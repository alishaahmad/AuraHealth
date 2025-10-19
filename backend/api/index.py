from fastapi import FastAPI, HTTPException, File, UploadFile, WebSocket, WebSocketDisconnect, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import os
import json
import uuid
import base64
from datetime import datetime
from typing import List, Optional, Dict, Any
import google.generativeai as genai
import openai
from dotenv import load_dotenv
import requests
from email_templates import get_welcome_email_template, get_monthly_report_template
from email_sender import python_email_sender
from email_template_loader import template_loader

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="Aura Health API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174", 
        "http://localhost:5175",
        "http://localhost:5176",
        "http://localhost:5177",
        "https://aura-health.vercel.app",
        "https://*.vercel.app",
        "https://tryaura.health",
        "https://www.tryaura.health"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Key setup
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
RESEND_API_KEY = os.getenv("RESEND_API_KEY")

# Initialize AI clients
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    GEMINI_AVAILABLE = True
else:
    GEMINI_AVAILABLE = False

if OPENAI_API_KEY:
    openai.api_key = OPENAI_API_KEY
    OPENAI_AVAILABLE = True
else:
    OPENAI_AVAILABLE = False

RESEND_AVAILABLE = bool(RESEND_API_KEY)

# Data directory (use writable tmp on serverless platforms like Vercel)
# Prefer env var DATA_DIR if provided; otherwise use /tmp which is writable at runtime
DATA_DIR = os.getenv("DATA_DIR", "/tmp/aura-data")
try:
    os.makedirs(DATA_DIR, exist_ok=True)
except Exception:
    # As a last resort, fall back to /tmp
    DATA_DIR = "/tmp/aura-data"
    os.makedirs(DATA_DIR, exist_ok=True)

# Pydantic models
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    model: str = "openrouter"
    receipt_context: Optional[Dict[str, Any]] = None
    health_profile: Optional[Dict[str, Any]] = None

class EmailRequest(BaseModel):
    to: str
    subject: str
    html: str
    userName: str
    month: str
    year: int
    auraScore: int
    scoreDescription: str
    totalReceipts: Optional[int] = 0
    healthInsights: Optional[List[str]] = []
    mealSuggestions: Optional[List[str]] = []
    warnings: Optional[List[str]] = []

class NewsletterSubscription(BaseModel):
    email: str
    userName: str
    subscribedAt: str

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

manager = ConnectionManager()

# Health check endpoint
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# OCR and analysis endpoint
@app.post("/api/ocr/process")
async def process_receipt(
    file: UploadFile | None = File(default=None),
    image_data: str | None = Form(default=None)
):
    try:
        if not GEMINI_AVAILABLE:
            # Graceful fallback: return a deterministic demo analysis so the UI has content
            demo = {
                "store_name": "Demo Market",
                "raw_text": "DEMO RECEIPT\nAPPLE 2.00\nBREAD 3.50\nMILK 4.25\nSUBTOTAL 9.75\nTAX 0.78\nTOTAL 10.53",
                "items": [
                    {"name": "Apple", "price": 2.00, "quantity": 1, "category": "produce"},
                    {"name": "Whole Wheat Bread", "price": 3.50, "quantity": 1, "category": "bakery"},
                    {"name": "2% Milk", "price": 4.25, "quantity": 1, "category": "dairy"}
                ],
                "subtotal": 9.75,
                "tax": 0.78,
                "total": 10.53,
                "red_flags": [],
                "budget_swaps": [{"item": "Bread", "swap": "Whole grain bread", "savings": "$0.20"}],
                "healthy_swaps": [{"item": "Milk", "swap": "Low-fat milk", "reason": "Less saturated fat"}],
                "meal_plan": [{"name": "Apple & Toast Breakfast", "uses": ["Apple", "Bread"], "prep_time": "5m", "difficulty": "easy", "nutrition_benefits": "Fiber and slow-release carbs"}],
                "alternative_meal_plan": [],
                "ingredient_analysis": [{"ingredient": "Apple", "health_benefits": "Rich in fiber", "nutritional_value": "~95 kcal", "cooking_tips": "Best fresh"}],
                "nutrients": [{"name": "Fiber", "amount": "~7 g", "daily_value_percent": "25%"}],
                "macros": {"calories": 650, "protein_g": 25, "carbs_g": 90, "fat_g": 18, "fiber_g": 12, "sugar_g": 34, "sodium_mg": 820},
                "overall_health_score": 72,
                "suggestions": [{"category": "General", "title": "Great choices", "description": "Mostly whole foods", "priority": "low"}],
                "warnings": []
            }
            analysis_id = str(uuid.uuid4())[:8]
            with open(os.path.join(DATA_DIR, f"analysis_{analysis_id}.json"), 'w') as f:
                json.dump(demo, f, indent=2)
            # Return flat fields expected by the frontend OCRService
            demo_response = {"success": True, "analysis_id": analysis_id}
            demo_response.update(demo)
            return demo_response
        
        # Accept either a binary file upload (field name: "file") or a base64 string (field name: "image_data")
        if file is not None:
            contents = await file.read()
            base64_image = base64.b64encode(contents).decode('utf-8')
        elif image_data is not None:
            # Support data URLs like "data:image/png;base64,xxxx"
            if "," in image_data:
                base64_image = image_data.split(",", 1)[1]
            else:
                base64_image = image_data
        else:
            raise HTTPException(status_code=422, detail="Missing file or image_data")
        
        # Initialize Gemini model
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        # Enhanced prompt for rich data extraction
        prompt = """
        You are a nutrition and ingredients analyst. Analyze this receipt image and return ONLY JSON (no prose). 
        
        Schema: {
          "store_name": "string",
          "raw_text": "string", 
          "items": [
            {
              "name": "string",
              "price": "number",
              "quantity": "number", 
              "category": "string",
              "nutrition": {
                "carbohydrates": "number",
                "protein": "number",
                "fats": "number",
                "fiber": "number",
                "sugar": "number",
                "sodium": "number",
                "calories": "number"
              }
            }
          ],
          "subtotal": "number",
          "tax": "number", 
          "total": "number",
          "red_flags": [
            {
              "title": "string",
              "detail": "string"
            }
          ],
          "budget_swaps": [
            {
              "item": "string",
              "swap": "string", 
              "savings": "string"
            }
          ],
          "healthy_swaps": [
            {
              "item": "string",
              "swap": "string",
              "reason": "string"
            }
          ],
          "meal_plan": [
            {
              "name": "string",
              "uses": ["string"],
              "prep_time": "string",
              "difficulty": "string",
              "nutrition_benefits": "string"
            }
          ],
          "alternative_meal_plan": [
            {
              "name": "string", 
              "uses": ["string"],
              "prep_time": "string",
              "difficulty": "string",
              "nutrition_benefits": "string"
            }
          ],
          "ingredient_analysis": [
            {
              "ingredient": "string",
              "health_benefits": "string",
              "nutritional_value": "string", 
              "cooking_tips": "string"
            }
          ],
          "nutrients": [
            {
              "name": "string",
              "amount": "string",
              "daily_value_percent": "string"
            }
          ],
          "macros": {
            "calories": "string|number",
            "protein_g": "string|number", 
            "carbs_g": "string|number",
            "fat_g": "string|number",
            "fiber_g": "string|number",
            "sugar_g": "string|number",
            "sodium_mg": "string|number"
          },
          "overall_health_score": "number",
          "suggestions": [
            {
              "category": "string",
              "title": "string", 
              "description": "string",
              "priority": "low|medium|high"
            }
          ],
          "warnings": [
            {
              "type": "string",
              "message": "string",
              "severity": "low|medium|high"
            }
          ]
        }
        
        Rules:
        - Ground all findings in the provided receipt image
        - If exact numbers are unavailable, provide reasonable estimates and mark them clearly (e.g., "~12 g")
        - Consider potential drug interactions, allergens, and dietary conflicts
        - Keep items concise and useful
        - Generate realistic meal plans based on the actual ingredients
        - Provide practical cooking tips and health benefits
        - Calculate overall health score based on nutritional balance and variety
        """
        
        # Generate content
        response = model.generate_content([
            prompt,
            {
                "mime_type": (file.content_type if file is not None else "image/png"),
                "data": base64_image
            }
        ])
        
        # Parse JSON response
        try:
            analysis_data = json.loads(response.text)
        except json.JSONDecodeError:
            # Fallback if JSON parsing fails - provide minimal but useful content
            analysis_data = {
                "store_name": "Scanned Store",
                "raw_text": "Unable to parse structured data, showing raw text only.",
                "items": [
                    {"name": "Grocery Items", "price": 0.0, "quantity": 1, "category": "general"}
                ],
                "subtotal": 0,
                "tax": 0,
                "total": 0,
                "red_flags": [],
                "budget_swaps": [],
                "healthy_swaps": [],
                "meal_plan": [],
                "alternative_meal_plan": [],
                "ingredient_analysis": [],
                "nutrients": [],
                "macros": {"calories": 0, "protein_g": 0, "carbs_g": 0, "fat_g": 0, "fiber_g": 0, "sugar_g": 0, "sodium_mg": 0},
                "overall_health_score": 0,
                "suggestions": [],
                "warnings": []
            }
        
        # Save analysis to file
        analysis_id = str(uuid.uuid4())[:8]
        analysis_file = os.path.join(DATA_DIR, f"analysis_{analysis_id}.json")
        
        with open(analysis_file, 'w') as f:
            json.dump(analysis_data, f, indent=2)
        
        print(f"Analysis saved with ID: {analysis_id}")
        
        response_payload = {"success": True, "analysis_id": analysis_id}
        response_payload.update(analysis_data)
        return response_payload
        
    except Exception as e:
        print(f"Error processing receipt: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process receipt: {str(e)}")

# Chat endpoint
@app.post("/api/chat")
async def chat(request: ChatRequest):
    try:
        print(f"💬 Received chat request")
        print(f"📊 Messages: {len(request.messages)}")
        print(f"🧾 Receipt context: {bool(request.receipt_context)}")
        print(f"🏥 Health profile: {request.health_profile}")
        print(f"🤖 AI Model: {request.model}")
        
        # Prepare context
        context_parts = []
        
        if request.receipt_context:
            context_parts.append(f"Receipt Analysis Context:\n{json.dumps(request.receipt_context, indent=2)}")
        
        if request.health_profile:
            context_parts.append(f"Health Profile:\n{json.dumps(request.health_profile, indent=2)}")
        
        context = "\n\n".join(context_parts) if context_parts else ""
        
        # Prepare messages
        messages = []
        if context:
            messages.append({
                "role": "system",
                "content": f"You are Astrea, an AI health assistant. Use this context to provide personalized advice:\n\n{context}\n\nAlways respond in markdown format and be helpful, accurate, and encouraging."
            })
        
        for msg in request.messages:
            messages.append({
                "role": msg.role,
                "content": msg.content
            })
        
        # Choose AI model
        if request.model == "gemini" and GEMINI_AVAILABLE:
            model = genai.GenerativeModel('gemini-2.0-flash')
            response = model.generate_content(messages[-1]["content"])
            ai_response = response.text
        elif request.model == "openrouter" and OPENAI_AVAILABLE:
            response = openai.ChatCompletion.create(
                model="anthropic/claude-3.5-sonnet",
                messages=messages,
                max_tokens=1000,
                temperature=0.7
            )
            ai_response = response.choices[0].message.content
        else:
            raise HTTPException(status_code=500, detail="AI service not available")
        
        return {
            "success": True,
            "response": ai_response,
            "model": request.model
        }
        
    except Exception as e:
        print(f"❌ Chat error: {e}")
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")

# WebSocket endpoint for Gemini Live
@app.websocket("/ws/gemini-live")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            print(f"📨 Received WebSocket message: {data}")
            
            if data == "setup":
                print("🔧 Setting up WebSocket connection")
                await manager.send_personal_message("WebSocket connected successfully", websocket)
            else:
                # Handle other WebSocket messages here
                await manager.send_personal_message(f"Echo: {data}", websocket)
                
    except WebSocketDisconnect:
        print("🔌 WebSocket disconnected")
        manager.disconnect(websocket)

# Audio processing endpoint
@app.post("/api/gemini-live-audio")
async def process_audio(audio_data: str):
    try:
        if not GEMINI_AVAILABLE:
            raise HTTPException(status_code=500, detail="Gemini API not available")
        
        # Decode base64 audio
        audio_bytes = base64.b64decode(audio_data)
        
        if len(audio_bytes) < 100:
            return {
                "success": True,
                "response": "I didn't hear anything. Please try speaking again.",
                "audio_response": ""
            }
        
        # Process with Gemini (simplified for Vercel)
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        # For now, return a simple response
        response_text = "I received your audio message. This is a simplified response for Vercel deployment."
        
        return {
            "success": True,
            "response": response_text,
            "audio_response": ""
        }
        
    except Exception as e:
        print(f"❌ Audio processing error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process audio: {str(e)}")

# History endpoint
@app.get("/api/history")
async def get_history():
    try:
        history_files = []
        if os.path.exists(DATA_DIR):
            for filename in os.listdir(DATA_DIR):
                if filename.startswith("analysis_") and filename.endswith(".json"):
                    filepath = os.path.join(DATA_DIR, filename)
                    with open(filepath, 'r') as f:
                        data = json.load(f)
                        history_files.append({
                            "id": filename.replace("analysis_", "").replace(".json", ""),
                            "timestamp": os.path.getmtime(filepath),
                            "data": data
                        })
        
        # Sort by timestamp (newest first)
        history_files.sort(key=lambda x: x["timestamp"], reverse=True)
        
        return {"success": True, "history": history_files}
        
    except Exception as e:
        print(f"❌ History error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get history: {str(e)}")

# Email endpoints
@app.post("/api/send-email")
async def send_email(request: EmailRequest):
    try:
        if not RESEND_AVAILABLE or not RESEND_API_KEY:
            return JSONResponse(
                status_code=500,
                content={"error": "Resend API not available or API key missing"}
            )
        
        # Use the proper email template for monthly reports
        if "Health Snapshot" in request.subject:
            html_content = template_loader.get_monthly_report_email(
                user_name=request.userName,
                month=request.month,
                year=request.year,
                aura_score=request.auraScore,
                score_description=request.scoreDescription,
                total_receipts=request.totalReceipts,
                health_insights=request.healthInsights,
                meal_suggestions=request.mealSuggestions,
                warnings=request.warnings
            )
        else:
            html_content = request.html
        
        email_data = {
            "from": "Aura Health <hello@tryaura.health>",
            "to": [request.to],
            "subject": request.subject,
            "html": html_content
        }
        
        headers = {
            "Authorization": f"Bearer {RESEND_API_KEY}",
            "Content-Type": "application/json"
        }
        
        response = requests.post(
            "https://api.resend.com/emails",
            headers=headers,
            json=email_data
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"📧 Email sent successfully to: {request.to}")
            print(f"📧 Resend ID: {result.get('id')}")
            
            return JSONResponse(
                status_code=200,
                content={
                    "message": "Email sent successfully!",
                    "emailId": str(uuid.uuid4()),
                    "resendId": result.get('id')
                }
            )
        else:
            print(f"❌ Resend API error: {response.status_code} - {response.text}")
            print("🔄 Trying Python SMTP fallback...")
            
            # Try fallback email sender
            if python_email_sender.send_email(
                to_email=request.to,
                subject=request.subject,
                html_content=html_content,
                sender_name="Aura Health"
            ):
                return JSONResponse(
                    status_code=200,
                    content={
                        "message": "Email sent successfully via fallback!",
                        "emailId": str(uuid.uuid4()),
                        "method": "python_smtp"
                    }
                )
            else:
                return JSONResponse(
                    status_code=500,
                    content={"error": f"Failed to send email via both Resend and SMTP: {response.text}"}
                )
        
    except Exception as e:
        print(f"❌ Email sending error: {e}")
        print("🔄 Trying Python SMTP fallback...")
        
        # Try fallback email sender
        if python_email_sender.send_email(
            to_email=request.to,
            subject=request.subject,
            html_content=html_content,
            sender_name="Aura Health"
        ):
            return JSONResponse(
                status_code=200,
                content={
                    "message": "Email sent successfully via fallback!",
                    "emailId": str(uuid.uuid4()),
                    "method": "python_smtp"
                }
            )
        else:
            return JSONResponse(
                status_code=500,
                content={"error": f"Failed to send email: {str(e)}"}
            )

@app.post("/api/newsletter/subscribe")
async def subscribe_newsletter(request: NewsletterSubscription):
    try:
        subscription_data = {
            "id": str(uuid.uuid4()),
            "email": request.email,
            "userName": request.userName,
            "subscribedAt": request.subscribedAt,
            "status": "active"
        }
        
        subscription_file = os.path.join(DATA_DIR, f"subscription_{subscription_data['id']}.json")
        with open(subscription_file, 'w') as f:
            json.dump(subscription_data, f, indent=2)
        
        print(f"📧 Newsletter subscription: {request.email} ({request.userName})")
        
        # Generate React Email template using pre-generated templates
        try:
            # Use the template loader to get the monthly report template instead of welcome
            from datetime import datetime
            current_month = datetime.now().strftime('%B')
            current_year = datetime.now().year
            
            monthly_html = template_loader.get_monthly_report_email(
                user_name=request.userName,
                month=current_month,
                year=current_year,
                aura_score=78,  # Sample score
                score_description="You're on the right track—keep making small changes for even better results!",
                total_receipts=12,
                health_insights=[
                    "Grapefruit Juice: May interfere with your statin medication (atorvastatin), potentially increasing side effects. Consider alternative citrus options.",
                    "High Vitamin K (Kale Chips): Can affect blood thinner effectiveness. Consistency is key—maintain steady vitamin K intake with your warfarin regimen."
                ],
                meal_suggestions=[
                    "Canned Soup → Low-Sodium Bone Broth: Better for blood pressure management. 75% less sodium, more protein, supports your heart health goals.",
                    "Regular Pasta → Chickpea Pasta: Naturally gluten-free and higher in protein. Helps stabilize blood sugar while accommodating your sensitivity.",
                    "Grapefruit → Orange Juice: Safe with your statin medication. No drug interaction risk, still provides vitamin C and morning brightness."
                ],
                warnings=[
                    "High Sodium Content (Canned Soup): Your hypertension profile suggests limiting sodium to 1,500mg daily. This item contains 42% of that in one serving.",
                    "Added Sugars (Flavored Yogurt): For prediabetes management, watch for hidden sugars. This contains 18g added sugar per serving—consider plain yogurt with fresh fruit.",
                    "Gluten (Wheat Pasta): You've noted gluten sensitivity. We detected gluten-containing items on 3 receipts this month."
                ]
            )
            print(f"📧 Generated Monthly Report template for: {request.email}")
            
            # Send the email using Resend
            if RESEND_AVAILABLE and RESEND_API_KEY:
                monthly_email = {
                    "from": "Aura Health <hello@tryaura.health>",
                    "to": [request.email],
                    "subject": f"Your {current_month} {current_year} Snapshot from Aura Health",
                    "html": monthly_html
                }
                
                headers = {
                    "Authorization": f"Bearer {RESEND_API_KEY}",
                    "Content-Type": "application/json"
                }
                
                response = requests.post(
                    "https://api.resend.com/emails",
                    headers=headers,
                    json=monthly_email
                )
                
                if response.status_code == 200:
                    print(f"📧 Monthly report email sent via Resend to: {request.email}")
                else:
                    print(f"⚠️ Resend failed, trying Python SMTP: {response.text}")
                    python_email_sender.send_email(
                        to_email=request.email,
                        subject=f"Your {current_month} {current_year} Snapshot from Aura Health",
                        html_content=monthly_html,
                        sender_name="Aura Health"
                    )
            else:
                python_email_sender.send_email(
                    to_email=request.email,
                    subject=f"Your {current_month} {current_year} Snapshot from Aura Health",
                    html_content=monthly_html,
                    sender_name="Aura Health"
                )
                    
        except Exception as e:
            print(f"⚠️ Email sending error, using fallback: {e}")
            # Fallback to Python template
            from datetime import datetime
            current_month = datetime.now().strftime('%B')
            current_year = datetime.now().year
            
            monthly_html = get_monthly_report_template(
                user_name=request.userName,
                month=current_month,
                year=current_year,
                aura_score=78,
                score_description="You're on the right track—keep making small changes for even better results!",
                total_receipts=12,
                health_insights=[
                    "Grapefruit Juice: May interfere with your statin medication (atorvastatin), potentially increasing side effects. Consider alternative citrus options.",
                    "High Vitamin K (Kale Chips): Can affect blood thinner effectiveness. Consistency is key—maintain steady vitamin K intake with your warfarin regimen."
                ],
                meal_suggestions=[
                    "Canned Soup → Low-Sodium Bone Broth: Better for blood pressure management. 75% less sodium, more protein, supports your heart health goals.",
                    "Regular Pasta → Chickpea Pasta: Naturally gluten-free and higher in protein. Helps stabilize blood sugar while accommodating your sensitivity.",
                    "Grapefruit → Orange Juice: Safe with your statin medication. No drug interaction risk, still provides vitamin C and morning brightness."
                ],
                warnings=[
                    "High Sodium Content (Canned Soup): Your hypertension profile suggests limiting sodium to 1,500mg daily. This item contains 42% of that in one serving.",
                    "Added Sugars (Flavored Yogurt): For prediabetes management, watch for hidden sugars. This contains 18g added sugar per serving—consider plain yogurt with fresh fruit.",
                    "Gluten (Wheat Pasta): You've noted gluten sensitivity. We detected gluten-containing items on 3 receipts this month."
                ]
            )
            python_email_sender.send_email(
                to_email=request.email,
                subject=f"Your {current_month} {current_year} Snapshot from Aura Health",
                html_content=monthly_html,
                sender_name="Aura Health"
            )
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "Successfully subscribed to newsletter!",
                "subscriptionId": subscription_data['id']
            }
        )
        
    except Exception as e:
        print(f"❌ Newsletter subscription error: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": f"Failed to subscribe to newsletter: {str(e)}"}
        )

@app.get("/api/newsletter/subscribers")
async def get_subscribers():
    try:
        subscribers = []
        if os.path.exists(DATA_DIR):
            for filename in os.listdir(DATA_DIR):
                if filename.startswith("subscription_") and filename.endswith(".json"):
                    filepath = os.path.join(DATA_DIR, filename)
                    with open(filepath, 'r') as f:
                        data = json.load(f)
                        subscribers.append(data)
        
        return JSONResponse(
            status_code=200,
            content={"subscribers": subscribers}
        )
        
    except Exception as e:
        print(f"❌ Get subscribers error: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": f"Failed to get subscribers: {str(e)}"}
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

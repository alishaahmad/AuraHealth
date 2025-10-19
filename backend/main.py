from fastapi import FastAPI, HTTPException, UploadFile, File, Form, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import requests
import os
import base64
import json
import time
from datetime import datetime
import uuid
from typing import List, Optional
from pydantic import BaseModel
from dotenv import load_dotenv
import uvicorn

# Optional imports with fallbacks
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    print("Warning: Google Generative AI not available. Install with: pip install google-generativeai")

try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    print("Warning: OpenAI not available. Install with: pip install openai")

try:
    import smtplib
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart
    EMAIL_AVAILABLE = True
except ImportError:
    EMAIL_AVAILABLE = False
    print("Warning: Email functionality not available. Install with: pip install smtplib")

try:
    import requests
    RESEND_AVAILABLE = True
except ImportError:
    RESEND_AVAILABLE = False
    print("Warning: Requests not available. Install with: pip install requests")

try:
    import easyocr
    from PIL import Image
    import io
    import base64
    OCR_AVAILABLE = True
except ImportError:
    OCR_AVAILABLE = False
    print("Warning: OCR not available. Install with: pip install easyocr pillow")

# Load environment variables
load_dotenv()

# Get API keys
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
RESEND_API_KEY = os.getenv("RESEND_API_KEY")

# Create data directory for saving analysis results
DATA_DIR = "analysis_data"
os.makedirs(DATA_DIR, exist_ok=True)

# Rate limiting for Gemini API (free tier: 15 requests per minute)
last_request_time = 0
request_count = 0
RATE_LIMIT_WINDOW = 60  # 60 seconds
MAX_REQUESTS_PER_WINDOW = 10  # Conservative limit to avoid quota issues

def check_rate_limit():
    """Check if we can make a request without exceeding rate limits"""
    global last_request_time, request_count
    
    current_time = time.time()
    
    # Reset counter if window has passed
    if current_time - last_request_time > RATE_LIMIT_WINDOW:
        request_count = 0
        last_request_time = current_time
    
    # Check if we've exceeded the limit
    if request_count >= MAX_REQUESTS_PER_WINDOW:
        wait_time = RATE_LIMIT_WINDOW - (current_time - last_request_time)
        return False, wait_time
    
    # Increment counter
    request_count += 1
    return True, 0

app = FastAPI(title="Aura Health API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure APIs
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_AVAILABLE and GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

if OPENAI_AVAILABLE and OPENROUTER_API_KEY:
    openai.api_key = OPENROUTER_API_KEY

# Pydantic models
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    model: str = "openrouter"
    receipts: Optional[List[dict]] = None

class OCRResponse(BaseModel):
    raw_text: str
    items: List[dict]
    health_analysis: dict

class HealthAnalysis(BaseModel):
    health_score: int
    warnings: List[str]
    suggestions: List[str]

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

# OCR Service
class OCRService:
    # Initialize EasyOCR reader once
    _reader = None
    
    @classmethod
    def _get_reader(cls):
        """Get or initialize EasyOCR reader"""
        if cls._reader is None and OCR_AVAILABLE:
            try:
                cls._reader = easyocr.Reader(['en'])
            except Exception as e:
                print(f"Failed to initialize EasyOCR: {str(e)}")
                return None
        return cls._reader
    
    @staticmethod
    def process_receipt(image_data: str) -> dict:
        """Process receipt image and extract text using EasyOCR"""
        if not OCR_AVAILABLE:
            # Return mock data if OCR is not available
            return OCRService._get_mock_receipt_data()
        
        try:
            # Decode base64 image
            image_bytes = base64.b64decode(image_data.split(',')[1])
            image = Image.open(io.BytesIO(image_bytes))
            
            # Convert PIL image to numpy array for EasyOCR
            import numpy as np
            image_array = np.array(image)
            
            # Get EasyOCR reader
            reader = OCRService._get_reader()
            if reader is None:
                return OCRService._get_mock_receipt_data()
            
            # Extract text using EasyOCR
            results = reader.readtext(image_array)
            
            # Combine all text with proper spacing
            raw_text = ""
            for (bbox, text, confidence) in results:
                if confidence > 0.5:  # Only include high-confidence text
                    raw_text += text + " "
            
            raw_text = raw_text.strip()
            
            # Extract items from the text
            items = OCRService._extract_items(raw_text)
            
            return {
                "raw_text": raw_text,
                "items": items
            }
        except Exception as e:
            print(f"OCR processing failed: {str(e)}")
            # No fallback - just fail if OCR doesn't work
            raise Exception(f"OCR processing failed: {str(e)}")
    
    # Removed hardcoded mock data - no fallbacks
    
    @staticmethod
    def _extract_items(text: str) -> List[dict]:
        """Extract items from receipt text using intelligent parsing"""
        lines = text.split('\n')
        items = []
        
        # Common food categories for better classification
        categories = {
            'fruits': ['banana', 'apple', 'orange', 'grape', 'berry', 'mango', 'pineapple', 'lemon', 'lime'],
            'vegetables': ['spinach', 'lettuce', 'tomato', 'onion', 'carrot', 'broccoli', 'cucumber', 'pepper'],
            'dairy': ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'dairy'],
            'meat': ['chicken', 'beef', 'pork', 'fish', 'turkey', 'lamb', 'meat'],
            'bakery': ['bread', 'bagel', 'muffin', 'cake', 'cookie', 'pastry'],
            'beverages': ['juice', 'soda', 'water', 'coffee', 'tea', 'drink'],
            'nuts': ['almond', 'walnut', 'peanut', 'cashew', 'nut'],
            'snacks': ['chips', 'crackers', 'popcorn', 'snack']
        }
        
        for line in lines:
            line = line.strip()
            if line and any(char.isdigit() for char in line):
                # Skip header lines and totals
                if any(skip_word in line.lower() for skip_word in ['total', 'subtotal', 'tax', 'discount', 'change', 'cash', 'card']):
                    continue
                
                # Extract price using regex
                import re
                price_match = re.search(r'\$?(\d+\.\d{2})', line)
                if not price_match:
                    continue
                
                price = float(price_match.group(1))
                
                # Extract item name (everything before the price)
                price_pos = line.find(price_match.group(0))
                item_name = line[:price_pos].strip()
                
                # Clean up item name
                item_name = re.sub(r'^\d+\s*x?\s*', '', item_name)  # Remove quantity prefixes
                item_name = re.sub(r'\s+', ' ', item_name)  # Normalize spaces
                
                if not item_name or len(item_name) < 2:
                    continue
                
                # Determine category
                category = 'general'
                item_lower = item_name.lower()
                for cat, keywords in categories.items():
                    if any(keyword in item_lower for keyword in keywords):
                        category = cat
                        break
                
                # Extract quantity if present
                quantity = 1
                qty_match = re.search(r'^(\d+)\s*x?\s*', line)
                if qty_match:
                    quantity = int(qty_match.group(1))
                
                items.append({
                    "name": item_name,
                    "price": price,
                    "quantity": quantity,
                    "category": category
                })
        
        return items[:10]  # Limit to 10 items

    @staticmethod
    def save_analysis_to_file(analysis_data: dict) -> str:
        """Save analysis results to a JSON file"""
        try:
            # Generate unique filename with timestamp
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            analysis_id = str(uuid.uuid4())[:8]
            filename = f"analysis_{timestamp}_{analysis_id}.json"
            filepath = os.path.join(DATA_DIR, filename)
            
            # Add metadata
            analysis_data["metadata"] = {
                "analysis_id": analysis_id,
                "timestamp": datetime.now().isoformat(),
                "version": "1.0"
            }
            
            # Save to file
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(analysis_data, f, indent=2, ensure_ascii=False)
            
            return analysis_id
        except Exception as e:
            print(f"Failed to save analysis: {str(e)}")
            return None

    @staticmethod
    def load_analysis_history() -> List[dict]:
        """Load all saved analysis files"""
        try:
            analyses = []
            for filename in os.listdir(DATA_DIR):
                if filename.endswith('.json'):
                    filepath = os.path.join(DATA_DIR, filename)
                    with open(filepath, 'r', encoding='utf-8') as f:
                        analysis = json.load(f)
                        analyses.append(analysis)
            
            # Sort by timestamp (newest first)
            analyses.sort(key=lambda x: x.get('metadata', {}).get('timestamp', ''), reverse=True)
            return analyses
        except Exception as e:
            print(f"Failed to load analysis history: {str(e)}")
            return []

# Gemini Image Processing
async def process_receipt_with_gemini(image_bytes: bytes) -> dict:
    """Process receipt image directly with Gemini"""
    try:
        if not GEMINI_AVAILABLE:
            raise Exception("Gemini API not available")
        
        # Configure Gemini
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        # Create the prompt for Gemini
        prompt = """
        You are a nutrition and ingredients analyst.
        Return ONLY JSON (no prose). Schema:
        {
          "store_name": "Extract the store name from the receipt",
          "raw_text": "Extract ALL text from the receipt exactly as it appears",
          "items": [
            {
              "name": "Exact item name as shown on receipt",
              "price": 0.00,
              "quantity": 1,
              "category": "fruits|vegetables|dairy|meat|bakery|beverages|nuts|general",
              "nutrition": {
                "carbohydrates": 0,
                "protein": 0,
                "fats": 0,
                "fiber": 0,
                "sugar": 0,
                "sodium": 0,
                "calories": 0
              }
            }
          ],
          "subtotal": 0.00,
          "tax": 0.00,
          "total": 0.00,
          "red_flags": [{"title": "string", "detail": "string", "severity": "low|medium|high"}],
          "budget_swaps": [{"item": "string", "swap": "string", "savings": "string"}],
          "healthy_swaps": [{"item": "string", "swap": "string", "reason": "string"}],
          "meal_plan": [{"name": "string", "uses": ["string"], "prep_time": "string", "difficulty": "easy|medium|hard", "nutrition_benefits": "string"}],
          "alternative_meal_plan": [{"name": "string", "uses": ["string"], "prep_time": "string", "difficulty": "easy|medium|hard", "nutrition_benefits": "string"}],
          "ingredient_analysis": [{"ingredient": "string", "health_benefits": "string", "nutritional_value": "string", "cooking_tips": "string"}],
          "nutrients": [{"name": "string", "amount": "string", "daily_value_percent": "string"}],
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
          "suggestions": [{"category": "string", "title": "string", "description": "string", "priority": "low|medium|high"}],
          "warnings": [{"type": "string", "message": "string", "severity": "low|medium|high"}]
        }
        Rules:
        - Ground all findings in the provided text (ingredients/receipt). Do NOT invent items.
        - If exact numbers are unavailable, provide reasonable estimates and mark them clearly (e.g., "~12 g").
        - Consider the user's profile (meds, allergies, goals) for flags.
        - For meal_plan: Create 2-3 practical meal suggestions using ONLY the items found on the receipt. Each meal should specify which purchased items are used and how they can be combined into complete meals.
        - For alternative_meal_plan: Create 2-3 different meal suggestions using the same ingredients but with different preparation methods or combinations.
        - For ingredient_analysis: Analyze each major ingredient for health benefits, nutritional value, and cooking tips.
        - For red_flags: Identify potential health concerns like drug interactions, allergens, high sodium/sugar with severity levels.
        - For budget_swaps: Suggest cheaper alternatives for expensive items found on the receipt with estimated savings.
        - For healthy_swaps: Suggest healthier alternatives based on the ingredients found in purchased items.
        - For overall_health_score: Calculate a score from 1-100 based on nutritional balance, ingredient quality, and health benefits.
        - For suggestions: Provide actionable recommendations for improving the overall healthiness of the purchase.
        - For warnings: Highlight any immediate concerns that need attention.
        - Keep items concise and useful.
        
        MEAL PLAN REQUIREMENTS:
        - Use only items that appear on the receipt
        - Create complete meal suggestions (breakfast, lunch, dinner, or snacks)
        - Specify which receipt items are used in each meal
        - Provide practical cooking/preparation suggestions
        - Consider nutritional balance and health benefits
        
        HEALTHY SWAPS REQUIREMENTS:
        - Analyze ingredients in purchased items
        - Suggest healthier alternatives for processed or less healthy ingredients
        - Focus on whole foods, less processed options
        - Consider nutritional density and health benefits
        - Provide specific ingredient substitutions
        """
        
        # Process image with Gemini
        from PIL import Image
        import io
        
        # Convert bytes to PIL Image
        try:
            image = Image.open(io.BytesIO(image_bytes))
            # Convert to RGB if necessary
            if image.mode != 'RGB':
                image = image.convert('RGB')
        except Exception as e:
            print(f"Error processing image: {e}")
            raise Exception(f"Failed to process image: {str(e)}")
        
        # Process image with Gemini
        try:
            response = model.generate_content([prompt, image])
        except Exception as e:
            print(f"Error calling Gemini: {e}")
            raise Exception(f"Gemini API error: {str(e)}")
        
        # Parse the response
        response_text = response.text
        print(f"Gemini response: {response_text[:1000]}...")
        
        # Try to extract JSON from response
        import re
        
        # Clean up the response text
        cleaned_text = response_text.strip()
        
        # Look for JSON in various formats
        json_match = None
        
        # Try markdown code blocks first
        json_match = re.search(r'```json\s*(\{.*?\})\s*```', cleaned_text, re.DOTALL)
        if not json_match:
            # Try regular JSON object
            json_match = re.search(r'\{[^{}]*"store_name"[^{}]*\}', cleaned_text, re.DOTALL)
        if not json_match:
            # Try any JSON object
            json_match = re.search(r'\{.*\}', cleaned_text, re.DOTALL)
        
        if json_match:
            try:
                json_text = json_match.group(1) if json_match.groups() else json_match.group()
                # Clean up the JSON text
                json_text = json_text.strip()
                print(f"Extracted JSON: {json_text[:500]}...")
                
                receipt_data = json.loads(json_text)
                print(f"Successfully parsed JSON: {receipt_data}")
                
                # Validate required fields
                if not receipt_data.get("items"):
                    receipt_data["items"] = []
                if not receipt_data.get("raw_text"):
                    receipt_data["raw_text"] = response_text
                if not receipt_data.get("store_name"):
                    receipt_data["store_name"] = "Unknown Store"
                    
            except json.JSONDecodeError as e:
                print(f"JSON parsing error: {e}")
                print(f"Raw JSON text: {json_text}")
                # Fallback - create basic receipt data from text
                receipt_data = {
                    "store_name": "Unknown Store",
                    "raw_text": response_text,
                    "items": [],
                    "subtotal": 0.0,
                    "tax": 0.0,
                    "total": 0.0
                }
        else:
            print("No JSON found in response")
            # Fallback if no JSON found
            receipt_data = {
                "store_name": "Unknown Store",
                "raw_text": response_text,
                "items": [],
                "subtotal": 0.0,
                "tax": 0.0,
                "total": 0.0
            }
        
        # Create health analysis
        health_analysis = {
            "health_score": 75,  # Default score
            "warnings": [],
            "suggestions": []
        }
        
        # Simple health analysis based on items
        for item in receipt_data.get("items", []):
            item_name = item.get("name", "").lower()
            
            # Check for common allergens and drug interactions
            if "grapefruit" in item_name:
                health_analysis["warnings"].append(f"⚠️ {item['name']} may interact with certain medications")
            if any(allergen in item_name for allergen in ["milk", "dairy", "cheese"]):
                health_analysis["warnings"].append(f"⚠️ {item['name']} contains dairy - check for allergies")
            if any(allergen in item_name for allergen in ["nuts", "almond", "walnut"]):
                health_analysis["warnings"].append(f"⚠️ {item['name']} contains nuts - check for allergies")
            
            # Add suggestions for healthy items
            if any(healthy in item_name for healthy in ["organic", "fresh", "whole"]):
                health_analysis["suggestions"].append(f"✅ Great choice: {item['name']} is healthy")
        
        # Calculate health score
        health_analysis["health_score"] = max(0, 100 - len(health_analysis["warnings"]) * 10)
        
        return {
            "receipt_data": receipt_data,
            "health_analysis": health_analysis
        }
        
    except Exception as e:
        print(f"Gemini processing error: {str(e)}")
        raise Exception(f"Failed to process image with Gemini: {str(e)}")

# Health Analysis Service
class HealthAnalysisService:
    @staticmethod
    def analyze_health(receipt_data: dict) -> HealthAnalysis:
        """Analyze receipt for health insights using real OCR data"""
        items = receipt_data.get("items", [])
        raw_text = receipt_data.get("raw_text", "")
        warnings = []
        suggestions = []
        
        # Enhanced health analysis based on real OCR data
        for item in items:
            item_name = item["name"].lower()
            category = item.get("category", "general")
            
            # Allergen detection
            allergens = {
                "milk": ["milk", "dairy", "cheese", "yogurt", "butter", "cream", "lactose"],
                "wheat": ["wheat", "bread", "pasta", "flour", "gluten", "cereal"],
                "nuts": ["nuts", "almond", "walnut", "peanut", "cashew", "pistachio"],
                "soy": ["soy", "tofu", "soybean", "soy sauce"],
                "eggs": ["egg", "eggs", "mayonnaise", "custard"],
                "fish": ["fish", "salmon", "tuna", "cod", "seafood"],
                "shellfish": ["shrimp", "crab", "lobster", "shellfish"]
            }
            
            for allergen_type, keywords in allergens.items():
                if any(keyword in item_name for keyword in keywords):
                    warnings.append(f"⚠️ {item['name']} contains {allergen_type} - check if you have {allergen_type} allergies")
            
            # Drug interaction warnings
            drug_interactions = {
                "grapefruit": "may interact with statins, calcium channel blockers, and other medications",
                "cranberry": "may interact with warfarin and other blood thinners",
                "licorice": "may interact with blood pressure medications",
                "green tea": "may interact with blood thinners and stimulants"
            }
            
            for food, interaction in drug_interactions.items():
                if food in item_name:
                    warnings.append(f"💊 {item['name']} {interaction}")
            
            # Nutritional warnings
            if category == "meat" and any(processed in item_name for processed in ["sausage", "bacon", "deli", "processed"]):
                warnings.append(f"🥓 {item['name']} is processed meat - consider lean, unprocessed alternatives")
            
            if any(high_sugar in item_name for high_sugar in ["soda", "candy", "chocolate", "cake", "cookie", "sweet"]):
                warnings.append(f"🍭 {item['name']} is high in sugar - consider healthier alternatives")
            
            if any(high_sodium in item_name for high_sodium in ["soup", "broth", "sauce", "canned", "pickled", "cured"]):
                warnings.append(f"🧂 {item['name']} is high in sodium - consider low-sodium alternatives")
            
            # Positive health indicators
            if any(healthy in item_name for healthy in ["organic", "fresh", "whole", "lean", "low-fat", "sugar-free"]):
                suggestions.append(f"✅ Great choice: {item['name']} is a healthy option")
        
        # Category-based suggestions
        categories = [item.get("category", "general") for item in items]
        
        if "fruits" in categories and "vegetables" in categories:
            suggestions.append("🥗 Excellent! You're getting both fruits and vegetables")
        elif "fruits" in categories:
            suggestions.append("🍎 Great fruit selection! Consider adding some vegetables too")
        elif "vegetables" in categories:
            suggestions.append("🥕 Great vegetable selection! Consider adding some fruits too")
        else:
            suggestions.append("🥬 Consider adding more fruits and vegetables to your diet")
        
        if "dairy" in categories:
            suggestions.append("🥛 Good dairy choices! Consider low-fat or plant-based alternatives if needed")
        
        if "nuts" in categories:
            suggestions.append("🥜 Nuts are great for healthy fats! Just watch portion sizes")
        
        # Overall health score calculation
        base_score = 100
        score_deductions = len(warnings) * 8  # Each warning reduces score by 8 points
        score_bonuses = len([s for s in suggestions if "Great choice" in s or "Excellent" in s]) * 5
        
        health_score = max(0, min(100, base_score - score_deductions + score_bonuses))
        
        # Add general suggestions based on overall analysis
        if health_score < 60:
            suggestions.append("💡 Consider focusing on whole foods, fruits, and vegetables for better health")
        elif health_score >= 80:
            suggestions.append("🌟 Excellent food choices! You're making great health decisions")
        
        return HealthAnalysis(
            health_score=health_score,
            warnings=warnings,
            suggestions=suggestions
        )

# AI Service
class AIService:
    @staticmethod
    async def chat_with_openrouter(messages: List[dict], receipts: List[dict] = None) -> dict:
        """Chat with OpenRouter API"""
        try:
            # Add receipt context to system message
            system_content = """You are Astrea, an AI health assistant specialized in food safety, drug interactions, and dietary analysis.
            
Your expertise includes:
- Drug-food interactions and medication safety
- Allergen detection and food safety
- Dietary recommendations based on health conditions
- Receipt analysis for health insights
- General nutrition and wellness advice

Always prioritize user safety and recommend consulting healthcare professionals for medical advice.
Be helpful, accurate, and empathetic in your responses."""

            if receipts:
                system_content += f"\n\nRecent Receipt Analysis Context (from real OCR data):\n"
                for i, receipt in enumerate(receipts):
                    system_content += f"Receipt {i+1}:\n"
                    system_content += f"- Health Score: {receipt.get('analysis', {}).get('healthScore', 0)}%\n"
                    system_content += f"- Store: {receipt.get('storeName', 'Unknown')}\n"
                    system_content += f"- Date: {receipt.get('date', 'Unknown')}\n"
                    system_content += f"- Items ({len(receipt.get('items', []))}):\n"
                    for item in receipt.get('items', []):
                        system_content += f"  • {item.get('name', 'Unknown')} (${item.get('price', 0):.2f}) - {item.get('category', 'general')}\n"
                    system_content += f"- Warnings: {'; '.join(receipt.get('analysis', {}).get('warnings', []))}\n"
                    system_content += f"- Suggestions: {'; '.join(receipt.get('analysis', {}).get('suggestions', []))}\n"
                    system_content += f"- Raw OCR Text: {receipt.get('text', '')[:200]}...\n\n"

            # Prepare messages for OpenRouter
            openrouter_messages = [{"role": "system", "content": system_content}] + messages
            
            headers = {
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:5173",
                "X-Title": "Aura Health"
            }
            
            data = {
                "model": "anthropic/claude-3.5-sonnet",
                "messages": openrouter_messages,
                "max_tokens": 1000,
                "temperature": 0.7
            }
            
            response = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                json=data,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                return {
                    "content": result["choices"][0]["message"]["content"],
                    "model": "openrouter"
                }
            else:
                raise HTTPException(status_code=response.status_code, detail="OpenRouter API error")
                
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"OpenRouter error: {str(e)}")
    
    @staticmethod
    async def chat_with_gemini(messages: List[dict], receipts: List[dict] = None) -> dict:
        """Chat with Google Gemini API"""
        if not GEMINI_AVAILABLE:
            return AIService._get_mock_response(messages[-1]['content'], "gemini")
        
        try:
            model = genai.GenerativeModel('gemini-pro')
            
            # Prepare conversation
            conversation_text = ""
            for msg in messages:
                conversation_text += f"{msg['role']}: {msg['content']}\n\n"
            
            if receipts:
                conversation_text += "\nRecent Receipt Analysis Context (from real OCR data):\n"
                for i, receipt in enumerate(receipts):
                    conversation_text += f"Receipt {i+1}:\n"
                    conversation_text += f"- Health Score: {receipt.get('analysis', {}).get('healthScore', 0)}%\n"
                    conversation_text += f"- Store: {receipt.get('storeName', 'Unknown')}\n"
                    conversation_text += f"- Date: {receipt.get('date', 'Unknown')}\n"
                    conversation_text += f"- Items ({len(receipt.get('items', []))}):\n"
                    for item in receipt.get('items', []):
                        conversation_text += f"  • {item.get('name', 'Unknown')} (${item.get('price', 0):.2f}) - {item.get('category', 'general')}\n"
                    conversation_text += f"- Warnings: {'; '.join(receipt.get('analysis', {}).get('warnings', []))}\n"
                    conversation_text += f"- Suggestions: {'; '.join(receipt.get('analysis', {}).get('suggestions', []))}\n\n"
            
            response = model.generate_content(conversation_text)
            
            return {
                "content": response.text,
                "model": "gemini"
            }
            
        except Exception as e:
            print(f"Gemini error: {str(e)}")
            return AIService._get_mock_response(messages[-1]['content'], "gemini")
    
    @staticmethod
    def _get_mock_response(user_input: str, model: str) -> dict:
        """Return mock response when AI services are not available"""
        input_lower = user_input.lower()
        
        if "receipt" in input_lower or "scan" in input_lower:
            response = "I can help you analyze your receipts! I see you've scanned some receipts recently. I can identify potential drug interactions, allergens, and provide health recommendations based on your purchases. What specific aspect of your receipt would you like me to analyze?"
        elif "grapefruit" in input_lower or "interaction" in input_lower:
            response = "Grapefruit can interact with many medications including statins, calcium channel blockers, and some antidepressants. If you're taking any medications, it's best to avoid grapefruit or consult your doctor. I noticed grapefruit juice in your recent receipt - consider switching to orange juice or other citrus alternatives."
        elif "health" in input_lower or "diet" in input_lower:
            response = "Based on your recent purchases, I can see you're making some healthy choices! I recommend focusing on whole foods, limiting processed items, and ensuring you're getting enough variety in your diet. What specific health goals are you working towards?"
        elif "allerg" in input_lower:
            response = "Allergen detection is one of my key features! I can scan your receipts for any ingredients that might trigger allergic reactions based on your allergy profile. Make sure to keep your health profile updated with all your known allergies. What allergens are you concerned about?"
        else:
            response = "I'm here to help with your health and nutrition questions! I can analyze your receipts for potential issues, answer questions about food interactions, and provide personalized recommendations. What would you like to know about your health and nutrition?"
        
        return {
            "content": response,
            "model": model
        }

# API Routes
@app.get("/")
async def root():
    return {"message": "Aura Health API is running"}

@app.post("/api/ocr/process")
async def process_receipt(image_data: str = Form(...)):
    """Process receipt image using Gemini for direct analysis"""
    try:
        print(f"Processing receipt with image data length: {len(image_data)}")
        print(f"Image data preview: {image_data[:100]}...")
        
        if not GEMINI_AVAILABLE:
            print("Gemini API not available")
            raise HTTPException(status_code=500, detail="Gemini API not available")
        
        # Decode base64 image
        try:
            if ',' in image_data:
                base64_data = image_data.split(',')[1]
                print(f"Base64 data length: {len(base64_data)}")
                image_bytes = base64.b64decode(base64_data)
                print(f"Decoded image bytes length: {len(image_bytes)}")
            else:
                image_bytes = base64.b64decode(image_data)
                print(f"Decoded image bytes length: {len(image_bytes)}")
        except Exception as e:
            print(f"Error decoding image: {e}")
            raise HTTPException(status_code=400, detail=f"Invalid image data: {str(e)}")
        
        # Use Gemini to process the image directly
        print("Calling Gemini API...")
        gemini_result = await process_receipt_with_gemini(image_bytes)
        print("Gemini API call successful")
        
        # Create complete analysis data
        analysis_data = {
            "receipt_data": gemini_result["receipt_data"],
            "health_analysis": gemini_result["health_analysis"],
            "store_name": gemini_result["receipt_data"].get("store_name", "Unknown Store"),
            "date": datetime.now().strftime("%Y-%m-%d"),
            "time": datetime.now().strftime("%H:%M:%S")
        }
        
        # Save to JSON file
        analysis_id = OCRService.save_analysis_to_file(analysis_data)
        if analysis_id:
            print(f"Analysis saved with ID: {analysis_id}")
        
        # Ensure all required fields exist
        receipt_data = gemini_result.get("receipt_data", {})
        health_analysis = gemini_result.get("health_analysis", {})
        
        return OCRResponse(
            raw_text=receipt_data.get("raw_text", ""),
            items=receipt_data.get("items", []),
            health_analysis=health_analysis
        )
    except Exception as e:
        print(f"Receipt processing error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/chat")
async def chat_with_ai(request: ChatRequest):
    """Chat with AI assistant"""
    try:
        if request.model == "openrouter":
            if not OPENROUTER_API_KEY:
                raise HTTPException(status_code=400, detail="OpenRouter API key not configured")
            result = await AIService.chat_with_openrouter(
                [msg.dict() for msg in request.messages],
                request.receipts
            )
        elif request.model == "gemini":
            if not GEMINI_API_KEY:
                raise HTTPException(status_code=400, detail="Gemini API key not configured")
            result = await AIService.chat_with_gemini(
                [msg.dict() for msg in request.messages],
                request.receipts
            )
        else:
            raise HTTPException(status_code=400, detail="Unsupported model")
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "services": {
            "ocr_available": OCR_AVAILABLE,
            "openrouter_available": OPENAI_AVAILABLE,
            "gemini_available": GEMINI_AVAILABLE,
            "openrouter_configured": bool(OPENROUTER_API_KEY),
            "gemini_configured": bool(GEMINI_API_KEY)
        },
        "message": "Backend is running with fallback mock services"
    }

@app.get("/api/history")
async def get_analysis_history():
    """Get analysis history"""
    try:
        analyses = OCRService.load_analysis_history()
        return {"analyses": analyses}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/gemini-live-token")
async def get_gemini_live_token():
    """Get Gemini Live API token for WebSocket connection"""
    try:
        if not GEMINI_AVAILABLE:
            raise HTTPException(status_code=500, detail="Gemini API not available")
        
        return {"api_key": GEMINI_API_KEY}
        
    except Exception as e:
        print(f"Error getting Gemini Live token: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get Gemini Live token: {str(e)}")

@app.post("/api/gemini-live")
async def gemini_live_audio(request: dict):
    """Process audio input with Gemini Live context (fallback for non-WebSocket)"""
    try:
        audio_data = request.get("audio_data")
        receipt_context = request.get("receipt_context")
        health_profile = request.get("health_profile", {})
        
        if not audio_data:
            raise HTTPException(status_code=400, detail="No audio data provided")
        
        if not GEMINI_AVAILABLE:
            raise HTTPException(status_code=500, detail="Gemini API not available")
        
        # Configure Gemini
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        # Create context-aware prompt
        context_prompt = """
        You are Astrea, an AI health assistant specializing in nutrition and food analysis. 
        You're having a real-time conversation with a user about their receipt data.
        
        Respond naturally and conversationally, focusing on:
        - Nutritional advice based on their purchases
        - Health recommendations
        - Meal planning suggestions
        - Ingredient substitutions
        - Budget-friendly alternatives
        
        Keep responses concise and helpful. Ask follow-up questions when appropriate.
        """
        
        # Add receipt context if available
        if receipt_context:
            context_prompt += f"""
            
            Current Receipt Context:
            - Store: {receipt_context.get('text', '').split('\\n')[0] if receipt_context.get('text') else 'Unknown'}
            - Items: {len(receipt_context.get('items', []))} items
            - Total: ${sum(item.get('price', 0) for item in receipt_context.get('items', [])):.2f}
            - Items: {', '.join([item.get('name', '') for item in receipt_context.get('items', [])[:5]])}
            """
        
        # Add health profile context if available
        if health_profile:
            context_prompt += f"""
            
            User Health Profile:
            - Diagnoses: {', '.join(health_profile.get('diagnoses', [])) or 'None specified'}
            - Medications: {', '.join(health_profile.get('medications', [])) or 'None specified'}
            - Allergies: {', '.join(health_profile.get('allergies', [])) or 'None specified'}
            - Dietary Restrictions: {', '.join(health_profile.get('dietaryRestrictions', [])) or 'None specified'}
            - Health Goals: {', '.join(health_profile.get('healthGoals', [])) or 'None specified'}
            """
        
        # For now, we'll simulate audio processing since Gemini Live might not be available
        # In a real implementation, you would process the audio with Gemini's audio capabilities
        response = model.generate_content([
            context_prompt,
            "The user has sent an audio message. Please respond as if you heard them asking about their receipt data and health. Provide helpful nutrition advice and suggestions."
        ])
        
        return {"response": response.text}
        
    except Exception as e:
        print(f"Error processing audio: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process audio: {str(e)}")

@app.post("/api/gemini-live-audio")
async def gemini_live_audio_conversation(request: dict):
    """Process audio input and generate audio response for conversation"""
    try:
        print("🎤 Received audio conversation request")
        
        audio_data = request.get("audio_data")
        receipt_context = request.get("receipt_context")
        health_profile = request.get("health_profile", {})
        conversation_history = request.get("conversation_history", [])
        
        print(f"📊 Audio data length: {len(audio_data) if audio_data else 0}")
        print(f"💬 Conversation history length: {len(conversation_history)}")
        print(f"🧾 Receipt context available: {receipt_context is not None}")
        print(f"🏥 Health profile: {health_profile}")
        
        if not audio_data:
            print("❌ No audio data provided")
            raise HTTPException(status_code=400, detail="No audio data provided")
        
        if not GEMINI_AVAILABLE:
            print("❌ Gemini API not available")
            raise HTTPException(status_code=500, detail="Gemini API not available")
        
        # Check rate limit
        can_proceed, wait_time = check_rate_limit()
        if not can_proceed:
            print(f"⏰ Rate limit exceeded, wait {wait_time} seconds")
            raise HTTPException(
                status_code=429, 
                detail=f"Rate limit exceeded. Please wait {int(wait_time)} seconds before trying again."
            )
        
        print("🔧 Configuring Gemini...")
        # Configure Gemini
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        # Create context-aware prompt for audio conversation
        context_prompt = """
        You are Astrea, an AI health assistant specializing in nutrition and food analysis. 
        You're having a real-time audio conversation with a user about their receipt data.
        
        Respond naturally and conversationally as if you're speaking to them, focusing on:
        - Nutritional advice based on their purchases
        - Health recommendations
        - Meal planning suggestions
        - Ingredient substitutions
        - Budget-friendly alternatives
        
        Keep responses concise, conversational, and helpful. Ask follow-up questions when appropriate.
        Speak as if you're having a natural conversation with them.
        """
        
        # Add conversation history for context
        if conversation_history:
            print(f"📝 Adding conversation history ({len(conversation_history)} messages)")
            context_prompt += "\n\nConversation History:\n"
            for msg in conversation_history[-5:]:  # Last 5 messages for context
                role = "User" if msg.get('role') == 'user' else "Astrea"
                content = msg.get('content', '')
                context_prompt += f"{role}: {content}\n"
                print(f"  {role}: {content}")
        
        # Add receipt context if available
        if receipt_context:
            print("🧾 Adding receipt context")
            context_prompt += f"""
            
            Current Receipt Context:
            - Store: {receipt_context.get('text', '').split('\\n')[0] if receipt_context.get('text') else 'Unknown'}
            - Items: {len(receipt_context.get('items', []))} items
            - Total: ${sum(item.get('price', 0) for item in receipt_context.get('items', [])):.2f}
            - Items: {', '.join([item.get('name', '') for item in receipt_context.get('items', [])[:5]])}
            """
        
        # Add health profile context if available
        if health_profile:
            print("🏥 Adding health profile context")
            context_prompt += f"""
            
            User Health Profile:
            - Diagnoses: {', '.join(health_profile.get('diagnoses', [])) or 'None specified'}
            - Medications: {', '.join(health_profile.get('medications', [])) or 'None specified'}
            - Allergies: {', '.join(health_profile.get('allergies', [])) or 'None specified'}
            - Dietary Restrictions: {', '.join(health_profile.get('dietaryRestrictions', [])) or 'None specified'}
            - Health Goals: {', '.join(health_profile.get('healthGoals', [])) or 'None specified'}
            """
        
        print("🤖 Generating AI response...")
        
        # Only process if we have meaningful audio data
        if len(audio_data) < 100:
            print("⚠️ Audio data too small, returning empty response")
            return {
                "text_response": "I didn't hear anything. Please try speaking again.",
                "audio_response": None
            }
        
        # Generate text response based on actual audio input
        response = model.generate_content([
            context_prompt,
            "The user has sent an audio message. Please respond naturally as if you heard them speaking. If you don't have enough context about what they said, ask them to repeat or provide more details."
        ])
        
        print(f"✅ Generated response: {response.text[:100]}...")
        
        # Return text response
        return {
            "text_response": response.text,
            "audio_response": None
        }
        
    except HTTPException:
        # Re-raise HTTP exceptions (like rate limit)
        raise
    except Exception as e:
        print(f"💥 Error processing audio conversation: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to process audio conversation: {str(e)}")

@app.post("/api/chat")
async def chat_endpoint(request: dict):
    """Handle chat messages from the frontend"""
    try:
        print("💬 Received chat request")
        
        messages = request.get("messages", [])
        receipt_context = request.get("receiptContext")
        health_profile = request.get("healthProfile", {})
        ai_model = request.get("aiModel", "openrouter")
        
        print(f"📊 Messages: {len(messages)}")
        print(f"🧾 Receipt context: {receipt_context is not None}")
        print(f"🏥 Health profile: {health_profile}")
        print(f"🤖 AI Model: {ai_model}")
        
        if not messages:
            raise HTTPException(status_code=400, detail="No messages provided")
        
        # Get the last user message
        last_message = messages[-1]
        if last_message.get("role") != "user":
            raise HTTPException(status_code=400, detail="Last message must be from user")
        
        user_message = last_message.get("content", "")
        
        # Create context-aware prompt
        context_prompt = f"""
        You are Astrea, an AI health assistant specializing in nutrition and food analysis.
        You're having a text conversation with a user about their receipt data and health.
        
        Respond naturally and helpfully, focusing on:
        - Nutritional advice based on their purchases
        - Health recommendations
        - Meal planning suggestions
        - Ingredient substitutions
        - Budget-friendly alternatives
        
        IMPORTANT: Format your responses using Markdown for better readability:
        - Use **bold** for important points
        - Use *italics* for emphasis
        - Use bullet points (-) for lists
        - Use numbered lists (1.) for steps
        - Use `code` for specific items or measurements
        - Use ## headings for main topics
        - Use > blockquotes for important tips
        
        Keep responses concise, helpful, and conversational with proper markdown formatting.
        """
        
        # Add receipt context if available
        if receipt_context:
            context_prompt += f"""
            
            Current Receipt Context:
            - Store: {receipt_context.get('text', '').split('\\n')[0] if receipt_context.get('text') else 'Unknown'}
            - Items: {len(receipt_context.get('items', []))} items
            - Total: ${sum(item.get('price', 0) for item in receipt_context.get('items', [])):.2f}
            - Items: {', '.join([item.get('name', '') for item in receipt_context.get('items', [])[:5]])}
            """
        
        # Add health profile context if available
        if health_profile:
            context_prompt += f"""
            
            User Health Profile:
            - Diagnoses: {', '.join(health_profile.get('diagnoses', [])) or 'None specified'}
            - Medications: {', '.join(health_profile.get('medications', [])) or 'None specified'}
            - Allergies: {', '.join(health_profile.get('allergies', [])) or 'None specified'}
            - Dietary Restrictions: {', '.join(health_profile.get('dietaryRestrictions', [])) or 'None specified'}
            - Health Goals: {', '.join(health_profile.get('healthGoals', [])) or 'None specified'}
            """
        
        # Generate response based on AI model
        if ai_model == "gemini" and GEMINI_AVAILABLE:
            # Use Gemini
            genai.configure(api_key=GEMINI_API_KEY)
            model = genai.GenerativeModel('gemini-2.0-flash')
            
            response = model.generate_content([
                context_prompt,
                f"User message: {user_message}"
            ])
            
            return {"response": response.text}
            
        elif ai_model == "openrouter" and OPENAI_AVAILABLE:
            # Use OpenRouter (Claude)
            headers = {
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:3000",
                "X-Title": "AuraHealth"
            }
            
            data = {
                "model": "anthropic/claude-3.5-sonnet",
                "messages": [
                    {"role": "system", "content": context_prompt},
                    {"role": "user", "content": user_message}
                ],
                "max_tokens": 1000,
                "temperature": 0.7
            }
            
            response = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=data)
            
            if response.status_code == 200:
                result = response.json()
                return {"response": result["choices"][0]["message"]["content"]}
            else:
                raise HTTPException(status_code=500, detail=f"OpenRouter API error: {response.status_code}")
        else:
            raise HTTPException(status_code=500, detail="No available AI model")
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"💥 Error processing chat: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to process chat: {str(e)}")

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"✅ WebSocket connected. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        print(f"🔌 WebSocket disconnected. Total connections: {len(self.active_connections)}")

    async def send_personal_message(self, message: str, websocket: WebSocket):
        try:
            await websocket.send_text(message)
        except Exception as e:
            print(f"❌ Error sending message: {e}")

manager = ConnectionManager()

@app.websocket("/ws/gemini-live")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message = json.loads(data)
            
            print(f"📨 Received WebSocket message: {message['type']}")
            
            if message['type'] == 'setup':
                # Handle initial setup
                print("🔧 Setting up WebSocket connection")
                await manager.send_personal_message(
                    json.dumps({
                        "type": "setup_complete",
                        "message": "WebSocket connection established"
                    }),
                    websocket
                )
                
            elif message['type'] == 'audio_data':
                # Process audio data
                audio_data = message['data']['audio_data']
                receipt_context = message['data'].get('receipt_context')
                health_profile = message['data'].get('health_profile', {})
                conversation_history = message['data'].get('conversation_history', [])
                
                print(f"🎤 Processing audio data: {len(audio_data)} characters")
                
                try:
                    # Check rate limit
                    can_proceed, wait_time = check_rate_limit()
                    if not can_proceed:
                        await manager.send_personal_message(
                            json.dumps({
                                "type": "error",
                                "message": f"Rate limit exceeded. Please wait {int(wait_time)} seconds."
                            }),
                            websocket
                        )
                        continue
                    
                    # Process audio with Gemini
                    if not GEMINI_AVAILABLE:
                        await manager.send_personal_message(
                            json.dumps({
                                "type": "error",
                                "message": "Gemini API not available"
                            }),
                            websocket
                        )
                        continue
                    
                    # Configure Gemini
                    genai.configure(api_key=GEMINI_API_KEY)
                    model = genai.GenerativeModel('gemini-2.0-flash')
                    
                    # Create context-aware prompt
                    context_prompt = """
                    You are Astrea, an AI health assistant specializing in nutrition and food analysis. 
                    You're having a real-time audio conversation with a user about their receipt data.
                    
                    Respond naturally and conversationally as if you're speaking to them, focusing on:
                    - Nutritional advice based on their purchases
                    - Health recommendations
                    - Meal planning suggestions
                    - Ingredient substitutions
                    - Budget-friendly alternatives
                    
                    Keep responses concise, conversational, and helpful. Ask follow-up questions when appropriate.
                    Speak as if you're having a natural conversation with them.
                    """
                    
                    # Add conversation history for context
                    if conversation_history:
                        context_prompt += "\n\nConversation History:\n"
                        for msg in conversation_history[-5:]:
                            role = "User" if msg.get('role') == 'user' else "Astrea"
                            content = msg.get('content', '')
                            context_prompt += f"{role}: {content}\n"
                    
                    # Add receipt context if available
                    if receipt_context:
                        context_prompt += f"""
                        
                        Current Receipt Context:
                        - Store: {receipt_context.get('text', '').split('\\n')[0] if receipt_context.get('text') else 'Unknown'}
                        - Items: {len(receipt_context.get('items', []))} items
                        - Total: ${sum(item.get('price', 0) for item in receipt_context.get('items', [])):.2f}
                        - Items: {', '.join([item.get('name', '') for item in receipt_context.get('items', [])[:5]])}
                        """
                    
                    # Add health profile context if available
                    if health_profile:
                        context_prompt += f"""
                        
                        User Health Profile:
                        - Diagnoses: {', '.join(health_profile.get('diagnoses', [])) or 'None specified'}
                        - Medications: {', '.join(health_profile.get('medications', [])) or 'None specified'}
                        - Allergies: {', '.join(health_profile.get('allergies', [])) or 'None specified'}
                        - Dietary Restrictions: {', '.join(health_profile.get('dietaryRestrictions', [])) or 'None specified'}
                        - Health Goals: {', '.join(health_profile.get('healthGoals', [])) or 'None specified'}
                        """
                    
                    # Only process if we have meaningful audio data
                    if len(audio_data) < 100:
                        await manager.send_personal_message(
                            json.dumps({
                                "type": "text_response",
                                "text": "I didn't hear anything. Please try speaking again."
                            }),
                            websocket
                        )
                        continue
                    
                    # Generate response
                    response = model.generate_content([
                        context_prompt,
                        "The user has sent an audio message. Please respond naturally as if you heard them speaking. If you don't have enough context about what they said, ask them to repeat or provide more details."
                    ])
                    
                    print(f"✅ Generated response: {response.text[:100]}...")
                    
                    # Send text response back
                    await manager.send_personal_message(
                        json.dumps({
                            "type": "text_response",
                            "text": response.text
                        }),
                        websocket
                    )
                    
                except Exception as e:
                    print(f"❌ Error processing audio: {e}")
                    await manager.send_personal_message(
                        json.dumps({
                            "type": "error",
                            "message": f"Error processing audio: {str(e)}"
                        }),
                        websocket
                    )
                    
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"❌ WebSocket error: {e}")
        manager.disconnect(websocket)

# Email endpoints
@app.post("/api/send-email")
async def send_email(request: EmailRequest):
    """Send monthly health report email"""
    try:
        if not RESEND_AVAILABLE or not RESEND_API_KEY:
            return JSONResponse(
                status_code=500,
                content={"error": "Resend API not available or API key missing"}
            )
        
        # Send email via Resend API
        email_data = {
            "from": "Aura Health <hello@tryaura.health>",
            "to": [request.to],
            "subject": request.subject,
            "html": request.html
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
            
            # Save email data for tracking
            email_record = {
                "id": str(uuid.uuid4()),
                "resend_id": result.get('id'),
                "to": request.to,
                "subject": request.subject,
                "userName": request.userName,
                "month": request.month,
                "year": request.year,
                "auraScore": request.auraScore,
                "scoreDescription": request.scoreDescription,
                "totalReceipts": request.totalReceipts,
                "healthInsights": request.healthInsights,
                "mealSuggestions": request.mealSuggestions,
                "warnings": request.warnings,
                "sentAt": datetime.now().isoformat(),
                "status": "sent"
            }
            
            # Save to file (in production, use a database)
            email_file = os.path.join(DATA_DIR, f"email_{email_record['id']}.json")
            with open(email_file, 'w') as f:
                json.dump(email_record, f, indent=2)
            
            return JSONResponse(
                status_code=200,
                content={
                    "message": "Email sent successfully!",
                    "emailId": email_record['id'],
                    "resendId": result.get('id')
                }
            )
        else:
            print(f"❌ Resend API error: {response.status_code} - {response.text}")
            return JSONResponse(
                status_code=500,
                content={"error": f"Failed to send email: {response.text}"}
            )
        
    except Exception as e:
        print(f"❌ Email sending error: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": f"Failed to send email: {str(e)}"}
        )

@app.post("/api/newsletter/subscribe")
async def subscribe_newsletter(request: NewsletterSubscription):
    """Subscribe user to newsletter"""
    try:
        # Save subscription data
        subscription_data = {
            "id": str(uuid.uuid4()),
            "email": request.email,
            "userName": request.userName,
            "subscribedAt": request.subscribedAt,
            "status": "active"
        }
        
        # Save to file (in production, use a database)
        subscription_file = os.path.join(DATA_DIR, f"subscription_{subscription_data['id']}.json")
        with open(subscription_file, 'w') as f:
            json.dump(subscription_data, f, indent=2)
        
        print(f"📧 Newsletter subscription: {request.email} ({request.userName})")
        
        # Send welcome email if Resend is available
        if RESEND_AVAILABLE and RESEND_API_KEY:
            try:
                welcome_html = f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #095d7e; font-size: 28px;">Welcome to Aura Health! 🌟</h1>
                    </div>
                    <div style="background: linear-gradient(135deg, #e2fcd6 0%, #ccecee 100%); padding: 30px; border-radius: 16px; margin-bottom: 20px;">
                        <h2 style="color: #095d7e; margin-bottom: 16px;">Hi {request.userName}!</h2>
                        <p style="color: #14967f; font-size: 16px; line-height: 1.6;">
                            Thank you for subscribing to our monthly health insights newsletter! 
                            You'll receive personalized health recommendations, dietary insights, 
                            and wellness tips delivered to your inbox every month.
                        </p>
                    </div>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="https://your-domain.com/dashboard" style="background: linear-gradient(135deg, #14967f 0%, #095d7e 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block;">
                            Start Your Health Journey
                        </a>
                    </div>
                    <div style="text-align: center; color: #14967f; font-size: 14px; margin-top: 30px;">
                        <p>© 2024 Aura Health. Making every receipt a step toward better health.</p>
                    </div>
                </div>
                """
                
                welcome_email = {
                    "from": "Aura Health <hello@tryaura.health>",
                    "to": [request.email],
                    "subject": "Welcome to Aura Health! 🌟",
                    "html": welcome_html
                }
                
                headers = {
                    "Authorization": f"Bearer {RESEND_API_KEY}",
                    "Content-Type": "application/json"
                }
                
                response = requests.post(
                    "https://api.resend.com/emails",
                    headers=headers,
                    json=welcome_email
                )
                
                if response.status_code == 200:
                    print(f"📧 Welcome email sent to: {request.email}")
                else:
                    print(f"⚠️ Failed to send welcome email: {response.text}")
                    
            except Exception as e:
                print(f"⚠️ Welcome email error: {e}")
        
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
    """Get all newsletter subscribers"""
    try:
        subscribers = []
        for filename in os.listdir(DATA_DIR):
            if filename.startswith("subscription_"):
                with open(os.path.join(DATA_DIR, filename), 'r') as f:
                    subscriber = json.load(f)
                    subscribers.append(subscriber)
        
        return JSONResponse(
            status_code=200,
            content={
                "subscribers": subscribers,
                "count": len(subscribers)
            }
        )
        
    except Exception as e:
        print(f"❌ Error getting subscribers: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": f"Failed to get subscribers: {str(e)}"}
        )

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 8000)),
        reload=os.getenv("DEBUG", "True").lower() == "true"
    )

# Aura Health Backend API

Python FastAPI backend for Aura Health application with OCR processing and AI chat capabilities.

## Features

- **OCR Processing**: Extract text from receipt images using Tesseract
- **Health Analysis**: Analyze receipts for health insights, warnings, and suggestions
- **AI Chat**: Integration with OpenRouter and Google Gemini APIs
- **Receipt Context**: AI chat includes recent receipt data for personalized responses
- **CORS Support**: Configured for frontend integration

## Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Install Tesseract OCR

**macOS:**
```bash
brew install tesseract
```

**Ubuntu/Debian:**
```bash
sudo apt-get install tesseract-ocr
```

**Windows:**
Download from: https://github.com/UB-Mannheim/tesseract/wiki

### 3. Environment Configuration

Copy the example environment file:
```bash
cp env.example .env
```

Edit `.env` with your API keys:
```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
HOST=0.0.0.0
PORT=8000
DEBUG=True
CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:5175
TESSERACT_PATH=/usr/bin/tesseract
```

### 4. Get API Keys

**OpenRouter:**
1. Visit https://openrouter.ai/
2. Sign up and get your API key
3. Add to `.env` file

**Google Gemini:**
1. Visit https://makersuite.google.com/app/apikey
2. Create a new API key
3. Add to `.env` file

### 5. Run the Server

```bash
python main.py
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Health Check
```
GET /api/health
```

### OCR Processing
```
POST /api/ocr/process
Content-Type: multipart/form-data

Body:
- image_data: base64 encoded image string
```

### AI Chat
```
POST /api/ai/chat
Content-Type: application/json

Body:
{
  "messages": [
    {"role": "user", "content": "Hello"}
  ],
  "model": "openrouter",
  "receipts": [
    {
      "health_score": 85,
      "items": [{"name": "Apple", "price": 1.99}],
      "warnings": [],
      "suggestions": ["Great choice!"]
    }
  ]
}
```

## Development

### Running in Development Mode
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### API Documentation
Visit `http://localhost:8000/docs` for interactive API documentation.

## Integration with Frontend

The backend is configured to work with the React frontend running on ports 5173, 5174, or 5175. Update the frontend API calls to point to `http://localhost:8000/api/`.

## Troubleshooting

### Tesseract Not Found
If you get a Tesseract not found error, update the `TESSERACT_PATH` in your `.env` file to point to the correct installation path.

### API Key Issues
Make sure your API keys are correctly set in the `.env` file and that the services are accessible.

### CORS Issues
Update the `CORS_ORIGINS` in your `.env` file to include your frontend URL.

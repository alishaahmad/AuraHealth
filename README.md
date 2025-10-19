# Aura Health - AI-Powered Receipt Analysis

A modern Progressive Web App (PWA) that uses AI to analyze grocery receipts for health insights, drug interactions, and dietary recommendations.

## 🌟 Features

### Frontend (React + TypeScript)
- **Modern Dashboard**: Clean sidebar layout with scrollable content areas
- **Receipt Scanning**: Upload images and get instant OCR analysis
- **Health Analysis**: AI-powered warnings and suggestions
- **AI Chat**: Context-aware chat with Astrea AI assistant
- **Multiple AI Models**: Support for OpenRouter, Gemini, and Claude
- **Responsive Design**: Works on desktop and mobile
- **PWA Support**: Installable as a native app

### Backend (Python + FastAPI)
- **OCR Processing**: Tesseract-based text extraction
- **Health Analysis**: Intelligent food safety and interaction detection
- **AI Integration**: OpenRouter and Google Gemini API support
- **Receipt Context**: AI chat includes recent receipt data
- **RESTful API**: Clean API endpoints for frontend integration

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- Tesseract OCR

### Frontend Setup

```bash
cd AuraHealth
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173` (or 5174/5175)

### Backend Setup

```bash
cd backend
chmod +x setup.sh
./setup.sh
```

Or manually:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp env.example .env
# Edit .env with your API keys
python main.py
```

The backend will be available at `http://localhost:8000`

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `backend` directory:

```env
# API Keys
OPENROUTER_API_KEY=your_openrouter_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# Server Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=True

# CORS Settings
CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:5175

# OCR Configuration
TESSERACT_PATH=/usr/bin/tesseract
```

### Getting API Keys

**OpenRouter:**
1. Visit https://openrouter.ai/
2. Sign up and get your API key
3. Add to `.env` file

**Google Gemini:**
1. Visit https://makersuite.google.com/app/apikey
2. Create a new API key
3. Add to `.env` file

## 📱 Usage

### 1. Upload Receipt
- Click "Upload" or "Camera" in the sidebar
- Select or capture a receipt image
- Wait for OCR processing and health analysis

### 2. View Analysis
- Switch to "Receipt Analysis" tab
- Review health score, warnings, and suggestions
- See extracted text and item details

### 3. Chat with Astrea
- Switch to "Chat with Astrea" tab
- Ask questions about your health or receipts
- Get personalized advice based on your recent purchases

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │
│   (React)       │◄──►│   (FastAPI)     │
│                 │    │                 │
│ • Dashboard     │    │ • OCR Service   │
│ • Chat UI       │    │ • AI Service    │
│ • Receipt View  │    │ • Health Analysis│
└─────────────────┘    └─────────────────┘
         │                       │
         │                       ▼
         │              ┌─────────────────┐
         │              │   AI APIs       │
         │              │                 │
         └──────────────►│ • OpenRouter    │
                        │ • Google Gemini │
                        │ • Claude        │
                        └─────────────────┘
```

## 🛠️ Development

### Frontend Development
```bash
cd AuraHealth
npm run dev
```

### Backend Development
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload
```

### API Documentation
Visit `http://localhost:8000/docs` for interactive API documentation.

## 📦 Project Structure

```
AuraHealth/
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx      # Main dashboard component
│   │   ├── LandingPage.tsx    # Landing page
│   │   └── AboutPage.tsx      # About page
│   ├── services/
│   │   ├── aiService.ts       # AI chat service
│   │   └── ocrService.ts      # OCR processing service
│   └── components/ui/         # Shadcn UI components
├── backend/
│   ├── main.py               # FastAPI application
│   ├── requirements.txt      # Python dependencies
│   ├── setup.sh             # Setup script
│   └── README.md            # Backend documentation
└── README.md                # This file
```

## 🔍 API Endpoints

### OCR Processing
```
POST /api/ocr/process
Content-Type: multipart/form-data
Body: image_data (base64 encoded image)
```

### AI Chat
```
POST /api/ai/chat
Content-Type: application/json
Body: {
  "messages": [{"role": "user", "content": "Hello"}],
  "model": "openrouter",
  "receipts": [...]
}
```

### Health Check
```
GET /api/health
```

## 🎨 UI Components

Built with modern design principles:
- **Shadcn/UI**: Professional component library
- **Tailwind CSS**: Utility-first styling
- **Responsive Design**: Mobile-first approach
- **Dark Mode**: Full dark mode support
- **Accessibility**: WCAG compliant components

## 🔒 Security

- API keys stored in environment variables
- CORS properly configured
- Input validation and sanitization
- Error handling and fallbacks

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy dist/ folder
```

### Backend (Railway/Heroku)
```bash
# Set environment variables
# Deploy with Python runtime
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

**Tesseract not found:**
- Install Tesseract OCR
- Update `TESSERACT_PATH` in `.env`

**API key errors:**
- Verify API keys in `.env` file
- Check API service status

**CORS errors:**
- Update `CORS_ORIGINS` in `.env`
- Ensure frontend URL is included

**Port conflicts:**
- Change ports in configuration
- Kill existing processes

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review API documentation
3. Check backend logs
4. Open an issue on GitHub

---

Built with ❤️ for better health and nutrition awareness.

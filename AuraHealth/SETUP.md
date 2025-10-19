# Aura Health Setup Guide

## Overview
Aura Health is an AI-powered progressive web app for analyzing grocery and restaurant receipts to provide health insights, drug interaction warnings, and dietary recommendations.

## Features
- 🌌 **Dark Galaxy Theme** with purple hints
- 📱 **Progressive Web App** - works offline and installs like a native app
- 📸 **OCR Receipt Scanning** - upload or scan receipts with your camera
- 🤖 **AI Chat Assistant** - Astrea AI for health questions and recommendations
- ⚠️ **Health Analysis** - drug interactions, allergen detection, dietary conflicts
- 📊 **Dashboard** - track your health insights and receipt history

## Tech Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS v4
- **UI Components**: shadcn/ui with stone theme
- **AI Integration**: OpenRouter (Claude, Gemini, etc.)
- **OCR**: Mock service (ready for real OCR integration)
- **Build Tool**: Vite

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open in Browser**
   Navigate to `http://localhost:5173`

## AI Configuration

### OpenRouter (Recommended)
1. Sign up at [OpenRouter](https://openrouter.ai/)
2. Get your API key
3. Create a `.env` file in the root directory:
   ```env
   REACT_APP_OPENROUTER_API_KEY=your_api_key_here
   ```

### Google Gemini (Alternative)
1. Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add to `.env` file:
   ```env
   REACT_APP_GEMINI_API_KEY=your_api_key_here
   ```

## Available AI Models
- **OpenRouter** (Recommended) - Best overall performance
- **Google Gemini** - Fast and reliable
- **Anthropic Claude** - Excellent for complex analysis

## Project Structure
```
src/
├── components/
│   ├── LandingPage.tsx      # Home page with galaxy theme
│   ├── AboutPage.tsx        # About page
│   ├── Dashboard.tsx        # Main dashboard with OCR and chat
│   └── ui/                  # shadcn/ui components
├── services/
│   ├── ocrService.ts        # OCR processing service
│   └── aiService.ts         # AI chat service
└── App.tsx                  # Main app with routing
```

## Features in Detail

### Receipt Scanning
- Upload images or use camera
- OCR text extraction (mock implementation)
- Health analysis with warnings and suggestions
- Drug interaction detection
- Allergen identification

### AI Chat (Astrea)
- Context-aware health assistant
- Receipt analysis integration
- Multiple AI model support
- Real-time responses

### Health Analysis
- Drug-food interaction warnings
- Allergen detection
- Dietary conflict identification
- Health score calculation
- Personalized recommendations

## Customization

### Theme Colors
The galaxy theme uses these colors:
- Primary: `#14967f` (Teal)
- Accent: `#8b5cf6` (Purple)
- Background: `#0a0a0a` (Dark space)
- Text: `#e2fcd6` (Mint green)

### Adding Real OCR
Replace the mock OCR service with real APIs:
- Google Cloud Vision API
- AWS Textract
- Azure Computer Vision
- Tesseract.js (client-side)

## Deployment
1. Build the app: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Configure environment variables for production

## Browser Support
- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers (iOS Safari, Chrome Mobile)

## License
MIT License - see LICENSE file for details

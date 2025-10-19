#!/bin/bash

# Aura Health Backend - Vercel Deployment Script

echo "🚀 Deploying Aura Health Backend to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if user is logged in
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please login to Vercel first:"
    vercel login
fi

# Deploy to Vercel
echo "📦 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Set environment variables in Vercel dashboard:"
echo "   - GEMINI_API_KEY"
echo "   - OPENAI_API_KEY" 
echo "   - RESEND_API_KEY"
echo ""
echo "2. Update your frontend .env file with the new API URL:"
echo "   VITE_API_URL=https://your-project-name.vercel.app"
echo ""
echo "3. Test your deployment:"
echo "   curl https://your-project-name.vercel.app/api/health"

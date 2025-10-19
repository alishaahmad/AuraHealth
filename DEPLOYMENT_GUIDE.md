# 🚀 Aura Health - Vercel Deployment Guide

## 📋 Complete Setup for Newsletter Functionality

### **Step 1: Backend Deployment (Already Done)**
✅ Your backend is deployed on Vercel

### **Step 2: Set Environment Variables in Vercel**

1. **Go to your Vercel Dashboard**
2. **Select your backend project**
3. **Go to Settings → Environment Variables**
4. **Add these variables:**

```
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
RESEND_API_KEY=your_resend_api_key
```

### **Step 3: Get Your Backend URL**

Your backend URL will be: `https://your-backend-project-name.vercel.app`

### **Step 4: Deploy Frontend to Vercel**

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy from frontend directory:**
   ```bash
   cd /Users/rubinaahmad/Downloads/AuraHealth/AuraHealth
   vercel
   ```

3. **Set Environment Variable for Frontend:**
   - In Vercel Dashboard → Your Frontend Project → Settings → Environment Variables
   - Add: `VITE_API_URL=https://your-backend-project-name.vercel.app`

### **Step 5: Test Newsletter Functionality**

1. **Visit your deployed frontend**
2. **Scroll to newsletter section**
3. **Enter email and subscribe**
4. **Check email (including spam folder)**

## 🔧 **Manual Configuration (Alternative)**

If you prefer to set the API URL manually:

### **Option A: Update vercel.json**
Edit `AuraHealth/vercel.json` and replace:
```json
{
  "env": {
    "VITE_API_URL": "https://your-actual-backend-url.vercel.app"
  }
}
```

### **Option B: Update .env.local**
Create `AuraHealth/.env.local`:
```
VITE_API_URL=https://your-actual-backend-url.vercel.app
```

## 📧 **Newsletter Features**

✅ **Welcome Email**: Beautiful HTML template sent on subscription
✅ **Email Templates**: Professional design with Aura Health branding
✅ **Resend Integration**: Reliable email delivery
✅ **SMTP Fallback**: Python email sender as backup
✅ **Error Handling**: Graceful fallback if email fails

## 🧪 **Testing**

### **Test Backend API:**
```bash
curl https://your-backend-url.vercel.app/api/health
```

### **Test Newsletter Subscription:**
```bash
curl -X POST https://your-backend-url.vercel.app/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "userName": "Test User", "subscribedAt": "2024-01-01T00:00:00Z"}'
```

## 🐛 **Troubleshooting**

### **Newsletter Not Working:**
1. Check Vercel environment variables are set
2. Verify backend URL is correct
3. Check Vercel function logs
4. Test with different email addresses

### **Emails Not Received:**
1. Check spam/junk folder
2. Try different email providers (Gmail, Outlook)
3. Check Resend API key is valid
4. Verify sender domain is not blocked

## 📊 **Monitoring**

- **Vercel Dashboard**: Monitor function executions and errors
- **Resend Dashboard**: Track email delivery and opens
- **Backend Logs**: Check for subscription and email sending logs

## 🎯 **Expected User Flow**

1. User visits your deployed frontend
2. User scrolls to newsletter section
3. User enters email address
4. User clicks "Subscribe"
5. User receives welcome email with beautiful template
6. User can start using the app

---

**Need Help?** Check the Vercel function logs for detailed error messages.

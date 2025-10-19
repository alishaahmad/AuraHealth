# Email Setup Guide

## Overview
This project includes a complete email system for sending monthly health reports and managing newsletter subscriptions.

## Features
- 📧 Monthly health report emails with beautiful HTML templates
- 📬 Newsletter subscription management
- 🎨 React Email templates with responsive design
- 🔧 Email preview functionality
- 📊 Backend API for email management

## Setup

### 1. Install Dependencies
```bash
npm install react-email @react-email/components resend
```

### 2. Environment Variables
Create a `.env` file in the root directory:
```env
# Email Configuration
RESEND_API_KEY=your_resend_api_key_here
FROM=Aura Health <hello@tryaura.health>
TO=your.email@example.com

# For testing email preview
SEND=false
```

### 3. Email Preview
To preview the email template:
```bash
npm run email:preview
```

This will:
- Generate the HTML email template
- Save it to `tmp/aura-preview.html`
- Open it in your default browser

### 4. Send Test Email
To send a test email (requires RESEND_API_KEY):
```bash
npm run email:send
```

## File Structure
```
src/
├── components/
│   └── AuraMonthlyReport.tsx    # Main email template
├── services/
│   └── emailService.ts          # Frontend email service
scripts/
├── email-preview.ts             # Email preview script
backend/
└── main.py                      # Backend email endpoints
```

## API Endpoints

### Newsletter Subscription
- **POST** `/api/newsletter/subscribe`
- **GET** `/api/newsletter/subscribers`

### Email Sending
- **POST** `/api/send-email`

## Usage in Frontend

### Newsletter Subscription
```typescript
import { EmailService } from '@/services/emailService';

const result = await EmailService.subscribeToNewsletter(email, userName);
if (result.success) {
  console.log('Subscribed successfully!');
}
```

### Send Monthly Report
```typescript
const emailData = {
  userName: 'John Doe',
  email: 'john@example.com',
  month: 'November',
  year: 2024,
  auraScore: 85,
  scoreDescription: 'Great job!',
  // ... other data
};

const result = await EmailService.sendMonthlyReport(emailData);
```

## Email Template Features
- 🎨 Beautiful gradient design matching Aura Health theme
- 📱 Responsive layout for all devices
- 📊 Health score visualization
- 📈 Monthly statistics
- 💡 Health insights and suggestions
- ⚠️ Warning notifications
- 🔗 Call-to-action buttons

## Production Setup
For production, integrate with a real email service:
- **Resend** (recommended)
- **SendGrid**
- **Mailgun**
- **AWS SES**

Update the backend email endpoints to use your chosen service.

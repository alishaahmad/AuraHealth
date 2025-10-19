import { render } from '@react-email/components';
import WelcomeEmail from '../components/WelcomeEmail';

export async function POST(request: Request) {
  try {
    const { email, userName } = await request.json();
    
    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate welcome email HTML using React Email
    const emailHtml = await render(
      WelcomeEmail({
        userName: userName || 'Valued User'
      })
    );

    // Send to backend email service
    const backendUrl = process.env.VITE_API_URL || 'http://localhost:8000';
    const response = await fetch(`${backendUrl}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: email,
        subject: 'Welcome to Aura Health! 🌟',
        html: emailHtml,
        userName: userName || 'Valued User',
        month: new Date().toLocaleString('default', { month: 'long' }),
        year: new Date().getFullYear(),
        auraScore: 0,
        scoreDescription: '',
        totalReceipts: 0,
        healthInsights: [],
        mealSuggestions: [],
        warnings: []
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Welcome email sent successfully!',
      emailId: result.emailId
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Welcome email sending error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to send welcome email'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

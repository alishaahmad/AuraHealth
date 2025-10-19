import { render } from '@react-email/components';
import AuraMonthlyReport from '../components/AuraMonthlyReport';
import WelcomeEmail from '../components/WelcomeEmail';

export interface EmailData {
  userName: string;
  email: string;
  month: string;
  year: number;
  auraScore: number;
  scoreDescription: string;
  totalReceipts?: number;
  healthInsights?: string[];
  mealSuggestions?: string[];
  warnings?: string[];
}

export class EmailService {
  private static baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  static async sendMonthlyReport(emailData: EmailData): Promise<{ success: boolean; message: string }> {
    try {
      // Generate email HTML using React Email
      const emailHtml = await render(
        AuraMonthlyReport({
          userName: emailData.userName,
          month: emailData.month,
          year: emailData.year,
          auraScore: emailData.auraScore,
          scoreDescription: emailData.scoreDescription
        })
      );

      // Send to backend
      const response = await fetch(`${this.baseUrl}/api/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: emailData.email,
          subject: `Your ${emailData.month} ${emailData.year} Health Snapshot from Aura 🌟`,
          html: emailHtml,
          userName: emailData.userName,
          month: emailData.month,
          year: emailData.year,
          auraScore: emailData.auraScore,
          scoreDescription: emailData.scoreDescription,
          totalReceipts: emailData.totalReceipts,
          healthInsights: emailData.healthInsights,
          mealSuggestions: emailData.mealSuggestions,
          warnings: emailData.warnings
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, message: result.message || 'Email sent successfully!' };
    } catch (error) {
      console.error('Email sending error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to send email' 
      };
    }
  }

  static async subscribeToNewsletter(email: string, userName?: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          userName: userName || 'Valued User',
          subscribedAt: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, message: result.message || 'Successfully subscribed to newsletter!' };
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to subscribe to newsletter' 
      };
    }
  }

  static async sendWelcomeEmail(email: string, userName?: string): Promise<{ success: boolean; message: string }> {
    try {
      // Generate welcome email HTML using React Email
      const emailHtml = await render(
        WelcomeEmail({
          userName: userName || 'Valued User'
        })
      );

      // Send to backend
      const response = await fetch(`${this.baseUrl}/api/send-email`, {
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
      return { success: true, message: result.message || 'Welcome email sent successfully!' };
    } catch (error) {
      console.error('Welcome email sending error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to send welcome email' 
      };
    }
  }

  static generateSampleData(): EmailData {
    return {
      userName: 'Valued User',
      email: 'user@example.com',
      month: new Date().toLocaleString('default', { month: 'long' }),
      year: new Date().getFullYear(),
      auraScore: Math.floor(Math.random() * 40) + 60, // 60-100
      scoreDescription: "You're doing great! Keep up the healthy choices.",
      totalReceipts: Math.floor(Math.random() * 20) + 5, // 5-25
      healthInsights: [
        "Your vegetable intake has increased by 15% this month",
        "Consider reducing processed foods for better health",
        "Great job on choosing whole grains over refined options"
      ],
      mealSuggestions: [
        "Try our Mediterranean-inspired meal plan",
        "Add more leafy greens to your salads",
        "Consider plant-based protein alternatives"
      ],
      warnings: [
        "Watch out for high sodium in canned foods",
        "Consider reducing sugar intake from beverages"
      ]
    };
  }
}

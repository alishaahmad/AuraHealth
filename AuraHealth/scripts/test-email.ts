import { EmailService } from '../src/services/emailService';

async function testEmail() {
  console.log('🧪 Testing email functionality...');
  
  try {
    // Test newsletter subscription
    console.log('📧 Testing newsletter subscription...');
    const subscriptionResult = await EmailService.subscribeToNewsletter(
      'test@example.com',
      'Test User'
    );
    console.log('Newsletter subscription result:', subscriptionResult);
    
    // Test monthly report email
    console.log('📧 Testing monthly report email...');
    const emailData = EmailService.generateSampleData();
    emailData.email = 'test@example.com';
    emailData.userName = 'Test User';
    
    const emailResult = await EmailService.sendMonthlyReport(emailData);
    console.log('Monthly report result:', emailResult);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testEmail();

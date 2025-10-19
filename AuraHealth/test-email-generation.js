// Test script to verify React Email template generation
import { render } from '@react-email/components';
import WelcomeEmail from './src/components/WelcomeEmail.tsx';
import AuraMonthlyReport from './src/components/AuraMonthlyReport.tsx';

async function testWelcomeEmail() {
  console.log('🧪 Testing Welcome Email generation...');
  
  try {
    const html = await render(WelcomeEmail({
      userName: 'Test User'
    }));
    
    console.log('✅ Welcome Email generated successfully');
    console.log(`📏 Length: ${html.length} characters`);
    console.log(`🎨 Contains Aura Health branding: ${html.includes('AURA HEALTH') ? 'Yes' : 'No'}`);
    console.log(`🎨 Contains welcome message: ${html.includes('Welcome to Aura Health') ? 'Yes' : 'No'}`);
    
    return html;
  } catch (error) {
    console.error('❌ Welcome Email generation failed:', error);
    return null;
  }
}

async function testMonthlyReport() {
  console.log('🧪 Testing Monthly Report generation...');
  
  try {
    const html = await render(AuraMonthlyReport({
      userName: 'Test User',
      month: 'November',
      year: 2025,
      auraScore: 78,
      scoreDescription: 'You\'re on the right track!',
      totalReceipts: 12,
      healthInsights: ['Test insight 1', 'Test insight 2'],
      mealSuggestions: ['Test suggestion 1'],
      warnings: ['Test warning 1']
    }));
    
    console.log('✅ Monthly Report generated successfully');
    console.log(`📏 Length: ${html.length} characters`);
    console.log(`🎨 Contains Aura Health branding: ${html.includes('AURA HEALTH') ? 'Yes' : 'No'}`);
    console.log(`🎨 Contains score section: ${html.includes('YOUR AURA SCORE') ? 'Yes' : 'No'}`);
    console.log(`🎨 Contains metrics grid: ${html.includes('Receipts Scanned') ? 'Yes' : 'No'}`);
    
    return html;
  } catch (error) {
    console.error('❌ Monthly Report generation failed:', error);
    return null;
  }
}

async function main() {
  console.log('🚀 Starting React Email template tests...\n');
  
  const welcomeHtml = await testWelcomeEmail();
  console.log('');
  
  const monthlyHtml = await testMonthlyReport();
  console.log('');
  
  if (welcomeHtml && monthlyHtml) {
    console.log('🎉 All tests passed! React Email templates are working correctly.');
  } else {
    console.log('❌ Some tests failed. Check the errors above.');
  }
}

main().catch(console.error);

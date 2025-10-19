import fs from 'fs';
import path from 'path';
import { render } from '@react-email/components';
import WelcomeEmail from '../src/components/WelcomeEmail.tsx';
import AuraMonthlyReport from '../src/components/AuraMonthlyReport.tsx';

const TEMPLATES_DIR = path.join(process.cwd(), 'email-templates');

async function generateWelcomeEmailTemplate() {
  console.log('📧 Generating welcome email template...');
  
  const html = await render(WelcomeEmail({
    userName: '{{USER_NAME}}' // Placeholder for dynamic replacement
  }));
  
  // Create templates directory if it doesn't exist
  if (!fs.existsSync(TEMPLATES_DIR)) {
    fs.mkdirSync(TEMPLATES_DIR, { recursive: true });
  }
  
  // Write template file
  const templatePath = path.join(TEMPLATES_DIR, 'welcome-email.html');
  fs.writeFileSync(templatePath, html, 'utf8');
  
  console.log(`✅ Welcome email template saved to: ${templatePath}`);
  return html;
}

async function generateMonthlyReportTemplate() {
  console.log('📊 Generating monthly report template...');
  
  const html = await render(AuraMonthlyReport({
    userName: '{{USER_NAME}}',
    month: '{{MONTH}}',
    year: '{{YEAR}}',
    auraScore: '{{AURA_SCORE}}',
    scoreDescription: '{{SCORE_DESCRIPTION}}',
    totalReceipts: '{{TOTAL_RECEIPTS}}',
    healthInsights: '{{HEALTH_INSIGHTS}}',
    mealSuggestions: '{{MEAL_SUGGESTIONS}}',
    warnings: '{{WARNINGS}}'
  }));
  
  // Create templates directory if it doesn't exist
  if (!fs.existsSync(TEMPLATES_DIR)) {
    fs.mkdirSync(TEMPLATES_DIR, { recursive: true });
  }
  
  // Write template file
  const templatePath = path.join(TEMPLATES_DIR, 'monthly-report.html');
  fs.writeFileSync(templatePath, html, 'utf8');
  
  console.log(`✅ Monthly report template saved to: ${templatePath}`);
  return html;
}

async function main() {
  console.log('🚀 Generating email templates for Vercel deployment...\n');
  
  try {
    await generateWelcomeEmailTemplate();
    console.log('');
    await generateMonthlyReportTemplate();
    console.log('');
    
    console.log('🎉 All email templates generated successfully!');
    console.log('📁 Templates saved in: email-templates/');
    console.log('🚀 Ready for Vercel deployment!');
    
  } catch (error) {
    console.error('❌ Error generating templates:', error);
    process.exit(1);
  }
}

main().catch(console.error);

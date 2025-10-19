"""
Email template loader for Vercel deployment
Loads pre-generated React Email templates and replaces placeholders
"""
import os
import json
from pathlib import Path

class EmailTemplateLoader:
    def __init__(self):
        # Try multiple possible paths for the templates
        possible_paths = [
            Path(__file__).parent.parent / "AuraHealth" / "email-templates",
            Path(__file__).parent / "email-templates",
            Path("/Users/rubinaahmad/Downloads/AuraHealth/AuraHealth/email-templates"),
            Path("email-templates")
        ]
        
        self.templates_dir = None
        for path in possible_paths:
            if path.exists():
                self.templates_dir = path
                print(f"✅ Found templates directory: {path}")
                break
        
        if not self.templates_dir:
            print("⚠️ Templates directory not found, will use fallback templates")
            self.templates_dir = Path("email-templates")
        
        self.welcome_template = None
        self.monthly_report_template = None
        self._load_templates()
    
    def _load_templates(self):
        """Load email templates from the generated HTML files"""
        try:
            # Load welcome email template
            welcome_path = self.templates_dir / "welcome-email.html"
            if welcome_path.exists():
                with open(welcome_path, 'r', encoding='utf-8') as f:
                    self.welcome_template = f.read()
                print(f"✅ Loaded welcome email template ({len(self.welcome_template)} chars)")
            else:
                print(f"⚠️ Welcome email template not found at {welcome_path}")
            
            # Load monthly report template
            monthly_path = self.templates_dir / "monthly-report.html"
            if monthly_path.exists():
                with open(monthly_path, 'r', encoding='utf-8') as f:
                    self.monthly_report_template = f.read()
                print(f"✅ Loaded monthly report template ({len(self.monthly_report_template)} chars)")
            else:
                print(f"⚠️ Monthly report template not found at {monthly_path}")
                
        except Exception as e:
            print(f"❌ Error loading email templates: {e}")
    
    def get_welcome_email(self, user_name: str) -> str:
        """Get welcome email HTML with user name replaced"""
        if not self.welcome_template:
            return self._get_fallback_welcome_template(user_name)
        
        return self.welcome_template.replace('{{USER_NAME}}', user_name)
    
    def get_monthly_report_email(self, user_name: str, month: str, year: int, 
                                aura_score: int, score_description: str,
                                total_receipts: int = 0, health_insights: list = None,
                                meal_suggestions: list = None, warnings: list = None) -> str:
        """Get monthly report email HTML with data replaced"""
        if not self.monthly_report_template:
            return self._get_fallback_monthly_template(user_name, month, year, aura_score, score_description)
        
        # Replace placeholders
        html = self.monthly_report_template
        html = html.replace('{{USER_NAME}}', user_name)
        html = html.replace('{{MONTH}}', month)
        html = html.replace('{{YEAR}}', str(year))
        html = html.replace('{{AURA_SCORE}}', str(aura_score))
        html = html.replace('{{SCORE_DESCRIPTION}}', score_description)
        html = html.replace('{{TOTAL_RECEIPTS}}', str(total_receipts))
        
        # Replace lists (convert to HTML)
        if health_insights:
            insights_html = ''.join([f'<li>{insight}</li>' for insight in health_insights])
            html = html.replace('{{HEALTH_INSIGHTS}}', insights_html)
        else:
            html = html.replace('{{HEALTH_INSIGHTS}}', '')
            
        if meal_suggestions:
            suggestions_html = ''.join([f'<li>{suggestion}</li>' for suggestion in meal_suggestions])
            html = html.replace('{{MEAL_SUGGESTIONS}}', suggestions_html)
        else:
            html = html.replace('{{MEAL_SUGGESTIONS}}', '')
            
        if warnings:
            warnings_html = ''.join([f'<li>{warning}</li>' for warning in warnings])
            html = html.replace('{{WARNINGS}}', warnings_html)
        else:
            html = html.replace('{{WARNINGS}}', '')
        
        return html
    
    def _get_fallback_welcome_template(self, user_name: str) -> str:
        """Fallback welcome template if React Email template not available"""
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Welcome to Aura Health</title>
            <style>
                body {{ font-family: Arial, sans-serif; background-color: #ccecee; padding: 20px; }}
                .container {{ max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; }}
                .header {{ background: #14967f; color: white; padding: 40px; text-align: center; }}
                .content {{ padding: 40px; }}
                .cta {{ text-align: center; margin: 30px 0; }}
                .button {{ background: #14967f; color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; display: inline-block; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🌟 Welcome to Aura Health!</h1>
                </div>
                <div class="content">
                    <h2>Hi {user_name}!</h2>
                    <p>Thank you for subscribing to our monthly health insights newsletter! You'll receive personalized health recommendations, dietary insights, and wellness tips delivered to your inbox every month.</p>
                    <div class="cta">
                        <a href="https://tryaura.health/dashboard" class="button">Start Your Health Journey</a>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """
    
    def _get_fallback_monthly_template(self, user_name: str, month: str, year: int, 
                                     aura_score: int, score_description: str) -> str:
        """Fallback monthly template if React Email template not available"""
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Your {month} Health Snapshot</title>
            <style>
                body {{ font-family: Arial, sans-serif; background-color: #ccecee; padding: 20px; }}
                .container {{ max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; }}
                .header {{ background: #14967f; color: white; padding: 40px; text-align: center; }}
                .content {{ padding: 40px; }}
                .score {{ background: #e8f5f3; padding: 30px; border-radius: 16px; text-align: center; margin: 20px 0; }}
                .score-number {{ font-size: 72px; font-weight: bold; color: #14967f; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Your {month} {year} Health Snapshot</h1>
                </div>
                <div class="content">
                    <div class="score">
                        <div class="score-number">{aura_score}</div>
                        <p>Out of 100</p>
                        <p>{score_description}</p>
                    </div>
                    <p>Hi {user_name}, here's your monthly health report from Aura Health!</p>
                </div>
            </div>
        </body>
        </html>
        """

# Global template loader instance
template_loader = EmailTemplateLoader()

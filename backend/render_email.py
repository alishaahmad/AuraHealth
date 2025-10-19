"""
Email rendering service using React Email templates
"""
import subprocess
import json
import os
import tempfile
from pathlib import Path

def render_welcome_email(user_name: str) -> str:
    """Render welcome email using React Email"""
    try:
        # Create a temporary script to render the email
        script_content = f'''
import {{ render }} from '@react-email/components';
import WelcomeEmail from '../src/components/WelcomeEmail';

async function main() {{
    const html = await render(WelcomeEmail({{
        userName: "{user_name}"
    }}));
    console.log(html);
}}

main().catch(console.error);
'''
        
        # Write script to temporary file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.ts', delete=False) as f:
            f.write(script_content)
            script_path = f.name
        
        try:
            # Run the script from the AuraHealth directory
            result = subprocess.run(
                ['npx', 'tsx', script_path],
                cwd='/Users/rubinaahmad/Downloads/AuraHealth/AuraHealth',
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if result.returncode == 0:
                return result.stdout.strip()
            else:
                print(f"Error rendering email: {result.stderr}")
                return None
                
        finally:
            # Clean up temporary file
            os.unlink(script_path)
            
    except Exception as e:
        print(f"Error in render_welcome_email: {e}")
        return None

def render_monthly_report(user_name: str, month: str, year: int, aura_score: int, 
                         score_description: str, total_receipts: int = 0,
                         health_insights: list = None, meal_suggestions: list = None,
                         warnings: list = None) -> str:
    """Render monthly report email using React Email"""
    try:
        if health_insights is None:
            health_insights = []
        if meal_suggestions is None:
            meal_suggestions = []
        if warnings is None:
            warnings = []
            
        # Create a temporary script to render the email
        script_content = f'''
import {{ render }} from '@react-email/components';
import AuraMonthlyReport from '../src/components/AuraMonthlyReport';

async function main() {{
    const html = await render(AuraMonthlyReport({{
        userName: "{user_name}",
        month: "{month}",
        year: {year},
        auraScore: {aura_score},
        scoreDescription: "{score_description}",
        totalReceipts: {total_receipts},
        healthInsights: {json.dumps(health_insights)},
        mealSuggestions: {json.dumps(meal_suggestions)},
        warnings: {json.dumps(warnings)}
    }}));
    console.log(html);
}}

main().catch(console.error);
'''
        
        # Write script to temporary file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.ts', delete=False) as f:
            f.write(script_content)
            script_path = f.name
        
        try:
            # Run the script from the AuraHealth directory
            result = subprocess.run(
                ['npx', 'tsx', script_path],
                cwd='/Users/rubinaahmad/Downloads/AuraHealth/AuraHealth',
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if result.returncode == 0:
                return result.stdout.strip()
            else:
                print(f"Error rendering email: {result.stderr}")
                return None
                
        finally:
            # Clean up temporary file
            os.unlink(script_path)
            
    except Exception as e:
        print(f"Error in render_monthly_report: {e}")
        return None

if __name__ == "__main__":
    # Test the rendering
    print("Testing welcome email rendering...")
    welcome_html = render_welcome_email("Test User")
    if welcome_html:
        print("✅ Welcome email rendered successfully")
        print(f"Length: {len(welcome_html)} characters")
    else:
        print("❌ Failed to render welcome email")
    
    print("\nTesting monthly report rendering...")
    monthly_html = render_monthly_report(
        user_name="Test User",
        month="November",
        year=2025,
        aura_score=78,
        score_description="You're doing great!",
        total_receipts=12,
        health_insights=["Test insight 1", "Test insight 2"],
        meal_suggestions=["Test suggestion 1"],
        warnings=["Test warning 1"]
    )
    if monthly_html:
        print("✅ Monthly report rendered successfully")
        print(f"Length: {len(monthly_html)} characters")
    else:
        print("❌ Failed to render monthly report")

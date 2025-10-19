"""
Email templates for Aura Health
"""

def get_welcome_email_template(user_name: str) -> str:
    """Generate welcome email HTML template"""
    return f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Aura Health</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f8fafc;
            }}
            .container {{
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }}
            .header {{
                background: linear-gradient(135deg, #14967f 0%, #095d7e 100%);
                color: white;
                text-align: center;
                padding: 40px 20px;
            }}
            .header h1 {{
                margin: 0;
                font-size: 28px;
                font-weight: bold;
            }}
            .content {{
                padding: 40px 30px;
            }}
            .welcome-section {{
                background: linear-gradient(135deg, #e2fcd6 0%, #ccecee 100%);
                padding: 30px;
                border-radius: 16px;
                margin-bottom: 30px;
                text-align: center;
            }}
            .welcome-section h2 {{
                color: #095d7e;
                margin: 0 0 16px 0;
                font-size: 24px;
            }}
            .welcome-section p {{
                color: #14967f;
                font-size: 16px;
                line-height: 1.6;
                margin: 0;
            }}
            .cta-button {{
                display: inline-block;
                background: linear-gradient(135deg, #14967f 0%, #095d7e 100%);
                color: white;
                padding: 16px 32px;
                text-decoration: none;
                border-radius: 12px;
                font-weight: bold;
                font-size: 16px;
                margin: 20px 0;
                transition: transform 0.2s ease;
            }}
            .cta-button:hover {{
                transform: translateY(-2px);
            }}
            .features {{
                margin: 30px 0;
            }}
            .feature {{
                display: flex;
                align-items: center;
                margin: 15px 0;
                padding: 15px;
                background-color: #f8fafc;
                border-radius: 8px;
            }}
            .feature-icon {{
                font-size: 24px;
                margin-right: 15px;
            }}
            .feature-text {{
                color: #095d7e;
                font-weight: 500;
            }}
            .footer {{
                text-align: center;
                padding: 30px;
                background-color: #f8fafc;
                color: #14967f;
                font-size: 14px;
            }}
            .footer p {{
                margin: 0;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🌟 Welcome to Aura Health!</h1>
            </div>
            
            <div class="content">
                <div class="welcome-section">
                    <h2>Hi {user_name}!</h2>
                    <p>
                        Thank you for subscribing to our monthly health insights newsletter! 
                        You'll receive personalized health recommendations, dietary insights, 
                        and wellness tips delivered to your inbox every month.
                    </p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="https://aura-health.vercel.app/dashboard" class="cta-button">
                        Start Your Health Journey
                    </a>
                </div>
                
                <div class="features">
                    <h3 style="color: #095d7e; text-align: center; margin-bottom: 20px;">What you can expect:</h3>
                    
                    <div class="feature">
                        <div class="feature-icon">📊</div>
                        <div class="feature-text">Monthly health score analysis and personalized insights</div>
                    </div>
                    
                    <div class="feature">
                        <div class="feature-icon">🍎</div>
                        <div class="feature-text">Nutritional recommendations based on your receipt data</div>
                    </div>
                    
                    <div class="feature">
                        <div class="feature-icon">⚠️</div>
                        <div class="feature-text">Important health warnings and dietary conflict alerts</div>
                    </div>
                    
                    <div class="feature">
                        <div class="feature-icon">🍽️</div>
                        <div class="feature-text">Custom meal plans and healthy recipe suggestions</div>
                    </div>
                </div>
            </div>
            
            <div class="footer">
                <p>© 2024 Aura Health. Making every receipt a step toward better health.</p>
                <p>You can unsubscribe at any time by replying to this email.</p>
            </div>
        </div>
    </body>
    </html>
    """

def get_monthly_report_template(user_name: str, month: str, year: int, aura_score: int, 
                              score_description: str, total_receipts: int = 0,
                              health_insights: list = None, meal_suggestions: list = None,
                              warnings: list = None) -> str:
    """Generate monthly health report email template"""
    if health_insights is None:
        health_insights = []
    if meal_suggestions is None:
        meal_suggestions = []
    if warnings is None:
        warnings = []
    
    return f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your {month} Health Snapshot</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f8fafc;
            }}
            .container {{
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }}
            .header {{
                background: linear-gradient(135deg, #14967f 0%, #095d7e 100%);
                color: white;
                text-align: center;
                padding: 40px 20px;
            }}
            .header h1 {{
                margin: 0;
                font-size: 28px;
                font-weight: bold;
            }}
            .content {{
                padding: 40px 30px;
            }}
            .score-section {{
                background: linear-gradient(135deg, #e2fcd6 0%, #ccecee 100%);
                padding: 30px;
                border-radius: 16px;
                margin-bottom: 30px;
                text-align: center;
            }}
            .score-circle {{
                width: 100px;
                height: 100px;
                border-radius: 50%;
                background: linear-gradient(135deg, #14967f 0%, #095d7e 100%);
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 36px;
                font-weight: bold;
                margin: 0 auto 20px;
            }}
            .score-description {{
                color: #095d7e;
                font-size: 16px;
                margin: 0;
            }}
            .stats {{
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 20px;
                margin: 30px 0;
            }}
            .stat {{
                text-align: center;
                padding: 20px;
                background-color: #f8fafc;
                border-radius: 8px;
            }}
            .stat-number {{
                font-size: 24px;
                font-weight: bold;
                color: #14967f;
                margin: 0;
            }}
            .stat-label {{
                color: #095d7e;
                font-size: 14px;
                margin: 5px 0 0 0;
            }}
            .section {{
                margin: 30px 0;
            }}
            .section h3 {{
                color: #095d7e;
                margin-bottom: 15px;
            }}
            .insight-list {{
                list-style: none;
                padding: 0;
            }}
            .insight-list li {{
                background-color: #f8fafc;
                padding: 15px;
                margin: 10px 0;
                border-radius: 8px;
                border-left: 4px solid #14967f;
            }}
            .warning {{
                background-color: #fef2f2;
                border-left-color: #ef4444;
            }}
            .footer {{
                text-align: center;
                padding: 30px;
                background-color: #f8fafc;
                color: #14967f;
                font-size: 14px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Your {month} {year} Health Snapshot</h1>
            </div>
            
            <div class="content">
                <div class="score-section">
                    <h2 style="color: #095d7e; margin: 0 0 20px 0;">Your Aura Score</h2>
                    <div class="score-circle">{aura_score}</div>
                    <p class="score-description">{score_description}</p>
                </div>
                
                <div class="stats">
                    <div class="stat">
                        <p class="stat-number">{total_receipts}</p>
                        <p class="stat-label">Receipts Analyzed</p>
                    </div>
                    <div class="stat">
                        <p class="stat-number">{aura_score}</p>
                        <p class="stat-label">Health Score</p>
                    </div>
                    <div class="stat">
                        <p class="stat-number">{len(health_insights)}</p>
                        <p class="stat-label">Health Insights</p>
                    </div>
                    <div class="stat">
                        <p class="stat-number">{len(meal_suggestions)}</p>
                        <p class="stat-label">Meal Suggestions</p>
                    </div>
                </div>
                
                {f'''
                <div class="section">
                    <h3>🏥 Health Insights</h3>
                    <ul class="insight-list">
                        {''.join([f'<li>{insight}</li>' for insight in health_insights])}
                    </ul>
                </div>
                ''' if health_insights else ''}
                
                {f'''
                <div class="section">
                    <h3>🍽️ Meal Suggestions</h3>
                    <ul class="insight-list">
                        {''.join([f'<li>{suggestion}</li>' for suggestion in meal_suggestions])}
                    </ul>
                </div>
                ''' if meal_suggestions else ''}
                
                {f'''
                <div class="section">
                    <h3>⚠️ Important Warnings</h3>
                    <ul class="insight-list">
                        {''.join([f'<li class="warning">{warning}</li>' for warning in warnings])}
                    </ul>
                </div>
                ''' if warnings else ''}
            </div>
            
            <div class="footer">
                <p>© 2024 Aura Health. Making every receipt a step toward better health.</p>
                <p>Keep scanning receipts to improve your health insights!</p>
            </div>
        </div>
    </body>
    </html>
    """

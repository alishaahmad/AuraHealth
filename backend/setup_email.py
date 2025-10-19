#!/usr/bin/env python3
"""
Email setup script for Aura Health
"""

import os
import sys

def setup_email_config():
    """Interactive setup for email configuration"""
    print("🚀 Aura Health Email Setup")
    print("=" * 40)
    
    # Check if .env exists
    env_file = ".env"
    if not os.path.exists(env_file):
        print("❌ .env file not found!")
        return False
    
    print("📧 Email Configuration Setup")
    print()
    
    # Get Resend API key
    print("1. Resend API Key (Required)")
    print("   Get your API key from: https://resend.com/api-keys")
    resend_key = input("   Enter your Resend API key: ").strip()
    
    if not resend_key or resend_key.startswith("re_"):
        print("✅ Valid Resend API key format detected")
    else:
        print("⚠️  Resend API keys usually start with 're_'")
    
    # Optional SMTP setup
    print()
    print("2. SMTP Fallback (Optional)")
    print("   This is used if Resend fails")
    use_smtp = input("   Do you want to set up SMTP fallback? (y/n): ").strip().lower()
    
    smtp_config = {}
    if use_smtp == 'y':
        smtp_config['server'] = input("   SMTP Server (default: smtp.gmail.com): ").strip() or "smtp.gmail.com"
        smtp_config['port'] = input("   SMTP Port (default: 587): ").strip() or "587"
        smtp_config['email'] = input("   Your email address: ").strip()
        smtp_config['password'] = input("   Your app password: ").strip()
    
    # Update .env file
    print()
    print("📝 Updating .env file...")
    
    # Read current .env
    with open(env_file, 'r') as f:
        lines = f.readlines()
    
    # Update RESEND_API_KEY
    updated_lines = []
    for line in lines:
        if line.startswith("RESEND_API_KEY="):
            updated_lines.append(f"RESEND_API_KEY={resend_key}\n")
        elif use_smtp == 'y' and line.startswith("SMTP_SERVER="):
            updated_lines.append(f"SMTP_SERVER={smtp_config['server']}\n")
        elif use_smtp == 'y' and line.startswith("SMTP_PORT="):
            updated_lines.append(f"SMTP_PORT={smtp_config['port']}\n")
        elif use_smtp == 'y' and line.startswith("SENDER_EMAIL="):
            updated_lines.append(f"SENDER_EMAIL={smtp_config['email']}\n")
        elif use_smtp == 'y' and line.startswith("SENDER_PASSWORD="):
            updated_lines.append(f"SENDER_PASSWORD={smtp_config['password']}\n")
        else:
            updated_lines.append(line)
    
    # Write updated .env
    with open(env_file, 'w') as f:
        f.writelines(updated_lines)
    
    print("✅ .env file updated successfully!")
    print()
    print("🔄 Please restart your backend server:")
    print("   cd /Users/rubinaahmad/Downloads/AuraHealth/backend")
    print("   source venv/bin/activate")
    print("   python main.py")
    print()
    print("🧪 Then test with:")
    print("   python test_email.py")
    
    return True

if __name__ == "__main__":
    setup_email_config()

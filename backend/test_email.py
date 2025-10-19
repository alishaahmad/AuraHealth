#!/usr/bin/env python3
"""
Test script for email functionality
"""

import os
import sys
import json
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_newsletter_subscription():
    """Test newsletter subscription"""
    print("🧪 Testing newsletter subscription...")
    
    # Test data
    test_data = {
        "email": "test@example.com",
        "userName": "Test User",
        "subscribedAt": "2024-01-01T00:00:00Z"
    }
    
    # API endpoint
    api_url = "http://localhost:8000/api/newsletter/subscribe"
    
    try:
        response = requests.post(api_url, json=test_data)
        print(f"📊 Status Code: {response.status_code}")
        print(f"📝 Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Newsletter subscription test passed!")
            return True
        else:
            print("❌ Newsletter subscription test failed!")
            return False
            
    except Exception as e:
        print(f"❌ Error testing newsletter subscription: {e}")
        return False

def test_email_sending():
    """Test email sending"""
    print("🧪 Testing email sending...")
    
    # Test data
    test_data = {
        "to": "test@example.com",
        "subject": "Test Email from Aura Health",
        "html": "<h1>Test Email</h1><p>This is a test email from Aura Health.</p>",
        "userName": "Test User",
        "month": "January",
        "year": 2024,
        "auraScore": 85,
        "scoreDescription": "Great job!",
        "totalReceipts": 5,
        "healthInsights": ["Eat more vegetables", "Drink more water"],
        "mealSuggestions": ["Try a green smoothie", "Add more protein"],
        "warnings": ["Watch sodium intake"]
    }
    
    # API endpoint
    api_url = "http://localhost:8000/api/send-email"
    
    try:
        response = requests.post(api_url, json=test_data)
        print(f"📊 Status Code: {response.status_code}")
        print(f"📝 Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Email sending test passed!")
            return True
        else:
            print("❌ Email sending test failed!")
            return False
            
    except Exception as e:
        print(f"❌ Error testing email sending: {e}")
        return False

def check_environment():
    """Check if required environment variables are set"""
    print("🔍 Checking environment variables...")
    
    required_vars = ["RESEND_API_KEY"]
    optional_vars = ["SMTP_SERVER", "SMTP_PORT", "SENDER_EMAIL", "SENDER_PASSWORD"]
    
    all_good = True
    
    for var in required_vars:
        if os.getenv(var):
            print(f"✅ {var}: Set")
        else:
            print(f"❌ {var}: Not set")
            all_good = False
    
    for var in optional_vars:
        if os.getenv(var):
            print(f"✅ {var}: Set")
        else:
            print(f"⚠️  {var}: Not set (optional for fallback)")
    
    return all_good

if __name__ == "__main__":
    print("🚀 Aura Health Email Testing")
    print("=" * 40)
    
    # Check environment
    env_ok = check_environment()
    print()
    
    if not env_ok:
        print("❌ Required environment variables not set!")
        print("Please set RESEND_API_KEY in your .env file")
        sys.exit(1)
    
    # Test newsletter subscription
    newsletter_ok = test_newsletter_subscription()
    print()
    
    # Test email sending
    email_ok = test_email_sending()
    print()
    
    # Summary
    print("📊 Test Summary:")
    print(f"Environment: {'✅' if env_ok else '❌'}")
    print(f"Newsletter: {'✅' if newsletter_ok else '❌'}")
    print(f"Email Send: {'✅' if email_ok else '❌'}")
    
    if all([env_ok, newsletter_ok, email_ok]):
        print("🎉 All tests passed!")
    else:
        print("⚠️  Some tests failed. Check the logs above.")

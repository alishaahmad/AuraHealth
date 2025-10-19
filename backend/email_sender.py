"""
Fallback email sender using Python's built-in email capabilities
"""

import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from typing import Optional

class PythonEmailSender:
    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.sender_email = os.getenv("SENDER_EMAIL")
        self.sender_password = os.getenv("SENDER_PASSWORD")
        
    def send_email(self, to_email: str, subject: str, html_content: str, 
                   sender_name: str = "Aura Health") -> bool:
        """Send email using Python's smtplib"""
        try:
            if not self.sender_email or not self.sender_password:
                print("❌ SMTP credentials not configured")
                return False
                
            # Create message
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = f"{sender_name} <{self.sender_email}>"
            message["To"] = to_email
            
            # Create HTML part
            html_part = MIMEText(html_content, "html")
            message.attach(html_part)
            
            # Create secure connection and send email
            context = ssl.create_default_context()
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls(context=context)
                server.login(self.sender_email, self.sender_password)
                server.sendmail(self.sender_email, to_email, message.as_string())
            
            print(f"📧 Email sent successfully to {to_email} via Python SMTP")
            return True
            
        except Exception as e:
            print(f"❌ Python email sending error: {e}")
            return False

# Global instance
python_email_sender = PythonEmailSender()

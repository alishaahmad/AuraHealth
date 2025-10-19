import React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface WelcomeEmailProps {
  userName?: string;
}

export default function WelcomeEmail({
  userName = "Valued User",
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head>
        <meta name="color-scheme" content="light only" />
        <meta name="supported-color-schemes" content="light" />
        <style>{`
          @media (prefers-color-scheme: dark) {
            body {
              background-color: #ccecee !important;
            }
          }
        `}</style>
      </Head>
      <Preview>Welcome to Aura Health! 🌟</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>AURA HEALTH</Text>
            <Heading style={headerTitle}>🌟 Welcome to Aura Health!</Heading>
          </Section>
          
          <Section style={content}>
            <div style={welcomeSection}>
              <Heading style={welcomeTitle}>Hi {userName}!</Heading>
              <Text style={welcomeText}>
                Thank you for subscribing to our monthly health insights newsletter! 
                You'll receive personalized health recommendations, dietary insights, 
                and wellness tips delivered to your inbox every month.
              </Text>
            </div>
            
            <div style={ctaSection}>
              <Button style={ctaButton} href="https://aura-health.vercel.app/dashboard">
                Start Your Health Journey
              </Button>
            </div>
            
            <div style={features}>
              <Heading style={featuresTitle}>What you can expect:</Heading>
              
              <div style={feature}>
                <div style={featureIcon}>📊</div>
                <div style={featureText}>Monthly health score analysis and personalized insights</div>
              </div>
              
              <div style={feature}>
                <div style={featureIcon}>🍎</div>
                <div style={featureText}>Nutritional recommendations based on your receipt data</div>
              </div>
              
              <div style={feature}>
                <div style={featureIcon}>⚠️</div>
                <div style={featureText}>Important health warnings and dietary conflict alerts</div>
              </div>
              
              <div style={feature}>
                <div style={featureIcon}>🍽️</div>
                <div style={featureText}>Custom meal plans and healthy recipe suggestions</div>
              </div>
            </div>
          </Section>
          
          <Section style={footer}>
            <Text style={footerText}>
              © 2024 Aura Health. Making every receipt a step toward better health.
            </Text>
            <Text style={footerInfo}>
              You can unsubscribe at any time by replying to this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = { 
  backgroundColor: "#ccecee", 
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  padding: "20px 0",
  WebkitTextSizeAdjust: "100%"
};

const container = { 
  maxWidth: "600px", 
  margin: "0 auto", 
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  overflow: "hidden",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
};

const header = { 
  backgroundColor: "#14967f", 
  color: "#f1f9ff", 
  textAlign: "center" as const, 
  padding: "60px 40px"
};

const logo = { 
  fontSize: "14px", 
  fontWeight: "400", 
  letterSpacing: "2px", 
  textTransform: "uppercase" as const, 
  marginBottom: "20px", 
  opacity: 0.9, 
  color: "#f1f9ff",
  margin: "0 0 20px 0"
};

const headerTitle = { 
  fontSize: "28px", 
  fontWeight: "700", 
  marginBottom: "12px", 
  letterSpacing: "-0.5px", 
  color: "#f1f9ff", 
  margin: "0 0 12px 0" 
};

const content = { 
  padding: "40px 30px",
  backgroundColor: "#ffffff"
};

const welcomeSection = { 
  background: "linear-gradient(135deg, #e2fcd6 0%, #ccecee 100%)",
  padding: "30px",
  borderRadius: "16px",
  marginBottom: "30px",
  textAlign: "center" as const
};

const welcomeTitle = { 
  color: "#095d7e",
  margin: "0 0 16px 0",
  fontSize: "24px"
};

const welcomeText = { 
  color: "#14967f",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "0"
};

const ctaSection = { 
  textAlign: "center" as const, 
  margin: "30px 0" 
};

const ctaButton = { 
  backgroundColor: "#14967f", 
  color: "#f1f9ff", 
  padding: "16px 32px", 
  textDecoration: "none", 
  borderRadius: "12px", 
  fontWeight: "bold", 
  fontSize: "16px", 
  margin: "20px 0",
  transition: "transform 0.2s ease",
  display: "inline-block" 
};

const features = { 
  margin: "30px 0" 
};

const featuresTitle = { 
  color: "#095d7e", 
  textAlign: "center" as const, 
  marginBottom: "20px",
  fontSize: "20px"
};

const feature = { 
  display: "flex",
  alignItems: "center",
  margin: "15px 0",
  padding: "15px",
  backgroundColor: "#f8fafc",
  borderRadius: "8px"
};

const featureIcon = { 
  fontSize: "24px",
  marginRight: "15px"
};

const featureText = { 
  color: "#095d7e",
  fontWeight: "500"
};

const footer = { 
  textAlign: "center" as const, 
  padding: "30px",
  backgroundColor: "#f8fafc",
  color: "#14967f",
  fontSize: "14px"
};

const footerText = { 
  margin: "0 0 10px 0"
};

const footerInfo = { 
  margin: "0",
  fontSize: "12px",
  opacity: 0.8
};

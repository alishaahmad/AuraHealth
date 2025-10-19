import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Hr,
  Row,
  Column,
} from "@react-email/components";
// import React from "react";

interface AuraMonthlyReportProps {
  userName: string;
  month: string;
  year: number;
  auraScore: number;
  scoreDescription: string;
  totalReceipts?: number;
  healthInsights?: string[];
  mealSuggestions?: string[];
  warnings?: string[];
}

export const AuraMonthlyReport = ({
  userName = "Valued User",
  month = "November",
  year = 2024,
  auraScore = 75,
  scoreDescription = "You're doing great! Keep up the healthy choices.",
  totalReceipts = 12,
  healthInsights = [
    "Your vegetable intake has increased by 15% this month",
    "Consider reducing processed foods for better health",
    "Great job on choosing whole grains over refined options"
  ],
  mealSuggestions = [
    "Try our Mediterranean-inspired meal plan",
    "Add more leafy greens to your salads",
    "Consider plant-based protein alternatives"
  ],
  warnings = [
    "Watch out for high sodium in canned foods",
    "Consider reducing sugar intake from beverages"
  ]
}: AuraMonthlyReportProps) => {
  const previewText = `Your ${month} ${year} Health Snapshot from Aura Health`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img
              src="https://your-domain.com/logo.png"
              width="60"
              height="60"
              alt="Aura Health"
              style={logo}
            />
            <Heading style={headerTitle}>Aura Health</Heading>
          </Section>

          {/* Hero Section */}
          <Section style={hero}>
            <Heading style={heroTitle}>
              Your {month} {year} Health Snapshot 🌟
            </Heading>
            <Text style={heroSubtitle}>
              Hi {userName}, here's how you've been doing with your health journey this month.
            </Text>
          </Section>

          {/* Aura Score */}
          <Section style={scoreSection}>
            <div style={scoreContainer}>
              <Text style={scoreLabel}>Your Aura Score</Text>
              <div style={scoreCircle}>
                <Text style={scoreNumber}>{auraScore}</Text>
              </div>
              <Text style={scoreDescriptionStyle}>{scoreDescription}</Text>
            </div>
          </Section>

          {/* Stats */}
          <Section style={statsSection}>
            <Row>
              <Column style={statColumn}>
                <Text style={statNumber}>{totalReceipts}</Text>
                <Text style={statLabel}>Receipts Analyzed</Text>
              </Column>
              <Column style={statColumn}>
                <Text style={statNumber}>{healthInsights.length}</Text>
                <Text style={statLabel}>Health Insights</Text>
              </Column>
              <Column style={statColumn}>
                <Text style={statNumber}>{mealSuggestions.length}</Text>
                <Text style={statLabel}>Meal Suggestions</Text>
              </Column>
            </Row>
          </Section>

          {/* Health Insights */}
          <Section style={insightsSection}>
            <Heading style={sectionTitle}>🏥 Health Insights</Heading>
            {healthInsights.map((insight, index) => (
              <div key={index} style={insightItem}>
                <Text style={insightText}>• {insight}</Text>
              </div>
            ))}
          </Section>

          {/* Meal Suggestions */}
          <Section style={suggestionsSection}>
            <Heading style={sectionTitle}>🍽️ Meal Suggestions</Heading>
            {mealSuggestions.map((suggestion, index) => (
              <div key={index} style={suggestionItem}>
                <Text style={suggestionText}>• {suggestion}</Text>
              </div>
            ))}
          </Section>

          {/* Warnings */}
          {warnings.length > 0 && (
            <Section style={warningsSection}>
              <Heading style={sectionTitle}>⚠️ Areas to Watch</Heading>
              {warnings.map((warning, index) => (
                <div key={index} style={warningItem}>
                  <Text style={warningText}>• {warning}</Text>
                </div>
              ))}
            </Section>
          )}

          {/* CTA */}
          <Section style={ctaSection}>
            <Link href="https://your-domain.com/dashboard" style={ctaButton}>
              View Full Dashboard
            </Link>
            <Text style={ctaText}>
              Keep tracking your health journey with Aura Health
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              © {year} Aura Health. Making every receipt a step toward better health.
            </Text>
            <Text style={footerText}>
              <Link href="https://your-domain.com/unsubscribe" style={footerLink}>
                Unsubscribe
              </Link>
              {" • "}
              <Link href="https://your-domain.com/privacy" style={footerLink}>
                Privacy Policy
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: "#f1f9ff",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "600px",
};

const header = {
  textAlign: "center" as const,
  padding: "20px 0",
  borderBottom: "1px solid #e2fcd6",
};

const logo = {
  margin: "0 auto 10px",
  borderRadius: "12px",
};

const headerTitle = {
  color: "#095d7e",
  fontSize: "28px",
  fontWeight: "bold",
  margin: "0",
};

const hero = {
  textAlign: "center" as const,
  padding: "40px 20px",
  background: "linear-gradient(135deg, #e2fcd6 0%, #ccecee 100%)",
  borderRadius: "16px",
  margin: "20px 0",
};

const heroTitle = {
  color: "#095d7e",
  fontSize: "32px",
  fontWeight: "bold",
  margin: "0 0 16px 0",
};

const heroSubtitle = {
  color: "#14967f",
  fontSize: "18px",
  margin: "0",
};

const scoreSection = {
  textAlign: "center" as const,
  padding: "30px 20px",
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  margin: "20px 0",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
};

const scoreContainer = {
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
};

const scoreLabel = {
  color: "#14967f",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 16px 0",
};

const scoreCircle = {
  width: "120px",
  height: "120px",
  borderRadius: "50%",
  background: "linear-gradient(135deg, #14967f 0%, #095d7e 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 0 16px 0",
};

const scoreNumber = {
  color: "#ffffff",
  fontSize: "36px",
  fontWeight: "bold",
  margin: "0",
};

const scoreDescriptionStyle = {
  color: "#095d7e",
  fontSize: "16px",
  margin: "0",
  textAlign: "center" as const,
};

const statsSection = {
  padding: "20px",
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  margin: "20px 0",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
};

const statColumn = {
  textAlign: "center" as const,
  padding: "0 10px",
};

const statNumber = {
  color: "#14967f",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0 0 4px 0",
};

const statLabel = {
  color: "#095d7e",
  fontSize: "14px",
  margin: "0",
};

const insightsSection = {
  padding: "20px",
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  margin: "20px 0",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
};

const suggestionsSection = {
  padding: "20px",
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  margin: "20px 0",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
};

const warningsSection = {
  padding: "20px",
  backgroundColor: "#fff5f5",
  borderRadius: "16px",
  margin: "20px 0",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  border: "1px solid #fed7d7",
};

const sectionTitle = {
  color: "#095d7e",
  fontSize: "20px",
  fontWeight: "bold",
  margin: "0 0 16px 0",
};

const insightItem = {
  margin: "8px 0",
};

const insightText = {
  color: "#14967f",
  fontSize: "16px",
  margin: "0",
};

const suggestionItem = {
  margin: "8px 0",
};

const suggestionText = {
  color: "#14967f",
  fontSize: "16px",
  margin: "0",
};

const warningItem = {
  margin: "8px 0",
};

const warningText = {
  color: "#e53e3e",
  fontSize: "16px",
  margin: "0",
};

const ctaSection = {
  textAlign: "center" as const,
  padding: "30px 20px",
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  margin: "20px 0",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
};

const ctaButton = {
  backgroundColor: "#14967f",
  color: "#ffffff",
  padding: "16px 32px",
  borderRadius: "12px",
  textDecoration: "none",
  fontSize: "18px",
  fontWeight: "bold",
  display: "inline-block",
  margin: "0 0 16px 0",
};

const ctaText = {
  color: "#095d7e",
  fontSize: "16px",
  margin: "0",
};

const hr = {
  borderColor: "#e2fcd6",
  margin: "20px 0",
};

const footer = {
  textAlign: "center" as const,
  padding: "20px",
};

const footerText = {
  color: "#14967f",
  fontSize: "14px",
  margin: "8px 0",
};

const footerLink = {
  color: "#14967f",
  textDecoration: "underline",
};

export default AuraMonthlyReport;

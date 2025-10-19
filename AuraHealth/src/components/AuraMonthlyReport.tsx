/** @jsxRuntime classic */
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
  Row,
  Column,
} from "@react-email/components";

interface MetricData {
  value: string | number;
  label: string;
  description: string;
  isWarning?: boolean;
}

interface ListItem {
  title: string;
  description: string;
}

interface SwapItem {
  title: string;
  text: string;
}

interface AuraMonthlyReportProps {
  userName?: string;
  month?: string;
  year?: number;
  introText?: string;
  auraScore?: number;
  scoreDescription?: string;
  metrics?: MetricData[];
  highlightTitle?: string;
  highlightText?: string;
  medicationInteractions?: ListItem[];
  conditionFlags?: ListItem[];
  smartSwaps?: SwapItem[];
}

const defaultMetrics: MetricData[] = [
  { value: 12, label: "Receipts Scanned", description: "Tracked your grocery purchases throughout the month.", isWarning: false },
  { value: 8, label: "Healthy Swaps", description: "Smart substitutions for better health outcomes.", isWarning: false },
  { value: 2, label: "Med Interactions", description: "Foods flagged for potential medication conflicts.", isWarning: true },
  { value: 0, label: "Allergen Exposures", description: "Successfully avoided your tracked allergens.", isWarning: false },
  { value: 3, label: "Health Flags", description: "Items to watch based on your conditions.", isWarning: true },
  { value: "$47", label: "Est. Savings", description: "Money saved through healthier choices.", isWarning: false },
];

const defaultMedicationInteractions: ListItem[] = [
  { title: "Grapefruit Juice", description: "May interfere with your statin medication (atorvastatin), potentially increasing side effects. Consider alternative citrus options." },
  { title: "High Vitamin K (Kale Chips)", description: "Can affect blood thinner effectiveness. Consistency is key—maintain steady vitamin K intake with your warfarin regimen." },
];

const defaultConditionFlags: ListItem[] = [
  { title: "High Sodium Content (Canned Soup)", description: "Your hypertension profile suggests limiting sodium to 1,500mg daily. This item contains 42% of that in one serving." },
  { title: "Added Sugars (Flavored Yogurt)", description: "For prediabetes management, watch for hidden sugars. This contains 18g added sugar per serving—consider plain yogurt with fresh fruit." },
  { title: "Gluten (Wheat Pasta)", description: "You've noted gluten sensitivity. We detected gluten-containing items on 3 receipts this month." },
];

const defaultSmartSwaps: SwapItem[] = [
  { title: "Canned Soup → Low-Sodium Bone Broth", text: "Better for blood pressure management. 75% less sodium, more protein, supports your heart health goals." },
  { title: "Regular Pasta → Chickpea Pasta", text: "Naturally gluten-free and higher in protein. Helps stabilize blood sugar while accommodating your sensitivity." },
  { title: "Grapefruit → Orange Juice", text: "Safe with your statin medication. No drug interaction risk, still provides vitamin C and morning brightness." },
];

export default function AuraMonthlyReport({
  userName = "There",
  month = "November",
  year = 2025,
  introText = "Here's a quiet reflection of your wellness journey through November 2025. We've been watching for ingredients that may interact with your medications, monitoring for allergens, and highlighting choices that align with your health profile.",
  auraScore = 78,
  scoreDescription = "You're on the right track—keep making small changes for even better results!",
  metrics = defaultMetrics,
  highlightTitle = "Unbelievable Progress!",
  highlightText = "You're making thoughtful, nourishing choices that support your health goals. Every smart swap and mindful decision is helping you build lasting wellness habits.",
  medicationInteractions = defaultMedicationInteractions,
  conditionFlags = defaultConditionFlags,
  smartSwaps = defaultSmartSwaps,
}: AuraMonthlyReportProps) {
  // Use userName in the preview text
  const previewText = `Your ${month} ${year} wellness snapshot is ready, ${userName}`;

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
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>AURA HEALTH</Text>
            <Heading style={headerTitle}>Your {month} Snapshot</Heading>
            <Text style={headerSubtitle}>All Fresh And Updated</Text>
          </Section>

          <Section style={introSection}>
            <Text style={introTextStyle}>{introText}</Text>
            <Button style={ctaButton} href="#">
              Learn More
            </Button>
          </Section>

          <Section style={scoreSection}>
            <Text style={sectionTitle}>YOUR AURA SCORE</Text>
            <Section style={scoreCard}>
              <Heading style={scoreNumber}>{auraScore}</Heading>
              <Text style={scoreLabel}>Out Of 100</Text>
              <div style={progressBarContainer}>
                <div style={{ ...progressBar, width: `${auraScore}%` }} />
              </div>
              <Text style={scoreDescriptionStyle}>{scoreDescription}</Text>
            </Section>
          </Section>

          {/* Features Grid - Fixed with table layout */}
          <Section style={featuresSection}>
            <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" border={0}>
              <tbody>
                <tr>
                  {metrics.slice(0, 3).map((metric, i) => (
                    <td key={i} width="33.333%" style={featureColumn}>
                      <table style={featureIconTableWrapper} align="center" cellPadding="0" cellSpacing="0">
                        <tbody>
                          <tr>
                            <td style={{
                              width: "80px",
                              height: "80px",
                              backgroundColor: "#e2fcd6",
                              borderRadius: "50%",
                              border: "2px solid #ccecee",
                              textAlign: "center",
                              verticalAlign: "middle",
                              fontSize: "36px",
                              fontWeight: "700",
                              color: metric.isWarning ? "#dc3545" : "#095d7e",
                              lineHeight: "1"
                            }}>
                              {metric.value}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <Text style={featureTitle}>{metric.label}</Text>
                      <Text style={featureDescription}>{metric.description}</Text>
                    </td>
                  ))}
                </tr>
                <tr>
                  {metrics.slice(3, 6).map((metric, i) => (
                    <td key={i} width="33.333%" style={featureColumn}>
                      <table style={featureIconTableWrapper} align="center" cellPadding="0" cellSpacing="0">
                        <tbody>
                          <tr>
                            <td style={{
                              width: "80px",
                              height: "80px",
                              backgroundColor: "#e2fcd6",
                              borderRadius: "50%",
                              border: "2px solid #ccecee",
                              textAlign: "center",
                              verticalAlign: "middle",
                              fontSize: "36px",
                              fontWeight: "700",
                              color: metric.isWarning ? "#dc3545" : "#095d7e",
                              lineHeight: "1"
                            }}>
                              {metric.value}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <Text style={featureTitle}>{metric.label}</Text>
                      <Text style={featureDescription}>{metric.description}</Text>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </Section>

          <Section style={highlightSection}>
            <Heading style={highlightTitleStyle}>{highlightTitle}</Heading>
            <Text style={highlightTextStyle}>{highlightText}</Text>
          </Section>

          <Section style={contentSection}>
            <Heading style={contentTitle}>From Your Health Report</Heading>
            <Text style={contentIntro}>
              Here are the key insights and recommendations based on your health
              profile, medication regimen, and dietary preferences for {month} {year}.
            </Text>

            {medicationInteractions && medicationInteractions.length > 0 && (
              <Section style={listSection}>
                <Text style={listTitle}>MEDICATION INTERACTIONS DETECTED</Text>
                {medicationInteractions.map((item, idx) => (
                  <Section key={idx} style={listItem}>
                    <Row>
                      <Column style={bulletColumn}>
                        <div style={bullet} />
                      </Column>
                      <Column style={listContentColumn}>
                        <Text style={listItemTitle}>{item.title}</Text>
                        <Text style={listItemText}>{item.description}</Text>
                      </Column>
                    </Row>
                  </Section>
                ))}
              </Section>
            )}

            {conditionFlags && conditionFlags.length > 0 && (
              <Section style={listSection}>
                <Text style={listTitle}>CONDITION-SPECIFIC CONSIDERATIONS</Text>
                {conditionFlags.map((item, idx) => (
                  <Section key={idx} style={listItem}>
                    <Row>
                      <Column style={bulletColumn}>
                        <div style={bullet} />
                      </Column>
                      <Column style={listContentColumn}>
                        <Text style={listItemTitle}>{item.title}</Text>
                        <Text style={listItemText}>{item.description}</Text>
                      </Column>
                    </Row>
                  </Section>
                ))}
              </Section>
            )}

            {smartSwaps && smartSwaps.length > 0 && (
              <>
                {smartSwaps.map((swap, idx) => (
                  <Section key={idx} style={insightCard}>
                    <Heading style={insightTitle}>Smart Swap #{idx + 1}</Heading>
                    <Text style={insightText}>
                      <strong style={{ color: "#14967f" }}>{swap.title}</strong>
                      <br />
                      {swap.text}
                    </Text>
                    <Button style={insightButton} href="#">
                      Learn More
                    </Button>
                  </Section>
                ))}
              </>
            )}
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              This information is for general wellness purposes only and is not
              medical advice. Aura Health provides observational insights based
              on ingredient analysis, your health profile, known medication
              interactions, and allergen databases. Always consult your
              healthcare provider before making dietary changes.
            </Text>
            <Text style={footerInfo}>Aura Health · Sent With Care · {month} {year}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles - Updated with dark mode fixes and proper centering
const main = { 
  backgroundColor: "#ccecee", 
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  padding: "20px 0",
  WebkitTextSizeAdjust: "100%"
};

const container = { 
  maxWidth: "600px", 
  margin: "0 auto", 
  backgroundColor: "#f1f9ff",
  borderRadius: "16px",
  overflow: "hidden"
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
  fontSize: "36px", 
  fontWeight: "700", 
  marginBottom: "12px", 
  letterSpacing: "-0.5px", 
  color: "#f1f9ff", 
  margin: "0 0 12px 0" 
};

const headerSubtitle = { 
  fontSize: "16px", 
  fontWeight: "400", 
  opacity: 0.95, 
  letterSpacing: "0.5px", 
  color: "#f1f9ff", 
  margin: "0" 
};

const introSection = { 
  padding: "50px 40px", 
  textAlign: "center" as const,
  backgroundColor: "#f1f9ff"
};

const introTextStyle = { 
  fontSize: "15px", 
  lineHeight: "26px", 
  color: "#095d7e", 
  maxWidth: "500px", 
  margin: "0 auto 30px" 
};

const ctaButton = { 
  backgroundColor: "#14967f", 
  color: "#f1f9ff", 
  padding: "14px 32px", 
  textDecoration: "none", 
  borderRadius: "25px", 
  fontWeight: "600", 
  fontSize: "14px", 
  letterSpacing: "0.5px", 
  textTransform: "uppercase" as const, 
  display: "inline-block" 
};

const scoreSection = { 
  padding: "60px 40px 50px 40px", 
  backgroundColor: "#f1f9ff" 
};

const sectionTitle = { 
  textAlign: "center" as const, 
  fontSize: "16px", 
  fontWeight: "800", 
  color: "#095d7e", 
  textTransform: "uppercase" as const, 
  letterSpacing: "1.5px", 
  margin: "0 0 40px 0" 
};

const scoreCard = { 
  backgroundColor: "#e8f5f3", 
  borderRadius: "16px", 
  padding: "40px", 
  textAlign: "center" as const,
  border: "2px solid #ccecee"
};

const scoreNumber = { 
  fontSize: "72px", 
  fontWeight: "700", 
  color: "#14967f", 
  lineHeight: "1", 
  marginBottom: "10px", 
  margin: "0 0 10px 0" 
};

const scoreLabel = { 
  fontSize: "18px", 
  color: "#095d7e", 
  marginBottom: "20px", 
  margin: "0 0 20px 0" 
};

const progressBarContainer = { 
  width: "100%", 
  height: "12px", 
  backgroundColor: "#ccecee", 
  borderRadius: "6px", 
  overflow: "hidden", 
  marginBottom: "20px" 
};

const progressBar = { 
  height: "100%", 
  backgroundColor: "#14967f", 
  borderRadius: "6px"
};

const scoreDescriptionStyle = { 
  fontSize: "15px", 
  color: "#095d7e", 
  lineHeight: "24px", 
  margin: "0" 
};

const featuresSection = { 
  padding: "50px 40px",
  backgroundColor: "#f1f9ff"
};

const featureColumn = { 
  textAlign: "center" as const, 
  padding: "30px 20px", 
  verticalAlign: "top" as const 
};

const featureIconTableWrapper = {
  width: "80px",
  height: "80px",
  marginBottom: "20px"
};

const featureTitle = { 
  fontSize: "16px", 
  fontWeight: "700", 
  color: "#095d7e", 
  marginBottom: "10px", 
  margin: "0 0 10px 0" 
};

const featureDescription = { 
  fontSize: "13px", 
  color: "#095d7e", 
  lineHeight: "20px", 
  margin: "0" 
};

const highlightSection = { 
  backgroundColor: "#095d7e", 
  color: "#f1f9ff", 
  padding: "60px 40px", 
  textAlign: "center" as const 
};

const highlightTitleStyle = { 
  fontSize: "28px", 
  fontWeight: "700", 
  marginBottom: "16px", 
  color: "#f1f9ff", 
  margin: "0 0 16px 0" 
};

const highlightTextStyle = { 
  fontSize: "14px", 
  lineHeight: "24px", 
  opacity: 0.95, 
  color: "#f1f9ff", 
  margin: "0" 
};

const contentSection = { 
  padding: "50px 40px",
  backgroundColor: "#f1f9ff"
};

const contentTitle = { 
  textAlign: "center" as const, 
  fontSize: "36px", 
  fontWeight: "700", 
  color: "#14967f", 
  marginBottom: "20px", 
  margin: "0 0 20px 0",
  fontStyle: "italic" as const,
  letterSpacing: "-0.5px"
};

const contentIntro = { 
  textAlign: "center" as const, 
  fontSize: "15px", 
  color: "#095d7e", 
  lineHeight: "26px", 
  maxWidth: "500px", 
  margin: "0 auto 50px" 
};

const listSection = { 
  backgroundColor: "#e8f5f3", 
  borderRadius: "16px", 
  padding: "30px", 
  marginBottom: "30px",
  border: "1px solid #ccecee"
};

const listTitle = { 
  fontSize: "14px", 
  fontWeight: "700", 
  color: "#095d7e", 
  textTransform: "uppercase" as const, 
  letterSpacing: "1px", 
  marginBottom: "20px", 
  margin: "0 0 20px 0" 
};

const listItem = { 
  marginBottom: "20px" 
};

const bulletColumn = { 
  width: "24px", 
  verticalAlign: "top" as const, 
  paddingTop: "8px" 
};

const bullet = { 
  width: "8px", 
  height: "8px", 
  backgroundColor: "#14967f", 
  borderRadius: "50%" 
};

const listContentColumn = { 
  verticalAlign: "top" as const 
};

const listItemTitle = { 
  fontSize: "15px", 
  fontWeight: "600", 
  color: "#14967f", 
  marginBottom: "6px", 
  margin: "0 0 6px 0" 
};

const listItemText = { 
  fontSize: "14px", 
  color: "#095d7e", 
  lineHeight: "22px", 
  margin: "0" 
};

const insightCard = { 
  backgroundColor: "#e8f5f3", 
  borderRadius: "16px", 
  padding: "30px", 
  marginBottom: "20px",
  border: "1px solid #ccecee"
};

const insightTitle = { 
  fontSize: "18px", 
  fontWeight: "700", 
  color: "#095d7e", 
  marginBottom: "12px", 
  margin: "0 0 12px 0" 
};

const insightText = { 
  fontSize: "14px", 
  color: "#095d7e", 
  lineHeight: "22px", 
  marginBottom: "20px", 
  margin: "0 0 20px 0" 
};

const insightButton = { 
  backgroundColor: "#14967f", 
  color: "#f1f9ff", 
  padding: "10px 24px", 
  textDecoration: "none", 
  borderRadius: "20px", 
  fontWeight: "600", 
  fontSize: "13px", 
  textTransform: "uppercase" as const, 
  letterSpacing: "0.5px", 
  display: "inline-block" 
};

const footer = { 
  backgroundColor: "#095d7e", 
  color: "#f1f9ff", 
  padding: "40px", 
  textAlign: "center" as const 
};

const footerText = { 
  fontSize: "13px", 
  opacity: 0.9, 
  lineHeight: "22px", 
  marginBottom: "20px", 
  color: "#f1f9ff", 
  margin: "0 0 20px 0" 
};

const footerInfo = { 
  fontSize: "12px", 
  opacity: 0.8, 
  letterSpacing: "0.5px", 
  color: "#f1f9ff", 
  margin: "0" 
};
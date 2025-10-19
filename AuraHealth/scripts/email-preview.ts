import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { render } from "@react-email/components";
import AuraMonthlyReport from "../src/components/AuraMonthlyReport";
import WelcomeEmail from "../src/components/WelcomeEmail";

const OUT_DIR = path.join(process.cwd(), "tmp");
const OUT_FILE = path.join(OUT_DIR, "aura-preview.html");

async function main() {
  console.log("🎨 Generating email previews...");
  
  // Generate monthly report preview
  const monthlyReportHtml = await render(
    AuraMonthlyReport({
      userName: "Test User",
      month: "November",
      year: 2025,
      auraScore: 78,
      scoreDescription: "You're on the right track—keep making small changes for even better results!",
    })
  );
  
  // Generate welcome email preview
  const welcomeEmailHtml = await render(
    WelcomeEmail({
      userName: "Test User"
    })
  );
  
  // Create output directory
  fs.mkdirSync(OUT_DIR, { recursive: true });
  
  // Write monthly report preview
  const monthlyReportFile = path.join(OUT_DIR, "monthly-report-preview.html");
  fs.writeFileSync(monthlyReportFile, monthlyReportHtml, "utf8");
  console.log(`📊 Monthly report preview written to ${monthlyReportFile}`);
  
  // Write welcome email preview
  const welcomeEmailFile = path.join(OUT_DIR, "welcome-email-preview.html");
  fs.writeFileSync(welcomeEmailFile, welcomeEmailHtml, "utf8");
  console.log(`🌟 Welcome email preview written to ${welcomeEmailFile}`);
  
  // Open the monthly report preview
  try {
    execSync(`open ${monthlyReportFile}`);
    console.log("📱 Opened monthly report preview in default browser.");
  } catch {
    console.log("❌ Could not open browser automatically.");
  }
}

main().catch((err) => {
  console.error("❌ Unexpected error:", err);
  process.exit(1);
});
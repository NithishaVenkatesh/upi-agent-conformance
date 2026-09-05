import { test, expect, Page } from "@playwright/test";

const BASE_URL = "http://localhost:3000";

interface AuditFinding {
  severity: "critical" | "high" | "medium" | "low";
  category: string;
  issue: string;
  location: string;
  impact: string;
  screenshot?: string;
}

const findings: AuditFinding[] = [];

// Helper to capture issues
function reportIssue(finding: AuditFinding) {
  findings.push(finding);
  console.log(`[${finding.severity.toUpperCase()}] ${finding.category}: ${finding.issue}`);
}

test.describe("UI/UX Comprehensive Audit", () => {
  test("Landing page - Visual & Interaction Audit", async ({ page }) => {
    await page.goto(`${BASE_URL}/`);

    // Wait for page to load
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    // 1. CHECK: Button visibility and contrast
    const ctaButtons = await page.locator('button, [role="button"], a').all();
    console.log(`\n📋 Found ${ctaButtons.length} interactive elements`);

    const primaryButton = await page.locator('a[href="/login"]');
    const primaryBox = await primaryButton.boundingBox();
    console.log(`Primary CTA button size: ${primaryBox?.width}x${primaryBox?.height}`);

    // Check if button is properly visible
    const isVisible = await primaryButton.isVisible();
    if (!isVisible) {
      reportIssue({
        severity: "critical",
        category: "Visibility",
        issue: "Primary CTA button is not visible",
        location: "Landing page - Hero section",
        impact: "Users cannot navigate to login",
      });
    }

    // 2. CHECK: Text readability - large text with color
    const heroText = await page.locator('blockquote, h1, h2, h3').all();
    console.log(`\n📝 Found ${heroText.length} text elements`);

    for (const text of heroText) {
      const color = await text.evaluate((el) =>
        window.getComputedStyle(el).color
      );
      const fontSize = await text.evaluate((el) =>
        window.getComputedStyle(el).fontSize
      );
      const backgroundColor = await text.evaluate((el) =>
        window.getComputedStyle(el.parentElement!).backgroundColor
      );

      console.log(`Text: color=${color}, size=${fontSize}, bgColor=${backgroundColor}`);

      // Check contrast ratio (very simple check)
      if (color === "rgb(0, 0, 0)" && backgroundColor === "rgba(0, 0, 0, 0)") {
        reportIssue({
          severity: "high",
          category: "Color Contrast",
          issue: "Text has poor contrast with background",
          location: `Text element with size ${fontSize}`,
          impact: "Text may be hard to read for users with vision impairments",
        });
      }
    }

    // 3. CHECK: Form inputs on login page
    const links = await page.locator("a").all();
    let hasLoginLink = false;
    for (const link of links) {
      const href = await link.getAttribute("href");
      if (href === "/login") {
        hasLoginLink = true;
        break;
      }
    }

    if (hasLoginLink) {
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState("networkidle");

      // Check form inputs
      const emailInput = await page.locator('input[type="email"]');
      const passwordInput = await page.locator('input[type="password"]');
      const submitButton = await page.locator('button[type="submit"]');

      // 3a. Check if inputs have proper labels
      const emailLabel = await page.locator('label').filter({ hasText: /email/i });
      if (!(await emailLabel.isVisible())) {
        reportIssue({
          severity: "medium",
          category: "Accessibility",
          issue: "Email input lacks visible label",
          location: "Login page - Email field",
          impact: "Users with assistive technology may have difficulty",
        });
      }

      // 3b. Check input visibility and size
      const emailBox = await emailInput.boundingBox();
      if (emailBox && emailBox.height < 30) {
        reportIssue({
          severity: "medium",
          category: "UX",
          issue: "Input field is too small - may be hard to tap on mobile",
          location: "Login page - Email field",
          impact: "Poor mobile experience, hard to interact with",
        });
      }

      // 3c. Check button visibility
      const buttonBox = await submitButton.boundingBox();
      if (buttonBox && buttonBox.height < 40) {
        reportIssue({
          severity: "medium",
          category: "UX",
          issue: "Submit button is too small - minimum tap target should be 44x44px",
          location: "Login page - Submit button",
          impact: "Poor mobile usability, hard to tap",
        });
      }

      // 3d. Check if button text is readable
      const buttonText = await submitButton.textContent();
      const buttonColor = await submitButton.evaluate((el) =>
        window.getComputedStyle(el).backgroundColor
      );
      const buttonTextColor = await submitButton.evaluate((el) =>
        window.getComputedStyle(el).color
      );

      console.log(`\nButton color: ${buttonColor}, text color: ${buttonTextColor}`);

      // 3e. Test form interaction
      await emailInput.fill("");
      await submitButton.click();

      // Check for validation message
      const validationError = await page.locator("[aria-invalid], .error").isVisible().catch(() => false);
      if (!validationError) {
        reportIssue({
          severity: "low",
          category: "UX",
          issue: "No visible validation error on empty email submission",
          location: "Login page - Form validation",
          impact: "Users may not know why form didn't submit",
        });
      }

      // 4. Test the dashboard after login
      const preFillEmail = await emailInput.inputValue();
      console.log(`\nEmail field pre-filled with: ${preFillEmail}`);

      if (preFillEmail === "") {
        reportIssue({
          severity: "low",
          category: "UX",
          issue: "Demo credentials are not pre-filled as advertised",
          location: "Login page - Credentials",
          impact: "Users need to type credentials manually in demo",
        });
      }

      await emailInput.fill(preFillEmail || "judge@razorpay.dev");
      await passwordInput.fill("demo");
      await submitButton.click();

      // Wait for navigation
      await page.waitForNavigation().catch(() => {});
      await page.waitForLoadState("networkidle").catch(() => {});
      await page.waitForTimeout(1000);
    }
  });

  test("Dashboard - Interactive Elements Audit", async ({ page }) => {
    await page.goto(`${BASE_URL}/app`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    console.log("\n\n=== DASHBOARD AUDIT ===\n");

    // 1. CHECK: Status indicators and their visibility
    const statusElements = await page.locator("[class*='status'], [class*='verdict'], [class*='verdict']").all();
    console.log(`Found ${statusElements.length} status-related elements`);

    // 2. CHECK: Navigation and links
    const allLinks = await page.locator("a").all();
    console.log(`Found ${allLinks.length} links on dashboard`);

    const inactiveLinks = [];
    for (const link of allLinks) {
      const href = await link.getAttribute("href");
      const isDisabled = await link.evaluate((el) =>
        el.getAttribute("aria-disabled") === "true"
      );

      if (isDisabled || href === "#") {
        const text = await link.textContent();
        inactiveLinks.push(text?.trim());
      }
    }

    if (inactiveLinks.length > 0) {
      reportIssue({
        severity: "medium",
        category: "Interactivity",
        issue: `Found ${inactiveLinks.length} disabled/inactive links: ${inactiveLinks.join(", ")}`,
        location: "Dashboard - Navigation",
        impact: "Users might click expecting action but nothing happens",
      });
    }

    // 3. CHECK: Table and data visibility
    const table = await page.locator("table");
    if (await table.isVisible()) {
      const rows = await table.locator("tbody tr").all();
      console.log(`Found ${rows.length} table rows`);

      if (rows.length === 0) {
        reportIssue({
          severity: "low",
          category: "Content",
          issue: "Dashboard table appears empty",
          location: "Dashboard - Transactions table",
          impact: "Users cannot see transaction data",
        });
      } else {
        // Check row contrast and readability
        for (let i = 0; i < Math.min(2, rows.length); i++) {
          const bgColor = await rows[i].evaluate((el) =>
            window.getComputedStyle(el).backgroundColor
          );
          const textColor = await rows[i].evaluate((el) =>
            window.getComputedStyle(el).color
          );
          console.log(`Row ${i}: bg=${bgColor}, text=${textColor}`);
        }
      }
    }

    // 4. CHECK: Filter buttons / Segmented control
    const filterButtons = await page.locator("button").all();
    console.log(`\nFound ${filterButtons.length} buttons on dashboard`);

    // Try clicking filter buttons
    const allButton = await page.locator("button").filter({ hasText: /All/i }).first();
    if (await allButton.isVisible()) {
      const buttonBox = await allButton.boundingBox();
      console.log(`Filter button size: ${buttonBox?.width}x${buttonBox?.height}`);

      if (buttonBox && buttonBox.height < 32) {
        reportIssue({
          severity: "low",
          category: "UX",
          issue: "Filter button is too small for comfortable clicking",
          location: "Dashboard - Filter controls",
          impact: "Mobile users may have difficulty using filters",
        });
      }

      // Test filter interaction
      await allButton.click();
      await page.waitForTimeout(500);

      const allowedButton = await page.locator("button").filter({ hasText: /Allowed/i }).first();
      if (await allowedButton.isVisible()) {
        const isActive = await allowedButton.evaluate((el) =>
          el.getAttribute("aria-pressed") === "true" ||
          el.className.includes("active") ||
          el.className.includes("selected")
        );
        console.log(`Allowed button active state: ${isActive}`);
      }
    }

    // 5. CHECK: Color usage - especially for status indicators
    const passIndicators = await page.locator("[class*='pass'], [class*='success'], [class*='allowed']").all();
    const failIndicators = await page.locator("[class*='fail'], [class*='error'], [class*='refused']").all();

    console.log(`\nFound ${passIndicators.length} pass indicators and ${failIndicators.length} fail indicators`);

    // Check if colors are distinguishable
    for (const indicator of passIndicators.slice(0, 2)) {
      const color = await indicator.evaluate((el) =>
        window.getComputedStyle(el).color
      );
      console.log(`Pass indicator color: ${color}`);
    }

    for (const indicator of failIndicators.slice(0, 2)) {
      const color = await indicator.evaluate((el) =>
        window.getComputedStyle(el).color
      );
      console.log(`Fail indicator color: ${color}`);
    }

    // 6. CHECK: Spacing and Layout issues
    const mainContent = await page.locator("main, [role='main']");
    if (await mainContent.isVisible()) {
      const padding = await mainContent.evaluate((el) =>
        window.getComputedStyle(el).padding
      );
      console.log(`Main content padding: ${padding}`);
    }

    // 7. CHECK: Modal/Dialog if present
    const modals = await page.locator("[role='dialog'], .modal").all();
    console.log(`\nFound ${modals.length} modals/dialogs`);

    // 8. CHECK: Hover states and feedback
    const interactiveElements = await page.locator("button, a, input").all();
    const sample = interactiveElements[0];
    if (sample) {
      const hoverState = await sample.evaluate((el) =>
        window.getComputedStyle(el, ":hover").backgroundColor
      );
      console.log(`First interactive element hover state exists: ${hoverState !== ""}`);
    }
  });

  test("Responsive Design & Mobile Audit", async ({ page }) => {
    console.log("\n\n=== RESPONSIVE DESIGN AUDIT ===\n");

    // Test at mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState("networkidle");

    // Check if content is readable at mobile size
    const viewport = page.viewportSize();
    console.log(`Testing at viewport: ${viewport?.width}x${viewport?.height}`);

    // Check for horizontal scroll
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const windowWidth = await page.evaluate(() => window.innerWidth);

    if (bodyWidth > windowWidth) {
      reportIssue({
        severity: "high",
        category: "Responsive Design",
        issue: `Horizontal scrolling detected - body width ${bodyWidth}px exceeds viewport ${windowWidth}px`,
        location: "Landing page - Mobile viewport",
        impact: "Poor mobile experience, users must scroll horizontally",
      });
    }

    // Check text readability at mobile
    const textElements = await page.locator("p, span, div").all();
    for (const el of textElements.slice(0, 5)) {
      const fontSize = await el.evaluate((e) =>
        parseInt(window.getComputedStyle(e).fontSize)
      );

      if (fontSize < 12) {
        reportIssue({
          severity: "medium",
          category: "Mobile Readability",
          issue: `Text with font size ${fontSize}px is too small for mobile`,
          location: "Landing page - Mobile text",
          impact: "Users on mobile will struggle to read small text",
        });
        break; // Report once
      }
    }

    // Check touch target sizes
    const buttons = await page.locator("button, a[role='button']").all();
    for (const btn of buttons.slice(0, 3)) {
      const box = await btn.boundingBox();
      if (box && (box.width < 44 || box.height < 44)) {
        reportIssue({
          severity: "medium",
          category: "Mobile UX",
          issue: `Touch target too small: ${box.width}x${box.height}px (should be 44x44px minimum)`,
          location: "Landing page - Touch targets",
          impact: "Users on mobile will have difficulty tapping buttons",
        });
        break; // Report once
      }
    }
  });

  test("Accessibility & WCAG Compliance Audit", async ({ page }) => {
    console.log("\n\n=== ACCESSIBILITY AUDIT ===\n");

    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState("networkidle");

    // 1. CHECK: Image alt text
    const images = await page.locator("img").all();
    console.log(`Found ${images.length} images`);

    for (const img of images) {
      const alt = await img.getAttribute("alt");
      if (!alt || alt.trim() === "") {
        reportIssue({
          severity: "medium",
          category: "Accessibility",
          issue: "Image missing alt text",
          location: "Landing page - Images",
          impact: "Screen reader users won't know what the image is",
        });
        break;
      }
    }

    // 2. CHECK: Heading hierarchy
    const headings = await page.locator("h1, h2, h3, h4, h5, h6").all();
    console.log(`Found ${headings.length} headings`);

    let lastLevel = 0;
    for (const heading of headings) {
      const level = parseInt(await heading.evaluate((el) => el.tagName[1]));
      if (level > lastLevel + 1 && lastLevel > 0) {
        reportIssue({
          severity: "low",
          category: "Accessibility",
          issue: `Heading hierarchy skipped from H${lastLevel} to H${level}`,
          location: "Landing page - Heading structure",
          impact: "Screen reader users may have difficulty navigating content structure",
        });
      }
      lastLevel = level;
    }

    // 3. CHECK: Form labels and associations
    await page.goto(`${BASE_URL}/login`);
    const inputs = await page.locator("input").all();
    console.log(`\nFound ${inputs.length} inputs`);

    for (const input of inputs) {
      const id = await input.getAttribute("id");
      const required = await input.getAttribute("required");

      if (!id) {
        reportIssue({
          severity: "low",
          category: "Accessibility",
          issue: "Input field missing ID attribute",
          location: "Login page - Form inputs",
          impact: "Labels cannot be properly associated with inputs",
        });
      }
    }

    // 4. CHECK: Color not sole indicator
    await page.goto(`${BASE_URL}/app`);
    const statusElements = await page.locator("[class*='status'], [class*='verdict']").all();
    for (const el of statusElements) {
      const text = await el.textContent();
      const hasTextIndicator = text && (text.includes("Pass") || text.includes("Fail") || text.includes("Allowed") || text.includes("Refused"));

      if (!hasTextIndicator) {
        reportIssue({
          severity: "medium",
          category: "Accessibility",
          issue: "Status indicator relies only on color without text",
          location: "Dashboard - Status indicators",
          impact: "Colorblind users cannot determine status",
        });
        break;
      }
    }
  });

  test("Performance & Visual Consistency Audit", async ({ page }) => {
    console.log("\n\n=== PERFORMANCE & CONSISTENCY AUDIT ===\n");

    // 1. CHECK: CSS custom properties (design tokens)
    await page.goto(`${BASE_URL}/`);

    const cssVars = await page.evaluate(() => {
      const styles = window.getComputedStyle(document.body);
      const vars: Record<string, string> = {};
      for (let i = 0; i < styles.length; i++) {
        const propName = styles[i];
        if (propName.startsWith("--")) {
          vars[propName] = styles.getPropertyValue(propName);
        }
      }
      return vars;
    });

    console.log(`Found ${Object.keys(cssVars).length} CSS custom properties`);

    // 2. CHECK: Font consistency
    const textElements = await page.locator("body *").all();
    const fonts = new Set<string>();
    for (const el of textElements.slice(0, 10)) {
      const font = await el.evaluate((e) =>
        window.getComputedStyle(e).fontFamily
      );
      fonts.add(font);
    }

    console.log(`Used ${fonts.size} different fonts: ${Array.from(fonts).join(", ")}`);

    if (fonts.size > 3) {
      reportIssue({
        severity: "low",
        category: "Design Consistency",
        issue: `Too many fonts in use (${fonts.size}). Best practice is 1-3 fonts max`,
        location: "Site-wide",
        impact: "Inconsistent visual appearance, less professional look",
      });
    }

    // 3. CHECK: Color consistency
    const colors = new Set<string>();
    for (const el of textElements.slice(0, 20)) {
      const color = await el.evaluate((e) =>
        window.getComputedStyle(e).color
      );
      if (color && color !== "rgba(0, 0, 0, 0)") {
        colors.add(color);
      }
    }

    console.log(`Found ${colors.size} different text colors`);

    if (colors.size > 5) {
      reportIssue({
        severity: "medium",
        category: "Design Consistency",
        issue: `Too many text colors (${colors.size}). Should use 3-4 main colors from palette`,
        location: "Site-wide",
        impact: "Inconsistent branding and visual confusion",
      });
    }

    // 4. CHECK: Loading performance
    const navigationTiming = await page.evaluate(() => {
      const timing = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart,
        loadComplete: timing.loadEventEnd - timing.loadEventStart,
      };
    });

    console.log(`Performance: DOMContentLoaded=${navigationTiming.domContentLoaded}ms, Load=${navigationTiming.loadComplete}ms`);

    if (navigationTiming.domContentLoaded > 2000) {
      reportIssue({
        severity: "medium",
        category: "Performance",
        issue: `DOMContentLoaded took ${navigationTiming.domContentLoaded}ms (target: <1000ms)`,
        location: "Site-wide",
        impact: "Slow perceived load time affects user experience",
      });
    }
  });

  test("Specific UX Issue Verification", async ({ page }) => {
    console.log("\n\n=== SPECIFIC UX ISSUES ===\n");

    // Issue 1: Check for text visibility against background (hidden text)
    await page.goto(`${BASE_URL}/`);
    const allElements = await page.locator("*").all();

    for (const el of allElements.slice(0, 50)) {
      const textColor = await el.evaluate((e) =>
        window.getComputedStyle(e).color
      );
      const bgColor = await el.evaluate((e) =>
        window.getComputedStyle(e).backgroundColor
      );
      const text = await el.textContent();

      // Simple check: if colors are too similar, might be hard to read
      if (
        text &&
        text.trim().length > 0 &&
        textColor === bgColor
      ) {
        reportIssue({
          severity: "critical",
          category: "Visibility",
          issue: "Text color matches background color - text is invisible",
          location: `Dashboard - ${text.substring(0, 30)}...`,
          impact: "Users cannot read the content",
        });
      }
    }

    // Issue 2: Verify button states
    const buttons = await page.locator("button, a[role='button']").all();
    for (const btn of buttons.slice(0, 10)) {
      const disabled = await btn.getAttribute("disabled");
      const ariaDisabled = await btn.getAttribute("aria-disabled");
      const opacity = await btn.evaluate((e) =>
        window.getComputedStyle(e).opacity
      );

      const text = await btn.textContent();
      if ((disabled || ariaDisabled === "true") && opacity === "1") {
        reportIssue({
          severity: "medium",
          category: "UX Feedback",
          issue: `Button "${text?.trim()}" appears disabled but doesn't look disabled`,
          location: "Site-wide - Buttons",
          impact: "Users are confused about whether they can click the button",
        });
      }
    }

    // Issue 3: Check for sufficient spacing between interactive elements
    const interactiveElements = await page.locator("button, a, input[type='button'], input[type='submit']").all();
    if (interactiveElements.length > 1) {
      const box1 = await interactiveElements[0].boundingBox();
      const box2 = await interactiveElements[1].boundingBox();

      if (box1 && box2) {
        const horizontalGap = Math.abs(box1.x + box1.width - box2.x);
        const verticalGap = Math.abs(box1.y + box1.height - box2.y);

        if (horizontalGap < 8 && verticalGap > 5) {
          reportIssue({
            severity: "low",
            category: "UX",
            issue: `Interactive elements too close together - only ${horizontalGap}px spacing`,
            location: "Site-wide - Button spacing",
            impact: "Users may accidentally click wrong button on mobile",
          });
        }
      }
    }
  });
});

// Export findings as JSON at the end
test.afterAll(async () => {
  console.log("\n\n" + "=".repeat(60));
  console.log("AUDIT COMPLETE - FINDINGS SUMMARY");
  console.log("=".repeat(60) + "\n");

  const criticalCount = findings.filter((f) => f.severity === "critical").length;
  const highCount = findings.filter((f) => f.severity === "high").length;
  const mediumCount = findings.filter((f) => f.severity === "medium").length;
  const lowCount = findings.filter((f) => f.severity === "low").length;

  console.log(`Total Issues Found: ${findings.length}`);
  console.log(`  🔴 Critical: ${criticalCount}`);
  console.log(`  🟠 High: ${highCount}`);
  console.log(`  🟡 Medium: ${mediumCount}`);
  console.log(`  🔵 Low: ${lowCount}\n`);

  // Group by category
  const byCategory: Record<string, AuditFinding[]> = {};
  findings.forEach((f) => {
    if (!byCategory[f.category]) byCategory[f.category] = [];
    byCategory[f.category].push(f);
  });

  console.log("\n📊 ISSUES BY CATEGORY:\n");
  Object.entries(byCategory).forEach(([category, issues]) => {
    console.log(`${category} (${issues.length} issues)`);
    issues.forEach((issue) => {
      console.log(`  • [${issue.severity}] ${issue.issue}`);
      console.log(`    → Impact: ${issue.impact}`);
    });
    console.log();
  });

  // Save to JSON
  const report = {
    timestamp: new Date().toISOString(),
    totalIssues: findings.length,
    critical: criticalCount,
    high: highCount,
    medium: mediumCount,
    low: lowCount,
    findings: findings.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    }),
  };

  const fs = await import("fs");
  fs.writeFileSync("./ui-audit-report.json", JSON.stringify(report, null, 2));
  console.log("\n✅ Full report saved to: ui-audit-report.json");
});

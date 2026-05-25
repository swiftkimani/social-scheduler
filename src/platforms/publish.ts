import { chromium, firefox, BrowserContext, Page } from "playwright";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

// Reuse the same helpers as auth.ts for default browser detection and cookie handling
const DATA_DIR = process.env.SCHEDULER_DATA_DIR || path.join(process.cwd(), "data");
const COOKIE_DIR = path.join(DATA_DIR, "cookies");

function ensureDir(d: string) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

function cookieFile(platform: string): string {
  ensureDir(COOKIE_DIR);
  return path.join(COOKIE_DIR, `${platform}.json`);
}

interface BrowserConfig {
  type: "chromium" | "firefox";
  profileDir: string;
  channel?: string;
  args?: string[];
}

// Default browser detection (copied from auth.ts)
const browserMap: Record<string, BrowserConfig> = {
  "google-chrome": {
    type: "chromium",
    profileDir: path.join(os.homedir(), ".config", "google-chrome"),
    channel: "chrome",
    args: ["--profile-directory=Default"],
  },
  "google-chrome-stable": {
    type: "chromium",
    profileDir: path.join(os.homedir(), ".config", "google-chrome"),
    channel: "chrome",
    args: ["--profile-directory=Default"],
  },
  "chromium": {
    type: "chromium",
    profileDir: path.join(os.homedir(), ".config", "chromium"),
    args: ["--profile-directory=Default"],
  },
  "chromium-browser": {
    type: "chromium",
    profileDir: path.join(os.homedir(), ".config", "chromium"),
    args: ["--profile-directory=Default"],
  },
  "brave-browser": {
    type: "chromium",
    profileDir: path.join(os.homedir(), ".config", "BraveSoftware", "Brave-Browser"),
    channel: "chrome",
    args: ["--profile-directory=Default"],
  },
  "microsoft-edge": {
    type: "chromium",
    profileDir: path.join(os.homedir(), ".config", "microsoft-edge"),
    channel: "msedge",
    args: ["--profile-directory=Default"],
  },
  "firefox": { type: "firefox", profileDir: "" },
  "firefox-esr": { type: "firefox", profileDir: "" },
};

function detectDefaultBrowser(): string {
  const preferred = process.env.BROWSER?.toLowerCase();
  if (preferred && browserMap[preferred]) return preferred;
  if (preferred && browserMap[preferred.replace(/-browser$/, "")])
    return preferred.replace(/-browser$/, "");
  try {
    const out = require("child_process")
      .execSync("xdg-settings get default-web-browser", { encoding: "utf-8", timeout: 3000 })
      .trim();
    const name = out.replace(/\.desktop$/, "").toLowerCase();
    if (browserMap[name]) return name;
    for (const key of Object.keys(browserMap)) {
      if (name.includes(key)) return key;
    }
  } catch {}
  // Fallback: check which profiles exist
  for (const name of ["google-chrome", "brave-browser", "firefox", "chromium", "microsoft-edge"]) {
    if (name === "firefox") {
      if (fs.existsSync(path.join(os.homedir(), ".mozilla", "firefox"))) return name;
    } else {
      if (fs.existsSync(browserMap[name].profileDir)) return name;
    }
  }
  return "google-chrome";
}

function getBrowserConfig(name: string): BrowserConfig {
  if (name === "firefox" || name === "firefox-esr") {
    const profilesDir = path.join(os.homedir(), ".mozilla", "firefox");
    let profilePath = "";
    if (fs.existsSync(profilesDir)) {
      const entries = fs.readdirSync(profilesDir).filter((e) => !e.endsWith(".ini"));
      const defaultProfile = entries.find((e) => e.endsWith(".default") || e.endsWith(".default-release"));
      if (defaultProfile) profilePath = path.join(profilesDir, defaultProfile);
    }
    return {
      type: "firefox",
      profileDir:
        profilePath || path.join(os.homedir(), ".mozilla", "firefox", "default"),
    };
  }
  return browserMap[name] || browserMap["google-chrome"];
}

/**
 * Publish a tweet (or thread) to X using a saved Playwright session.
 * @param content The full text you want to tweet. Use "\n\n" for line breaks.
 */
async function publishToX(content: string) {
  const browserName = detectDefaultBrowser();
  const config = getBrowserConfig(browserName);
  console.log(`Using browser: ${browserName} (profile: ${config.profileDir})`);

  // Load saved cookies (created by `auth.ts`)
  const cookiePath = cookieFile("x");
  if (!fs.existsSync(cookiePath)) {
    console.error("❌ No saved X session cookies found. Run the auth flow first: `npx tsx src/platforms/auth.ts x`");
    process.exit(1);
  }
  const raw = fs.readFileSync(cookiePath, "utf-8");
  const cookies = JSON.parse(raw);

  let context: BrowserContext;
  if (config.type === "firefox") {
    context = await firefox.launchPersistentContext(config.profileDir, { headless: false });
  } else {
    context = await chromium.launchPersistentContext(config.profileDir, {
      headless: false,
      channel: config.channel,
      args: config.args,
    });
  }

  // Add the saved cookies to the context (in case the profile didn't retain them)
  await context.addCookies(cookies);

  const page: Page = await context.newPage();
  try {
    // Go directly to the tweet composer. Adding the text as a query param works for simple tweets.
    const composeUrl = `https://x.com/compose/tweet?text=${encodeURIComponent(content)}`;
    await page.goto(composeUrl, { waitUntil: "domcontentloaded" });
    console.log("🟢 Composer loaded, waiting for tweet button...");

    // If the compose URL didn't pre‑fill, fall back to manual fill.
    const textareaSelector = "div[data-testid='tweetTextarea_0']";
    if (await page.$(textareaSelector) !== null) {
      await page.fill(textareaSelector, content);
    }
    // Click the Tweet button
    const tweetBtn = "div[data-testid='tweetButton']";
    await page.waitForSelector(tweetBtn, { timeout: 15000 });
    await page.click(tweetBtn);
    console.log("✅ Tweet sent!");
  } catch (e) {
    console.error("❌ Failed to publish tweet:", e);
  } finally {
    // Keep the browser open for a few seconds so the user can see the result, then close.
    await page.waitForTimeout(5000);
    await context.close();
  }
}

// CLI entry point
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log("Usage: npx tsx src/platforms/publish.ts <tweet‑text>");
    process.exit(0);
  }
  const tweet = args.join(" ");
  publishToX(tweet);
}

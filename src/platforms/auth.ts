import { chromium, firefox } from "playwright"
import { execSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"
import os from "node:os"

const DATA_DIR = process.env.SCHEDULER_DATA_DIR || path.join(process.cwd(), "data")
const COOKIE_DIR = path.join(DATA_DIR, "cookies")

function ensureDir(d: string) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true })
}

function cookieFile(platform: string): string {
  ensureDir(COOKIE_DIR)
  return path.join(COOKIE_DIR, `${platform}.json`)
}

// ─── Default Browser Detection ────────────────────────────────────────────────

interface BrowserConfig {
  type: "chromium" | "firefox"
  profileDir: string
  channel?: string
  args?: string[]
}

const browserMap: Record<string, BrowserConfig> = {
  "google-chrome": {
    type: "chromium", profileDir: path.join(os.homedir(), ".config", "google-chrome"),
    channel: "chrome", args: ["--profile-directory=Default"],
  },
  "google-chrome-stable": {
    type: "chromium", profileDir: path.join(os.homedir(), ".config", "google-chrome"),
    channel: "chrome", args: ["--profile-directory=Default"],
  },
  "chromium": {
    type: "chromium", profileDir: path.join(os.homedir(), ".config", "chromium"),
    args: ["--profile-directory=Default"],
  },
  "chromium-browser": {
    type: "chromium", profileDir: path.join(os.homedir(), ".config", "chromium"),
    args: ["--profile-directory=Default"],
  },
  "brave-browser": {
    type: "chromium", profileDir: path.join(os.homedir(), ".config", "BraveSoftware", "Brave-Browser"),
    channel: "chrome", args: ["--profile-directory=Default"],
  },
  "microsoft-edge": {
    type: "chromium", profileDir: path.join(os.homedir(), ".config", "microsoft-edge"),
    channel: "msedge", args: ["--profile-directory=Default"],
  },
  "firefox": {
    type: "firefox", profileDir: "",
  },
  "firefox-esr": {
    type: "firefox", profileDir: "",
  },
}

function detectDefaultBrowser(): string {
  const preferred = process.env.BROWSER?.toLowerCase()
  if (preferred && browserMap[preferred]) return preferred
  if (preferred && browserMap[preferred.replace(/-browser$/, "")]) return preferred.replace(/-browser$/, "")

  try {
    const out = execSync("xdg-settings get default-web-browser", { encoding: "utf-8", timeout: 3000 }).trim()
    const name = out.replace(/\.desktop$/, "").toLowerCase()
    if (browserMap[name]) return name
    for (const key of Object.keys(browserMap)) {
      if (name.includes(key)) return key
    }
  } catch {}

  // Fallback: check which browser profiles exist
  for (const name of ["google-chrome", "brave-browser", "firefox", "chromium", "microsoft-edge"]) {
    if (name === "firefox") {
      if (fs.existsSync(path.join(os.homedir(), ".mozilla", "firefox"))) return name
    } else {
      if (fs.existsSync(browserMap[name].profileDir)) return name
    }
  }
  return "google-chrome"
}

function getBrowserConfig(name: string): BrowserConfig {
  if (name === "firefox" || name === "firefox-esr") {
    const profilesDir = path.join(os.homedir(), ".mozilla", "firefox")
    let profilePath = ""
    if (fs.existsSync(profilesDir)) {
      const entries = fs.readdirSync(profilesDir).filter(e => !e.endsWith(".ini"))
      const defaultProfile = entries.find(e => e.endsWith(".default") || e.endsWith(".default-release"))
      if (defaultProfile) profilePath = path.join(profilesDir, defaultProfile)
    }
    return { type: "firefox", profileDir: profilePath || path.join(os.homedir(), ".mozilla", "firefox", "default") }
  }
  return browserMap[name] || browserMap["google-chrome"]
}

// ─── Auth Flow ───────────────────────────────────────────────────────────────

async function authFlow(platform: string, label: string, loginUrl: string, successUrl: string) {
  const browserName = detectDefaultBrowser()
  const config = getBrowserConfig(browserName)

  console.log(`\n  ╔══════════════════════════════════════╗`)
  console.log(`  ║     Authenticate ${label.padEnd(27)}║`)
  console.log(`  ╚══════════════════════════════════════╝`)
  console.log(`\n  Default browser: ${browserName}`)
  console.log(`  Profile: ${config.profileDir}`)
  console.log(`  Platform: ${label}`)
  console.log(`\n  Log in with your saved passwords — no manual entry needed.\n`)

  if (config.type !== "firefox" && !fs.existsSync(config.profileDir)) {
    console.error(`\n  ❌ Profile not found: ${config.profileDir}`)
    console.error(`  Set BROWSER=firefox or BROWSER=brave to use a different browser.\n`)
    process.exit(1)
  }

  let context
  if (config.type === "firefox") {
    context = await firefox.launchPersistentContext(config.profileDir, {
      headless: false,
    })
  } else {
    context = await chromium.launchPersistentContext(config.profileDir, {
      headless: false,
      channel: config.channel,
      args: config.args,
    })
  }
  const page = await context.newPage()

  try {
    await page.goto(loginUrl, { waitUntil: "domcontentloaded" })
    console.log(`  → Waiting for you to log in on ${label}...`)

    await page.waitForURL(successUrl, { timeout: 180000 })
    console.log("  ✅ Login detected!")
    await page.waitForTimeout(2000)

    const cookies = await context.cookies()
    const file = cookieFile(platform)
    fs.writeFileSync(file, JSON.stringify(cookies, null, 2))
    console.log(`  ✅ Session saved to ${file}`)
    console.log(`  ✅ ${label} is now connected!\n`)
  } catch (e) {
    console.error(`\n  ❌ Auth failed: ${e instanceof Error ? e.message : e}`)
    process.exit(1)
  } finally {
    await context.close()
  }
}

// ─── Platform Map ────────────────────────────────────────────────────────────

const platforms: Record<string, [string, string, string]> = {
  x: ["X/Twitter", "https://x.com/login", "https://x.com/home"],
  twitter: ["X/Twitter", "https://x.com/login", "https://x.com/home"],
  linkedin: ["LinkedIn", "https://www.linkedin.com/login", "https://www.linkedin.com/feed/**"],
  facebook: ["Facebook", "https://www.facebook.com/login", "https://www.facebook.com/**"],
  instagram: ["Instagram", "https://www.instagram.com/accounts/login", "https://www.instagram.com/**"],
  threads: ["Threads", "https://www.threads.net/login", "https://www.threads.net/**"],
}

const input = process.argv[2]
if (!input || !platforms[input]) {
  console.log("Usage: npx tsx src/platforms/auth.ts <platform>")
  console.log("Platforms: x, twitter, linkedin, facebook, instagram, threads")
  console.log("")
  console.log("Auto-detects your system's default browser via xdg-settings.")
  console.log("Set BROWSER=firefox or BROWSER=brave to override.")
  process.exit(1)
}

const [label, loginUrl, successUrl] = platforms[input]
authFlow(input, label, loginUrl, successUrl)

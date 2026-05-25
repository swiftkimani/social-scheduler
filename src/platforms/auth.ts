import { chromium } from "playwright"
import fs from "node:fs"
import path from "node:path"

const DATA_DIR = process.env.SCHEDULER_DATA_DIR || path.join(process.cwd(), "data")
const COOKIE_DIR = path.join(DATA_DIR, "cookies")

function ensureDir(d: string) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true })
}

function cookieFile(platform: string): string {
  ensureDir(COOKIE_DIR)
  return path.join(COOKIE_DIR, `${platform}.json`)
}

async function authFlow(platform: string, label: string, loginUrl: string, successUrl: string) {
  console.log(`\n  ╔══════════════════════════════════════╗`)
  console.log(`  ║     Authenticate ${label.padEnd(27)}║`)
  console.log(`  ╚══════════════════════════════════════╝`)
  console.log(`\n  A browser will open. Log in to ${label} and I'll capture your session.`)
  console.log(`  No passwords stored. Cookies saved locally.\n`)

  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } })
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
    await browser.close()
  }
}

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
  process.exit(1)
}

const [label, loginUrl, successUrl] = platforms[input]
authFlow(input, label, loginUrl, successUrl)

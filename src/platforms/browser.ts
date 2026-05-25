import { chromium, Browser, Page } from "playwright"
import { Platform, PlatformClient } from "../types.js"
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

async function loadCookies(page: Page, platform: string): Promise<boolean> {
  const file = cookieFile(platform)
  if (!fs.existsSync(file)) return false
  try {
    const cookies = JSON.parse(fs.readFileSync(file, "utf-8"))
    if (!Array.isArray(cookies) || cookies.length === 0) return false
    await page.context().addCookies(cookies)
    return true
  } catch {
    return false
  }
}

async function saveCookies(page: Page, platform: string) {
  ensureDir(COOKIE_DIR)
  const cookies = await page.context().cookies()
  fs.writeFileSync(cookieFile(platform), JSON.stringify(cookies, null, 2))
}

async function newPage(): Promise<{ browser: Browser; context: any; page: Page }> {
  const b = await launchBrowser()
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } })
  const p = await ctx.newPage()
  return { browser: b, context: ctx, page: p }
}

// ─── X/Twitter ───────────────────────────────────────────────────────────────

export class BrowserXClient implements PlatformClient {
  name: Platform = "twitter"

  async post(content: string) {
    const { page, context } = await newPage()
    try {
      const has = await loadCookies(page, "x")
      if (!has) return { success: false, error: "No X session. Run: npm run auth:x" }

      await page.goto("https://x.com/home", { waitUntil: "domcontentloaded", timeout: 15000 })
      await page.waitForTimeout(2000)
      const ok = await page.locator('a[data-testid="SideNav_NewTweet_Button"]').isVisible({ timeout: 5000 }).catch(() => false)
      if (!ok) return { success: false, error: "X session expired. Re-auth: npm run auth:x" }

      await page.goto("https://x.com/compose/post", { waitUntil: "domcontentloaded", timeout: 15000 })
      await page.waitForTimeout(1500)
      const ta = page.locator('div[data-testid="tweetTextarea_0"]').first()
      await ta.waitFor({ state: "visible", timeout: 8000 })
      await ta.click()
      await page.keyboard.type(content, { delay: 20 })
      await page.waitForTimeout(500)
      await page.locator('div[data-testid="tweetButton"]').first().click()
      await page.waitForTimeout(3000)
      await saveCookies(page, "x")
      return { success: true, postId: `x-${Date.now()}` }
    } catch (e) {
      return { success: false, error: `X post failed: ${e instanceof Error ? e.message : e}` }
    } finally { await context.close() }
  }
}

// ─── LinkedIn ────────────────────────────────────────────────────────────────

export class BrowserLinkedInClient implements PlatformClient {
  name: Platform = "linkedin"

  async post(content: string) {
    const { page, context } = await newPage()
    try {
      const has = await loadCookies(page, "linkedin")
      if (!has) return { success: false, error: "No LinkedIn session. Run: npm run auth:linkedin" }

      await page.goto("https://www.linkedin.com/feed/", { waitUntil: "domcontentloaded", timeout: 15000 })
      await page.waitForTimeout(2000)
      const ok = await page.locator('div[data-id="feed-dock"]').isVisible({ timeout: 5000 }).catch(() => false)
      if (!ok) return { success: false, error: "LinkedIn session expired. Re-auth: npm run auth:linkedin" }

      await page.locator('button:has-text("Start a post")').first().click()
      await page.waitForTimeout(1500)
      const ed = page.locator('div[role="textbox"]').first()
      await ed.waitFor({ state: "visible", timeout: 5000 })
      await ed.click()
      await page.keyboard.type(content, { delay: 15 })
      await page.waitForTimeout(500)
      await page.locator('button:has-text("Post")').last().click()
      await page.waitForTimeout(3000)
      await saveCookies(page, "linkedin")
      return { success: true, postId: `linkedin-${Date.now()}` }
    } catch (e) {
      return { success: false, error: `LinkedIn post failed: ${e instanceof Error ? e.message : e}` }
    } finally { await context.close() }
  }
}

// ─── Facebook ────────────────────────────────────────────────────────────────

export class BrowserFacebookClient implements PlatformClient {
  name: Platform = "facebook"

  async post(content: string) {
    const { page, context } = await newPage()
    try {
      const has = await loadCookies(page, "facebook")
      if (!has) return { success: false, error: "No Facebook session. Run: npm run auth:facebook" }

      await page.goto("https://www.facebook.com/", { waitUntil: "domcontentloaded", timeout: 15000 })
      await page.waitForTimeout(3000)
      const ok = await page.locator('[role="dialog"], [aria-label="Create a post"], [data-pagelet="Feed"]').first().isVisible({ timeout: 5000 }).catch(() => false)
      if (!ok) return { success: false, error: "Facebook session expired. Re-auth: npm run auth:facebook" }

      const composer = page.locator('[aria-label="What\'s on your mind?"], [aria-label="Create a post"], [role="button"]:has-text("What\'s on your mind")').first()
      await composer.waitFor({ state: "visible", timeout: 8000 })
      await composer.click()
      await page.waitForTimeout(1500)

      const editor = page.locator('[role="dialog"] [contenteditable="true"], [role="textbox"]').first()
      await editor.waitFor({ state: "visible", timeout: 5000 })
      await editor.click()
      await page.keyboard.type(content, { delay: 15 })
      await page.waitForTimeout(500)

      await page.locator('[aria-label="Post"], button:has-text("Post")').last().click()
      await page.waitForTimeout(3000)
      await saveCookies(page, "facebook")
      return { success: true, postId: `facebook-${Date.now()}` }
    } catch (e) {
      return { success: false, error: `Facebook post failed: ${e instanceof Error ? e.message : e}` }
    } finally { await context.close() }
  }
}

// ─── Instagram (text stories) ────────────────────────────────────────────────

export class BrowserInstagramClient implements PlatformClient {
  name: Platform = "instagram"

  async post(content: string) {
    const { page, context } = await newPage()
    try {
      const has = await loadCookies(page, "instagram")
      if (!has) return { success: false, error: "No Instagram session. Run: npm run auth:instagram" }

      await page.goto("https://www.instagram.com/", { waitUntil: "domcontentloaded", timeout: 15000 })
      await page.waitForTimeout(3000)
      const ok = await page.locator('svg[aria-label="Home"], [role="navigation"]').first().isVisible({ timeout: 5000 }).catch(() => false)
      if (!ok) return { success: false, error: "Instagram session expired. Re-auth: npm run auth:instagram" }

      await page.goto("https://www.instagram.com/create/story/", { waitUntil: "domcontentloaded", timeout: 15000 })
      await page.waitForTimeout(2000)

      const textTool = page.locator('svg[aria-label="Create"], [aria-label="Create"]').first()
      await textTool.waitFor({ state: "visible", timeout: 5000 }).catch(() => {})
      await page.waitForTimeout(500)

      const editor = page.locator('[role="textbox"], div[contenteditable="true"]').first()
      await editor.waitFor({ state: "visible", timeout: 8000 }).catch(() => {})
      await page.waitForTimeout(500)
      await page.keyboard.type(content, { delay: 20 })
      await page.waitForTimeout(500)

      await page.locator('button:has-text("Share"), button:has-text("Send to")').first().click().catch(() => {})
      await page.waitForTimeout(3000)
      await saveCookies(page, "instagram")
      return { success: true, postId: `instagram-${Date.now()}` }
    } catch (e) {
      return { success: false, error: `Instagram post failed: ${e instanceof Error ? e.message : e}` }
    } finally { await context.close() }
  }
}

// ─── Threads ─────────────────────────────────────────────────────────────────

export class BrowserThreadsClient implements PlatformClient {
  name: Platform = "threads"

  async post(content: string) {
    const { page, context } = await newPage()
    try {
      const has = await loadCookies(page, "threads")
      if (!has) return { success: false, error: "No Threads session. Run: npm run auth:threads" }

      await page.goto("https://www.threads.net/", { waitUntil: "domcontentloaded", timeout: 15000 })
      await page.waitForTimeout(3000)
      const ok = await page.locator('[aria-label="Write a reply"], [aria-label="New post"]').first().isVisible({ timeout: 5000 }).catch(() => false)
      if (!ok) return { success: false, error: "Threads session expired. Re-auth: npm run auth:threads" }

      const compose = page.locator('[aria-label="Write a reply"], [aria-label="New post"], a[href="/new"]').first()
      await compose.waitFor({ state: "visible", timeout: 8000 })
      await compose.click()
      await page.waitForTimeout(2000)

      const editor = page.locator('[role="textbox"]').first()
      await editor.waitFor({ state: "visible", timeout: 5000 })
      await editor.click()
      await page.keyboard.type(content, { delay: 15 })
      await page.waitForTimeout(500)

      await page.locator('button:has-text("Post"), button:has-text("Publish")').last().click()
      await page.waitForTimeout(3000)
      await saveCookies(page, "threads")
      return { success: true, postId: `threads-${Date.now()}` }
    } catch (e) {
      return { success: false, error: `Threads post failed: ${e instanceof Error ? e.message : e}` }
    } finally { await context.close() }
  }
}

// ─── Browser Lifecycle ───────────────────────────────────────────────────────

let _browser: Browser | null = null

async function launchBrowser(): Promise<Browser> {
  if (_browser && _browser.isConnected()) return _browser
  if (_browser) await _browser.close().catch(() => {})
  _browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  })
  return _browser
}

export async function closeBrowser() {
  if (_browser) {
    await _browser.close().catch(() => {})
    _browser = null
  }
}

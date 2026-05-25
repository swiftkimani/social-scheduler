import { Platform, PlatformClient } from "../types.js"
import {
  BrowserXClient, BrowserLinkedInClient,
  BrowserFacebookClient, BrowserInstagramClient, BrowserThreadsClient,
} from "./browser.js"
import OAuth from "oauth-1.0a"
import crypto from "node:crypto"
import fs from "node:fs"
import path from "node:path"

// ─── Twitter/X Client (OAuth 1.0a) ──────────────────────────────────────────

const DATA_DIR = process.env.SCHEDULER_DATA_DIR || path.join(process.cwd(), "data")

function loadTwitterOAuthTokens(): { token: string; secret: string } | null {
  const file = path.join(DATA_DIR, "twitter-oauth.json")
  try {
    const data = JSON.parse(fs.readFileSync(file, "utf-8"))
    if (data.token && data.secret) return data
  } catch {}
  return null
}

function getTwitterOAuthClient() {
  const ck = process.env.xConsumerKey || process.env.TWITTER_CONSUMER_KEY || ""
  const cs = process.env.xSecretKey || process.env.TWITTER_CONSUMER_SECRET || ""
  if (!ck || !cs) return null
  return new OAuth({
    consumer: { key: ck, secret: cs },
    signature_method: "HMAC-SHA1",
    hash_function(base_string, key) {
      return crypto.createHmac("sha1", key).update(base_string).digest("base64")
    },
  })
}

class TwitterClient implements PlatformClient {
  name: Platform = "twitter"

  async post(content: string) {
    if (content.length > 280) return { success: false, error: "Tweet exceeds 280 characters" }
    const tokens = loadTwitterOAuthTokens()
    if (!tokens) return { success: false, error: "X not connected — connect via Account Hub" }
    const oauth = getTwitterOAuthClient()
    if (!oauth) return { success: false, error: "xConsumerKey / xSecretKey not set in .env" }
    try {
      const requestData = { url: "https://api.twitter.com/2/tweets", method: "POST", data: { text: content } }
      const headers = oauth.toHeader(oauth.authorize(requestData, { key: tokens.token, secret: tokens.secret }))
      const res = await fetch(requestData.url, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(requestData.data),
      })
      if (!res.ok) return { success: false, error: `Twitter API error: ${await res.text()}` }
      const data = (await res.json()) as { data?: { id: string } }
      if (!data.data?.id) return { success: false, error: "No tweet ID returned" }
      return { success: true, postId: data.data.id }
    } catch (e) { return { success: false, error: `Twitter request failed: ${e}` } }
  }
}

// ─── LinkedIn Client (API) ───────────────────────────────────────────────────

class LinkedInClient implements PlatformClient {
  name: Platform = "linkedin"

  async post(content: string) {
    const token = process.env.LINKEDIN_ACCESS_TOKEN
    const userUrn = process.env.LINKEDIN_USER_URN
    if (!token) return { success: false, error: "LINKEDIN_ACCESS_TOKEN not set" }
    if (!userUrn) return { success: false, error: "LINKEDIN_USER_URN not set" }
    if (content.length > 3000) return { success: false, error: "LinkedIn post exceeds 3000 characters" }
    try {
      const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "X-Restli-Protocol-Version": "2.0.0" },
        body: JSON.stringify({
          author: `urn:li:person:${userUrn}`, lifecycleState: "PUBLISHED",
          specificContent: { "com.linkedin.ugc.ShareContent": { shareCommentary: { text: content }, shareMediaCategory: "NONE" } },
          visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
        }),
      })
      if (!res.ok) return { success: false, error: `LinkedIn API error: ${await res.text()}` }
      return { success: true }
    } catch (e) { return { success: false, error: `LinkedIn request failed: ${e}` } }
  }

  validate(content: string) {
    if (content.length > 3000) return { valid: false, error: "LinkedIn post exceeds 3000 characters" }
    return { valid: true }
  }
}

// ─── Mock Clients ────────────────────────────────────────────────────────────

class MockClient implements PlatformClient {
  constructor(public name: Platform) {}
  async post(content: string) {
    return { success: true, postId: `mock-${this.name}-${Date.now()}` }
  }
}

// ─── Factory ─────────────────────────────────────────────────────────────────

function useBrowser(): boolean {
  return process.env.USE_BROWSER_AUTH === "true"
}

export function getPlatformClient(platform: Platform): PlatformClient {
  if (useBrowser()) {
    switch (platform) {
      case "twitter": return new BrowserXClient()
      case "linkedin": return new BrowserLinkedInClient()
      case "facebook": return new BrowserFacebookClient()
      case "instagram": return new BrowserInstagramClient()
      case "threads": return new BrowserThreadsClient()
    }
  }

  if (process.env.USE_MOCK_CLIENTS === "true") {
    return new MockClient(platform)
  }

  switch (platform) {
    case "twitter": return new TwitterClient()
    case "linkedin": return new LinkedInClient()
    default: return new MockClient(platform)
  }
}

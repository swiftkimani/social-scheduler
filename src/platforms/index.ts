import { Platform, PlatformClient } from "../types.js"
import {
  BrowserXClient, BrowserLinkedInClient,
  BrowserFacebookClient, BrowserInstagramClient, BrowserThreadsClient,
} from "./browser.js"

// ─── Twitter/X Client (API) ──────────────────────────────────────────────────

class TwitterClient implements PlatformClient {
  name: Platform = "twitter"

  async post(content: string) {
    const token = process.env.TWITTER_ACCESS_TOKEN
    if (!token) return { success: false, error: "TWITTER_ACCESS_TOKEN not set" }
    if (content.length > 280) return { success: false, error: "Tweet exceeds 280 characters" }
    try {
      const res = await fetch("https://api.twitter.com/2/tweets", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ text: content }),
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

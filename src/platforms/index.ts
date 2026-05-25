import { Platform, PlatformClient } from "../types.js"

// ─── Twitter/X Client ───────────────────────────────────────────────────────

class TwitterClient implements PlatformClient {
  name: Platform = "twitter"

  async post(content: string): Promise<{ success: boolean; postId?: string; error?: string }> {
    const token = process.env.TWITTER_ACCESS_TOKEN
    if (!token) return { success: false, error: "TWITTER_ACCESS_TOKEN not set" }

    if (content.length > 280) return { success: false, error: "Tweet exceeds 280 characters" }

    try {
      const res = await fetch("https://api.twitter.com/2/tweets", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: content }),
      })
      if (!res.ok) {
        const err = await res.text()
        return { success: false, error: `Twitter API error: ${err}` }
      }
      const data = (await res.json()) as { data?: { id: string } }
      if (!data.data?.id) return { success: false, error: "No tweet ID returned" }
      return { success: true, postId: data.data.id }
    } catch (e) {
      return { success: false, error: `Twitter request failed: ${e}` }
    }
  }
}

// ─── LinkedIn Client ────────────────────────────────────────────────────────

class LinkedInClient implements PlatformClient {
  name: Platform = "linkedin"

  async post(content: string): Promise<{ success: boolean; postId?: string; error?: string }> {
    const token = process.env.LINKEDIN_ACCESS_TOKEN
    const userUrn = process.env.LINKEDIN_USER_URN
    if (!token) return { success: false, error: "LINKEDIN_ACCESS_TOKEN not set" }
    if (!userUrn) return { success: false, error: "LINKEDIN_USER_URN not set" }

    if (content.length > 3000) return { success: false, error: "LinkedIn post exceeds 3000 characters" }

    try {
      const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0",
        },
        body: JSON.stringify({
          author: `urn:li:person:${userUrn}`,
          lifecycleState: "PUBLISHED",
          specificContent: {
            "com.linkedin.ugc.ShareContent": {
              shareCommentary: { text: content },
              shareMediaCategory: "NONE",
            },
          },
          visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
        }),
      })
      if (!res.ok) {
        const err = await res.text()
        return { success: false, error: `LinkedIn API error: ${err}` }
      }
      return { success: true }
    } catch (e) {
      return { success: false, error: `LinkedIn request failed: ${e}` }
    }
  }

  validate(content: string): { valid: boolean; error?: string } {
    if (content.length > 3000) return { valid: false, error: "LinkedIn post exceeds 3000 characters" }
    return { valid: true }
  }
}

// ─── Mock Clients (for demo/testing without API keys) ───────────────────────

class MockTwitterClient implements PlatformClient {
  name: Platform = "twitter"

  async post(content: string) {
    return { success: true, postId: `mock-tweet-${Date.now()}` }
  }
}

class MockLinkedInClient implements PlatformClient {
  name: Platform = "linkedin"

  async post(content: string) {
    return { success: true, postId: `mock-linkedin-${Date.now()}` }
  }
}

// ─── Factory ────────────────────────────────────────────────────────────────

export function getPlatformClient(platform: Platform): PlatformClient {
  const useMock = process.env.USE_MOCK_CLIENTS === "true"
  if (useMock) {
    return platform === "twitter" ? new MockTwitterClient() : new MockLinkedInClient()
  }
  switch (platform) {
    case "twitter":
      return new TwitterClient()
    case "linkedin":
      return new LinkedInClient()
  }
}

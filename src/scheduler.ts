import { v4 as uuid } from "uuid"
import { SocialPost, Platform, PostStatus } from "./types.js"
import { addPost, updatePost, getPost, getPostsByStatus, getAllPosts, removePost } from "./storage.js"
import { getPlatformClient } from "./platforms/index.js"

export interface ScheduleInput {
  content: string
  platforms: Platform[]
  scheduledAt?: string
}

export function schedulePost(input: ScheduleInput): SocialPost {
  const now = new Date().toISOString()
  const post: SocialPost = {
    id: uuid(),
    content: input.content,
    platforms: input.platforms,
    status: input.scheduledAt ? "pending" : "draft",
    scheduledAt: input.scheduledAt || null,
    publishedAt: null,
    createdAt: now,
    updatedAt: now,
    error: null,
  }
  addPost(post)
  return post
}

export async function publishPost(postId: string): Promise<SocialPost | null> {
  const post = getPost(postId)
  if (!post) return null
  if (post.status === "published") return post

  let allSuccess = true
  let lastError: string | null = null

  for (const platform of post.platforms) {
    const client = getPlatformClient(platform)
    const result = await client.post(post.content)
    if (!result.success) {
      allSuccess = false
      lastError = result.error || `Failed to post to ${platform}`
    }
  }

  return updatePost(postId, {
    status: allSuccess ? "published" : "pending",
    publishedAt: allSuccess ? new Date().toISOString() : null,
    error: lastError,
  })
}

export async function publishAllPending(): Promise<{ published: number; failed: number }> {
  const pending = getPostsByStatus("pending").filter((p) => {
    if (!p.scheduledAt) return false
    return new Date(p.scheduledAt) <= new Date()
  })

  let published = 0
  let failed = 0

  for (const post of pending) {
    const result = await publishPost(post.id)
    if (result?.status === "published") published++
    else failed++
  }

  return { published, failed }
}

export function listPosts(status?: string): SocialPost[] {
  return status ? getPostsByStatus(status) : getAllPosts()
}

export function cancelPost(postId: string): SocialPost | null {
  return updatePost(postId, { status: "cancelled" })
}

export function deletePost(postId: string): boolean {
  return removePost(postId)
}

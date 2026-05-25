export type Platform = "twitter" | "linkedin" | "facebook" | "instagram" | "threads"

export type PostStatus = "draft" | "pending" | "published" | "cancelled"

export interface SocialPost {
  id: string
  content: string
  platforms: Platform[]
  status: PostStatus
  scheduledAt: string | null
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  error: string | null
}

export interface StorageData {
  posts: SocialPost[]
}

export interface PlatformClient {
  name: Platform
  post(content: string): Promise<{ success: boolean; postId?: string; error?: string }>
  validate?(content: string): { valid: boolean; error?: string }
}

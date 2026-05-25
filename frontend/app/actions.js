"use server"

import { refresh } from "next/cache"

const API = process.env.GO_API || "http://localhost:8080"

export async function schedulePost(formData) {
  const content = formData.get("content")
  const platforms = formData.getAll("platforms")
  const scheduledAt = formData.get("scheduledAt") || null

  if (!content || platforms.length === 0) {
    return { error: "Content and at least one platform are required" }
  }

  const res = await fetch(`${API}/api/schedule`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, platforms, scheduledAt }),
  })

  if (!res.ok) {
    const err = await res.json()
    return { error: err.error || "Failed to schedule post" }
  }

  refresh()
  return { success: true }
}

export async function publishPost(formData) {
  const id = formData.get("id")
  const res = await fetch(`${API}/api/posts/${id}/publish`, { method: "POST" })
  if (!res.ok) return { error: "Failed to publish post" }
  refresh()
  return { success: true }
}

export async function cancelPost(formData) {
  const id = formData.get("id")
  const res = await fetch(`${API}/api/posts/${id}/cancel`, { method: "POST" })
  if (!res.ok) return { error: "Failed to cancel post" }
  refresh()
  return { success: true }
}

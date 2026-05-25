import fs from "node:fs"
import path from "node:path"
import { SocialPost, StorageData } from "./types.js"

const DATA_DIR = process.env.SCHEDULER_DATA_DIR || path.join(process.cwd(), "data")
const DATA_FILE = path.join(DATA_DIR, "schedule.json")

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

function load(): StorageData {
  ensureDataDir()
  if (!fs.existsSync(DATA_FILE)) {
    return { posts: [] }
  }
  const raw = fs.readFileSync(DATA_FILE, "utf-8")
  return JSON.parse(raw)
}

function save(data: StorageData) {
  ensureDataDir()
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8")
}

export function getAllPosts(): SocialPost[] {
  return load().posts
}

export function getPost(id: string): SocialPost | undefined {
  return load().posts.find((p) => p.id === id)
}

export function addPost(post: SocialPost) {
  const data = load()
  data.posts.push(post)
  save(data)
}

export function updatePost(id: string, updates: Partial<SocialPost>): SocialPost | null {
  const data = load()
  const idx = data.posts.findIndex((p) => p.id === id)
  if (idx === -1) return null
  data.posts[idx] = { ...data.posts[idx], ...updates, updatedAt: new Date().toISOString() }
  save(data)
  return data.posts[idx]
}

export function removePost(id: string): boolean {
  const data = load()
  const len = data.posts.length
  data.posts = data.posts.filter((p) => p.id !== id)
  save(data)
  return data.posts.length < len
}

export function getPendingPosts(): SocialPost[] {
  return load().posts.filter((p) => p.status === "pending")
}

export function getPostsByStatus(status: string): SocialPost[] {
  if (!status) return getAllPosts()
  return load().posts.filter((p) => p.status === status)
}

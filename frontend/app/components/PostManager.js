"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useFormStatus } from "react-dom"
import { schedulePost, publishPost, cancelPost } from "../actions"

function SubmitButton({ label, variant = "primary", pendingLabel }) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className={`btn btn-${variant}`}>
      {pending ? pendingLabel || `${label}...` : label}
    </button>
  )
}

function PostItem({ post, index }) {
  const statusClass =
    post.status === "published" ? "status-published"
    : post.status === "cancelled" ? "status-cancelled"
    : post.status === "pending" ? "status-pending"
    : "status-draft"

  const statusIcon =
    post.status === "published" ? "✅"
    : post.status === "cancelled" ? "❌"
    : post.status === "pending" ? "⏳"
    : "📝"

  const created = new Date(post.createdAt).toLocaleString()
  const scheduled = post.scheduledAt ? new Date(post.scheduledAt).toLocaleString() : null

  return (
    <div className="post-item" style={{ animationDelay: `${index * 30}ms` }}>
      <div className="post-body">
        <div className="post-text">{post.content}</div>
        <div className="post-meta">
          <span className={`post-status ${statusClass}`}>
            {statusIcon} {post.status}
          </span>
          {post.platforms?.map((p) => (
            <span key={p} className="tag">{p}</span>
          ))}
          {scheduled && <span className="meta-item">📅 {scheduled}</span>}
          <span className="meta-item">🕐 {created}</span>
        </div>
      </div>
      <div className="post-actions">
        {(post.status === "pending" || post.status === "draft") && (
          <form action={cancelPost}>
            <input type="hidden" name="id" value={post.id} />
            <SubmitButton label="Cancel" variant="danger" pendingLabel="..." />
          </form>
        )}
        {post.status === "pending" && (
          <form action={publishPost}>
            <input type="hidden" name="id" value={post.id} />
            <SubmitButton label="Publish" variant="success" pendingLabel="..." />
          </form>
        )}
      </div>
    </div>
  )
}

export default function PostManager({ initialPosts }) {
  const [posts, setPosts] = useState(initialPosts)
  const [filter, setFilter] = useState("")
  const [charCount, setCharCount] = useState(0)
  const [toast, setToast] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const formRef = useRef(null)

  useEffect(() => {
    setPosts(initialPosts)
  }, [initialPosts])

  const filteredPosts = filter
    ? posts.filter((p) => p.status === filter)
    : posts

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  const refreshPosts = useCallback(async () => {
    try {
      const res = await fetch("/api/posts")
      const data = await res.json()
      setPosts(data)
    } catch {
      showToast("Failed to refresh", "error")
    }
  }, [showToast])

  async function handleSchedule(formData) {
    setSubmitting(true)
    try {
      const result = await schedulePost(formData)
      if (result.success) {
        formRef.current?.reset()
        setCharCount(0)
        await refreshPosts()
        showToast("Post scheduled!", "success")
      } else {
        showToast(result.error || "Failed to schedule", "error")
      }
    } catch {
      showToast("An error occurred", "error")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container">
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.msg}
        </div>
      )}

      <header className="header">
        <h1>📅 Social Scheduler</h1>
        <p>Schedule and manage social media posts</p>
      </header>

      <div className="card">
        <h2>✏️ New Post</h2>
        <form action={handleSchedule} ref={formRef}>
          <div className="form-group">
            <label htmlFor="content">Content</label>
            <textarea
              id="content"
              name="content"
              placeholder="What do you want to post?"
              maxLength={3000}
              rows={3}
              onChange={(e) => setCharCount(e.target.value.length)}
            />
            <div className="char-count">{charCount} / 3000</div>
          </div>
          <div className="form-group">
            <label>Platforms</label>
            <div className="checkbox-group">
              <label><input type="checkbox" name="platforms" value="twitter" defaultChecked /> Twitter/X</label>
              <label><input type="checkbox" name="platforms" value="linkedin" /> LinkedIn</label>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="scheduledAt">Schedule (optional)</label>
            <input type="datetime-local" id="scheduledAt" name="scheduledAt" />
          </div>
          <button type="submit" disabled={submitting} className="btn btn-primary">
            {submitting ? "Scheduling..." : "Schedule Post"}
          </button>
        </form>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>📋 Posts</h2>
          <div className="card-controls">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="published">Published</option>
              <option value="cancelled">Cancelled</option>
              <option value="draft">Draft</option>
            </select>
            <button className="btn btn-secondary" onClick={refreshPosts}>
              🔄 Refresh
            </button>
          </div>
        </div>
        <div className="posts-list">
          {filteredPosts.length === 0 ? (
            <div className="empty-state">📭 No posts found</div>
          ) : (
            filteredPosts.map((post, i) => (
              <PostItem key={post.id} post={post} index={i} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

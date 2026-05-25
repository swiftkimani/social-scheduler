"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { schedulePost, publishPost, cancelPost } from "../actions"

function Toast({ toasts, onRemove }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`} onClick={() => onRemove(t.id)}>
          <span>{t.type === "success" ? "✓" : "✕"}</span>
          {t.msg}
        </div>
      ))}
    </div>
  )
}

function PostItem({ post, index, onPublish, onCancel }) {
  const canPublish = post.status === "pending"
  const canCancel = post.status === "pending" || post.status === "draft"

  const scheduled = post.scheduledAt ? new Date(post.scheduledAt).toLocaleString() : null
  const created = new Date(post.createdAt).toLocaleString()

  return (
    <div className="post-item" style={{ animationDelay: `${index * 50}ms` }}>
      <div className={`post-indicator ${post.status}`} />
      <div className="post-body">
        <div className="post-text">{post.content}</div>
        <div className="post-meta">
          <span className={`post-status status-${post.status}`}>
            {post.status === "published" ? "✓" : post.status === "cancelled" ? "✕" : post.status === "pending" ? "○" : "—"}{" "}
            {post.status}
          </span>
          {post.platforms?.map((p) => (
            <span key={p} className={`tag tag-${p}`}>{p}</span>
          ))}
          {scheduled && <span className="meta-item">📅 {scheduled}</span>}
          <span className="meta-item">🕐 {created}</span>
        </div>
      </div>
      <div className="post-actions">
        {canCancel && (
          <form onSubmit={(e) => { e.preventDefault(); onCancel(post.id) }}>
            <button type="submit" className="btn btn-danger btn-sm">Cancel</button>
          </form>
        )}
        {canPublish && (
          <form onSubmit={(e) => { e.preventDefault(); onPublish(post.id) }}>
            <button type="submit" className="btn btn-success btn-sm">Publish</button>
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
  const [toasts, setToasts] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [platforms, setPlatforms] = useState({ twitter: true, linkedin: false })
  const formRef = useRef(null)
  const toastId = useRef(0)

  useEffect(() => { setPosts(initialPosts) }, [initialPosts])

  const filteredPosts = filter
    ? posts.filter((p) => p.status === filter)
    : posts

  const addToast = useCallback((msg, type = "success") => {
    const id = ++toastId.current
    setToasts((prev) => [...prev, { id, msg, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const refreshPosts = useCallback(async () => {
    try {
      const res = await fetch("/api/posts")
      if (res.ok) {
        const data = await res.json()
        setPosts(data)
      }
    } catch {
      addToast("Failed to refresh posts", "error")
    }
  }, [addToast])

  async function handleSchedule(formData) {
    const content = formData.get("content")
    const selectedPlatforms = Object.entries(platforms)
      .filter(([, v]) => v)
      .map(([k]) => k)

    if (!content || selectedPlatforms.length === 0) {
      addToast("Content and at least one platform required", "error")
      return
    }

    setSubmitting(true)
    try {
      const data = new FormData()
      data.set("content", content)
      selectedPlatforms.forEach((p) => data.append("platforms", p))
      const scheduledAt = formData.get("scheduledAt")
      if (scheduledAt) data.set("scheduledAt", scheduledAt)

      const result = await schedulePost(data)
      if (result?.success) {
        formRef.current?.reset()
        setCharCount(0)
        setPlatforms({ twitter: true, linkedin: false })
        await refreshPosts()
        addToast("Post scheduled!", "success")
      } else {
        addToast(result?.error || "Failed to schedule", "error")
      }
    } catch {
      addToast("Something went wrong", "error")
    } finally {
      setSubmitting(false)
    }
  }

  async function handlePublish(id) {
    const data = new FormData()
    data.set("id", id)
    const result = await publishPost(data)
    if (result?.success) {
      addToast("Post published!", "success")
      await refreshPosts()
    } else {
      addToast(result?.error || "Failed to publish", "error")
    }
  }

  async function handleCancel(id) {
    const data = new FormData()
    data.set("id", id)
    const result = await cancelPost(data)
    if (result?.success) {
      addToast("Post cancelled", "success")
      await refreshPosts()
    } else {
      addToast(result?.error || "Failed to cancel", "error")
    }
  }

  function togglePlatform(name) {
    setPlatforms((prev) => ({ ...prev, [name]: !prev[name] }))
  }

  const charClass = charCount > 280 ? "danger" : charCount > 200 ? "warning" : ""

  return (
    <>
      <div className="bg-glow" />
      <div className="bg-glow-2" />
      <Toast toasts={toasts} onRemove={removeToast} />

      <div className="container">
        <header className="header">
          <span className="header-icon">◆</span>
          <h1>NEXUS AI</h1>
          <p>Schedule and manage posts across Twitter &amp; LinkedIn</p>
        </header>

        <div className="layout">
          <div className="glass card">
            <div className="card-header">
              <div className="card-header-icon purple">✎</div>
              <h2>New Post</h2>
            </div>
            <form action={handleSchedule} ref={formRef}>
              <div className="form-group">
                <label htmlFor="content">Content</label>
                <textarea
                  id="content"
                  name="content"
                  placeholder="What's on your mind?"
                  maxLength={3000}
                  rows={3}
                  onChange={(e) => setCharCount(e.target.value.length)}
                />
                <div className={`char-count ${charClass}`}>
                  {charCount} / 3000
                </div>
              </div>
              <div className="form-group">
                <label>Platforms</label>
                <div className="platform-toggles">
                  <div
                    className={`platform-toggle ${platforms.twitter ? "active" : ""}`}
                    onClick={() => togglePlatform("twitter")}
                  >
                    <input type="checkbox" name="platforms" value="twitter" checked={platforms.twitter} readOnly />
                    𝕏 Twitter
                  </div>
                  <div
                    className={`platform-toggle ${platforms.linkedin ? "active" : ""}`}
                    onClick={() => togglePlatform("linkedin")}
                  >
                    <input type="checkbox" name="platforms" value="linkedin" checked={platforms.linkedin} readOnly />
                    in LinkedIn
                  </div>
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

          <div className="glass card">
            <div className="card-header">
              <div className="card-header-icon pink">☰</div>
              <h2>Posts</h2>
              <span className="badge">{posts.length}</span>
            </div>
            <div className="toolbar">
              <div className="toolbar-left">
                <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                  <option value="">All</option>
                  <option value="pending">Pending</option>
                  <option value="published">Published</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={refreshPosts}>
                ↻ Refresh
              </button>
            </div>
            <div className="posts-list">
              {filteredPosts.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">📭</span>
                  <p>No posts yet — schedule one!</p>
                </div>
              ) : (
                filteredPosts.map((post, i) => (
                  <PostItem
                    key={post.id}
                    post={post}
                    index={i}
                    onPublish={handlePublish}
                    onCancel={handleCancel}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import AiGenerator from "../../components/AiGenerator"
import PatternInsights from "../../components/PatternInsights"

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
            {post.status === "published" ? "✓" : post.status === "cancelled" ? "✕" : post.status === "pending" ? "○" : "—"} {post.status}
          </span>
          {post.platforms?.map((p) => <span key={p} className={`tag tag-${p}`}>{p}</span>)}
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

export default function SchedulePage() {
  const [posts, setPosts] = useState([])
  const [filter, setFilter] = useState("")
  const [charCount, setCharCount] = useState(0)
  const [toasts, setToasts] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [platforms, setPlatforms] = useState({ twitter: true, linkedin: false })
  const [showAi, setShowAi] = useState(false)
  const formRef = useRef(null)
  const contentRef = useRef(null)
  const toastId = useRef(0)

  const refreshPosts = useCallback(async () => {
    try {
      const res = await fetch("/api/posts")
      if (res.ok) setPosts(await res.json())
    } catch { addToast("Failed to refresh", "error") }
  }, [])

  useEffect(() => { refreshPosts() }, [refreshPosts])

  const addToast = useCallback((msg, type = "success") => {
    const id = ++toastId.current
    setToasts((prev) => [...prev, { id, msg, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  async function handleSchedule(formData) {
    const content = formData.get("content")
    const selectedPlatforms = Object.entries(platforms).filter(([, v]) => v).map(([k]) => k)
    if (!content || selectedPlatforms.length === 0) {
      addToast("Content and at least one platform required", "error")
      return
    }
    setSubmitting(true)
    try {
      const data = new FormData()
      data.set("content", content)
      selectedPlatforms.forEach((p) => data.append("platforms", p))
      if (formData.get("scheduledAt")) data.set("scheduledAt", formData.get("scheduledAt"))

      const res = await fetch("http://localhost:8080/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, platforms: selectedPlatforms, scheduledAt: formData.get("scheduledAt") || null }),
      })
      if (res.ok) {
        formRef.current?.reset(); setCharCount(0); setPlatforms({ twitter: true, linkedin: false })
        await refreshPosts(); addToast("Post scheduled!", "success")
      } else {
        addToast("Failed to schedule", "error")
      }
    } catch { addToast("Something went wrong", "error") }
    finally { setSubmitting(false) }
  }

  async function handlePublish(id) {
    const res = await fetch(`http://localhost:8080/api/posts/${id}/publish`, { method: "POST" })
    if (res.ok) { addToast("Post published!", "success"); await refreshPosts() }
    else { addToast("Failed to publish", "error") }
  }

  async function handleCancel(id) {
    const res = await fetch(`http://localhost:8080/api/posts/${id}/cancel`, { method: "POST" })
    if (res.ok) { addToast("Post cancelled", "success"); await refreshPosts() }
    else { addToast("Failed to cancel", "error") }
  }

  function handleAiSelect(text) {
    if (contentRef.current) {
      contentRef.current.value = text
      setCharCount(text.length)
    }
    setShowAi(false)
  }

  const filteredPosts = filter ? posts.filter((p) => p.status === filter) : posts
  const charClass = charCount > 280 ? "danger" : charCount > 200 ? "warning" : ""

  const plat = Object.entries(platforms).filter(([, v]) => v).map(([k]) => k)
  const aiPlatform = plat[0] || "twitter"

  return (
    <div>
      <Toast toasts={toasts} onRemove={removeToast} />
      <div className="dashboard-header">
        <h1>Schedule</h1>
        <p>Create and manage your social media posts</p>
      </div>

      <div className="dashboard-grid">
        <div>
          <div className="glass card" style={{marginBottom:"1.5rem"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1.25rem"}}>
              <div style={{display:"flex",alignItems:"center",gap:"0.625rem"}}>
                <span style={{fontSize:"1rem"}}>✎</span>
                <h2 style={{fontSize:"1rem",fontWeight:700}}>New Post</h2>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAi(!showAi)}>
                ✨ {showAi ? "Hide AI" : "AI Generate"}
              </button>
            </div>

            {showAi && (
              <div className="glass" style={{marginBottom:"1rem",borderRadius:"var(--radius-sm)"}}>
                <AiGenerator onSelect={handleAiSelect} platform={aiPlatform} />
              </div>
            )}

            <form action={handleSchedule} ref={formRef}>
              <div className="form-group">
                <label>Content</label>
                <textarea
                  ref={contentRef}
                  id="content"
                  name="content"
                  placeholder="What do you want to share?"
                  maxLength={3000}
                  rows={3}
                  onChange={(e) => setCharCount(e.target.value.length)}
                />
                <div className={`char-count ${charClass}`}>{charCount} / 3000</div>
              </div>
              <div className="form-group">
                <label>Platforms</label>
                <div className="platform-toggles">
                  {["twitter", "linkedin"].map((p) => (
                    <div key={p} className={`platform-toggle ${platforms[p] ? "active" : ""}`} onClick={() => setPlatforms((prev) => ({ ...prev, [p]: !prev[p] }))}>
                      <input type="checkbox" name="platforms" value={p} checked={platforms[p]} readOnly />
                      {p === "twitter" ? "𝕏 Twitter" : "in LinkedIn"}
                    </div>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Schedule (optional)</label>
                <input type="datetime-local" name="scheduledAt" />
              </div>
              <button type="submit" disabled={submitting} className="btn btn-primary">
                {submitting ? "Scheduling..." : "Schedule Post"}
              </button>
            </form>
          </div>

          <div className="glass card">
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1rem",flexWrap:"wrap",gap:"0.75rem"}}>
              <div style={{display:"flex",alignItems:"center",gap:"0.75rem"}}>
                <span style={{fontSize:"1rem"}}>☰</span>
                <h2 style={{fontSize:"1rem",fontWeight:700}}>Posts</h2>
                <span className="badge" style={{background:"rgba(148,163,184,0.08)",color:"var(--text-muted)",fontSize:"0.7rem",fontWeight:600,padding:"0.125rem 0.5rem",borderRadius:999}}>{posts.length}</span>
              </div>
              <div style={{display:"flex",gap:"0.5rem"}}>
                <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                  <option value="">All</option>
                  <option value="pending">Pending</option>
                  <option value="published">Published</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="draft">Draft</option>
                </select>
                <button className="btn btn-ghost btn-sm" onClick={refreshPosts}>↻</button>
              </div>
            </div>
            <div className="posts-list">
              {filteredPosts.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">📭</span>
                  <p>No posts yet — schedule one!</p>
                </div>
              ) : (
                filteredPosts.slice().reverse().map((post, i) => (
                  <PostItem key={post.id} post={post} index={i} onPublish={handlePublish} onCancel={handleCancel} />
                ))
              )}
            </div>
          </div>
        </div>

        <div className="glass">
          <PatternInsights />
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect, useCallback } from "react"

export default function PostsPage() {
  const [posts, setPosts] = useState([])
  const [filter, setFilter] = useState("")
  const [toasts, setToasts] = useState([])
  const toastId = { current: 0 }

  const addToast = useCallback((msg, type = "success") => {
    const id = ++toastId.current
    setToasts((prev) => [...prev, { id, msg, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500)
  }, [])

  const refresh = useCallback(async () => {
    const res = await fetch("/api/posts")
    if (res.ok) setPosts(await res.json())
  }, [])

  useEffect(() => { refresh() }, [refresh])

  async function handlePublish(id) {
    const res = await fetch(`http://localhost:8080/api/posts/${id}/publish`, { method: "POST" })
    if (res.ok) { addToast("Published!", "success"); refresh() }
    else addToast("Failed", "error")
  }

  async function handleCancel(id) {
    const res = await fetch(`http://localhost:8080/api/posts/${id}/cancel`, { method: "POST" })
    if (res.ok) { addToast("Cancelled", "success"); refresh() }
    else addToast("Failed", "error")
  }

  const filtered = filter ? posts.filter((p) => p.status === filter) : posts

  return (
    <div>
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>{t.type === "success" ? "✓" : "✕"} {t.msg}</div>
        ))}
      </div>
      <div className="dashboard-header">
        <h1>Posts</h1>
        <p>All your scheduled and published posts</p>
      </div>
      <div className="glass card">
        <div style={{display:"flex",gap:"0.75rem",marginBottom:"1rem",alignItems:"center"}}>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="published">Published</option>
            <option value="cancelled">Cancelled</option>
            <option value="draft">Draft</option>
          </select>
          <button className="btn btn-ghost btn-sm" onClick={refresh}>↻ Refresh</button>
          <span style={{fontSize:"0.8rem",color:"var(--text-muted)",marginLeft:"auto"}}>{filtered.length} posts</span>
        </div>
        <div className="posts-list">
          {filtered.length === 0 ? (
            <div className="empty-state"><span className="empty-icon">📭</span><p>No posts found</p></div>
          ) : (
            filtered.slice().reverse().map((p, i) => (
              <div key={p.id} className="post-item" style={{animationDelay:`${i*50}ms`}}>
                <div className={`post-indicator ${p.status}`} />
                <div className="post-body">
                  <div className="post-text">{p.content}</div>
                  <div className="post-meta">
                    <span className={`post-status status-${p.status}`}>{p.status}</span>
                    {p.platforms?.map((pl) => <span key={pl} className={`tag tag-${pl}`}>{pl}</span>)}
                    {p.scheduledAt && <span className="meta-item">📅 {new Date(p.scheduledAt).toLocaleString()}</span>}
                    <span className="meta-item">🕐 {new Date(p.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                <div className="post-actions">
                  {(p.status === "pending" || p.status === "draft") && (
                    <button className="btn btn-danger btn-sm" onClick={() => handleCancel(p.id)}>Cancel</button>
                  )}
                  {p.status === "pending" && (
                    <button className="btn btn-success btn-sm" onClick={() => handlePublish(p.id)}>Publish</button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

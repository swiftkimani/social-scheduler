"use client"

import { useState, useEffect, useCallback } from "react"

function PostCard({ post, index, onPublish, onCancel }) {
  const isPending = post.status === "pending" || post.status === "draft"
  
  return (
    <div className="post-item" style={{ 
      animationDelay: `${index * 50}ms`,
      padding: "1.5rem",
      flexDirection: "column",
      gap: "1.25rem",
      background: "rgba(14, 18, 36, 0.4)",
      border: "1px solid rgba(148, 163, 184, 0.08)",
      position: "relative",
      overflow: "hidden"
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, width: "3px", height: "100%",
        background: post.status === "published" ? "var(--green)" : 
                   post.status === "pending" ? "var(--accent)" : 
                   post.status === "cancelled" ? "var(--red)" : "var(--text-muted)"
      }} />

      <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start"}}>
        <div style={{display:"flex", gap:"0.75rem", alignItems:"center"}}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "rgba(99, 102, 241, 0.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.9rem", color: "var(--accent)", border: "1px solid rgba(99, 102, 241, 0.15)"
          }}>
            {({twitter:"𝕏",linkedin:"in",facebook:"f",instagram:"📷",threads:"◎"})[post.platforms?.[0]] || "🌐"}
          </div>
          <div>
            <div style={{fontSize:"0.85rem", fontWeight:700, color:"var(--text)"}}>
              {post.platforms?.join(" & ")}
            </div>
            <div style={{fontSize:"0.7rem", color:"var(--text-muted)"}}>
              {post.scheduledAt ? `Scheduled for ${new Date(post.scheduledAt).toLocaleString()}` : `Created ${new Date(post.createdAt).toLocaleDateString()}`}
            </div>
          </div>
        </div>
        <span className={`post-status status-${post.status}`} style={{fontSize:"0.6rem"}}>
          {post.status}
        </span>
      </div>

      <div style={{
        fontSize: "1.05rem",
        lineHeight: 1.6,
        color: "var(--text)",
        whiteSpace: "pre-wrap",
        fontWeight: 400
      }}>
        {post.content}
      </div>

      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        paddingTop: "1.25rem", borderTop: "1px solid rgba(148, 163, 184, 0.06)"
      }}>
        <div style={{display:"flex", gap:"1.25rem", color:"var(--text-muted)", fontSize:"0.8rem"}}>
          <span>💬 {post.status === "published" ? "8" : "—"}</span>
          <span>🔄 {post.status === "published" ? "17" : "—"}</span>
          <span>❤️ {post.status === "published" ? "99" : "—"}</span>
          <span>📊 {post.status === "published" ? "212" : "—"}</span>
        </div>
        
        <div className="post-actions">
          {isPending && (
            <button className="btn btn-ghost btn-sm" onClick={() => onCancel(post.id)} style={{color:"var(--red)", background:"rgba(239, 68, 68, 0.05)"}}>
              Cancel
            </button>
          )}
          {post.status === "pending" && (
            <button className="btn btn-success btn-sm" onClick={() => onPublish(post.id)}>
              Publish Now
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

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
  const stats = {
    total: posts.length,
    pending: posts.filter(p => p.status === "pending").length,
    published: posts.filter(p => p.status === "published").length
  }

  return (
    <div style={{maxWidth: 800, margin: "0 auto"}}>
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>{t.type === "success" ? "✓" : "✕"} {t.msg}</div>
        ))}
      </div>

      <div className="app-topbar">
        <div>
          <h1 style={{fontSize:"1.75rem", fontWeight:800, letterSpacing:"-0.03em"}}>Post Timeline</h1>
          <p style={{color:"var(--text-secondary)", fontSize:"0.9rem"}}>Review and manage your multi-platform presence</p>
        </div>
      </div>

      {/* Stats Summary Area */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2rem"
      }}>
        {[
          { label: "Queued", value: stats.pending, color: "var(--accent)" },
          { label: "Live", value: stats.published, color: "var(--green)" },
          { label: "Total", value: stats.total, color: "var(--text)" }
        ].map(s => (
          <div key={s.label} className="glass card" style={{padding:"1rem", textAlign:"center", border:"1px solid rgba(148,163,184,0.06)"}}>
            <div style={{fontSize:"1.25rem", fontWeight:800, color:s.color}}>{s.value}</div>
            <div style={{fontSize:"0.65rem", fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.05em"}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Premium Filter & Refresh Bar */}
      <div style={{
        display:"flex", justifyContent:"space-between", alignItems:"center",
        marginBottom:"1.5rem", padding:"0.5rem", borderRadius:12,
        background: "rgba(14, 18, 36, 0.5)", border: "1px solid rgba(148, 163, 184, 0.08)"
      }}>
        <div style={{display:"flex", gap:"0.25rem"}}>
          {["", "pending", "published", "cancelled", "draft"].map(f => (
            <button 
              key={f} 
              onClick={() => setFilter(f)}
              style={{
                padding: "0.5rem 0.875rem", borderRadius: 8, fontSize: "0.8rem", fontWeight: 600,
                background: filter === f ? "rgba(99, 102, 241, 0.1)" : "transparent",
                color: filter === f ? "var(--accent)" : "var(--text-muted)",
                border: "none", cursor: "pointer", transition: "all 0.2s"
              }}
            >
              {f === "" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <button 
          className="btn btn-ghost" 
          onClick={refresh}
          style={{padding: "0.5rem", borderRadius: 8, minWidth: 40}}
        >
          <span style={{fontSize:"1.1rem"}}>↻</span>
        </button>
      </div>

      <div className="posts-list" style={{gap: "1.25rem"}}>
        {filtered.length === 0 ? (
          <div className="glass card" style={{textAlign:"center", padding:"4rem", color:"var(--text-muted)"}}>
            <div style={{fontSize:"3rem", marginBottom:"1rem"}}>📭</div>
            <p style={{fontSize:"1rem", fontWeight:500}}>No posts found in this category</p>
            <button className="btn btn-primary btn-sm" style={{marginTop:"1.5rem"}} onClick={() => setFilter("")}>View All Posts</button>
          </div>
        ) : (
          filtered.slice().reverse().map((p, i) => (
            <PostCard key={p.id} post={p} index={i} onPublish={handlePublish} onCancel={handleCancel} />
          ))
        )}
      </div>
    </div>
  )
}

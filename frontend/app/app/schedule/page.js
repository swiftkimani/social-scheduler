"use client"

import { useState, useRef, useEffect, useCallback } from "react"

function PostItem({ post, index, onPublish, onCancel }) {
  return (
    <div className="post-item" style={{ animationDelay: `${index * 50}ms` }}>
      <div className={`post-indicator ${post.status}`} />
      <div className="post-body">
        <div className="post-text">{post.content}</div>
        <div className="post-meta">
          <span className={`post-status status-${post.status}`}>{post.status}</span>
          {post.platforms?.map((p) => <span key={p} className={`tag tag-${p}`}>{p}</span>)}
          {post.scheduledAt && <span className="meta-item">📅 {new Date(post.scheduledAt).toLocaleString()}</span>}
        </div>
      </div>
      <div className="post-actions">
        {(post.status === "pending" || post.status === "draft") &&
          <button className="btn btn-danger btn-sm" onClick={() => onCancel(post.id)}>Cancel</button>}
        {post.status === "pending" &&
          <button className="btn btn-success btn-sm" onClick={() => onPublish(post.id)}>Publish</button>}
      </div>
    </div>
  )
}

export default function ContentStudio() {
  const [posts, setPosts] = useState([])
  const [filter, setFilter] = useState("")
  const [charCount, setCharCount] = useState(0)
  const [toasts, setToasts] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [platforms, setPlatforms] = useState({ twitter: true, linkedin: false })
  const [topic, setTopic] = useState("")
  const [tone, setTone] = useState("casual")
  const [aiVariations, setAiVariations] = useState([])
  const [aiLoading, setAiLoading] = useState(false)
  const [aiScore, setAiScore] = useState(null)
  const [predictedEngagement, setPredictedEngagement] = useState(null)
  const formRef = useRef(null)
  const contentRef = useRef(null)
  const [bestTimes, setBestTimes] = useState([])
  const [connectedPlatforms, setConnectedPlatforms] = useState({})

  const addToast = useCallback((msg, type) => {
    const id = Date.now()
    setToasts((p) => [...p, { id, msg, type }])
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500)
  }, [])

  const refreshPosts = useCallback(async () => {
    try { const r = await fetch("/api/posts"); if (r.ok) setPosts(await r.json()) } catch {}
  }, [])

  const refreshAccounts = useCallback(async () => {
    try {
      const r = await fetch("http://localhost:8080/api/accounts")
      if (r.ok) {
        const accts = await r.json()
        const map = {}
        accts.forEach(a => { if (a.status === "connected") map[a.platform] = true })
        setConnectedPlatforms(map)
      }
    } catch {}
  }, [])

  useEffect(() => {
    refreshPosts()
    refreshAccounts()
    fetch("http://localhost:8080/api/nexus/predict").then(r=>r.json()).then(d => setBestTimes(d.bestTimes || [])).catch(()=>{})
  }, [refreshPosts, refreshAccounts])

  async function generateAI() {
    if (!topic.trim()) return
    setAiLoading(true)
    try {
      const r = await fetch("http://localhost:8080/api/nexus/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim(), tone, platform: Object.entries(platforms).filter(([,v])=>v).map(([k])=>k)[0] || "twitter" }),
      })
      const d = await r.json()
      setAiVariations(d.variations || [])
      setAiScore(d.brandScore)
      setPredictedEngagement(d.predictedEngagement)
    } catch { setAiVariations([`${topic} — here's what you need to know 🧵`, `Thoughts on ${topic} 👇`, `${topic} is evolving fast. Here's why.`]) }
    finally { setAiLoading(false) }
  }

  function useVariation(text) {
    if (contentRef.current) { contentRef.current.value = text; setCharCount(text.length) }
    setAiVariations([])
  }

  async function handleSchedule(formData) {
    const content = formData.get("content")
    const selected = Object.entries(platforms).filter(([,v])=>v).map(([k])=>k)
    if (!content || selected.length === 0) { addToast("Content + platform required", "error"); return }
    setSubmitting(true)
    try {
      const r = await fetch("http://localhost:8080/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, platforms: selected, scheduledAt: formData.get("scheduledAt") || null }),
      })
      if (r.ok) { formRef.current?.reset(); setCharCount(0); setAiVariations([]); await refreshPosts(); addToast("Scheduled!", "success") }
      else addToast("Failed", "error")
    } catch { addToast("Error", "error") }
    finally { setSubmitting(false) }
  }

  async function handlePublish(id) {
    const r = await fetch(`http://localhost:8080/api/posts/${id}/publish`, { method: "POST" })
    if (r.ok) { addToast("Published!", "success"); await refreshPosts() } else addToast("Failed", "error")
  }
  async function handleCancel(id) {
    const r = await fetch(`http://localhost:8080/api/posts/${id}/cancel`, { method: "POST" })
    if (r.ok) { addToast("Cancelled", "success"); await refreshPosts() } else addToast("Failed", "error")
  }

  const filtered = filter ? posts.filter(p => p.status === filter) : posts
  const charClass = charCount > 280 ? "danger" : charCount > 200 ? "warning" : ""

  return (
    <div>
      <div className="toast-container">{toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`} onClick={() => setToasts(p => p.filter(x => x.id !== t.id))}>{t.type === "success" ? "✓" : "✕"} {t.msg}</div>
      ))}</div>
      <div className="app-topbar"><div><h1>Content Studio</h1><p>Create and schedule AI-powered posts</p></div></div>
      <div className="dashboard-grid">
        <div>
          <div className="glass card" style={{marginBottom:"1.5rem"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1.25rem"}}>
              <div style={{display:"flex",alignItems:"center",gap:"0.625rem"}}>
                <span>✎</span><h2 style={{fontSize:"1rem",fontWeight:700}}>New Post</h2>
              </div>
            </div>

            {/* AI Generator */}
            <div style={{background:"rgba(99,102,241,0.03)",borderRadius:12,padding:"1rem",marginBottom:"1.25rem"}}>
              <div style={{display:"flex",gap:"0.75rem",marginBottom:"0.75rem",alignItems:"end"}}>
                <div style={{flex:1}}>
                  <label style={{fontSize:"0.7rem",fontWeight:600,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.05em",display:"block",marginBottom:"0.25rem"}}>✨ AI Generate</label>
                  <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="Enter a topic..." style={{width:"100%"}} onKeyDown={e => e.key === "Enter" && generateAI()} />
                </div>
                <select value={tone} onChange={e => setTone(e.target.value)} style={{width:"auto",minWidth:120}}>
                  <option value="casual">Casual</option>
                  <option value="professional">Professional</option>
                  <option value="humorous">Humorous</option>
                  <option value="inspirational">Inspirational</option>
                </select>
                <button className="btn btn-primary btn-sm" onClick={generateAI} disabled={aiLoading || !topic.trim()}>{aiLoading ? "..." : "Generate"}</button>
              </div>
              {aiVariations.length > 0 && (
                <div>
                  {aiScore && <div style={{display:"flex",gap:"1rem",marginBottom:"0.75rem",fontSize:"0.75rem"}}>
                    <span style={{color:"#a5b4fc"}}>Brand Score: {aiScore}%</span>
                    {predictedEngagement && <span style={{color:"#6ee7b7"}}>Predicted: {predictedEngagement.medium} eng.</span>}
                  </div>}
                  {aiVariations.map((v,i) => (
                    <div key={i} className="ai-variation" onClick={() => useVariation(v)} style={{
                      padding:"0.625rem 0.875rem", borderRadius:8, border:"1px solid rgba(99,102,241,0.08)",
                      background:"rgba(6,8,15,0.3)", marginBottom:"0.375rem", fontSize:"0.8rem",
                      cursor:"pointer", transition:"all 0.15s", lineHeight:1.4,
                    }}>{v}</div>
                  ))}
                </div>
              )}
            </div>

            <form action={handleSchedule} ref={formRef}>
              <div className="form-group">
                <label>Content</label>
                <textarea ref={contentRef} name="content" placeholder="What do you want to share?" maxLength={3000} rows={3} onChange={e => setCharCount(e.target.value.length)} />
                <div className={`char-count ${charClass}`}>{charCount} / 3000</div>
              </div>
              <div className="form-group">
                <label>Platforms</label>
                <div className="platform-toggles">
                  {["twitter","linkedin"].map(p => {
                    const connected = connectedPlatforms[p]
                    return (
                      <div key={p} className={`platform-toggle ${platforms[p]?"active":""}`} onClick={() => setPlatforms(prev => ({...prev, [p]:!prev[p]}))} style={{position:"relative"}}>
                        <input type="checkbox" checked={platforms[p]} readOnly />
                        <span style={{
                          width: 6, height: 6, borderRadius: "50%",
                          background: connected ? "#10b981" : "#5a6380",
                          display: "inline-block", marginRight: "0.25rem",
                          boxShadow: connected ? "0 0 6px rgba(16,185,129,0.6)" : "none",
                          transition: "all 0.3s",
                        }} />
                        {p === "twitter" ? "𝕏 Twitter" : "in LinkedIn"}
                      </div>
                    )
                  })}
                </div>
                <div style={{fontSize:"0.7rem",color:"var(--text-muted)",marginTop:"0.375rem",display:"flex",gap:"0.75rem"}}>
                  {["twitter","linkedin"].map(p => (
                    <span key={p} style={{display:"flex",alignItems:"center",gap:"0.25rem"}}>
                      <span style={{
                        width: 5, height: 5, borderRadius: "50%",
                        background: connectedPlatforms[p] ? "#10b981" : "#5a6380",
                        display: "inline-block",
                      }} />
                      {connectedPlatforms[p] ? `${p === "twitter" ? "X" : "LinkedIn"} connected` : `${p === "twitter" ? "X" : "LinkedIn"} not connected`}
                    </span>
                  ))}
                  <a href="/app/settings" style={{color:"#a5b4fc",textDecoration:"none",marginLeft:"auto"}}>
                    {Object.keys(connectedPlatforms).length === 0 ? "Connect accounts →" : ""}
                  </a>
                </div>
              </div>
              <div className="form-group"><label>Schedule</label><input type="datetime-local" name="scheduledAt" /></div>
              <button type="submit" disabled={submitting} className="btn btn-primary">{submitting ? "..." : "Schedule Post"}</button>
            </form>
          </div>

          <div className="glass card">
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1rem"}}>
              <div style={{display:"flex",alignItems:"center",gap:"0.75rem"}}>
                <span>☰</span><h2 style={{fontSize:"1rem",fontWeight:700}}>Posts</h2>
                <span style={{fontSize:"0.75rem",color:"var(--text-muted)",background:"rgba(148,163,184,0.06)",padding:"0.125rem 0.5rem",borderRadius:999}}>{posts.length}</span>
              </div>
              <div style={{display:"flex",gap:"0.5rem"}}>
                <select value={filter} onChange={e => setFilter(e.target.value)}>
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
              {filtered.length === 0 ? (
                <div className="empty-state" style={{textAlign:"center",padding:"2rem",color:"var(--text-muted)",fontSize:"0.85rem"}}>📭 No posts yet</div>
              ) : (
                filtered.slice().reverse().map((p,i) => (
                  <PostItem key={p.id} post={p} index={i} onPublish={handlePublish} onCancel={handleCancel} />
                ))
              )}
            </div>
          </div>
        </div>

        <div>
          {/* AI Copilot Panel */}
          <div className="glass card" style={{marginBottom:"1.5rem"}}>
            <h3 style={{fontSize:"0.9rem",fontWeight:700,marginBottom:"0.75rem",display:"flex",alignItems:"center",gap:"0.5rem"}}>
              <span>🤖</span> AI Copilot
            </h3>
            <div className="ai-section cyan">
              <p style={{fontSize:"0.8rem",color:"var(--text-secondary)",lineHeight:1.6}}>
                <strong style={{color:"#67e8f9"}}>Best Times</strong><br />
                {bestTimes.length > 0 ? bestTimes.join(", ") : "Loading..."}
              </p>
            </div>
            <div className="ai-section purple" style={{marginTop:"0.75rem"}}>
              <p style={{fontSize:"0.8rem",color:"var(--text-secondary)",lineHeight:1.6}}>
                <strong style={{color:"#a5b4fc"}}>Tip</strong><br />
                Posts with visuals get 3x more engagement. Try the Visual Studio module for AI-generated images.
              </p>
            </div>
            <div style={{marginTop:"0.75rem"}}>
              <p style={{fontSize:"0.8rem",color:"var(--text-secondary)",lineHeight:1.6}}>
                <strong style={{color:"#f9a8d4"}}>Platform Limits</strong><br />
                Twitter: 280 chars · LinkedIn: 3,000 chars
              </p>
            </div>
            <div className="ai-section green" style={{marginTop:"0.75rem"}}>
              <p style={{fontSize:"0.8rem",color:"var(--text-secondary)",lineHeight:1.6}}>
                <strong style={{color:"#6ee7b7"}}>Account Status</strong><br />
                {Object.keys(connectedPlatforms).length === 0 ? (
                  <a href="/app/settings" style={{color:"#fcd34d",textDecoration:"none"}}>No accounts connected → Connect in Account Hub</a>
                ) : (
                  Object.entries(connectedPlatforms).map(([p, connected]) => (
                    <span key={p} style={{display:"flex",alignItems:"center",gap:"0.375rem",marginTop:"0.25rem"}}>
                      <span style={{
                        width: 6, height: 6, borderRadius: "50%",
                        background: connected ? "#10b981" : "#5a6380",
                        display: "inline-block",
                      }} />
                      {p === "twitter" ? "X / Twitter" : "LinkedIn"}: {connected ? "Connected — posts will publish live" : "Not connected"}
                    </span>
                  ))
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

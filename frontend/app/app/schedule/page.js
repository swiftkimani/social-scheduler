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
  const [summaryText, setSummaryText] = useState("")
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summaryResult, setSummaryResult] = useState(null)

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

  async function handleSummarize() {
    const text = contentRef.current?.value
    if (!text || text.length < 10) { addToast("Write at least 10 characters to summarize", "error"); return }
    setSummaryLoading(true)
    try {
      const r = await fetch("http://localhost:8080/api/nexus/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: text.slice(0, 100), context: text.slice(0, 500) }),
      })
      if (r.ok) {
        const d = await r.json()
        setSummaryResult(d)
      } else { addToast("Summary failed", "error") }
    } catch { addToast("Error generating summary", "error") }
    setSummaryLoading(false)
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
  const charMax = 3000
  const charPct = Math.min((charCount / charMax) * 100, 100)
  const charClass = charCount > 280 ? charCount > 2600 ? "danger" : "warn" : ""
  const pendingAuto = posts.filter(p => p.status === "pending" && p.scheduledAt).length

  return (
    <div>
      <div className="toast-container">{toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`} onClick={() => setToasts(p => p.filter(x => x.id !== t.id))}>{t.type === "success" ? "✓" : "✕"} {t.msg}</div>
      ))}</div>
      <div className="app-topbar">
        <div>
          <div style={{display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:"0.25rem"}}>
            <h1 style={{fontSize:"1.35rem",fontWeight:800,letterSpacing:"-0.02em"}}>Content Studio</h1>
            {pendingAuto > 0 && (
              <span style={{
                display:"inline-flex",alignItems:"center",gap:"0.25rem",
                padding:"0.15rem 0.5rem", borderRadius:999,
                background:"rgba(16,185,129,0.08)", border:"1px solid rgba(16,185,129,0.1)",
                fontSize:"0.65rem", fontWeight:600, color:"#6ee7b7",
              }}>
                <span style={{width:4,height:4,borderRadius:"50%",background:"#10b981",display:"inline-block",animation:"pulse 2s infinite"}} />
                {pendingAuto} auto-publish queued
              </span>
            )}
          </div>
          <p style={{color:"var(--text-secondary)",fontSize:"0.85rem"}}>Create and schedule AI-powered posts</p>
        </div>
      </div>
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
                <button className="btn btn-primary btn-sm" onClick={generateAI} disabled={aiLoading || !topic.trim()}>
                  {aiLoading ? <span style={{display:"inline-flex",gap:"0.25rem"}}><span className="spinner" /> Generating</span> : "Generate"}
                </button>
              </div>
              {aiVariations.length > 0 && (
                <div>
                  {aiScore && <div style={{display:"flex",gap:"1rem",marginBottom:"0.75rem",fontSize:"0.75rem"}}>
                    <span style={{
                      display:"inline-flex",alignItems:"center",gap:"0.375rem",
                      padding:"0.2rem 0.5rem", borderRadius:999, background:"rgba(99,102,241,0.06)",
                      color:"#a5b4fc", fontWeight:600,
                    }}>Brand Score: {aiScore}%</span>
                    {predictedEngagement && <span style={{
                      display:"inline-flex",alignItems:"center",gap:"0.375rem",
                      padding:"0.2rem 0.5rem", borderRadius:999, background:"rgba(16,185,129,0.06)",
                      color:"#6ee7b7", fontWeight:600,
                    }}>~{predictedEngagement.medium} eng.</span>}
                  </div>}
                  {aiVariations.map((v,i) => (
                    <div key={i} className="ai-variation" onClick={() => useVariation(v)} style={{
                      padding:"0.625rem 0.875rem", borderRadius:8, border:"1px solid rgba(99,102,241,0.08)",
                      background:"rgba(6,8,15,0.3)", marginBottom:"0.375rem", fontSize:"0.8rem",
                      cursor:"pointer", transition:"all 0.15s", lineHeight:1.4,
                      whiteSpace:"pre-wrap",
                    }}>{v}</div>
                  ))}
                </div>
              )}
            </div>

            <form action={handleSchedule} ref={formRef}>
              <div className="form-group">
                <label>Content</label>
                <div className="textarea-wrap">
                  <textarea ref={contentRef} name="content" placeholder="What do you want to share? Write a post, paste a URL, or generate with AI above..." maxLength={charMax} rows={4} onChange={e => setCharCount(e.target.value.length)} />
                  <div className="char-progress"><div className={`fill ${charClass}`} style={{width:`${charPct}%`}} /></div>
                  <div className="char-count-abs">{charCount}/{charMax}</div>
                </div>
              </div>
              <div style={{display:"flex",gap:"0.5rem",marginTop:"-0.5rem",marginBottom:"1rem"}}>
                <button type="button" className="btn btn-ghost btn-sm" onClick={handleSummarize} disabled={summaryLoading || !contentRef.current?.value} style={{fontSize:"0.7rem"}}>
                  {summaryLoading ? "..." : "📝 AI Summarize"}
                </button>
              </div>
              {summaryResult && (
                <div style={{
                  padding:"0.75rem 1rem", borderRadius:"var(--radius-sm)", marginBottom:"1rem",
                  background:"rgba(99,102,241,0.03)", border:"1px solid rgba(99,102,241,0.08)",
                }}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.5rem"}}>
                    <span style={{fontSize:"0.7rem",fontWeight:600,color:"#a5b4fc"}}>AI Summary</span>
                    <span style={{fontSize:"0.65rem",color:"var(--text-muted)"}}>confidence: {summaryResult.confidence}%</span>
                  </div>
                  <p style={{fontSize:"0.8rem",color:"var(--text-secondary)",lineHeight:1.6,whiteSpace:"pre-wrap"}}>{summaryResult.summary}</p>
                  {summaryResult.keyPoints && (
                    <ul style={{marginTop:"0.5rem",paddingLeft:"1rem",fontSize:"0.75rem",color:"var(--text-muted)",lineHeight:1.8}}>
                      {summaryResult.keyPoints.map((k,i) => <li key={i}>{k}</li>)}
                    </ul>
                  )}
                </div>
              )}
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
              <div className="form-group"><label>Schedule (optional — leave blank for draft)</label><input type="datetime-local" name="scheduledAt" /></div>
              <button type="submit" disabled={submitting} className="btn btn-primary" style={{width:"100%"}}>
                {submitting ? "Scheduling..." : "Schedule Post"}
              </button>
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
                Posts with visuals get 3x more engagement. Try the AI Summarize button below your content box for instant insights.
              </p>
            </div>
            <div style={{marginTop:"0.75rem"}}>
              <p style={{fontSize:"0.8rem",color:"var(--text-secondary)",lineHeight:1.6}}>
                <strong style={{color:"#f9a8d4"}}>Auto-Publish</strong><br />
                Scheduled posts are auto-published every 30 seconds when their time arrives. No manual action needed.
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
                      <span style={{width:6,height:6,borderRadius:"50%",background:connected?"#10b981":"#5a6380",display:"inline-block"}} />
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
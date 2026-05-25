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

function LivePreview({ content, platforms }) {
  const selected = Object.entries(platforms).filter(([,v])=>v).map(([k])=>k);
  const mainPlatform = selected[0] || "twitter";
  
  return (
    <div className="glass card" style={{position:"sticky", top:"2rem", border:"1px solid rgba(99,102,241,0.15)"}}>
      <div style={{display:"flex", alignItems:"center", gap:"0.5rem", marginBottom:"1.25rem"}}>
        <span style={{fontSize:"1.1rem"}}>👁️</span>
        <h2 style={{fontSize:"0.9rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em"}}>Live Preview</h2>
        <div style={{marginLeft:"auto", display:"flex", gap:"0.25rem"}}>
          {selected.map(p => (
            <span key={p} className={`tag tag-${p}`} style={{fontSize:"0.55rem", padding:"0.1rem 0.4rem"}}>{p}</span>
          ))}
        </div>
      </div>
      
      <div style={{
        background: "rgba(6,8,15,0.4)",
        borderRadius: 12,
        padding: "1.25rem",
        border: "1px solid rgba(148,163,184,0.08)",
        minHeight: "150px"
      }}>
        <div style={{display:"flex", gap:"0.75rem", marginBottom:"1rem"}}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%",
            background: "linear-gradient(135deg, var(--accent), var(--pink))",
            display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, color:"#fff", fontSize:"0.8rem"
          }}>N</div>
          <div>
            <div style={{fontWeight:700, fontSize:"0.85rem", color:"var(--text)"}}>Nexus AI</div>
            <div style={{fontSize:"0.75rem", color:"var(--text-muted)"}}>@nexus_studio · Just now</div>
          </div>
        </div>
        <div style={{
          fontSize: "0.95rem", 
          lineHeight: 1.6, 
          color: "var(--text)", 
          whiteSpace: "pre-wrap",
          marginBottom: "1rem"
        }}>
          {content || <span style={{color:"var(--text-muted)", fontStyle:"italic"}}>Your content will appear here...</span>}
        </div>
        <div style={{
          display:"flex", justifyContent:"space-between", 
          paddingTop:"0.75rem", borderTop:"1px solid rgba(148,163,184,0.06)",
          color:"var(--text-muted)", fontSize:"0.8rem"
        }}>
          <span>💬 0</span>
          <span>🔄 0</span>
          <span>❤️ 0</span>
          <span>📊 0</span>
        </div>
      </div>
      
      <div style={{marginTop:"1.5rem", padding:"1rem", background:"rgba(99,102,241,0.03)", borderRadius:10, border:"1px solid rgba(99,102,241,0.08)"}}>
        <div style={{fontSize:"0.7rem", fontWeight:700, color:"#a5b4fc", textTransform:"uppercase", marginBottom:"0.5rem"}}>Optimization Check</div>
        <div style={{display:"flex", flexDirection:"column", gap:"0.5rem"}}>
          <div style={{display:"flex", justifyContent:"space-between", fontSize:"0.75rem"}}>
            <span>Readability</span>
            <span style={{color:"#6ee7b7"}}>High</span>
          </div>
          <div style={{display:"flex", justifyContent:"space-between", fontSize:"0.75rem"}}>
            <span>Hashtag Density</span>
            <span style={{color:"#fcd34d"}}>Optimal</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ContentStudio() {
  const [posts, setPosts] = useState([])
  const [filter, setFilter] = useState("")
  const [content, setContent] = useState("")
  const [charCount, setCharCount] = useState(0)
  const [toasts, setToasts] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [platforms, setPlatforms] = useState({ twitter: true, linkedin: false, facebook: false, instagram: false, threads: false })
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
      const r = await fetch("/api/accounts")
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
    fetch("/api/nexus/predict").then(r=>r.json()).then(d => setBestTimes(d.bestTimes || [])).catch(()=>{})
  }, [refreshPosts, refreshAccounts])

  async function generateAI() {
    if (!topic.trim()) return
    setAiLoading(true)
    try {
      const r = await fetch("/api/nexus/generate", {
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
      const r = await fetch("/api/nexus/summarize", {
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
    if (contentRef.current) { 
      contentRef.current.value = text; 
      setContent(text);
      setCharCount(text.length); 
    }
    setAiVariations([])
  }

  async function handleSchedule(formData) {
    const content = formData.get("content")
    const selected = Object.entries(platforms).filter(([,v])=>v).map(([k])=>k)
    if (!content || selected.length === 0) { addToast("Content + platform required", "error"); return }
    setSubmitting(true)
    try {
      const r = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, platforms: selected, scheduledAt: formData.get("scheduledAt") || null }),
      })
      if (r.ok) { 
        formRef.current?.reset(); 
        setContent("");
        setCharCount(0); 
        setAiVariations([]); 
        await refreshPosts(); 
        addToast("Scheduled!", "success") 
      }
      else addToast("Failed", "error")
    } catch { addToast("Error", "error") }
    finally { setSubmitting(false) }
  }

  async function handlePublish(id) {
    const r = await fetch(`/api/posts/${id}/publish`, { method: "POST" })
    if (r.ok) { addToast("Published!", "success"); await refreshPosts() } else addToast("Failed", "error")
  }
  async function handleCancel(id) {
    const r = await fetch(`/api/posts/${id}/cancel`, { method: "POST" })
    if (r.ok) { addToast("Cancelled", "success"); await refreshPosts() } else addToast("Failed", "error")
  }

  const filtered = filter ? posts.filter(p => p.status === filter) : posts
  const charMax = 3000
  const charPct = Math.min((charCount / charMax) * 100, 100)
  const charClass = charCount > 280 ? charCount > 2600 ? "danger" : "warn" : ""
  const pendingAuto = posts.filter(p => p.status === "pending" && p.scheduledAt).length

  return (
    <div style={{maxWidth:1200, margin:"0 auto"}}>
      <div className="toast-container">{toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`} onClick={() => setToasts(p => p.filter(x => x.id !== t.id))}>{t.type === "success" ? "✓" : "✕"} {t.msg}</div>
      ))}</div>
      
      <div className="app-topbar">
        <div>
          <div style={{display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:"0.25rem"}}>
            <h1 style={{fontSize:"1.5rem",fontWeight:800,letterSpacing:"-0.03em"}}>Content Studio</h1>
            {pendingAuto > 0 && (
              <span style={{
                display:"inline-flex",alignItems:"center",gap:"0.375rem",
                padding:"0.25rem 0.625rem", borderRadius:999,
                background:"rgba(16,185,129,0.08)", border:"1px solid rgba(16,185,129,0.1)",
                fontSize:"0.65rem", fontWeight:600, color:"#6ee7b7",
              }}>
                <span style={{width:5,height:5,borderRadius:"50%",background:"#10b981",display:"inline-block",animation:"pulse 2s infinite"}} />
                {pendingAuto} queued
              </span>
            )}
          </div>
          <p style={{color:"var(--text-secondary)",fontSize:"0.85rem"}}>Compose and optimize your social strategy with AI</p>
        </div>
      </div>

      <div className="dashboard-grid" style={{gridTemplateColumns:"1fr 380px"}}>
        {/* Left Column: Editor & AI Tools */}
        <div style={{display:"flex", flexDirection:"column", gap:"1.5rem"}}>
          
          {/* Enhanced AI Generator */}
          <div className="glass card" style={{padding:"1.25rem", border:"1px solid rgba(99,102,241,0.2)"}}>
            <div style={{display:"flex", alignItems:"center", gap:"0.5rem", marginBottom:"1.25rem"}}>
              <span style={{color:"#a5b4fc", fontSize:"1.2rem"}}>✨</span>
              <h2 style={{fontSize:"0.95rem", fontWeight:700}}>AI Intelligence</h2>
              <span style={{marginLeft:"auto", fontSize:"0.65rem", fontWeight:600, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.05em"}}>Powered by Nexus Engine</span>
            </div>

            <div style={{
              background: "rgba(99,102,241,0.04)",
              borderRadius: 14,
              padding: "1rem",
              border: "1px solid rgba(99,102,241,0.1)"
            }}>
              <div style={{display:"flex", gap:"0.75rem", alignItems:"stretch"}}>
                <div style={{flex:1, position:"relative"}}>
                  <input 
                    value={topic} 
                    onChange={e => setTopic(e.target.value)} 
                    placeholder="Describe your topic or idea..." 
                    style={{
                      width:"100%", height:"100%", padding:"0.75rem 1rem", 
                      borderRadius:10, background:"rgba(6,8,15,0.6)",
                      border:"1px solid rgba(148,163,184,0.1)", color:"var(--text)"
                    }} 
                    onKeyDown={e => e.key === "Enter" && generateAI()} 
                  />
                </div>
                <div style={{display:"flex", gap:"0.5rem"}}>
                  <select 
                    value={tone} 
                    onChange={e => setTone(e.target.value)} 
                    style={{
                      width:"auto", minWidth:130, borderRadius:10, 
                      padding:"0.75rem", background:"rgba(6,8,15,0.6)",
                      border:"1px solid rgba(148,163,184,0.1)", color:"var(--text)"
                    }}
                  >
                    <option value="casual">Casual</option>
                    <option value="professional">Professional</option>
                    <option value="humorous">Humorous</option>
                    <option value="inspirational">Inspirational</option>
                  </select>
                  <button 
                    className="btn btn-primary" 
                    onClick={generateAI} 
                    disabled={aiLoading || !topic.trim()}
                    style={{padding:"0 1.25rem", borderRadius:10}}
                  >
                    {aiLoading ? <span className="spinner" /> : "Generate"}
                  </button>
                </div>
              </div>

              {aiVariations.length > 0 && (
                <div style={{marginTop:"1.25rem", borderTop:"1px solid rgba(99,102,241,0.1)", paddingTop:"1rem"}}>
                  <div style={{display:"flex", gap:"1rem", marginBottom:"1rem"}}>
                    {aiScore && <span style={{
                      padding:"0.25rem 0.625rem", borderRadius:999, background:"rgba(99,102,241,0.08)",
                      color:"#a5b4fc", fontWeight:600, fontSize:"0.7rem"
                    }}>Brand Score: {aiScore}%</span>}
                    {predictedEngagement && <span style={{
                      padding:"0.25rem 0.625rem", borderRadius:999, background:"rgba(16,185,129,0.08)",
                      color:"#6ee7b7", fontWeight:600, fontSize:"0.7rem"
                    }}>Est. Engagement: {predictedEngagement.medium}</span>}
                  </div>
                  <div style={{display:"flex", flexDirection:"column", gap:"0.625rem"}}>
                    {aiVariations.map((v,i) => (
                      <div key={i} className="ai-variation" onClick={() => useVariation(v)} style={{
                        padding:"0.875rem 1.125rem", borderRadius:10, border:"1px solid rgba(148,163,184,0.06)",
                        background:"rgba(6,8,15,0.4)", fontSize:"0.85rem", cursor:"pointer", transition:"all 0.2s",
                        lineHeight:1.5
                      }}>
                        {v}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content Editor */}
          <div className="glass card">
            <form action={handleSchedule} ref={formRef}>
              <div className="form-group">
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.5rem"}}>
                  <label style={{margin:0}}>Post Content</label>
                  <div style={{display:"flex", gap:"0.5rem"}}>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={handleSummarize} disabled={summaryLoading || !content} style={{fontSize:"0.65rem", padding:"0.25rem 0.5rem"}}>
                      {summaryLoading ? "..." : "📝 Summarize"}
                    </button>
                  </div>
                </div>
                <div className="textarea-wrap">
                  <textarea 
                    ref={contentRef} 
                    name="content" 
                    placeholder="Start writing or choose an AI variation above..." 
                    maxLength={charMax} 
                    rows={6} 
                    value={content}
                    onChange={e => {
                      setContent(e.target.value);
                      setCharCount(e.target.value.length);
                    }} 
                    style={{fontSize:"1rem", padding:"1.125rem"}}
                  />
                  <div className="char-progress"><div className={`fill ${charClass}`} style={{width:`${charPct}%`}} /></div>
                  <div className="char-count-abs">{charCount}/{charMax}</div>
                </div>
              </div>

              {summaryResult && (
                <div style={{
                  padding:"1rem", borderRadius:12, marginBottom:"1.25rem",
                  background:"rgba(99,102,241,0.03)", border:"1px solid rgba(99,102,241,0.08)",
                  animation: "slideUp 0.3s ease-out"
                }}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.5rem"}}>
                    <span style={{fontSize:"0.7rem",fontWeight:700,color:"#a5b4fc",textTransform:"uppercase"}}>AI Summary</span>
                    <span style={{fontSize:"0.65rem",color:"var(--text-muted)"}}>{summaryResult.confidence}% confidence</span>
                  </div>
                  <p style={{fontSize:"0.85rem",color:"var(--text-secondary)",lineHeight:1.6}}>{summaryResult.summary}</p>
                </div>
              )}

              <div className="dashboard-grid-wide" style={{marginBottom:"1.5rem"}}>
                <div className="form-group" style={{margin:0}}>
                  <label>Platforms</label>
                  <div className="platform-toggles">
                    {[
                      ["twitter","𝕏"], ["linkedin","in"], ["facebook","f"],
                      ["instagram","📷"], ["threads","◎"],
                    ].map(([p, icon]) => {
                      const connected = connectedPlatforms[p]
                      return (
                        <div key={p} className={`platform-toggle ${platforms[p]?"active":""}`} onClick={() => setPlatforms(prev => ({...prev, [p]:!prev[p]}))}>
                          <input type="checkbox" checked={platforms[p]} readOnly />
                          <span style={{
                            width: 6, height: 6, borderRadius: "50%",
                            background: connected ? "#10b981" : "#5a6380",
                            marginRight: "0.25rem"
                          }} />
                          {icon}
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div className="form-group" style={{margin:0}}>
                  <label>Schedule Time</label>
                  <input type="datetime-local" name="scheduledAt" style={{padding:"0.625rem"}} />
                </div>
              </div>

              <button type="submit" disabled={submitting} className="btn btn-primary btn-lg" style={{width:"100%"}}>
                {submitting ? "Processing..." : "Schedule Post"}
              </button>
            </form>
          </div>

          {/* Quick List of Recent Posts */}
          <div className="glass card">
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1.25rem"}}>
              <div style={{display:"flex",alignItems:"center",gap:"0.625rem"}}>
                <span style={{fontSize:"1.1rem"}}>☰</span>
                <h2 style={{fontSize:"0.95rem",fontWeight:700}}>Recently Created</h2>
              </div>
              <div style={{display:"flex",gap:"0.5rem"}}>
                <select 
                  value={filter} 
                  onChange={e => setFilter(e.target.value)}
                  style={{fontSize:"0.75rem", padding:"0.25rem 0.5rem", borderRadius:6}}
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
                <button className="btn btn-ghost btn-sm" onClick={refreshPosts}>↻</button>
              </div>
            </div>
            <div className="posts-list">
              {filtered.length === 0 ? (
                <div className="empty-state" style={{padding:"2rem"}}>📭 No posts found</div>
              ) : (
                filtered.slice().reverse().slice(0, 5).map((p,i) => (
                  <PostItem key={p.id} post={p} index={i} onPublish={handlePublish} onCancel={handleCancel} />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Preview & Insights */}
        <div style={{display:"flex", flexDirection:"column", gap:"1.5rem"}}>
          
          {/* AI Insights moved above LivePreview */}
<div className="glass card">
  <h3 style={{fontSize:"0.9rem",fontWeight:700,marginBottom:"1rem",display:"flex",alignItems:"center",gap:"0.5rem"}}>
    <span>🤖</span> AI Insights
  </h3>
  <div style={{display:"flex", flexDirection:"column", gap:"1rem"}}>
    <div style={{padding:"0.875rem", borderRadius:10, background:"rgba(6,182,212,0.04)", border:"1px solid rgba(6,182,212,0.1)"}}>
      <div style={{fontSize:"0.7rem", fontWeight:700, color:"#67e8f9", textTransform:"uppercase", marginBottom:"0.375rem"}}>Best Posting Windows</div>
      <div style={{fontSize:"0.8rem", color:"var(--text-secondary)", lineHeight:1.5}}>
        {bestTimes.length > 0 ? bestTimes.join(" · ") : "Analyzing your audience..."}
      </div>
    </div>
    <div style={{padding:"0.875rem", borderRadius:10, background:"rgba(16,185,129,0.04)", border:"1px solid rgba(16,185,129,0.1)"}}>
      <div style={{fontSize:"0.7rem", fontWeight:700, color:"#6ee7b7", textTransform:"uppercase", marginBottom:"0.375rem"}}>Account Connectivity</div>
      <div style={{display:"flex", flexDirection:"column", gap:"0.375rem"}}>
        {[
          ["twitter", "X / Twitter"], ["linkedin", "LinkedIn"],
          ["facebook", "Facebook"], ["instagram", "Instagram"],
          ["threads", "Threads"]
        ].map(([p, label]) => (
          <div key={p} style={{display:"flex", alignItems:"center", gap:"0.5rem", fontSize:"0.75rem", color:"var(--text-secondary)"}}>
            <span style={{width:5, height:5, borderRadius:"50%", background:connectedPlatforms[p]?"#10b981":"#5a6380"}} />
            {label}: {connectedPlatforms[p] ? "Connected" : "Not Linked"}
          </div>
        ))}
      </div>
    </div>
    <div style={{padding:"0.875rem", borderRadius:10, background:"rgba(236,72,153,0.04)", border:"1px solid rgba(236,72,153,0.1)"}}>
      <div style={{fontSize:"0.7rem", fontWeight:700, color:"#f9a8d4", textTransform:"uppercase", marginBottom:"0.375rem"}}>Studio Tip</div>
      <p style={{fontSize:"0.8rem", color:"var(--text-secondary)", lineHeight:1.5}}>
        Posts with conversational tones perform 40% better on LinkedIn. Try switching the AI tone to 'Casual' for better results.
      </p>
    </div>
  </div>
</div>
<LivePreview content={content} platforms={platforms} />
        </div>
      </div>
    </div>
  )
}

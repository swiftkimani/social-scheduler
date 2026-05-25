"use client"

import { useState, useEffect, useCallback, useRef } from "react"

const PLATFORMS = [
  { id:"twitter", name:"X / Twitter", icon:"𝕏", color:"#1da1f2",
    gradient:"linear-gradient(135deg,#1da1f2,#0d8bd9)",
    bgGradient:"linear-gradient(135deg,rgba(29,161,242,0.08),rgba(29,161,242,0.02))",
    description:"Schedule tweets and engage in real time.", charLimit:280 },
  { id:"linkedin", name:"LinkedIn", icon:"in", color:"#0a66c2",
    gradient:"linear-gradient(135deg,#0a66c2,#004182)",
    bgGradient:"linear-gradient(135deg,rgba(10,102,194,0.08),rgba(10,102,194,0.02))",
    description:"Share professional content and grow your network.", charLimit:3000 },
  { id:"facebook", name:"Facebook", icon:"f", color:"#1877f2",
    gradient:"linear-gradient(135deg,#1877f2,#0d65d9)",
    bgGradient:"linear-gradient(135deg,rgba(24,119,242,0.08),rgba(24,119,242,0.02))",
    description:"Post to your timeline and engage your community.", charLimit:63206 },
  { id:"instagram", name:"Instagram", icon:"📷", color:"#e4405f",
    gradient:"linear-gradient(135deg,#e4405f,#c13584)",
    bgGradient:"linear-gradient(135deg,rgba(228,64,95,0.08),rgba(228,64,95,0.02))",
    description:"Share text stories and visual content.", charLimit:2200 },
  { id:"threads", name:"Threads", icon:"◎", color:"#101010",
    gradient:"linear-gradient(135deg,#333,#000)",
    bgGradient:"linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))",
    description:"Post text updates and join conversations.", charLimit:500 },
  { id:"tiktok", name:"TikTok", icon:"♪", color:"#ff0050",
    gradient:"linear-gradient(135deg,#ff0050,#00f2ea)",
    bgGradient:"linear-gradient(135deg,rgba(255,0,80,0.08),rgba(0,242,234,0.04))",
    description:"Share short-form video content.", charLimit:2200 },
  { id:"youtube", name:"YouTube", icon:"▶", color:"#ff0000",
    gradient:"linear-gradient(135deg,#ff0000,#cc0000)",
    bgGradient:"linear-gradient(135deg,rgba(255,0,0,0.08),rgba(255,0,0,0.02))",
    description:"Publish and manage video content.", charLimit:5000 },
  { id:"pinterest", name:"Pinterest", icon:"P", color:"#bd081c",
    gradient:"linear-gradient(135deg,#bd081c,#820614)",
    bgGradient:"linear-gradient(135deg,rgba(189,8,28,0.08),rgba(189,8,28,0.02))",
    description:"Pin your visual ideas and inspirations.", charLimit:500 },
  { id:"discord", name:"Discord", icon:"(·)", color:"#5865f2",
    gradient:"linear-gradient(135deg,#5865f2,#404eed)",
    bgGradient:"linear-gradient(135deg,rgba(88,101,242,0.08),rgba(88,101,242,0.02))",
    description:"Automate your community updates.", charLimit:2000 },
  { id:"slack", name:"Slack", icon:"#", color:"#4a154b",
    gradient:"linear-gradient(135deg,#4a154b,#2e0d30)",
    bgGradient:"linear-gradient(135deg,rgba(74,21,75,0.08),rgba(74,21,75,0.02))",
    description:"Push notifications to your team.", charLimit:4000 },
]

function AccountCard({ platform, authStatus, onStartAuth }) {
  const isConnected = authStatus === "authenticated"
  const isConnecting = authStatus === "in_progress"

  return (
    <div className="glass card" style={{
      padding: "1rem",
      background: platform.bgGradient,
      border: isConnected ? "1px solid rgba(16,185,129,0.2)" : "1px solid var(--border)",
      position:"relative", overflow:"hidden", transition:"all 0.3s",
      display:"flex", flexDirection:"column", justifyContent:"space-between",
      minHeight: "160px"
    }}>
      {isConnected && <div style={{
        position:"absolute", top:0, left:0, bottom:0, width:3,
        background:platform.gradient,
      }} />}
      
      <div>
        <div style={{display:"flex", alignItems:"center", gap:"0.75rem", marginBottom:"0.75rem"}}>
          <div style={{
            width:36, height:36, borderRadius:10,
            background:platform.gradient,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:platform.id==="twitter"?"1rem":platform.id==="instagram"?"1.1rem":"0.85rem",
            fontWeight:900,color:"#fff",
            boxShadow:`0 0 15px ${platform.color}33`,
            flexShrink: 0
          }}>{platform.icon}</div>
          <div style={{minWidth:0}}>
            <h3 style={{fontSize:"0.85rem",fontWeight:700, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{platform.name}</h3>
            <div style={{display:"flex",alignItems:"center",gap:"0.375rem",marginTop:"0.125rem"}}>
              <span style={{
                width:6,height:6,borderRadius:"50%",display:"inline-block",
                background:isConnected?"#10b981":isConnecting?"#fbbf24":"#64748b",
              }} />
              <span style={{
                fontSize:"0.7rem",fontWeight:600,
                color:isConnected?"#6ee7b7":isConnecting?"#fbbf24":"var(--text-muted)",
              }}>
                {isConnected ? "Live" : isConnecting ? "Wait..." : "Offline"}
              </span>
            </div>
          </div>
        </div>
        <p style={{fontSize:"0.7rem", color:"var(--text-muted)", lineHeight:1.4, marginBottom:"1rem"}}>
          {platform.description}
        </p>
      </div>

      <div style={{marginTop:"auto"}}>
        {!isConnected && !isConnecting && (
          <button
            className="btn btn-ghost btn-sm"
            style={{width:"100%", fontSize:"0.7rem", padding:"0.4rem"}}
            onClick={() => onStartAuth(platform.id)}
          >
            Connect
          </button>
        )}

        {isConnecting && (
          <div style={{
            padding:"0.5rem", borderRadius:8,
            background:"rgba(251,191,36,0.05)", border:"1px solid rgba(251,191,36,0.15)",
            textAlign:"center", display:"flex", alignItems:"center", gap:"0.5rem", justifyContent:"center"
          }}>
            <span className="spinner" style={{width:10, height:10}} />
            <span style={{fontSize:"0.65rem",color:"#fbbf24",fontWeight:600}}>Auth in browser</span>
          </div>
        )}

        {isConnected && (
          <div style={{display:"flex", gap:"0.5rem"}}>
             <div style={{
              flex:1, padding:"0.375rem",borderRadius:6,
              background:"rgba(6,8,15,0.4)",textAlign:"center",
              border: "1px solid rgba(148,163,184,0.04)"
            }}>
              <div style={{fontSize:"0.55rem",color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.04em"}}>Limit</div>
              <div style={{fontSize:"0.75rem",fontWeight:700,color:"#67e8f9"}}>{platform.charLimit}</div>
            </div>
            <button className="btn btn-ghost btn-sm" style={{padding:"0 0.5rem", minWidth:32, color:"var(--red)"}} onClick={() => onStartAuth(platform.id)}>
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const [authStatuses, setAuthStatuses] = useState({})
  const [loading, setLoading] = useState(true)
  const [toasts, setToasts] = useState([])
  const [twitterModalOpen, setTwitterModalOpen] = useState(false)
  const [twitterAuthUrl, setTwitterAuthUrl] = useState("")
  const [iframeError, setIframeError] = useState(false)
  const [verifyCode, setVerifyCode] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const iframeRef = useRef(null)

  useEffect(() => {
    if (!twitterAuthUrl || iframeError) return
    const timer = setTimeout(() => {
      try {
        const doc = iframeRef.current?.contentDocument
        if (!doc || !doc.body || doc.body.innerHTML.trim().length === 0) {
          setIframeError(true)
        }
      } catch {
        setIframeError(true)
      }
    }, 2000)
    return () => clearTimeout(timer)
  }, [twitterAuthUrl, iframeError])

  function addToast(msg, type="info") {
    const id = Date.now()
    setToasts(prev => [...prev, {id, msg, type}])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000)
  }

  const refreshStatus = useCallback(async () => {
    try {
      const r = await fetch("/api/auth/status")
      if (r.ok) setAuthStatuses(await r.json())
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => {
    refreshStatus()
    const interval = setInterval(refreshStatus, 3000)
    return () => clearInterval(interval)
  }, [refreshStatus])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("twitter") === "connected") {
      addToast("X/Twitter connected successfully!", "success")
      window.history.replaceState({}, "", window.location.pathname)
      refreshStatus()
      if (window.parent !== window) {
        window.parent.postMessage({ type: "twitter-auth", status: "connected" }, "*")
      }
    } else if (params.get("twitter") === "denied") {
      addToast("X/Twitter authorization was cancelled", "error")
      window.history.replaceState({}, "", window.location.pathname)
      if (window.parent !== window) {
        window.parent.postMessage({ type: "twitter-auth", status: "denied" }, "*")
      }
    }
  }, [])

  useEffect(() => {
    function handler(e) {
      if (e.data?.type === "twitter-auth") {
        setTwitterModalOpen(false)
        setTwitterAuthUrl("")
        setIframeError(false)
        if (e.data.status === "connected") {
          addToast("X/Twitter connected successfully!", "success")
        } else {
          addToast("X/Twitter authorization cancelled", "error")
        }
        refreshStatus()
      }
    }
    window.addEventListener("message", handler)
    return () => window.removeEventListener("message", handler)
  }, [refreshStatus])

  async function startTwitterAuth() {
    setIframeError(false)
    try {
      const r = await fetch("/api/auth/twitter/init")
      const data = await r.json()
      if (data.url) {
        localStorage.setItem("twitter_oauth_token", data.oauth_token)
        setTwitterAuthUrl(data.url)
        setTwitterModalOpen(true)
      } else {
        addToast(data.error || "Failed to start Twitter auth", "error")
      }
    } catch (e) {
      addToast("Failed to start Twitter auth: " + e.message, "error")
    }
  }

  async function handleVerifyTwitter() {
    const token = localStorage.getItem("twitter_oauth_token")
    if (!token) { addToast("No saved oauth_token — re-connect Twitter first", "error"); return }
    if (!verifyCode.trim()) { addToast("Paste the verifier code Twitter showed you", "error"); return }
    try {
      const r = await fetch("/api/auth/twitter/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oauth_token: token, oauth_verifier: verifyCode.trim() }),
      })
      const data = await r.json()
      if (data.status === "connected") {
        addToast("X/Twitter connected successfully!", "success")
        setTwitterModalOpen(false)
        setTwitterAuthUrl("")
        setVerifyCode("")
        setIframeError(false)
        localStorage.removeItem("twitter_oauth_token")
        refreshStatus()
      } else {
        addToast(data.error || "Verification failed", "error")
      }
    } catch (e) {
      addToast("Failed: " + e.message, "error")
    }
  }

  async function handleStartAuth(platformId) {
    if (platformId === "twitter") {
      startTwitterAuth()
      return
    }
    try {
      const r = await fetch(`/api/auth/${platformId}`, { method:"POST" })
      const data = await r.json()
      if (data.status === "already_authenticated") {
        addToast(`${platformId} already connected`, "info")
      } else if (data.status === "in_progress") {
        addToast(`Already connecting ${platformId}...`, "info")
      } else if (data.status === "started") {
        addToast(`Browser opened — log in to ${platformId}`, "success")
      }
      refreshStatus()
    } catch (e) {
      console.error("[AUTH] Failed:", e)
      addToast("Failed: is the backend running on port 8080?", "error")
    }
  }

  const filteredPlatforms = PLATFORMS.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const connectedCount = Object.values(authStatuses).filter(s => s === "authenticated").length

  return (
    <div style={{maxWidth: 1000, margin: "0 auto"}}>
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`} onClick={() => setToasts(p => p.filter(x => x.id !== t.id))}>
            {t.type === "success" ? "✓" : t.type === "error" ? "✕" : "i"} {t.msg}
          </div>
        ))}
      </div>
      
      <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:"2rem", gap:"1.5rem", flexWrap:"wrap"}}>
        <div>
          <h1 style={{fontSize:"1.75rem",fontWeight:800,letterSpacing:"-0.03em"}}>Account Hub</h1>
          <p style={{color:"var(--text-secondary)",fontSize:"0.9rem",marginTop:"0.25rem"}}>
            Connect and manage your social workspace
          </p>
        </div>

        <div style={{display:"flex", gap:"1rem", alignItems:"center", flex:1, minWidth:300, justifyContent:"flex-end"}}>
           <div style={{position:"relative", flex:1, maxWidth:400}}>
            <input 
              type="text" 
              placeholder="Search platforms... (⌘K)" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width:"100%", padding:"0.625rem 1rem", paddingLeft:"2.5rem", borderRadius:10,
                background:"rgba(6,8,15,0.4)", border:"1px solid var(--border)",
                color:"var(--text)", fontSize:"0.85rem", outline:"none"
              }}
            />
            <span style={{position:"absolute", left:"1rem", top:"50%", transform:"translateY(-50%)", color:"var(--text-muted)", fontSize:"0.9rem"}}>🔍</span>
          </div>

          <div style={{
            display:"flex",alignItems:"center",gap:"0.75rem",
            padding:"0.625rem 1.25rem",borderRadius:10,
            background:"rgba(16,185,129,0.06)",border:"1px solid rgba(16,185,129,0.1)",
          }}>
            <span style={{
              width:8,height:8,borderRadius:"50%",
              background:connectedCount>0?"#10b981":"#64748b",
              boxShadow:connectedCount>0?"0 0 10px rgba(16,185,129,0.4)":"none",
              animation: connectedCount > 0 ? "pulse 2s infinite" : "none"
            }} />
            <span style={{fontSize:"0.85rem",fontWeight:700,color:"#6ee7b7"}}>
              {connectedCount} / {PLATFORMS.length} Connected
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{textAlign:"center",padding:"5rem"}}>
          <span className="spinner" style={{width:32, height:32}} />
          <p style={{marginTop:"1rem", color:"var(--text-muted)"}}>Syncing account status...</p>
        </div>
      ) : (
        <div style={{
          display:"grid",
          gridTemplateColumns:"repeat(auto-fill, minmax(220px, 1fr))",
          gap:"1.25rem"
        }}>
          {filteredPlatforms.map(p => (
            <AccountCard
              key={p.id}
              platform={p}
              authStatus={authStatuses[p.id] || "not_authenticated"}
              onStartAuth={handleStartAuth}
            />
          ))}
          
          {filteredPlatforms.length === 0 && (
             <div style={{gridColumn:"1/-1", textAlign:"center", padding:"4rem", color:"var(--text-muted)"}}>
              <p>No platforms matching "{searchQuery}"</p>
              <button className="btn btn-ghost btn-sm" style={{marginTop:"1rem"}} onClick={() => setSearchQuery("")}>Clear Search</button>
            </div>
          )}
        </div>
      )}

      <div className="glass card" style={{
        marginTop:"2.5rem", padding:"1.5rem",
        background:"linear-gradient(135deg, rgba(99,102,241,0.04), rgba(236,72,153,0.02))",
        border:"1px solid rgba(99,102,241,0.08)",
        display:"flex", gap:"1.5rem", alignItems:"center"
      }}>
        <div style={{
          width:54, height:54, borderRadius:16, background:"rgba(99,102,241,0.1)",
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.5rem"
        }}>🔒</div>
        <div>
          <h3 style={{fontSize:"0.95rem",fontWeight:800,marginBottom:"0.375rem"}}>Secure Connection Protocol</h3>
          <p style={{fontSize:"0.85rem",color:"var(--text-secondary)",lineHeight:1.6, maxWidth:700}}>
            NEXUS uses platform-native authentication. X/Twitter utilizes OAuth 1.0a, while other platforms leverage localized session syncing. 
            <strong> We never store your passwords.</strong> All session data is encrypted and kept strictly within your workspace.
          </p>
        </div>
      </div>

      {twitterModalOpen && (
        <div style={{
          position:"fixed",inset:0,zIndex:9999,display:"flex",
          animation:"fadeIn 0.2s ease",
        }}>
          <div style={{
            position:"absolute",inset:0,background:"rgba(0,0,0,0.6)", backdropFilter:"blur(4px)"
          }} onClick={() => {
            setTwitterModalOpen(false)
            setTwitterAuthUrl("")
            setIframeError(false)
          }} />
          <div style={{
            position:"relative",width:"100%",maxWidth:520,marginLeft:"auto",
            height:"100vh",background:"var(--bg)",display:"flex",flexDirection:"column",
            boxShadow:"-8px 0 40px rgba(0,0,0,0.3)",
            animation:"slideInRight 0.3s ease",
            overflow:"hidden",
            borderLeft: "1px solid var(--border)"
          }}>
            <style>{`
              @keyframes slideInRight { from { transform: translateX(100%) } to { transform: translateX(0) } }
              @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
              .modal-iframe { width:100%; height:100%; border:none; }
            `}</style>
            <div style={{
              display:"flex",alignItems:"center",justifyContent:"space-between",
              padding:"1.25rem 1.5rem",borderBottom:"1px solid var(--border)",
              background: "rgba(6,8,15,0.4)"
            }}>
              <div>
                <div style={{fontSize:"1rem",fontWeight:800}}>Connect X / Twitter</div>
                <div style={{fontSize:"0.75rem",color:"var(--text-muted)",marginTop:"0.25rem"}}>
                  {iframeError ? "Paste the verifier code" : "Authorize in the secure window"}
                </div>
              </div>
              <button onClick={() => { setTwitterModalOpen(false); setTwitterAuthUrl(""); setIframeError(false) }}
                style={{background:"rgba(148,163,184,0.06)",border:"none",color:"var(--text-muted)",width:32, height:32, borderRadius:8, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center"}}>
                ×
              </button>
            </div>

            <div style={{flex:1,display:"flex",flexDirection:"column"}}>
              {!iframeError && (
                <iframe ref={iframeRef} src={twitterAuthUrl} className="modal-iframe"
                  style={{display: iframeError ? "none" : "block"}}
                  onLoad={() => {
                    try {
                      const url = iframeRef.current?.contentWindow?.location?.href
                      if (url && (url.includes("twitter=connected") || url.includes("twitter=denied"))) {
                        setTwitterModalOpen(false); setTwitterAuthUrl(""); setIframeError(false)
                        addToast(url.includes("connected") ? "X/Twitter connected!" : "X/Twitter cancelled", url.includes("connected") ? "success" : "error")
                        refreshStatus()
                      }
                    } catch {}
                  }}
                />
              )}
              {(iframeError || !twitterAuthUrl) && (
                <div style={{padding:"2rem",display:"flex",flexDirection:"column",gap:"1.5rem"}}>
                  <div style={{padding:"1.25rem", borderRadius:12, background:"rgba(251,191,36,0.05)", border:"1px solid rgba(251,191,36,0.15)"}}>
                    <div style={{fontSize:"0.85rem",color:"#fbbf24",fontWeight:700, marginBottom:"0.5rem"}}>Action Required</div>
                    <div style={{fontSize:"0.8rem",color:"var(--text-muted)",lineHeight:1.6}}>
                      Twitter blocks embedded windows. Open Twitter in a new tab, authorize NEXUS, then copy the 7-digit code provided.
                    </div>
                  </div>
                  
                  <a href={twitterAuthUrl} target="_blank" rel="noopener noreferrer"
                    className="btn btn-primary btn-lg"
                    style={{textAlign:"center",textDecoration:"none"}}>
                    Open Twitter to Authorize ↗
                  </a>
                  
                  <div style={{marginTop:"1rem"}}>
                    <label style={{fontSize:"0.75rem",fontWeight:700,color:"var(--text-muted)",textTransform:"uppercase", letterSpacing:"0.05em", display:"block", marginBottom:"0.5rem"}}>Verifier Code</label>
                    <input type="text" value={verifyCode}
                      onChange={e => setVerifyCode(e.target.value)}
                      placeholder="e.g. 4945332"
                      style={{width:"100%",padding:"0.875rem 1rem",borderRadius:"10px",border:"1px solid var(--border)",background:"rgba(6,8,15,0.4)",color:"#fff",fontSize:"1rem",marginBottom:"1rem",outline:"none",boxSizing:"border-box"}}
                    />
                    <button className="btn btn-primary" style={{width:"100%", padding:"0.875rem"}} onClick={handleVerifyTwitter}>
                      ✓ Verify & Connect
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

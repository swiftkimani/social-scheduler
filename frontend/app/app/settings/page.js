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
]

function AccountCard({ platform, authStatus, onStartAuth }) {
  const isConnected = authStatus === "authenticated"
  const isConnecting = authStatus === "in_progress"

  return (
    <div className="glass card" style={{
      background: platform.bgGradient,
      border: isConnected ? "1px solid rgba(16,185,129,0.15)" : "1px solid var(--border)",
      position:"relative", overflow:"hidden", transition:"all 0.3s",
    }}>
      {isConnected && <div style={{
        position:"absolute", top:0, left:0, right:0, height:3,
        background:"linear-gradient(90deg,#10b981,#34d399)",
      }} />}
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:"1.25rem"}}>
        <div style={{display:"flex",alignItems:"center",gap:"1rem"}}>
          <div style={{
            width:52, height:52, borderRadius:14,
            background:platform.gradient,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:platform.id==="twitter"?"1.4rem":"0.9rem",
            fontWeight:800,color:"#fff",
            boxShadow:`0 0 24px ${platform.color}22`,
          }}>{platform.icon}</div>
          <div>
            <h3 style={{fontSize:"1rem",fontWeight:700}}>{platform.name}</h3>
            <div style={{display:"flex",alignItems:"center",gap:"0.5rem",marginTop:"0.25rem"}}>
              <span style={{
                width:8,height:8,borderRadius:"50%",display:"inline-block",
                background:isConnected?"#10b981":isConnecting?"#fbbf24":"#64748b",
                boxShadow:isConnected?"0 0 8px rgba(16,185,129,0.5)":"none",
              }} />
              <span style={{
                fontSize:"0.8rem",fontWeight:600,
                color:isConnected?"#6ee7b7":isConnecting?"#fbbf24":"var(--text-muted)",
              }}>
                {isConnected ? "Connected" : isConnecting ? "Connecting..." : "Not Connected"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {!isConnected && !isConnecting && (
        <button
          className="btn btn-primary"
          style={{width:"100%"}}
          onClick={() => onStartAuth(platform.id)}
        >
          + Connect {platform.name}
        </button>
      )}

      {isConnecting && (
        <div style={{
          padding:"1rem", borderRadius:"var(--radius-sm)",
          background:"rgba(251,191,36,0.05)", border:"1px solid rgba(251,191,36,0.15)",
          textAlign:"center",
        }}>
          <div style={{fontSize:"0.85rem",color:"#fbbf24",fontWeight:600,marginBottom:"0.5rem"}}>
            ⏳ Check your browser — a login window opened
          </div>
          <div style={{fontSize:"0.75rem",color:"var(--text-muted)",lineHeight:1.5}}>
            Complete the login in the browser window.<br />
            This page will update automatically when connected.
          </div>
          <div style={{marginTop:"0.75rem"}}>
            <span className="spinner" style={{display:"inline-block"}} />
          </div>
        </div>
      )}

      {isConnected && (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.75rem"}}>
          <div style={{
            padding:"0.75rem",borderRadius:"var(--radius-sm)",
            background:"rgba(6,8,15,0.3)",textAlign:"center",
          }}>
            <div style={{fontSize:"0.65rem",color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:"0.25rem"}}>Status</div>
            <div style={{fontSize:"0.9rem",fontWeight:700,color:"#6ee7b7"}}>Live</div>
          </div>
          <div style={{
            padding:"0.75rem",borderRadius:"var(--radius-sm)",
            background:"rgba(6,8,15,0.3)",textAlign:"center",
          }}>
            <div style={{fontSize:"0.65rem",color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:"0.25rem"}}>Char Limit</div>
            <div style={{fontSize:"1rem",fontWeight:700,color:"#67e8f9"}}>{platform.charLimit}</div>
          </div>
        </div>
      )}
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
  const iframeRef = useRef(null)

  // Detect iframe blocking (X-Frame-Options) — fall back to verifier paste flow
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
    const interval = setInterval(refreshStatus, 2000)
    return () => clearInterval(interval)
  }, [refreshStatus])

  // Handle OAuth callback query params (for when this page loads in iframe after auth)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("twitter") === "connected") {
      addToast("X/Twitter connected successfully!", "success")
      window.history.replaceState({}, "", window.location.pathname)
      refreshStatus()
      // Tell parent window (if in iframe) to close the modal
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

  // Listen for postMessage from iframe (child settings page after auth completes)
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

  const connectedCount = Object.values(authStatuses).filter(s => s === "authenticated").length

  return (
    <div>
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`} onClick={() => setToasts(p => p.filter(x => x.id !== t.id))}>
            {t.type === "success" ? "✓" : t.type === "error" ? "✕" : "i"} {t.msg}
          </div>
        ))}
      </div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"2rem"}}>
        <div>
          <h1 style={{fontSize:"1.35rem",fontWeight:800,letterSpacing:"-0.02em"}}>Account Hub</h1>
          <p style={{color:"var(--text-secondary)",fontSize:"0.85rem",marginTop:"0.125rem"}}>
            Connect your accounts via browser — no API tokens needed
          </p>
        </div>
        <div style={{
          display:"flex",alignItems:"center",gap:"0.5rem",
          padding:"0.5rem 1rem",borderRadius:"var(--radius-sm)",
          background:"rgba(6,8,15,0.3)",border:"1px solid var(--border)",
        }}>
          <span style={{
            width:8,height:8,borderRadius:"50%",
            background:connectedCount>0?"#10b981":"#64748b",
            boxShadow:connectedCount>0?"0 0 8px rgba(16,185,129,0.5)":"none",
          }} />
          <span style={{fontSize:"0.8rem",fontWeight:600,color:"var(--text-secondary)"}}>
            {connectedCount} / {PLATFORMS.length} connected
          </span>
        </div>
      </div>

      {loading ? (
        <div style={{textAlign:"center",padding:"3rem",color:"var(--text-muted)"}}>Loading...</div>
      ) : (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1.5rem"}}>
          {PLATFORMS.map(p => (
            <AccountCard
              key={p.id}
              platform={p}
              authStatus={authStatuses[p.id] || "not_authenticated"}
              onStartAuth={handleStartAuth}
            />
          ))}
        </div>
      )}

      {connectedCount === 0 && !loading && (
        <div className="glass card" style={{
          marginTop:"1.5rem",textAlign:"center",padding:"2rem",
          border:"1px dashed rgba(99,102,241,0.15)",
        }}>
          <div style={{fontSize:"2rem",marginBottom:"0.75rem"}}>🔗</div>
          <h3 style={{fontSize:"1rem",fontWeight:700,marginBottom:"0.5rem"}}>No accounts connected yet</h3>
          <p style={{fontSize:"0.85rem",color:"var(--text-muted)",maxWidth:480,margin:"0 auto",lineHeight:1.6}}>
            Click "Connect" on any platform above to get started.
          </p>
        </div>
      )}

      <div style={{
        marginTop:"2rem",padding:"1.25rem",borderRadius:"var(--radius)",
        background:"rgba(99,102,241,0.03)",border:"1px solid rgba(99,102,241,0.08)",
      }}>
        <h3 style={{fontSize:"0.85rem",fontWeight:700,marginBottom:"0.5rem",display:"flex",alignItems:"center",gap:"0.5rem"}}>
          <span>🔒</span> How It Works
        </h3>
        <p style={{fontSize:"0.8rem",color:"var(--text-muted)",lineHeight:1.6}}>
          X/Twitter uses OAuth 1.0a — authorize in the modal. Other platforms use session cookies saved locally — no passwords stored.
        </p>
      </div>

      {/* ─── Right-to-left Slide-in Modal ──────────────────────── */}
      {twitterModalOpen && (
        <div style={{
          position:"fixed",inset:0,zIndex:9999,display:"flex",
          animation:"fadeIn 0.2s ease",
        }}>
          <div style={{
            position:"absolute",inset:0,background:"rgba(0,0,0,0.6)",
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
          }}>
            <style>{`
              @keyframes slideInRight { from { transform: translateX(100%) } to { transform: translateX(0) } }
              @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
              .modal-iframe { width:100%; height:100%; border:none; }
            `}</style>
            <div style={{
              display:"flex",alignItems:"center",justifyContent:"space-between",
              padding:"1rem 1.25rem",borderBottom:"1px solid var(--border)",
            }}>
              <div>
                <div style={{fontSize:"0.95rem",fontWeight:700}}>Connect X / Twitter</div>
                <div style={{fontSize:"0.75rem",color:"var(--text-muted)",marginTop:"0.125rem"}}>
                  {iframeError ? "Paste the verifier code" : "Authorize in the embedded window"}
                </div>
              </div>
              <button onClick={() => { setTwitterModalOpen(false); setTwitterAuthUrl(""); setIframeError(false) }}
                style={{background:"none",border:"none",color:"var(--text-muted)",fontSize:"1.4rem",cursor:"pointer",padding:"0.25rem",lineHeight:1}}>
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
                <div style={{padding:"1.25rem",display:"flex",flexDirection:"column",gap:"1rem"}}>
                  <div style={{fontSize:"0.82rem",color:"var(--text-muted)",lineHeight:1.5}}>
                    Twitter blocks embedded windows. Open Twitter in your own tab, authorize, then paste the code here.
                  </div>
                  <a href={twitterAuthUrl} target="_blank" rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{textAlign:"center",textDecoration:"none"}}>
                    Open Twitter to Authorize ↗
                  </a>
                  <div style={{borderTop:"1px solid var(--border)",paddingTop:"1rem"}}>
                    <div style={{fontSize:"0.8rem",fontWeight:600,marginBottom:"0.5rem"}}>Paste verifier code from Twitter:</div>
                    <input type="text" value={verifyCode}
                      onChange={e => setVerifyCode(e.target.value)}
                      placeholder="e.g. 4945332"
                      style={{width:"100%",padding:"0.6rem 0.75rem",borderRadius:"6px",border:"1px solid var(--border)",background:"rgba(6,8,15,0.4)",color:"#fff",fontSize:"0.9rem",marginBottom:"0.5rem",outline:"none",boxSizing:"border-box"}}
                    />
                    <button className="btn btn-primary" style={{width:"100%"}} onClick={handleVerifyTwitter}>
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

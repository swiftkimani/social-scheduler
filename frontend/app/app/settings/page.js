"use client"

import { useState, useEffect, useCallback } from "react"

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

  function addToast(msg, type="info") {
    const id = Date.now()
    setToasts(prev => [...prev, {id, msg, type}])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000)
  }

  const refreshStatus = useCallback(async () => {
    try {
      const r = await fetch("http://localhost:8080/api/auth/status")
      if (r.ok) setAuthStatuses(await r.json())
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => {
    refreshStatus()
    const interval = setInterval(refreshStatus, 2000)
    return () => clearInterval(interval)
  }, [refreshStatus])

  async function handleStartAuth(platformId) {
    try {
      const r = await fetch(`http://localhost:8080/api/auth/${platformId}`, { method:"POST" })
      const data = await r.json()
      console.log("[AUTH]", platformId, data)
      refreshStatus()
    } catch (e) {
      console.error("[AUTH] Failed:", e)
      alert("Failed to start auth. Check the backend is running on port 8080.")
    }
  }

  const connectedCount = Object.values(authStatuses).filter(s => s === "authenticated").length

  return (
    <div>
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
            Click "Connect" on any platform above. A browser window will open — log in, and your session will be captured automatically. No passwords stored.
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
          Session cookies are saved locally — no passwords or API tokens stored. When your session expires, just click Connect again. Same approach as WhatsApp Web.
        </p>
      </div>
    </div>
  )
}

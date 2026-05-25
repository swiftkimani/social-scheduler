"use client"

import { useState, useEffect, useCallback } from "react"

const PLATFORMS = [
  {
    id: "twitter",
    name: "X / Twitter",
    icon: "𝕏",
    color: "#1da1f2",
    gradient: "linear-gradient(135deg, #1da1f2, #0d8bd9)",
    bgGradient: "linear-gradient(135deg, rgba(29,161,242,0.08), rgba(29,161,242,0.02))",
    description: "Schedule tweets and engage with your audience in real time.",
    charLimit: 280,
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: "in",
    color: "#0a66c2",
    gradient: "linear-gradient(135deg, #0a66c2, #004182)",
    bgGradient: "linear-gradient(135deg, rgba(10,102,194,0.08), rgba(10,102,194,0.02))",
    description: "Share professional content and grow your business network.",
    charLimit: 3000,
  },
]

function AccountCard({ platform, account, onConnect, onDisconnect }) {
  const [showForm, setShowForm] = useState(false)
  const [formUser, setFormUser] = useState("")
  const [formToken, setFormToken] = useState("")
  const [connecting, setConnecting] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)

  async function handleConnect(e) {
    e.preventDefault()
    if (!formUser.trim() || !formToken.trim()) return
    setConnecting(true)
    try {
      const r = await fetch("http://localhost:8080/api/accounts/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: platform.id, username: formUser.trim(), avatar: "", token: formToken.trim() }),
      })
      if (r.ok) {
        const data = await r.json()
        onConnect(data)
        setShowForm(false)
        setFormUser("")
        setFormToken("")
      }
    } catch {}
    setConnecting(false)
  }

  async function handleDisconnect() {
    setDisconnecting(true)
    try {
      const r = await fetch("http://localhost:8080/api/accounts/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: platform.id }),
      })
      if (r.ok) onDisconnect(platform.id)
    } catch {}
    setDisconnecting(false)
  }

  const isConnected = account !== null

  return (
    <div className="glass card" style={{
      background: platform.bgGradient,
      border: isConnected ? `1px solid rgba(16,185,129,0.15)` : `1px solid var(--border)`,
      position: "relative", overflow: "hidden",
      transition: "all 0.3s",
    }}>
      {isConnected && <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: "linear-gradient(90deg, #10b981, #34d399)",
      }} />}
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:"1.25rem"}}>
        <div style={{display:"flex",alignItems:"center",gap:"1rem"}}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: platform.gradient,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: platform.id === "twitter" ? "1.4rem" : "0.9rem",
            fontWeight: 800, color: "#fff",
            boxShadow: `0 0 24px ${platform.color}22`,
          }}>{platform.icon}</div>
          <div>
            <h3 style={{fontSize:"1rem",fontWeight:700}}>{platform.name}</h3>
            {isConnected ? (
              <div style={{display:"flex",alignItems:"center",gap:"0.5rem",marginTop:"0.25rem"}}>
                <span style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: "#10b981", display: "inline-block",
                  boxShadow: "0 0 8px rgba(16,185,129,0.5)",
                }} />
                <span style={{fontSize:"0.8rem",color:"#6ee7b7",fontWeight:600}}>Connected</span>
                <span style={{fontSize:"0.75rem",color:"var(--text-muted)"}}>@{account.username}</span>
              </div>
            ) : (
              <p style={{fontSize:"0.8rem",color:"var(--text-muted)",marginTop:"0.125rem"}}>{platform.description}</p>
            )}
          </div>
        </div>
        {isConnected ? (
          <button className="btn btn-danger btn-sm" onClick={handleDisconnect} disabled={disconnecting} style={{fontSize:"0.7rem"}}>
            {disconnecting ? "..." : "Disconnect"}
          </button>
        ) : null}
      </div>

      {isConnected ? (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.75rem"}}>
          <div style={{
            padding:"0.75rem", borderRadius:"var(--radius-sm)",
            background:"rgba(6,8,15,0.3)", textAlign:"center",
          }}>
            <div style={{fontSize:"0.65rem",color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:"0.25rem"}}>Posts Published</div>
            <div style={{fontSize:"1.25rem",fontWeight:800,color:"#a5b4fc"}}>—</div>
          </div>
          <div style={{
            padding:"0.75rem", borderRadius:"var(--radius-sm)",
            background:"rgba(6,8,15,0.3)", textAlign:"center",
          }}>
            <div style={{fontSize:"0.65rem",color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:"0.25rem"}}>Limit</div>
            <div style={{fontSize:"1.25rem",fontWeight:800,color:"#67e8f9"}}>{platform.charLimit}</div>
          </div>
        </div>
      ) : (
        <div>
          {!showForm ? (
            <button className="btn btn-primary" style={{width:"100%"}} onClick={() => setShowForm(true)}>
              + Connect {platform.name}
            </button>
          ) : (
            <form onSubmit={handleConnect} style={{
              padding:"1rem", borderRadius:"var(--radius-sm)",
              background:"rgba(6,8,15,0.3)", border:"1px solid var(--border)",
            }}>
              <div className="form-group">
                <label>@{platform.name} Username</label>
                <input value={formUser} onChange={e => setFormUser(e.target.value)} placeholder="yourusername" required />
              </div>
              <div className="form-group">
                <label>Access Token</label>
                <input value={formToken} onChange={e => setFormToken(e.target.value)} placeholder="Paste your API token..." type="password" required />
              </div>
              <div style={{display:"flex",gap:"0.5rem"}}>
                <button type="submit" className="btn btn-primary btn-sm" disabled={connecting || !formUser.trim() || !formToken.trim()}>
                  {connecting ? "Connecting..." : "Connect"}
                </button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
              <p style={{fontSize:"0.7rem",color:"var(--text-muted)",marginTop:"0.75rem",lineHeight:1.5}}>
                Your token is stored locally and never shared. Generate one from your platform's developer dashboard.
              </p>
            </form>
          )}
        </div>
      )}
    </div>
  )
}

export default function SettingsPage() {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)

  const refreshAccounts = useCallback(async () => {
    try {
      const r = await fetch("http://localhost:8080/api/accounts")
      if (r.ok) setAccounts(await r.json())
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { refreshAccounts() }, [refreshAccounts])

  const getAccount = (platformId) => accounts.find(a => a.platform === platformId) || null

  const handleConnect = (acct) => {
    setAccounts(prev => {
      const filtered = prev.filter(a => a.platform !== acct.platform)
      return [...filtered, acct]
    })
  }

  const handleDisconnect = (platformId) => {
    setAccounts(prev => prev.filter(a => a.platform !== platformId))
  }

  const connectedCount = accounts.filter(a => a.status === "connected").length

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"2rem"}}>
        <div>
          <h1 style={{fontSize:"1.35rem",fontWeight:800,letterSpacing:"-0.02em"}}>Account Hub</h1>
          <p style={{color:"var(--text-secondary)",fontSize:"0.85rem",marginTop:"0.125rem"}}>
            Connect your social accounts to enable real publishing
          </p>
        </div>
        <div style={{
          display:"flex",alignItems:"center",gap:"0.5rem",
          padding:"0.5rem 1rem", borderRadius:"var(--radius-sm)",
          background:"rgba(6,8,15,0.3)", border:"1px solid var(--border)",
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: "50%",
            background: connectedCount > 0 ? "#10b981" : "#64748b",
            boxShadow: connectedCount > 0 ? "0 0 8px rgba(16,185,129,0.5)" : "none",
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
              account={getAccount(p.id)}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
            />
          ))}
        </div>
      )}

      {connectedCount === 0 && !loading && (
        <div className="glass card" style={{
          marginTop:"1.5rem", textAlign:"center", padding:"2rem",
          border:"1px dashed rgba(99,102,241,0.15)",
        }}>
          <div style={{fontSize:"2rem",marginBottom:"0.75rem"}}>🔗</div>
          <h3 style={{fontSize:"1rem",fontWeight:700,marginBottom:"0.5rem"}}>No accounts connected yet</h3>
          <p style={{fontSize:"0.85rem",color:"var(--text-muted)",maxWidth:480,margin:"0 auto",lineHeight:1.6}}>
            Connect your X and LinkedIn accounts to enable real publishing. Posts will be sent directly to your connected platforms when you hit publish.
          </p>
        </div>
      )}

      <div style={{
        marginTop:"2rem", padding:"1.25rem", borderRadius:"var(--radius)",
        background:"rgba(99,102,241,0.03)", border:"1px solid rgba(99,102,241,0.08)",
      }}>
        <h3 style={{fontSize:"0.85rem",fontWeight:700,marginBottom:"0.5rem",display:"flex",alignItems:"center",gap:"0.5rem"}}>
          <span>🔒</span> Privacy & Security
        </h3>
        <p style={{fontSize:"0.8rem",color:"var(--text-muted)",lineHeight:1.6}}>
          Access tokens are stored locally on your device and are never shared with third parties.
          You can disconnect any account at any time. For production use, we recommend OAuth 2.0 authentication.
        </p>
      </div>
    </div>
  )
}
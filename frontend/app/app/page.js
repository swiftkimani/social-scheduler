"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

const modules = [
  { icon: "🧠", label: "Content Intelligence", desc: "Generate platform-optimized content with brand voice", href: "/app/schedule", color: "#a5b4fc", bg: "rgba(99,102,241,0.08)", status: "active" },
  { icon: "⏰", label: "Autonomous Scheduling", desc: "Predictive, audience-aware post timing", href: "/app/schedule", color: "#67e8f9", bg: "rgba(6,182,212,0.08)", status: "active" },
  { icon: "👂", label: "Social Listening", desc: "Real-time brand monitoring across 12+ platforms", href: "/app/listening", color: "#6ee7b7", bg: "rgba(16,185,129,0.08)", status: "active" },
  { icon: "🎨", label: "AI Visual Studio", desc: "Brand-trained image and video generation", href: "/app/automation", color: "#f9a8d4", bg: "rgba(236,72,153,0.08)", status: "beta" },
  { icon: "📊", label: "Predictive Analytics", desc: "Forward-looking dashboards with AI prescriptions", href: "/app/analytics", color: "#fcd34d", bg: "rgba(245,158,11,0.08)", status: "active" },
  { icon: "⚡", label: "Automation Studio", desc: "Visual no-code workflow builder", href: "/app/automation", color: "#a5b4fc", bg: "rgba(99,102,241,0.08)", status: "active" },
  { icon: "💬", label: "Community Management", desc: "AI inbox with smart reply drafting", href: "/app/listening", color: "#67e8f9", bg: "rgba(6,182,212,0.08)", status: "beta" },
  { icon: "👁️", label: "Competitor Intel", desc: "Auto-track competitors and find content gaps", href: "/app/competitor", color: "#6ee7b7", bg: "rgba(16,185,129,0.08)", status: "active" },
  { icon: "👤", label: "Audience Personas", desc: "Behaviorally clustered audience segments", href: "/app/analytics", color: "#f9a8d4", bg: "rgba(236,72,153,0.08)", status: "beta" },
  { icon: "🛡️", label: "Crisis Management", desc: "Multi-signal detection with auto post-pause", href: "/app/competitor", color: "#fca5a5", bg: "rgba(239,68,68,0.08)", status: "coming" },
]

export default function Dashboard() {
  const [stats, setStats] = useState({ total:0, pending:0, published:0, draft:0 })
  const [analytics, setAnalytics] = useState(null)
  const [connectedAccounts, setConnectedAccounts] = useState([])
  const [dismissOnboard, setDismissOnboard] = useState(false)

  useEffect(() => {
    fetch("/api/stats").then(r=>r.json()).then(setStats).catch(()=>{})
    fetch("http://localhost:8080/api/nexus/analytics").then(r=>r.json()).then(setAnalytics).catch(()=>{})
    fetch("http://localhost:8080/api/accounts").then(r=>r.json()).then(setConnectedAccounts).catch(()=>{})
  }, [])

  const cards = [
    { label: "Pending", value: stats.pending, color: "#a5b4fc" },
    { label: "Published", value: stats.published, color: "#6ee7b7" },
    { label: "Drafts", value: stats.draft, color: "#f9a8d4" },
    { label: "Total Posts", value: stats.total, color: "#e8ecf4" },
  ]

  return (
    <div>
      {/* Premium Dashboard Hero */}
      <div style={{
        marginBottom:"2rem", borderRadius:"var(--radius)",
        background:"linear-gradient(135deg, rgba(99,102,241,0.04) 0%, rgba(236,72,153,0.02) 50%, rgba(6,182,212,0.02) 100%)",
        border:"1px solid var(--border)", padding:"2rem",
        position:"relative", overflow:"hidden",
      }}>
        <div style={{
          position:"absolute", width:400, height:400, borderRadius:"50%",
          background:"rgba(99,102,241,0.04)", filter:"blur(80px)",
          top:"-150px", right:"-100px", pointerEvents:"none",
        }} />
        <div style={{
          position:"absolute", width:300, height:300, borderRadius:"50%",
          background:"rgba(236,72,153,0.03)", filter:"blur(60px)",
          bottom:"-100px", left:"-50px", pointerEvents:"none",
        }} />
        <div style={{position:"relative",zIndex:1,display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:"1.5rem"}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:"0.5rem"}}>
              <span style={{
                display:"inline-flex", alignItems:"center", gap:"0.375rem",
                padding:"0.25rem 0.75rem", borderRadius:999,
                background:"rgba(99,102,241,0.08)", border:"1px solid rgba(99,102,241,0.1)",
                fontSize:"0.7rem", fontWeight:600, color:"#a5b4fc",
              }}>
                <span style={{width:6,height:6,borderRadius:"50%",background:"#10b981",display:"inline-block"}} />
                All systems operational
              </span>
            </div>
            <h1 style={{
              fontSize:"1.75rem", fontWeight:800, letterSpacing:"-0.03em",
              background:"linear-gradient(135deg, #f1f5f9 0%, #818cf8 50%, #f472b6 100%)",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
              marginBottom:"0.375rem",
            }}>NEXUS Dashboard</h1>
            <p style={{color:"var(--text-secondary)",fontSize:"0.85rem",lineHeight:1.6}}>
              Your AI-powered social media command center
            </p>
          </div>
          <div style={{display:"flex",gap:"0.75rem",flexShrink:0}}>
            <Link href="/app/schedule" className="btn btn-primary btn-sm" style={{gap:"0.5rem"}}>
              <span style={{fontSize:"1rem",lineHeight:1}}>+</span> New Post
            </Link>
            <Link href="/app/automation" className="btn btn-ghost btn-sm" style={{gap:"0.375rem"}}>
              ⚡ Automations
            </Link>
          </div>
        </div>
      </div>

      {/* Onboarding banner */}
      {connectedAccounts.length === 0 && !dismissOnboard && (
        <div style={{
          marginBottom:"1.5rem", padding:"1rem 1.5rem", borderRadius:"var(--radius-sm)",
          background:"linear-gradient(135deg, rgba(99,102,241,0.06), rgba(236,72,153,0.04))",
          border:"1px solid rgba(99,102,241,0.12)",
          display:"flex", alignItems:"center", justifyContent:"space-between", gap:"1rem",
          animation:"slideUp 0.5s ease-out",
        }}>
          <div style={{display:"flex",alignItems:"center",gap:"0.75rem"}}>
            <span style={{fontSize:"1.25rem"}}>🚀</span>
            <div>
              <p style={{fontSize:"0.8rem",color:"var(--text-secondary)",lineHeight:1.5}}>
                <strong style={{color:"var(--text)"}}>Welcome to NEXUS AI.</strong> Connect your X and LinkedIn accounts to start publishing for real.
              </p>
            </div>
          </div>
          <div style={{display:"flex",gap:"0.5rem",flexShrink:0}}>
            <Link href="/app/settings" className="btn btn-primary btn-sm" style={{fontSize:"0.75rem"}}>Connect Accounts</Link>
            <button className="btn btn-ghost btn-sm" style={{fontSize:"0.75rem"}} onClick={() => setDismissOnboard(true)}>Dismiss</button>
          </div>
        </div>
      )}

      <div className="stats-grid">
        {cards.map((c) => (
          <div key={c.label} className="glass stat-card">
            <div className="stat-num" style={{color:c.color}}>{c.value}</div>
            <div className="stat-label">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid" style={{marginBottom:"2rem"}}>
        <div className="glass card">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem"}}>
            <h2 style={{fontSize:"1rem",fontWeight:700}}>🧠 AI Command Center</h2>
            {analytics && <span style={{fontSize:"0.8rem",color:"var(--text-muted)"}}>Score: {analytics.performanceScore}/100</span>}
          </div>
          <div style={{background:"rgba(99,102,241,0.04)",borderRadius:12,padding:"1rem",marginBottom:"1rem"}}>
            <div style={{display:"flex",alignItems:"center",gap:"0.75rem",marginBottom:"0.5rem"}}>
              <span style={{fontSize:"1.1rem"}}>🤖</span>
              <span style={{fontWeight:600,fontSize:"0.9rem"}}>AI Copilot Summary</span>
            </div>
            <p style={{fontSize:"0.85rem",color:"var(--text-secondary)",lineHeight:1.6}}>
              {analytics ? `Your content is performing at ${analytics.performanceScore}/100. Reach is up ${Math.round((analytics.totalReach||0)/1000)}K this week with ${(analytics.engagementRate||0).toFixed(1)}% engagement rate. ${(analytics.followerGrowth||0) > 0 ? `${analytics.followerGrowth} new followers this period.` : ""}` : "Loading insights..."}
            </p>
          </div>
        </div>
        <div className="glass card">
          <h2 style={{fontSize:"1rem",fontWeight:700,marginBottom:"1rem"}}>📊 Weekly Reach</h2>
          {analytics?.weeklyTrend ? (
            <div style={{display:"flex",alignItems:"end",gap:"0.375rem",height:100}}>
              {analytics.weeklyTrend.map((v,i) => (
                <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:"0.25rem"}}>
                  <div style={{
                    width:"100%", borderRadius:"4px 4px 0 0",
                    background:"linear-gradient(180deg,rgba(99,102,241,0.6),rgba(99,102,241,0.2))",
                    height:`${(v/Math.max(...analytics.weeklyTrend))*80}px`,
                    transition:"height 0.5s",
                  }} />
                  <span style={{fontSize:"0.6rem",color:"var(--text-muted)"}}>{["M","T","W","T","F","S","S"][i]}</span>
                </div>
              ))}
            </div>
          ) : <p style={{fontSize:"0.85rem",color:"var(--text-muted)"}}>Loading...</p>}
        </div>
      </div>

      <div className="glass card">
        <h2 style={{fontSize:"1rem",fontWeight:700,marginBottom:"1.25rem"}}>📦 All Modules</h2>
        <div className="module-grid">
          {modules.map((m) => (
            <Link key={m.label} href={m.href} style={{textDecoration:"none",color:"inherit"}}>
              <div className="module-card">
                <div className="module-icon" style={{background:m.bg,color:m.color}}>{m.icon}</div>
                <h3>{m.label}</h3>
                <p>{m.desc}</p>
                <div className={`module-status ${m.status}`}>
                  {m.status === "active" ? "● Active" : m.status === "beta" ? "● Beta" : "○ Coming Soon"}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

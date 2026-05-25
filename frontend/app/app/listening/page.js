"use client"

import { useState, useEffect } from "react"

export default function SocialListening() {
  const [data, setData] = useState(null)
  useEffect(() => {
    fetch("http://localhost:8080/api/nexus/listening").then(r=>r.json()).then(setData).catch(()=>{})
  }, [])

  return (
    <div>
      <div className="app-topbar"><div><h1>Social Listening</h1><p>Real-time brand monitoring across 12+ platforms</p></div></div>
      <div className="dashboard-grid-wide">
        <div className="glass card">
          <h2 style={{fontSize:"1rem",fontWeight:700,marginBottom:"1rem"}}>👂 Overview</h2>
          {data ? (
            <div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"1rem",marginBottom:"1.5rem"}}>
                <div><div className="stat-num" style={{fontSize:"1.5rem",color:"#a5b4fc"}}>{data.totalMentions}</div><div className="stat-label">Total Mentions</div></div>
                <div><div className="stat-num" style={{fontSize:"1.5rem",color:"#6ee7b7"}}>{data.sentimentBreakdown?.positive?.toFixed(0) || 0}%</div><div className="stat-label">Positive</div></div>
                <div><div className="stat-num" style={{fontSize:"1.5rem",color:"#fca5a5"}}>{data.sentimentBreakdown?.negative?.toFixed(0) || 0}%</div><div className="stat-label">Negative</div></div>
              </div>
              <div style={{marginBottom:"1rem"}}>
                <p style={{fontSize:"0.8rem",fontWeight:600,marginBottom:"0.5rem",color:"var(--text-secondary)"}}>Trending Topics</p>
                <div style={{display:"flex",gap:"0.5rem",flexWrap:"wrap"}}>
                  {data.trendingTopics?.map(t => <span key={t} style={{padding:"0.25rem 0.625rem",borderRadius:999,background:"rgba(99,102,241,0.08)",color:"#a5b4fc",fontSize:"0.75rem",fontWeight:600}}>{t}</span>)}
                </div>
              </div>
            </div>
          ) : <p style={{color:"var(--text-muted)",fontSize:"0.85rem"}}>Loading...</p>}
        </div>
        <div className="glass card">
          <h2 style={{fontSize:"1rem",fontWeight:700,marginBottom:"1rem"}}>💬 Recent Mentions</h2>
          {data?.recentMentions?.map((m,i) => (
            <div key={i} style={{padding:"0.75rem 0",borderBottom:i < data.recentMentions.length-1 ? "1px solid var(--border)" : "none"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:"0.25rem"}}>
                <span style={{fontSize:"0.75rem",fontWeight:600}}>{m.author}</span>
                <span style={{
                  fontSize:"0.65rem",fontWeight:600,padding:"0.125rem 0.375rem",borderRadius:4,
                  background: m.sentiment === "positive" ? "rgba(16,185,129,0.1)" : m.sentiment === "negative" ? "rgba(239,68,68,0.1)" : "rgba(148,163,184,0.06)",
                  color: m.sentiment === "positive" ? "#6ee7b7" : m.sentiment === "negative" ? "#fca5a5" : "#94a3b8",
                }}>{m.sentiment}</span>
              </div>
              <p style={{fontSize:"0.8rem",color:"var(--text-secondary)",lineHeight:1.5}}>{m.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

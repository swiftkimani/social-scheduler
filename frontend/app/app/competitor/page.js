"use client"

import { useState, useEffect } from "react"

export default function CompetitorIntel() {
  const [data, setData] = useState(null)
  useEffect(() => {
    fetch("http://localhost:8080/api/nexus/competitor").then(r=>r.json()).then(setData).catch(()=>{})
  }, [])

  return (
    <div>
      <div className="app-topbar"><div><h1>👁️ Competitor Intelligence</h1><p>Track competitor strategies and find content gaps</p></div></div>
      <div className="dashboard-grid-wide">
        <div className="glass card">
          <h2 style={{fontSize:"1rem",fontWeight:700,marginBottom:"1rem"}}>Tracked Competitors</h2>
          {data?.competitors?.map((c,i) => (
            <div key={c.name} style={{padding:"1rem 0",borderBottom:i < data.competitors.length-1 ? "1px solid var(--border)" : "none"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.375rem"}}>
                <span style={{fontWeight:700,fontSize:"0.9rem"}}>{c.name}</span>
                <span style={{fontSize:"0.75rem",color:"var(--text-muted)"}}>Tracking since {c.trackedSince}</span>
              </div>
              <div style={{display:"flex",gap:"1.5rem",fontSize:"0.8rem",color:"var(--text-secondary)"}}>
                <span>{c.postsThisWeek} posts/week</span>
                <span>{c.avgEngagement}% avg eng.</span>
              </div>
              <p style={{fontSize:"0.8rem",color:"var(--text-muted)",marginTop:"0.375rem"}}>Top: &ldquo;{c.topContent}&rdquo;</p>
            </div>
          ))}
        </div>
        <div className="glass card">
          <h2 style={{fontSize:"1rem",fontWeight:700,marginBottom:"1rem"}}>📊 Insights</h2>
          <div style={{marginBottom:"1.5rem"}}>
            <p style={{fontSize:"0.8rem",color:"var(--text-muted)",marginBottom:"0.25rem"}}>Share of Voice</p>
            <div style={{fontSize:"2rem",fontWeight:800,color:"#a5b4fc"}}>{data?.shareOfVoice || 0}%</div>
          </div>
          <div>
            <p style={{fontSize:"0.8rem",fontWeight:600,marginBottom:"0.5rem",color:"var(--text-secondary)"}}>Content Gaps to Fill</p>
            {data?.contentGaps?.map((g,i) => (
              <div key={i} style={{display:"flex",alignItems:"center",gap:"0.5rem",padding:"0.5rem 0",borderBottom:"1px solid var(--border)"}}>
                <span style={{color:"#6ee7b7",fontSize:"0.8rem"}}>+</span>
                <span style={{fontSize:"0.85rem",color:"var(--text-secondary)"}}>{g}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

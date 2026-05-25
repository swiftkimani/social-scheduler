"use client"

import { useState, useEffect } from "react"

export default function AnalyticsPage() {
  const [times, setTimes] = useState([])
  const [reason, setReason] = useState("")

  useEffect(() => {
    fetch("http://localhost:8080/api/ai/predict")
      .then((r) => r.json())
      .then((d) => { setTimes(d.bestTimes || []); setReason(d.reason || "") })
      .catch(() => {})
  }, [])

  return (
    <div>
      <div className="dashboard-header">
        <h1>Analytics</h1>
        <p>AI-powered insights for your posting strategy</p>
      </div>
      <div className="dashboard-grid-wide">
        <div className="glass card">
          <h2 style={{fontSize:"1rem",fontWeight:700,marginBottom:"1rem"}}>📈 Best Times to Post</h2>
          <p style={{fontSize:"0.85rem",color:"var(--text-muted)",marginBottom:"1.25rem",lineHeight:1.6}}>{reason}</p>
          <div className="insights-panel" style={{padding:0}}>
            {times.map((t, i) => (
              <div key={t} className="insight-time">
                <span className="time">{t}</span>
                <div className="bar">
                  <div className="bar-fill" style={{width:`${100-i*20}%`}} />
                </div>
                <span style={{fontSize:"0.7rem",color:"var(--text-muted)",minWidth:30,textAlign:"right"}}>{(100-i*20)}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className="glass card">
          <h2 style={{fontSize:"1rem",fontWeight:700,marginBottom:"1rem"}}>🤖 AI Recommendations</h2>
          <div style={{display:"flex",flexDirection:"column",gap:"0.75rem"}}>
            {[
              { icon:"✍️", text:"Post consistently between your peak hours for 2.4x engagement" },
              { icon:"🎯", text:"Use 2-3 hashtags on Twitter, 5-8 on LinkedIn for optimal reach" },
              { icon:"📸", text:"Posts with visuals get 3x more engagement" },
              { icon:"⏰", text:"Schedule posts at least 24h in advance for algorithmic boost" },
            ].map((r) => (
              <div key={r.text} style={{display:"flex",gap:"0.75rem",alignItems:"flex-start",padding:"0.75rem",borderRadius:"var(--radius-sm)",background:"rgba(15,23,42,0.3)"}}>
                <span style={{fontSize:"1.25rem"}}>{r.icon}</span>
                <p style={{fontSize:"0.85rem",color:"#cbd5e1",lineHeight:1.5}}>{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

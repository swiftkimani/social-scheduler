"use client"

import { useState, useEffect } from "react"

export default function AutomationStudio() {
  const [playbooks, setPlaybooks] = useState([])
  useEffect(() => {
    fetch("/api/nexus/automation/playbooks").then(r=>r.json()).then(d => setPlaybooks(d.playbooks || [])).catch(()=>{})
  }, [])

  return (
    <div>
      <div className="app-topbar"><div><h1>⚡ Automation Studio</h1><p>Visual workflow builder — Trigger · Condition · Action</p></div></div>
      <div className="glass card" style={{marginBottom:"1.5rem"}}>
        <div style={{display:"flex",alignItems:"center",gap:"0.75rem",marginBottom:"1.25rem"}}>
          <div style={{display:"flex",gap:"0.5rem"}}>
            <button className="btn btn-primary btn-sm">+ New Workflow</button>
            <button className="btn btn-ghost btn-sm">Browse Templates</button>
          </div>
        </div>
        <div className="module-grid">
          {playbooks.map((pb) => (
            <div key={pb.id} className="module-card" style={{cursor:"default"}}>
              <div style={{display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:"0.75rem"}}>
                <span style={{fontSize:"1.25rem"}}>{pb.icon}</span>
                <h3 style={{fontSize:"0.9rem",fontWeight:700}}>{pb.name}</h3>
              </div>
              <p style={{fontSize:"0.8rem",color:"var(--text-secondary)",lineHeight:1.5,marginBottom:"0.75rem"}}>{pb.description}</p>
              <div style={{display:"flex",gap:"0.5rem",flexWrap:"wrap",marginBottom:"0.75rem"}}>
                {pb.triggers?.map(t => <span key={t} style={{fontSize:"0.65rem",padding:"0.125rem 0.5rem",borderRadius:4,background:"rgba(6,182,212,0.08)",color:"#67e8f9",fontWeight:600}}>⚡ {t}</span>)}
                {pb.actions?.map(a => <span key={a} style={{fontSize:"0.65rem",padding:"0.125rem 0.5rem",borderRadius:4,background:"rgba(99,102,241,0.08)",color:"#a5b4fc",fontWeight:600}}>→ {a}</span>)}
              </div>
              <div className={`module-status ${pb.status}`}>
                {pb.status === "active" ? "● Active" : "○ Draft"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

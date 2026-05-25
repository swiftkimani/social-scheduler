"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

export default function AppDashboard() {
  const [stats, setStats] = useState({ total: 0, pending: 0, published: 0, draft: 0 })
  const [recentPosts, setRecentPosts] = useState([])

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {})
    fetch("/api/posts")
      .then((r) => r.json())
      .then((posts) => setRecentPosts(posts.slice(-4).reverse()))
      .catch(() => {})
  }, [])

  const cards = [
    { label: "Pending", value: stats.pending, color: "purple" },
    { label: "Published", value: stats.published, color: "green" },
    { label: "Drafts", value: stats.draft, color: "pink" },
    { label: "Total", value: stats.total, color: "white" },
  ]

  return (
    <div>
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Overview of your social media activity</p>
      </div>

      <div className="stats-grid">
        {cards.map((c) => (
          <div key={c.label} className="glass stat-card">
            <div className="stat-num" style={{ color: c.color === "white" ? undefined : `var(--${c.color})` }}>
              {c.value}
            </div>
            <div className="stat-label">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="glass card">
          <div className="card-header" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem"}}>
            <h2 style={{fontSize:"1rem",fontWeight:700}}>Recent Posts</h2>
            <Link href="/app/posts" className="btn btn-ghost btn-sm">View All</Link>
          </div>
          {recentPosts.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📭</span>
              <p>No posts yet</p>
            </div>
          ) : (
            <div className="posts-list">
              {recentPosts.map((p, i) => (
                <div key={p.id} className="post-item" style={{animationDelay:`${i*50}ms`}}>
                  <div className={`post-indicator ${p.status}`} />
                  <div className="post-body">
                    <div className="post-text">{p.content.slice(0, 80)}{p.content.length > 80 ? "..." : ""}</div>
                    <div className="post-meta">
                      <span className={`post-status status-${p.status}`}>{p.status}</span>
                      {p.platforms?.map((pl) => <span key={pl} className={`tag tag-${pl}`}>{pl}</span>)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass">
          <div className="card-header" style={{display:"flex",alignItems:"center",gap:"0.75rem",padding:"1.25rem 1.25rem 0"}}>
            <span style={{fontSize:"0.9rem"}}>⏰</span>
            <h2 style={{fontSize:"0.9rem",fontWeight:700}}>AI Pattern Insights</h2>
          </div>
          <div style={{padding:"0 0.25rem"}}>
            <PatternInsightsInner />
          </div>
        </div>
      </div>
    </div>
  )
}

function PatternInsightsInner() {
  const [times, setTimes] = useState([])
  useEffect(() => {
    fetch("http://localhost:8080/api/ai/predict")
      .then((r) => r.json())
      .then((d) => setTimes(d.bestTimes || []))
      .catch(() => setTimes(["08:00","12:00","17:00","20:00"]))
  }, [])
  return (
    <div style={{padding:"0.75rem 1.25rem 1.25rem"}}>
      {times.length === 0 && <p style={{fontSize:"0.8rem",color:"var(--text-muted)"}}>Loading predictions...</p>}
      {times.map((t, i) => (
        <div key={t} className="insight-time" style={{padding:"0.375rem 0"}}>
          <span className="time" style={{fontSize:"0.85rem"}}>{t}</span>
          <div className="bar" style={{width:80}}>
            <div className="bar-fill" style={{width:`${100-i*20}%`}} />
          </div>
        </div>
      ))}
    </div>
  )
}

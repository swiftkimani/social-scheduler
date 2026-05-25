"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"

const sections = [
  {
    label: "Core", items: [
      { href: "/app", label: "Dashboard", icon: "◉" },
      { href: "/app/schedule", label: "Content Studio", icon: "✎" },
      { href: "/app/posts", label: "Posts", icon: "☰" },
      { href: "/app/analytics", label: "Analytics", icon: "📊" },
    ]
  },
  {
    label: "Intelligence", items: [
      { href: "/app/listening", label: "Social Listening", icon: "👂" },
      { href: "/app/automation", label: "Automation Studio", icon: "⚡" },
      { href: "/app/competitor", label: "Competitor Intel", icon: "👁️" },
    ]
  },
  {
    label: "Workspace", items: [
      { href: "/app/settings", label: "Account Hub", icon: "⚙️" },
    ]
  },
]

const iconBg = {
  "◉": "rgba(99,102,241,0.12)",
  "✎": "rgba(6,182,212,0.12)",
  "☰": "rgba(16,185,129,0.12)",
  "📊": "rgba(245,158,11,0.12)",
  "👂": "rgba(236,72,153,0.12)",
  "⚡": "rgba(99,102,241,0.12)",
  "👁️": "rgba(6,182,212,0.12)",
  "⚙️": "rgba(148,163,184,0.12)",
}

const iconColor = {
  "◉": "#a5b4fc",
  "✎": "#67e8f9",
  "☰": "#6ee7b7",
  "📊": "#fcd34d",
  "👂": "#f9a8d4",
  "⚡": "#a5b4fc",
  "👁️": "#67e8f9",
  "⚙️": "#94a3b8",
}

export default function AppSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState({})

  const isActive = (href) => {
    if (href === "/app") return pathname === "/app"
    return pathname.startsWith(href)
  }

  return (
    <aside className="sidebar">
      <Link href="/app" className="sidebar-logo">
        <span className="sidebar-logo-mark">N</span>
        <span className="sidebar-logo-text">NEXUS AI</span>
      </Link>

      <nav className="sidebar-nav">
        {sections.map((group) => (
          <div key={group.label} className="sidebar-group">
            <div className="sidebar-group-label">
              <span>{group.label}</span>
            </div>
            {group.items.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sidebar-link${active ? " active" : ""}`}
                >
                  {active && <span className="sidebar-active-bar" />}
                  <span
                    className="sidebar-link-icon"
                    style={{
                      background: active ? iconBg[item.icon] : "transparent",
                      color: active ? iconColor[item.icon] : "var(--text-muted)",
                    }}
                  >
                    {item.icon}
                  </span>
                  <span className="sidebar-link-label">{item.label}</span>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-status">
          <span className="sidebar-status-dot" />
          <span className="sidebar-status-text">All systems operational</span>
        </div>
        <Link href="/" className="sidebar-back-link">
          <span>←</span>
          <span>nexus.ai</span>
        </Link>
      </div>
    </aside>
  )
}
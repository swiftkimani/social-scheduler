"use client"

import "../globals.css"
import AppSidebar from "../components/AppSidebar"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import Link from "next/link"

const pageTitles = {
  "/app": { label: "Dashboard", icon: "◉" },
  "/app/schedule": { label: "Content Studio", icon: "✎" },
  "/app/posts": { label: "Posts", icon: "☰" },
  "/app/analytics": { label: "Analytics", icon: "📊" },
  "/app/listening": { label: "Social Listening", icon: "👂" },
  "/app/automation": { label: "Automation Studio", icon: "⚡" },
  "/app/competitor": { label: "Competitor Intel", icon: "👁️" },
  "/app/settings": { label: "Account Hub", icon: "⚙️" },
}

export default function AppLayout({ children }) {
  const pathname = usePathname()
  const page = pageTitles[pathname] || { label: "Dashboard", icon: "◉" }
  const [avatar, setAvatar] = useState("N")
  const [connected, setConnected] = useState(0)

  useEffect(() => {
    fetch("/api/accounts")
      .then(r => r.json())
      .then(accts => {
        if (accts.length > 0) {
          const initials = accts.map(a => a.username[0].toUpperCase()).filter(Boolean).join("")
          setAvatar(initials || "N")
          setConnected(accts.filter(a => a.status === "connected").length)
        }
      })
      .catch(() => {})
  }, [])

  return (
    <div className="app-layout">
      <AppSidebar />
      <main className="app-main">
        <div className="app-topbar-global">
          <div className="app-topbar-global-left">
            <div className="breadcrumb">
              NEXUS <span className="sep">/</span> <span>{page.icon} {page.label}</span>
            </div>
          </div>
          <div className="app-topbar-global-right">
            <div className="search-trigger">
              <span>🔍</span> Quick search... <kbd>⌘K</kbd>
            </div>
            <Link href="/app/settings" className="notif-dot" style={{textDecoration:"none"}}>
              <span>🔔</span>
            </Link>
            <Link href="/app/settings" className="app-topbar-avatar" style={{textDecoration:"none"}} title={connected > 0 ? `${connected} account(s) connected` : "Connect accounts"}>
              <span>{avatar}</span>
            </Link>
          </div>
        </div>
        <div className="app-main-inner">{children}</div>
      </main>
    </div>
  )
}

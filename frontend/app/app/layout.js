"use client"

import "../globals.css"
import AppSidebar from "../components/AppSidebar"
import { usePathname } from "next/navigation"

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
            <div className="notif-dot">
              <span>🔔</span>
              <span className="badge">3</span>
            </div>
            <div className="app-topbar-avatar">
              <span>N</span>
            </div>
          </div>
        </div>
        <div className="app-main-inner">{children}</div>
      </main>
    </div>
  )
}

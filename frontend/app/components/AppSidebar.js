"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  { href: "/app", label: "Dashboard", icon: "◉" },
  { href: "/app/schedule", label: "Schedule", icon: "✎" },
  { href: "/app/posts", label: "Posts", icon: "☰" },
  { href: "/app/analytics", label: "Analytics", icon: "📊" },
]

export default function AppSidebar() {
  const pathname = usePathname()

  const isActive = (href) => {
    if (href === "/app") return pathname === "/app"
    return pathname.startsWith(href)
  }

  return (
    <aside className="sidebar">
      <Link href="/app" className="sidebar-logo">
        <span className="logo-mark" style={{width:30,height:30,fontSize:"0.9rem",display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#6366f1,#8b5cf6)",borderRadius:8}}>📡</span>
        Scheduler
      </Link>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={isActive(item.href) ? "active" : ""}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="sidebar-footer">
        <Link href="/">
          <span className="nav-icon">←</span>
          Back to Site
        </Link>
      </div>
    </aside>
  )
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import "./dashboardNavbar.css";

export default function DashboardNavbar() {
  const pathname = usePathname();

  const sections = [
    { href: "/app", label: "Dashboard", icon: "◉" },
    { href: "/app/schedule", label: "Content Studio", icon: "✎" },
    { href: "/app/posts", label: "Posts", icon: "☰" },
    { href: "/app/analytics", label: "Analytics", icon: "📊" },
    { href: "/app/intelligence", label: "Intelligence", icon: "⚡" },
    { href: "/app/listening", label: "Social Listening", icon: "👂" },
    { href: "/app/automation", label: "Automation Studio", icon: "⚡" },
    { href: "/app/competitor", label: "Competitor Intel", icon: "👁️" }
  ];

  return (
    <header className="dashboard-navbar">
      <div className="dashboard-inner">
        <Link href="/" className="dashboard-logo">
          <img src="/logo.svg" alt="Nexus Logo" style={{ width: 32, height: 32 }} /> NEXUS AI
        </Link>
        <nav className="dashboard-nav">
          <ul className="dashboard-links">
            {sections.map((s) => (
              <li key={s.href} className={pathname.startsWith(s.href) ? "active" : ""}>
                <Link href={s.href}>
                  <span className="nav-icon">{s.icon}</span> {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <Link href="/" className="back-link">← Back to Site</Link>
      </div>
    </header>
  );
}


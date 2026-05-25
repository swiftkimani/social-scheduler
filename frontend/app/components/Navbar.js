"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import "./navbar.css";
// Google Font import is handled in layout.js; using class names for styling.

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const toggleMobile = () => setMobileOpen(!mobileOpen)

  const closeMobile = () => setMobileOpen(false)

  return (
    <>
      {/* Sticky glass‑morphic top bar */}
      <header className={`navbar ${scrolled ? "scrolled" : ""}`}> 
        <div className="navbar-inner">
          {/* Logo */}
          <Link href="/" className="navbar-logo" onClick={closeMobile}>
            <img src="/logo.svg" alt="Nexus Logo" style={{ width: 34, height: 34 }} /> NEXUS AI
          </Link>
          {/* Desktop navigation links */}
          <nav className="nav-desktop">
            <ul className="nav-links">
              <li><a href="#features">Modules</a></li>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><Link href="/app">Dashboard</Link></li>
            </ul>
          </nav>
          {/* Auth buttons */}
          <div className="navbar-auth">
            <Link href="/login" className="btn btn-ghost btn-sm">Log In</Link>
            <Link href="/signup" className="btn btn-primary btn-sm">Get Started</Link>
          </div>
          {/* Hamburger for mobile */}
          <button className="mobile-menu-btn" aria-label="Menu" onClick={toggleMobile} />
        </div>
      </header>

      {/* Mobile drawer */}
      <nav className={`mobile-drawer ${mobileOpen ? "open" : ""}`} aria-hidden={!mobileOpen}>
        <ul className="mobile-links">
          <li><a href="#features" onClick={closeMobile}>Modules</a></li>
          <li><a href="#how-it-works" onClick={closeMobile}>How It Works</a></li>
          <li><Link href="/app" onClick={closeMobile}>Dashboard</Link></li>
          <li><Link href="/login" onClick={closeMobile}>Log In</Link></li>
          <li><Link href="/signup" onClick={closeMobile}>Get Started</Link></li>
        </ul>
      </nav>
    </>
  )
}

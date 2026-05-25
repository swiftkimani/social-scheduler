import Link from "next/link"

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="hero-glow hero-glow-1" />
        <div className="hero-glow hero-glow-2" />
        <div className="hero-glow hero-glow-3" />
        <div className="hero-content">
          <div className="hero-badge">
            ✨ Now with AI <span>·</span> Generate posts, predict patterns
          </div>
          <h1>Schedule Smarter<br />with AI</h1>
          <p>
            An intelligent social media scheduling agent that helps you craft,
            schedule, and publish posts across Twitter and LinkedIn — powered by AI
            content generation and engagement pattern predictions.
          </p>
          <div className="hero-actions">
            <Link href="/signup" className="btn btn-primary btn-lg">
              Get Started Free
            </Link>
            <Link href="/app" className="btn btn-outline btn-lg">
              Launch Dashboard →
            </Link>
          </div>
          <div className="hero-mockup">
            <div style={{
              background: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 50%, #1a0a2e 100%)",
              padding: "3rem 2rem",
              textAlign: "center",
            }}>
              <div style={{
                display: "inline-flex", gap: "0.75rem", alignItems: "center",
                background: "rgba(15,23,42,0.6)", borderRadius: 12,
                padding: "0.75rem 1.25rem", border: "1px solid rgba(148,163,184,0.1)",
              }}>
                <span style={{fontSize:"1.5rem"}}>📡</span>
                <span style={{fontSize:"0.9rem",color:"#94a3b8"}}>How to build in public on</span>
                <span style={{
                  background:"rgba(29,161,242,0.1)", color:"#60b0f4",
                  padding:"0.125rem 0.5rem", borderRadius:4, fontWeight:700, fontSize:"0.7rem",
                  textTransform:"uppercase",
                }}>𝕏 Twitter</span>
                <span style={{color:"#64748b"}}>&</span>
                <span style={{
                  background:"rgba(10,102,194,0.1)", color:"#5c9bd5",
                  padding:"0.125rem 0.5rem", borderRadius:4, fontWeight:700, fontSize:"0.7rem",
                  textTransform:"uppercase",
                }}>in LinkedIn</span>
                <span style={{
                  background:"rgba(99,102,241,0.1)", color:"#a5b4fc",
                  padding:"0.25rem 0.75rem", borderRadius:999, fontWeight:600, fontSize:"0.75rem",
                }}>✨ AI Generated</span>
              </div>
              <div style={{marginTop:"1.5rem",display:"flex",gap:"1rem",justifyContent:"center",flexWrap:"wrap"}}>
                {["📅 Scheduled: 12 PM", "👁️ Predicted reach: 2.4K", "📊 Best time: 8 AM"].map((s) => (
                  <span key={s} style={{
                    background:"rgba(148,163,184,0.05)", border:"1px solid rgba(148,163,184,0.08)",
                    padding:"0.5rem 1rem", borderRadius:8, fontSize:"0.8rem", color:"#94a3b8",
                  }}>{s}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="container">
        <div className="stats">
          <div>
            <div className="stat-value purple">10K+</div>
            <div className="stat-label">Posts Scheduled</div>
          </div>
          <div>
            <div className="stat-value pink">98%</div>
            <div className="stat-label">Publish Rate</div>
          </div>
          <div>
            <div className="stat-value green">3.2x</div>
            <div className="stat-label">Avg. Engagement</div>
          </div>
        </div>
      </div>

      {/* Features */}
      <section className="section" id="features">
        <div className="container">
          <div className="section-header">
            <h2>Built for creators who ship</h2>
            <p>AI-powered tools to help you schedule, publish, and optimize your social media presence.</p>
          </div>
          <div className="features-grid">
            {[
              { icon: "✨", cls: "purple", title: "AI Content Generation", desc: "Generate engaging post variations from any topic. Choose from casual, professional, humorous, or inspirational tones." },
              { icon: "📊", cls: "purple", title: "Pattern Predictions", desc: "AI analyzes your posting patterns to recommend the best times for maximum reach and engagement." },
              { icon: "🎨", cls: "pink", title: "AI Visual Suggestions", desc: "Get AI-generated image and video suggestions that match your content style and brand." },
              { icon: "📅", cls: "green", title: "Smart Scheduling", desc: "Schedule posts in advance with intelligent timing suggestions based on when your audience is active." },
              { icon: "🔄", cls: "pink", title: "Cross-Platform Publishing", desc: "Publish to Twitter and LinkedIn simultaneously. One dashboard, multiple platforms." },
              { icon: "📈", cls: "green", title: "Analytics Dashboard", desc: "Track your post performance, engagement rates, and optimize your content strategy over time." },
            ].map((f) => (
              <div key={f.title} className="feature-card">
                <div className={`feature-icon ${f.cls}`}>{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section" id="how-it-works" style={{background:"rgba(99,102,241,0.02)"}}>
        <div className="container">
          <div className="section-header">
            <h2>How It Works</h2>
            <p>Three simple steps to smarter social media scheduling.</p>
          </div>
          <div className="steps">
            {[
              { title: "Create with AI", desc: "Enter a topic and let AI generate engaging post variations. Pick the one that fits your voice." },
              { title: "Schedule Smart", desc: "Choose your platforms and pick the best time — or let AI predict optimal posting windows." },
              { title: "Publish & Grow", desc: "Auto-publish at scheduled times. Track performance and refine your strategy with AI insights." },
            ].map((s) => (
              <div key={s.title} className="step">
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2>Ready to schedule smarter?</h2>
        <p>Join creators who use AI to optimize their social media.</p>
        <Link href="/signup" className="btn btn-primary btn-lg">
          Get Started Free
        </Link>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <p>© 2026 Social Scheduler. Built with Go + Next.js.</p>
          <p>
            <Link href="/app" style={{color:"var(--text-muted)",textDecoration:"none",fontWeight:500}}>Dashboard</Link>
            <span style={{margin:"0 0.75rem",color:"var(--border-hover)"}}>·</span>
            <Link href="https://github.com/swiftkimani/social-scheduler" style={{color:"var(--text-muted)",textDecoration:"none",fontWeight:500}}>GitHub</Link>
          </p>
        </div>
      </footer>
    </>
  )
}

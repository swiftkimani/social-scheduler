import Link from "next/link"

export default function LandingPage() {
  return (
    <>
      <section className="hero">
        <div className="hero-glow hero-glow-1" />
        <div className="hero-glow hero-glow-2" />
        <div className="hero-glow hero-glow-3" />
        <div className="hero-content">
          <div className="hero-badge">
            <span>🧠</span> NEXUS AI 2.0 · <span className="dot">●</span> Now with Autonomous Agents
          </div>
          <h1>Your AI-Powered<br />Social Command Center</h1>
          <p>
            One platform. Every channel. Zero busywork.<br />
            NEXUS thinks, learns, predicts, creates, and acts — managing your entire social
            media lifecycle from ideation to performance reporting.
          </p>
          <div className="hero-actions">
            <Link href="/signup" className="btn btn-primary btn-xl">
              Get Started Free
            </Link>
            <Link href="/app" className="btn btn-outline btn-xl">
              Launch Dashboard →
            </Link>
          </div>
          <div className="hero-mockup">
            <div style={{
              background: "linear-gradient(135deg, #0c0a1e 0%, #08080f 50%, #10051a 100%)",
              padding: "2.5rem 2rem",
            }}>
              <div style={{display:"flex",gap:"1rem",justifyContent:"center",flexWrap:"wrap",marginBottom:"1.25rem"}}>
                {["Content Intelligence", "Auto Scheduling", "Social Listening", "Visual Studio", "Automation", "Analytics"].map((m) => (
                  <span key={m} style={{
                    background:"rgba(99,102,241,0.06)", border:"1px solid rgba(99,102,241,0.1)",
                    padding:"0.5rem 1rem", borderRadius:8, fontSize:"0.8rem", color:"#8892b0",
                    fontWeight:500,
                  }}>{m}</span>
                ))}
              </div>
              <div style={{
                display:"flex", alignItems:"center", justifyContent:"center", gap:"1rem",
                background:"rgba(6,8,15,0.5)", borderRadius:12, padding:"0.75rem 1.25rem",
                border:"1px solid rgba(99,102,241,0.06)", maxWidth:500, margin:"0 auto",
              }}>
                <span style={{fontSize:"1.2rem"}}>🤖</span>
                <span style={{fontSize:"0.85rem",color:"#8892b0"}}>AI Copilot suggests:</span>
                <span style={{
                  background:"rgba(6,182,212,0.08)", color:"#67e8f9",
                  padding:"0.25rem 0.75rem", borderRadius:6, fontWeight:600, fontSize:"0.8rem",
                }}>Best time to post: 8 AM</span>
                <span style={{
                  background:"rgba(99,102,241,0.08)", color:"#a5b4fc",
                  padding:"0.25rem 0.75rem", borderRadius:6, fontWeight:600, fontSize:"0.8rem",
                }}>✨ 4 variants ready</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        <div className="stats">
          <div><div className="stat-value" style={{color:"#a5b4fc"}}>10K+</div><div className="stat-label">Workspaces Active</div></div>
          <div><div className="stat-value" style={{color:"#f9a8d4"}}>5M+</div><div className="stat-label">Posts Published</div></div>
          <div><div className="stat-value" style={{color:"#67e8f9"}}>98%</div><div className="stat-label">Uptime SLA</div></div>
          <div><div className="stat-value" style={{color:"#6ee7b7"}}>2.4x</div><div className="stat-label">Avg Engagement Lift</div></div>
        </div>
      </div>

      <section className="section" id="features">
        <div className="container">
          <div className="section-header">
            <h2>Ten intelligent modules. One platform.</h2>
            <p>NEXUS replaces your entire social toolstack with a unified AI agent layer.</p>
          </div>
          <div className="features-grid">
            {[
              { icon: "🧠", cls: "purple", title: "Content Intelligence", desc: "Generative AI with brand voice memory. One prompt generates platform-optimized variants across all formats." },
              { icon: "⏰", cls: "cyan", title: "Autonomous Scheduling", desc: "Predictive, audience-aware timing that learns when your followers engage most and auto-optimizes." },
              { icon: "👂", cls: "green", title: "Social Listening", desc: "Real-time brand mention tracking across 12+ platforms. Sentiment scoring, trend radar, crisis detection." },
              { icon: "🎨", cls: "pink", title: "AI Visual Studio", desc: "Brand-trained image generation, smart resize, dynamic templates, and video clip creation." },
              { icon: "📊", cls: "amber", title: "Predictive Analytics", desc: "Forward-looking dashboards that predict engagement, track ROI, and prescribe optimizations." },
              { icon: "⚡", cls: "purple", title: "Automation Studio", desc: "Visual no-code workflow builder. Trigger → Condition → Action. 50+ prebuilt playbooks." },
              { icon: "💬", cls: "cyan", title: "Community Management", desc: "AI inbox with intent classification, smart reply drafting, and SLA tracking across all channels." },
              { icon: "👁️", cls: "green", title: "Competitor Intel", desc: "Auto-track competitors, detect campaign launches, and uncover content gaps with actionable recommendations." },
              { icon: "👤", cls: "pink", title: "Audience Persona Engine", desc: "Behaviorally clustered audience segments. Personalize every post to what each segment actually engages with." },
              { icon: "🛡️", cls: "amber", title: "Crisis Management", desc: "Multi-signal crisis detection with automated post pause, holding statement generator, and post-crisis reports." },
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

      <section className="section" style={{background:"rgba(99,102,241,0.015)"}} id="how-it-works">
        <div className="container">
          <div className="section-header">
            <h2>From idea to impact in three steps</h2>
            <p>NEXUS automates the entire social media lifecycle so your team can focus on strategy.</p>
          </div>
          <div className="steps">
            {[
              { title: "Create with AI", desc: "Enter a topic. NEXUS generates platform-optimized variants in your brand voice. Pick, tweak, publish." },
              { title: "Automate Everything", desc: "Set triggers and actions. NEXUS schedules, listens, responds, and optimizes — autonomously." },
              { title: "Learn & Optimize", desc: "AI analyzes performance, predicts trends, and prescribes what to do next. Your strategy gets smarter every week." },
            ].map((s) => (
              <div key={s.title} className="step"><h3>{s.title}</h3><p>{s.desc}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready to cut the toolstack?</h2>
        <p>Join teams who replaced 6–12 tools with one AI platform.</p>
        <Link href="/signup" className="btn btn-primary btn-xl">Start Free Trial</Link>
      </section>

      <footer className="footer">
        <div className="footer-inner">
          <p>© 2026 NEXUS AI. Social Intelligence Platform.</p>
          <p>
            <Link href="/app">Dashboard</Link>
            <span style={{margin:"0 0.75rem",color:"var(--border)"}}>·</span>
            <a href="https://github.com/swiftkimani/social-scheduler">GitHub</a>
          </p>
        </div>
      </footer>
    </>
  )
}

import "../globals.css"

export const metadata = {
  title: "Log In — NEXUS AI",
}

export default function LoginPage() {
  return (
    <div className="auth-page">
      <div className="glass auth-card">
        <h1>Welcome back</h1>
        <p className="subtitle">Log in to manage your posts</p>
        <form>
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="you@example.com" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="••••••••" />
          </div>
          <button type="submit" className="btn btn-primary" style={{width:"100%"}}>
            Log In
          </button>
        </form>
        <div className="auth-divider">continue as guest</div>
        <a href="/app" className="btn btn-outline" style={{width:"100%",textDecoration:"none"}}>
          Skip to Dashboard →
        </a>
        <p className="auth-link">
          No account? <a href="/signup">Sign up</a>
        </p>
      </div>
    </div>
  )
}

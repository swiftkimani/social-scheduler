import "../globals.css"

export const metadata = {
  title: "Sign Up — Social Scheduler",
}

export default function SignupPage() {
  return (
    <div className="auth-page">
      <div className="glass auth-card">
        <h1>Create your account</h1>
        <p className="subtitle">Start scheduling smarter with AI</p>
        <form>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" placeholder="Jane Doe" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="you@example.com" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="••••••••" />
          </div>
          <button type="submit" className="btn btn-primary" style={{width:"100%"}}>
            Create Account
          </button>
        </form>
        <div className="auth-divider">or</div>
        <a href="/app" className="btn btn-outline" style={{width:"100%",textDecoration:"none"}}>
          Continue as Guest →
        </a>
        <p className="auth-link">
          Already have an account? <a href="/login">Log in</a>
        </p>
      </div>
    </div>
  )
}

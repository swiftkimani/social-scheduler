import "dotenv/config"
import http from "node:http"
import url from "node:url"
import { schedulePost, publishPost, listPosts, cancelPost } from "./scheduler.js"
import { Platform } from "./types.js"

const PORT = parseInt(process.env.PORT || "3030", 10)

async function handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
  const parsed = url.parse(req.url || "/", true)
  const pathname = parsed.pathname?.replace(/\/+$/, "") || "/"
  const method = req.method?.toUpperCase() || "GET"

  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  if (method === "OPTIONS") {
    res.writeHead(204)
    res.end()
    return
  }

  if (pathname === "/" && method === "GET") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" })
    res.end(UI_HTML)
    return
  }

  if (pathname === "/api/posts" && method === "GET") {
    const status = (parsed.query.status as string) || undefined
    const posts = listPosts(status)
    res.writeHead(200, { "Content-Type": "application/json" })
    res.end(JSON.stringify(posts))
    return
  }

  if (pathname === "/api/schedule" && method === "POST") {
    const body = await readBody(req)
    try {
      const { content, platforms, scheduledAt } = JSON.parse(body)
      if (!content || !platforms) {
        res.writeHead(400, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ error: "content and platforms are required" }))
        return
      }
      const platformList: Platform[] = (typeof platforms === "string" ? platforms.split(",") : platforms).map((p: string) => p.trim() as Platform)
      const post = schedulePost({ content, platforms: platformList, scheduledAt: scheduledAt || null })
      res.writeHead(201, { "Content-Type": "application/json" })
      res.end(JSON.stringify(post))
    } catch {
      res.writeHead(400, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ error: "Invalid JSON body" }))
    }
    return
  }

  const publishMatch = pathname.match(/^\/api\/posts\/([^/]+)\/publish$/)
  if (publishMatch && method === "POST") {
    const result = await publishPost(publishMatch[1])
    if (!result) {
      res.writeHead(404, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ error: "Post not found" }))
      return
    }
    res.writeHead(200, { "Content-Type": "application/json" })
    res.end(JSON.stringify(result))
    return
  }

  const cancelMatch = pathname.match(/^\/api\/posts\/([^/]+)\/cancel$/)
  if (cancelMatch && method === "POST") {
    const result = cancelPost(cancelMatch[1])
    if (!result) {
      res.writeHead(404, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ error: "Post not found" }))
      return
    }
    res.writeHead(200, { "Content-Type": "application/json" })
    res.end(JSON.stringify(result))
    return
  }

  res.writeHead(404, { "Content-Type": "application/json" })
  res.end(JSON.stringify({ error: "Not found" }))
}

function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = []
    req.on("data", (chunk: Buffer) => chunks.push(chunk))
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")))
  })
}

const server = http.createServer(handleRequest)

server.listen(PORT, () => {
  const addr = `http://localhost:${PORT}`
  console.log(`\n  🌐 Social Scheduler UI`)
  console.log(`  ─────────────────────`)
  console.log(`  Open: ${addr}`)
  console.log()
})

const UI_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Social Scheduler</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    background: #0f172a; color: #e2e8f0; min-height: 100vh;
  }
  .container { max-width: 960px; margin: 0 auto; padding: 2rem 1.5rem; }
  h1 { font-size: 1.75rem; font-weight: 700; margin-bottom: 0.25rem; }
  .subtitle { color: #94a3b8; margin-bottom: 2rem; }
  .card {
    background: #1e293b; border: 1px solid #334155; border-radius: 12px;
    padding: 1.5rem; margin-bottom: 1.5rem;
  }
  .card h2 { font-size: 1.125rem; font-weight: 600; margin-bottom: 1rem; }
  .form-row { margin-bottom: 1rem; }
  label { display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.375rem; color: #cbd5e1; }
  input, textarea, select {
    width: 100%; padding: 0.625rem 0.75rem; border-radius: 8px;
    border: 1px solid #475569; background: #0f172a; color: #e2e8f0;
    font-size: 0.9rem; font-family: inherit; outline: none;
  }
  input:focus, textarea:focus, select:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }
  textarea { resize: vertical; min-height: 80px; }
  .form-inline { display: flex; gap: 1rem; }
  .form-inline > * { flex: 1; }
  .checkbox-group { display: flex; gap: 1.5rem; padding: 0.25rem 0; }
  .checkbox-group label { display: flex; align-items: center; gap: 0.5rem; font-weight: 400; cursor: pointer; }
  .checkbox-group input[type="checkbox"] { width: auto; accent-color: #3b82f6; }
  button {
    padding: 0.625rem 1.25rem; border-radius: 8px; border: none;
    font-size: 0.875rem; font-weight: 600; cursor: pointer;
    transition: background 0.15s, opacity 0.15s;
  }
  button:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-primary { background: #3b82f6; color: #fff; }
  .btn-primary:hover:not(:disabled) { background: #2563eb; }
  .btn-success { background: #22c55e; color: #fff; }
  .btn-success:hover:not(:disabled) { background: #16a34a; }
  .btn-danger { background: #ef4444; color: #fff; }
  .btn-danger:hover:not(:disabled) { background: #dc2626; }
  .btn-sm { padding: 0.375rem 0.75rem; font-size: 0.8rem; }
  .filters { display: flex; gap: 0.75rem; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; }
  .filters select { width: auto; min-width: 140px; }
  .filters .btn { background: #334155; color: #e2e8f0; }
  .filters .btn:hover { background: #475569; }
  .filters .btn.active { background: #3b82f6; }
  .posts-list { display: flex; flex-direction: column; gap: 0.75rem; }
  .post-item {
    display: flex; align-items: center; gap: 1rem;
    background: #0f172a; border: 1px solid #334155; border-radius: 10px;
    padding: 1rem 1.25rem; transition: border-color 0.15s;
  }
  .post-item:hover { border-color: #475569; }
  .post-status {
    display: inline-flex; align-items: center; gap: 0.375rem;
    padding: 0.25rem 0.625rem; border-radius: 999px;
    font-size: 0.75rem; font-weight: 600; white-space: nowrap;
    text-transform: capitalize;
  }
  .status-pending { background: #1e3a5f; color: #93c5fd; }
  .status-published { background: #14532d; color: #86efac; }
  .status-cancelled { background: #450a0a; color: #fca5a5; }
  .status-draft { background: #1e293b; color: #94a3b8; }
  .post-content { flex: 1; min-width: 0; }
  .post-content .text { font-size: 0.9rem; line-height: 1.4; word-break: break-word; }
  .post-content .meta { font-size: 0.75rem; color: #64748b; margin-top: 0.25rem; }
  .post-platforms { display: flex; gap: 0.375rem; flex-wrap: wrap; }
  .post-platforms .tag {
    font-size: 0.7rem; padding: 0.125rem 0.5rem; border-radius: 4px;
    background: #334155; color: #94a3b8; font-weight: 500;
  }
  .post-actions { display: flex; gap: 0.5rem; flex-shrink: 0; }
  .empty-state { text-align: center; padding: 2.5rem 1rem; color: #64748b; }
  .empty-state p { font-size: 0.9rem; }
  .toast {
    position: fixed; bottom: 1.5rem; right: 1.5rem;
    padding: 0.75rem 1.25rem; border-radius: 10px;
    font-size: 0.875rem; font-weight: 500; z-index: 100;
    animation: slideIn 0.25s ease-out;
  }
  .toast-success { background: #166534; color: #86efac; border: 1px solid #22c55e; }
  .toast-error { background: #450a0a; color: #fca5a5; border: 1px solid #ef4444; }
  @keyframes slideIn { from { transform: translateY(1rem); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  @media (max-width: 640px) {
    .post-item { flex-direction: column; align-items: stretch; }
    .post-actions { justify-content: flex-end; }
    .form-inline { flex-direction: column; }
  }
</style>
</head>
<body>
<div class="container">
  <h1>📅 Social Scheduler</h1>
  <p class="subtitle">Schedule and manage social media posts</p>

  <div class="card" id="schedule-card">
    <h2>✏️ New Post</h2>
    <div class="form-row">
      <label for="content">Content</label>
      <textarea id="content" placeholder="What do you want to post?" maxlength="3000"></textarea>
      <div style="text-align:right;font-size:0.75rem;color:#64748b;margin-top:0.25rem"><span id="char-count">0</span> / 3000</div>
    </div>
    <div class="form-row">
      <label>Platforms</label>
      <div class="checkbox-group">
        <label><input type="checkbox" id="platform-twitter" checked> Twitter/X</label>
        <label><input type="checkbox" id="platform-linkedin"> LinkedIn</label>
      </div>
    </div>
    <div class="form-row">
      <label for="scheduledAt">Schedule (optional — leave blank for draft)</label>
      <input type="datetime-local" id="scheduledAt">
    </div>
    <button class="btn-primary" id="btn-schedule" onclick="schedule()">Schedule Post</button>
  </div>

  <div class="card">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;flex-wrap:wrap;gap:0.75rem">
      <h2 style="margin:0">📋 Posts</h2>
      <button class="btn-sm" style="background:#334155;color:#e2e8f0" onclick="loadPosts()">🔄 Refresh</button>
    </div>
    <div class="filters">
      <select id="filter-status" onchange="loadPosts()">
        <option value="">All statuses</option>
        <option value="pending">Pending</option>
        <option value="published">Published</option>
        <option value="cancelled">Cancelled</option>
        <option value="draft">Draft</option>
      </select>
    </div>
    <div id="posts-container" class="posts-list">
      <div class="empty-state"><p>Loading...</p></div>
    </div>
  </div>
</div>

<script>
let posts = []

async function api(path, opts = {}) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...opts
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || "Request failed")
  return data
}

async function loadPosts() {
  const status = document.getElementById("filter-status").value
  const qs = status ? "?status=" + encodeURIComponent(status) : ""
  try {
    posts = await api("/api/posts" + qs)
    renderPosts()
  } catch (e) {
    showToast(e.message, "error")
  }
}

function renderPosts() {
  const container = document.getElementById("posts-container")
  if (posts.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>📭 No posts found</p></div>'
    return
  }
  container.innerHTML = posts.map(p => {
    const platforms = (p.platforms || []).join(", ")
    const date = p.scheduledAt ? new Date(p.scheduledAt).toLocaleString() : "—"
    const created = new Date(p.createdAt).toLocaleString()
    return \`<div class="post-item">
      <div class="post-content">
        <div class="text">\${escapeHtml(p.content)}</div>
        <div class="meta">
          <span class="post-status status-\${p.status}">\${statusIcon(p.status)} \${p.status}</span>
          &middot; \${platforms}
          \${p.scheduledAt ? "&middot; " + date : ""}
          &middot; <span title="\${created}">\${timeAgo(p.createdAt)}</span>
        </div>
      </div>
      <div class="post-platforms">
        \${(p.platforms || []).map(pl => '<span class="tag">' + pl + '</span>').join("")}
      </div>
      <div class="post-actions">
        \${p.status === "pending" ? '<button class="btn-success btn-sm" onclick="publishPost(\\'' + p.id + '\\')">Publish</button>' : ""}
        \${p.status === "pending" || p.status === "draft" ? '<button class="btn-danger btn-sm" onclick="cancelPost(\\'' + p.id + '\\')">Cancel</button>' : ""}
      </div>
    </div>\`
  }).join("")
}

function statusIcon(status) {
  switch (status) {
    case "published": return "✅"
    case "cancelled": return "❌"
    case "pending": return "⏳"
    default: return "📝"
  }
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return mins + "m ago"
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return hrs + "h ago"
  return Math.floor(hrs / 24) + "d ago"
}

function escapeHtml(s) {
  const d = document.createElement("div")
  d.textContent = s
  return d.innerHTML
}

async function schedule() {
  const content = document.getElementById("content").value.trim()
  if (!content) { showToast("Please enter post content", "error"); return }
  const platforms = []
  if (document.getElementById("platform-twitter").checked) platforms.push("twitter")
  if (document.getElementById("platform-linkedin").checked) platforms.push("linkedin")
  if (platforms.length === 0) { showToast("Select at least one platform", "error"); return }
  const scheduledAt = document.getElementById("scheduledAt").value || null
  const btn = document.getElementById("btn-schedule")
  btn.disabled = true; btn.textContent = "Scheduling..."
  try {
    await api("/api/schedule", { method: "POST", body: JSON.stringify({ content, platforms, scheduledAt }) })
    showToast("Post scheduled successfully!", "success")
    document.getElementById("content").value = ""
    document.getElementById("scheduledAt").value = ""
    document.getElementById("char-count").textContent = "0"
    loadPosts()
  } catch (e) {
    showToast(e.message, "error")
  } finally {
    btn.disabled = false; btn.textContent = "Schedule Post"
  }
}

async function publishPost(id) {
  try {
    await api("/api/posts/" + id + "/publish", { method: "POST" })
    showToast("Post published!", "success")
    loadPosts()
  } catch (e) {
    showToast(e.message, "error")
  }
}

async function cancelPost(id) {
  try {
    await api("/api/posts/" + id + "/cancel", { method: "POST" })
    showToast("Post cancelled", "success")
    loadPosts()
  } catch (e) {
    showToast(e.message, "error")
  }
}

function showToast(msg, type) {
  const existing = document.querySelector(".toast")
  if (existing) existing.remove()
  const t = document.createElement("div")
  t.className = "toast toast-" + type
  t.textContent = msg
  document.body.appendChild(t)
  setTimeout(() => t.remove(), 3500)
}

document.getElementById("content").addEventListener("input", function() {
  document.getElementById("char-count").textContent = this.value.length
})

loadPosts()
</script>
</body>
</html>`

export {}

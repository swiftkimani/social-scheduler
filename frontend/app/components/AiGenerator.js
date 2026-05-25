"use client"

import { useState } from "react"

export default function AiGenerator({ onSelect, platform }) {
  const [topic, setTopic] = useState("")
  const [tone, setTone] = useState("casual")
  const [variations, setVariations] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedIdx, setSelectedIdx] = useState(null)

  async function generate() {
    if (!topic.trim()) return
    setLoading(true)
    setSelectedIdx(null)
    try {
      const res = await fetch("http://localhost:8080/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim(), tone, platform: platform || "twitter" }),
      })
      const data = await res.json()
      setVariations(data.variations || [])
    } catch {
      // fallback mock
      const mock = [
        `${topic} — here's what you need to know 🧵`,
        `Just dropped: ${topic} 🔥`,
        `Hot take on ${topic} 👇`,
        `Everything about ${topic} in one thread 🧵`,
      ]
      setVariations(mock)
    } finally {
      setLoading(false)
    }
  }

  function pick(idx) {
    setSelectedIdx(idx)
    onSelect?.(variations[idx])
  }

  return (
    <div className="ai-gen-panel">
      <h3><span className="sparkle">✨</span> AI Content Generator</h3>
      <div className="form-group">
        <label>Topic / Keyword</label>
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. AI trends 2026"
          onKeyDown={(e) => e.key === "Enter" && generate()}
        />
      </div>
      <div className="form-group">
        <label>Tone</label>
        <select value={tone} onChange={(e) => setTone(e.target.value)}>
          <option value="casual">Casual</option>
          <option value="professional">Professional</option>
          <option value="humorous">Humorous</option>
          <option value="inspirational">Inspirational</option>
        </select>
      </div>
      <button className="btn btn-primary btn-sm" onClick={generate} disabled={loading || !topic.trim()} style={{width:"100%",marginBottom:"0.75rem"}}>
        {loading ? "Generating..." : "Generate Ideas"}
      </button>
      {variations.map((v, i) => (
        <div
          key={i}
          className={`ai-variation ${selectedIdx === i ? "selected" : ""}`}
          onClick={() => pick(i)}
        >
          {v}
        </div>
      ))}
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"

export default function PatternInsights() {
  const [times, setTimes] = useState([])
  const [reason, setReason] = useState("")

  useEffect(() => {
    fetch("/api/ai/predict")
      .then((r) => r.json())
      .then((data) => {
        setTimes(data.bestTimes || [])
        setReason(data.reason || "")
      })
      .catch(() => {
        setTimes(["08:00", "12:00", "17:00", "20:00"])
        setReason("Based on general engagement patterns across your platforms.")
      })
  }, [])

  return (
    <div className="insights-panel">
      <h3>📈 Best Times to Post</h3>
      {times.map((t, i) => (
        <div key={t} className="insight-time">
          <span className="time">{t}</span>
          <div className="bar">
            <div className="bar-fill" style={{ width: `${100 - i * 20}%` }} />
          </div>
        </div>
      ))}
      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.75rem", lineHeight: 1.5 }}>{reason}</p>
    </div>
  )
}

import { NextResponse } from "next/server"

const API = process.env.GO_API || "http://localhost:8080"

export async function GET() {
  try {
    const res = await fetch(`${API}/api/stats`, { cache: "no-store" })
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ total: 0, pending: 0, published: 0, cancelled: 0, draft: 0 })
  }
}

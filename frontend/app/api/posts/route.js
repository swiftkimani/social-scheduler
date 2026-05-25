import { NextResponse } from "next/server"

const API = process.env.GO_API || "http://localhost:8080"

export async function GET() {
  try {
    const res = await fetch(`${API}/api/posts`, { cache: "no-store" })
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json([], { status: 200 })
  }
}

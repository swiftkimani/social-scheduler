import PostManager from "./components/PostManager"

const API = process.env.GO_API || "http://localhost:8080"

export default async function Home() {
  let posts = []
  try {
    const res = await fetch(`${API}/api/posts`, { cache: "no-store" })
    if (res.ok) posts = await res.json()
  } catch {}

  return <PostManager initialPosts={posts} />
}

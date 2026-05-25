import "dotenv/config"
import { Command } from "commander"
import { schedulePost, publishPost, listPosts, cancelPost, deletePost, publishAllPending } from "./scheduler.js"
import { Platform } from "./types.js"

const program = new Command()

program.name("social-scheduler").description("Social media scheduling agent").version("1.0.0")

program
  .command("schedule")
  .description("Schedule a new social media post")
  .argument("<content>", "Post content")
  .option("-p, --platforms <platforms>", "Comma-separated platforms (twitter,linkedin)", "twitter")
  .option("-a, --at <datetime>", "Schedule time (ISO format or 'tomorrow 9am')")
  .action((content: string, opts: { platforms: string; at?: string }) => {
    const platforms = opts.platforms.split(",").map((p: string) => p.trim() as Platform)
    const post = schedulePost({ content, platforms, scheduledAt: opts.at || null })
    console.log(`\n  ✅ Post scheduled`)
    console.log(`  ID:       ${post.id}`)
    console.log(`  Content:  ${post.content.slice(0, 60)}${post.content.length > 60 ? "..." : ""}`)
    console.log(`  Platforms: ${post.platforms.join(", ")}`)
    console.log(`  Status:   ${post.status}`)
    if (post.scheduledAt) console.log(`  At:       ${post.scheduledAt}`)
    console.log()
  })

program
  .command("post")
  .description("Publish a post immediately")
  .argument("<postId>", "Post ID to publish")
  .action(async (postId: string) => {
    const result = await publishPost(postId)
    if (!result) {
      console.log("  ❌ Post not found")
      return
    }
    if (result.status === "published") {
      console.log(`  ✅ Published successfully`)
    } else {
      console.log(`  ❌ Failed: ${result.error || "unknown error"}`)
    }
  })

program
  .command("publish-all")
  .description("Publish all pending posts whose scheduled time has passed")
  .action(async () => {
    const { published, failed } = await publishAllPending()
    console.log(`\n  ✅ ${published} published, ❌ ${failed} failed\n`)
  })

program
  .command("list")
  .description("List scheduled posts")
  .option("-s, --status <status>", "Filter by status (pending|published|cancelled|draft)")
  .action((opts: { status?: string }) => {
    const posts = listPosts(opts.status)
    if (posts.length === 0) {
      console.log("  📭 No posts found")
      return
    }
    console.log()
    for (const p of posts) {
      const icon = p.status === "published" ? "✅" : p.status === "cancelled" ? "❌" : p.status === "pending" ? "⏳" : "📝"
      console.log(`  ${icon} ${p.id.slice(0, 8)}... | ${p.status.padEnd(10)} | ${p.platforms.join(",").padEnd(12)} | ${p.content.slice(0, 50)}`)
    }
    console.log()
  })

program
  .command("cancel")
  .description("Cancel a scheduled post")
  .argument("<postId>", "Post ID to cancel")
  .action((postId: string) => {
    const result = cancelPost(postId)
    if (!result) {
      console.log("  ❌ Post not found")
      return
    }
    console.log(`  ❌ Cancelled: ${postId}`)
  })

program
  .command("delete")
  .description("Delete a post from the database")
  .argument("<postId>", "Post ID to delete")
  .action((postId: string) => {
    const result = deletePost(postId)
    console.log(result ? "  🗑️  Deleted" : "  ❌ Post not found")
  })

program.parse()

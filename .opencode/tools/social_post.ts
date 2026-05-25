import { tool } from "@opencode-ai/plugin"
import { execSync } from "node:child_process"
import path from "node:path"

const CLI = path.join(process.cwd(), "src/cli.ts")

export default tool({
  description: "Publish a scheduled post immediately",
  args: {
    postId: tool.schema.string().describe("The post ID to publish now"),
  },
  async execute(args) {
    try {
      const out = execSync(`npx tsx ${CLI} post ${args.postId}`, {
        encoding: "utf-8",
        timeout: 30000,
      })
      return out
    } catch (e: any) {
      return `Error: ${e.stderr || e.message}`
    }
  },
})

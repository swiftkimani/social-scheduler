import { tool } from "@opencode-ai/plugin"
import { execSync } from "node:child_process"
import path from "node:path"

const CLI = path.join(process.cwd(), "src/cli.ts")

export default tool({
  description: "Cancel a scheduled post before it publishes",
  args: {
    postId: tool.schema.string().describe("The post ID to cancel"),
  },
  async execute(args) {
    try {
      const out = execSync(`npx tsx ${CLI} cancel ${args.postId}`, {
        encoding: "utf-8",
        timeout: 10000,
      })
      return out
    } catch (e: any) {
      return `Error: ${e.stderr || e.message}`
    }
  },
})

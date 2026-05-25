import { tool } from "@opencode-ai/plugin"
import { execSync } from "node:child_process"
import path from "node:path"

const CLI = path.join(process.cwd(), "src/cli.ts")

export default tool({
  description: "List all scheduled/published/cancelled posts",
  args: {
    status: tool.schema.string().optional().describe("Filter by status: pending, published, cancelled, draft"),
  },
  async execute(args) {
    try {
      const cmd = args.status ? `list --status ${args.status}` : "list"
      const out = execSync(`npx tsx ${CLI} ${cmd}`, {
        encoding: "utf-8",
        timeout: 10000,
      })
      return out
    } catch (e: any) {
      return `Error: ${e.stderr || e.message}`
    }
  },
})

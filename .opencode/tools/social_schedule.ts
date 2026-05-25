import { tool } from "@opencode-ai/plugin"
import { execSync } from "node:child_process"
import path from "node:path"

const CLI = path.join(process.cwd(), "src/cli.ts")

function runCLI(args: string): string {
  try {
    return execSync(`npx tsx ${CLI} ${args}`, {
      encoding: "utf-8",
      timeout: 15000,
    })
  } catch (e: any) {
    return `Error: ${e.stderr || e.message}`
  }
}

export default tool({
  description: "Schedule a new social media post for future publishing",
  args: {
    content: tool.schema.string().describe("The post content/text"),
    platforms: tool.schema.string().describe("Comma-separated platforms: twitter,linkedin").default("twitter"),
    scheduledAt: tool.schema.string().optional().describe("ISO datetime string for when to post (e.g. 2026-06-01T09:00:00Z)"),
  },
  async execute(args) {
    let cmd = `schedule "${args.content.replace(/"/g, '\\"')}" --platforms ${args.platforms}`
    if (args.scheduledAt) cmd += ` --at "${args.scheduledAt}"`
    return runCLI(cmd)
  },
})

# Social Scheduler 📡

Schedule and publish social media posts across **Twitter/X** and **LinkedIn** — from the terminal, a web UI, or via OpenCode.

## Architecture

```
┌─────────────────────────────────────────────────┐
│  🌐 Next.js UI (:3000)                          │
│  (glassmorphism design, real-time updates)      │
└────────────────┬────────────────────────────────┘
                 │ proxy
┌────────────────▼────────────────────────────────┐
│  🦫 Go API Server (:8080)                       │
│  (REST API, JSON file storage)                   │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│  💾 data/schedule.json                          │
│  (shared with Node.js CLI)                      │
└─────────────────────────────────────────────────┘
```

Also available as a Node.js CLI and OpenCode subagent.

## Quick Start

### Run the Web UI

```bash
# Terminal 1 — Go backend
cd backend && go run .

# Terminal 2 — Next.js frontend
cd frontend && npm run dev
```

Open **http://localhost:3000** ✨

### Run via CLI

```bash
npm install
npx tsx src/cli.ts schedule "Hello world" --platforms twitter --at "tomorrow 9am"
npx tsx src/cli.ts list
npx tsx src/cli.ts post <post-id>
```

### Test without API keys

```bash
export USE_MOCK_CLIENTS=true
```

### Use with OpenCode

The project comes with an OpenCode subagent and custom tools pre-configured:

```bash
cd social-scheduler-agent
opencode
```

Inside OpenCode, use the agent:

```
@social-scheduler Schedule a tweet promoting our new blog post for tomorrow at 9am
```

Or use custom tools directly:

```
@social_schedule Schedule "Check out our new feature!" for twitter and linkedin
@social_list Show me all pending posts
```

## OpenCode Integration

### Subagent (`@social-scheduler`)

Defined in `.opencode/agents/social-scheduler.md`. The agent:
- Helps craft post content
- Suggests optimal posting times
- Warns about character limits (280 for Twitter, 3000 for LinkedIn)
- Manages your post queue

### Custom Tools (`.opencode/tools/`)

| Tool | Description |
|---|---|
| `social_schedule` | Schedule a new post |
| `social_post` | Publish a post immediately |
| `social_list` | List posts (filter by status) |
| `social_cancel` | Cancel a pending post |

## API Clients

### Twitter/X (v2)
- 280 character limit
- Uses OAuth 2.0 Bearer Token
- Requires: `TWITTER_ACCESS_TOKEN`

### LinkedIn
- 3000 character limit
- Uses OAuth 2.0 access token
- Requires: `LINKEDIN_ACCESS_TOKEN` + `LINKEDIN_USER_URN`

### Mock Mode
Set `USE_MOCK_CLIENTS=true` to test without real API credentials. All "posts" succeed silently with fake IDs.

## Data Storage

All posts are stored in `data/schedule.json` (plain JSON). No database needed.

```json
{
  "posts": [
    {
      "id": "uuid",
      "content": "Post text",
      "platforms": ["twitter", "linkedin"],
      "status": "pending",
      "scheduledAt": "2026-06-01T09:00:00.000Z",
      "createdAt": "...",
      "error": null
    }
  ]
}
```

## Feasibility

| Feature | Status | Effort |
|---|---|---|
| CLI scheduling | ✅ Built | ~2 hrs |
| OpenCode subagent | ✅ Built | ~30 min |
| Custom tools | ✅ Built | ~1 hr |
| Twitter/X posting | ✅ Built | API key needed |
| LinkedIn posting | ✅ Built | API key needed |
| Image/media support | ❌ Not yet | Medium effort |
| Multi-account | ❌ Not yet | Medium effort |
| AI content generation | ❌ Not yet | Low effort |
| Hashtag suggestions | ❌ Not yet | Low effort |

## Extending

Add a new platform in `src/platforms/index.ts`:

```typescript
class BlueskyClient implements PlatformClient {
  name: Platform = "bluesky"
  async post(content: string) {
    // implement Bluesky API call
  }
}
```

Then register it in the `getPlatformClient` factory.

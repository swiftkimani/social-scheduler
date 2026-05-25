# Social Scheduler Agent

An AI-powered social media scheduling agent that works as an **OpenCode subagent** and a **standalone CLI tool**. Schedule posts for Twitter/X and LinkedIn.

## Architecture

```
┌─────────────────────────────────────────────────┐
│  You (in OpenCode)                              │
│    @social-scheduler "Schedule a post..."       │
└──────────────┬──────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────┐
│  .opencode/agents/social-scheduler.md           │
│  (subagent definition — prompt + permissions)   │
└──────────────┬──────────────────────────────────┘
               │ calls
┌──────────────▼──────────────────────────────────┐
│  .opencode/tools/social_*.ts                    │
│  (custom tools — schedule, post, list, cancel)  │
└──────────────┬──────────────────────────────────┘
               │ runs
┌──────────────▼──────────────────────────────────┐
│  src/cli.ts                                     │
│  (commander-based CLI)                          │
└──────────────┬──────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────┐
│  src/scheduler.ts  ◄── src/storage.ts           │
│  (engine)               (JSON file store)       │
│  src/platforms/index.ts                         │
│  (Twitter/X API + LinkedIn API clients)         │
└─────────────────────────────────────────────────┘
```

## Quick Start

### 1. Install dependencies

```bash
cd social-scheduler-agent
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in at least one platform's credentials. **To test without real APIs:**

```bash
export USE_MOCK_CLIENTS=true
```

### 3. Try the CLI

```bash
# Schedule a post
npx tsx src/cli.ts schedule "Hello world from my scheduler!" --platforms twitter --at "tomorrow 9am"

# List all posts
npx tsx src/cli.ts list

# List pending posts only
npx tsx src/cli.ts list --status pending

# Publish immediately
npx tsx src/cli.ts post <post-id>

# Cancel a scheduled post
npx tsx src/cli.ts cancel <post-id>

# Publish all due posts
npx tsx src/cli.ts publish-all
```

### 4. Use with OpenCode

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

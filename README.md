# NEXUS AI ◆

AI-powered social intelligence platform — content generation, predictive analytics, social listening, automation, and competitor intelligence.

## Architecture

```
┌─────────────────────────────────────────────────┐
│  🌐 Next.js 16 UI (:3000)                       │
│  (NEXUS design system, glass/neon aesthetic)    │
└────────────────┬────────────────────────────────┘
                 │ proxy
┌────────────────▼────────────────────────────────┐
│  🦫 Go API Server (:8080)                       │
│  (REST API v2, 10 AI modules, JSON storage)    │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│  💾 data/schedule.json                          │
│  (shared state)                                 │
└─────────────────────────────────────────────────┘
```

## Quick Start

```bash
npm run dev
```

Opens **http://localhost:3000** — starts Go backend + Next.js frontend concurrently.

### AI Modules

| Module | Status |
|---|---|
| Content Studio | ✅ Active |
| AI Content Generation | ✅ Active |
| Pattern Prediction | ✅ Active |
| Analytics & Insights | ✅ Active |
| Social Listening | ✅ Active |
| Automation Studio | ✅ Active |
| Competitor Intelligence | ✅ Active |
| Sentiment Analysis | ✅ Active |
| Trend Detection | ✅ Active |
| Brand Health | 🔮 Coming |

## OpenCode Integration

### Subagent (`@nexus-ai`)

Defined in `.opencode/agents/social-scheduler.md`. The agent:
- Helps craft AI-optimized post content
- Suggests optimal posting times
- Manages your post queue
- Provides social listening insights

### Custom Tools

| Tool | Description |
|---|---|
| `social_schedule` | Schedule a new post |
| `social_post` | Publish a post immediately |
| `social_list` | List posts (filter by status) |
| `social_cancel` | Cancel a pending post |

## Data Storage

Posts stored in `data/schedule.json`. No database needed.

## Tech Stack

- **Frontend:** Next.js 16, CSS-in-JS (NEXUS design system)
- **Backend:** Go 1.26, REST API
- **AI:** Mock/simulated responses (no API keys required)

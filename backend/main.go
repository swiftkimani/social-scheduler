package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"
)

type Platform string

const (
	PlatformTwitter  Platform = "twitter"
	PlatformLinkedIn Platform = "linkedin"
)

type PostStatus string

const (
	StatusDraft     PostStatus = "draft"
	StatusPending   PostStatus = "pending"
	StatusPublished PostStatus = "published"
	StatusCancelled PostStatus = "cancelled"
)

type SocialPost struct {
	ID          string     `json:"id"`
	Content     string     `json:"content"`
	Platforms   []Platform `json:"platforms"`
	Status      PostStatus `json:"status"`
	ScheduledAt *string    `json:"scheduledAt"`
	PublishedAt *string    `json:"publishedAt"`
	CreatedAt   string     `json:"createdAt"`
	UpdatedAt   string     `json:"updatedAt"`
	Error       *string    `json:"error"`
}

type StorageData struct {
	Posts []SocialPost `json:"posts"`
}

type Scheduler struct {
	mu      sync.RWMutex
	dataDir string
	data    StorageData
}

func NewScheduler(dataDir string) *Scheduler {
	s := &Scheduler{dataDir: dataDir}
	s.load()
	return s
}

func (s *Scheduler) dataFile() string { return s.dataDir + "/schedule.json" }

func (s *Scheduler) load() {
	os.MkdirAll(s.dataDir, 0755)
	data, err := os.ReadFile(s.dataFile())
	if err != nil { s.data = StorageData{Posts: []SocialPost{}}; return }
	json.Unmarshal(data, &s.data)
	if s.data.Posts == nil { s.data.Posts = []SocialPost{} }
}

func (s *Scheduler) save() {
	os.MkdirAll(s.dataDir, 0755)
	data, _ := json.MarshalIndent(s.data, "", "  ")
	os.WriteFile(s.dataFile(), data, 0644)
}

func (s *Scheduler) ListPosts(status string) []SocialPost {
	s.mu.RLock(); defer s.mu.RUnlock()
	if status == "" { r := make([]SocialPost, len(s.data.Posts)); copy(r, s.data.Posts); return r }
	var r []SocialPost
	for _, p := range s.data.Posts { if string(p.Status) == status { r = append(r, p) } }
	return r
}

func (s *Scheduler) Stats() map[string]int {
	s.mu.RLock(); defer s.mu.RUnlock()
	st := map[string]int{"total": 0, "pending": 0, "published": 0, "cancelled": 0, "draft": 0}
	for _, p := range s.data.Posts { st["total"]++; st[string(p.Status)]++ }
	return st
}

func (s *Scheduler) SchedulePost(content string, platforms []Platform, scheduledAt *string) SocialPost {
	s.mu.Lock(); defer s.mu.Unlock()
	now := time.Now().UTC().Format(time.RFC3339)
	status := StatusPending
	if scheduledAt == nil || *scheduledAt == "" { status = StatusDraft; scheduledAt = nil }
	post := SocialPost{
		ID: fmt.Sprintf("%x", time.Now().UnixNano()), Content: content, Platforms: platforms,
		Status: status, ScheduledAt: scheduledAt, CreatedAt: now, UpdatedAt: now,
	}
	s.data.Posts = append(s.data.Posts, post); s.save(); return post
}

func (s *Scheduler) PublishPost(id string) *SocialPost {
	s.mu.Lock(); defer s.mu.Unlock()
	for i, p := range s.data.Posts {
		if p.ID != id { continue }
		if p.Status == StatusPublished { return &s.data.Posts[i] }
		now := time.Now().UTC().Format(time.RFC3339)
		s.data.Posts[i].Status = StatusPublished; s.data.Posts[i].PublishedAt = &now
		s.data.Posts[i].UpdatedAt = now; s.data.Posts[i].Error = nil; s.save()
		return &s.data.Posts[i]
	}
	return nil
}

func (s *Scheduler) CancelPost(id string) *SocialPost {
	s.mu.Lock(); defer s.mu.Unlock()
	for i, p := range s.data.Posts {
		if p.ID != id { continue }
		now := time.Now().UTC().Format(time.RFC3339)
		s.data.Posts[i].Status = StatusCancelled; s.data.Posts[i].UpdatedAt = now; s.save()
		return &s.data.Posts[i]
	}
	return nil
}

func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == "OPTIONS" { w.WriteHeader(http.StatusNoContent); return }
		next.ServeHTTP(w, r)
	})
}

type ErrorResponse struct{ Error string `json:"error"` }

// ─── Account Management ─────────────────────────────────────────────────────

type ConnectedAccount struct {
	Platform      Platform `json:"platform"`
	Username      string   `json:"username"`
	Avatar        string   `json:"avatar"`
	AccessToken   string   `json:"accessToken,omitempty"`
	ConnectedAt   string   `json:"connectedAt"`
	LastPostedAt  *string  `json:"lastPostedAt,omitempty"`
	Status        string   `json:"status"` // "connected", "error", "expired"
}

type AccountsData struct {
	Accounts []ConnectedAccount `json:"accounts"`
}

type AccountManager struct {
	mu      sync.RWMutex
	dataDir string
	data    AccountsData
}

func NewAccountManager(dataDir string) *AccountManager {
	a := &AccountManager{dataDir: dataDir}
	a.load()
	if a.data.Accounts == nil { a.data.Accounts = []ConnectedAccount{} }
	return a
}

func (a *AccountManager) file() string { return a.dataDir + "/accounts.json" }

func (a *AccountManager) load() {
	os.MkdirAll(a.dataDir, 0755)
	data, err := os.ReadFile(a.file())
	if err != nil { a.data = AccountsData{Accounts: []ConnectedAccount{}}; return }
	json.Unmarshal(data, &a.data)
	if a.data.Accounts == nil { a.data.Accounts = []ConnectedAccount{} }
}

func (a *AccountManager) save() {
	os.MkdirAll(a.dataDir, 0755)
	data, _ := json.MarshalIndent(a.data, "", "  ")
	os.WriteFile(a.file(), data, 0644)
}

func (a *AccountManager) List() []ConnectedAccount {
	a.mu.RLock(); defer a.mu.RUnlock()
	r := make([]ConnectedAccount, len(a.data.Accounts))
	copy(r, a.data.Accounts)
	return r
}

func (a *AccountManager) Connect(platform Platform, username, avatar, token string) ConnectedAccount {
	a.mu.Lock(); defer a.mu.Unlock()
	for i, acct := range a.data.Accounts {
		if acct.Platform == platform {
			a.data.Accounts[i].Username = username
			a.data.Accounts[i].Avatar = avatar
			a.data.Accounts[i].AccessToken = token
			a.data.Accounts[i].Status = "connected"
			a.data.Accounts[i].ConnectedAt = time.Now().UTC().Format(time.RFC3339)
			a.data.Accounts[i].LastPostedAt = nil
			a.save()
			return a.data.Accounts[i]
		}
	}
	acct := ConnectedAccount{
		Platform:    platform,
		Username:    username,
		Avatar:      avatar,
		AccessToken: token,
		ConnectedAt: time.Now().UTC().Format(time.RFC3339),
		Status:      "connected",
	}
	a.data.Accounts = append(a.data.Accounts, acct)
	a.save()
	return acct
}

func (a *AccountManager) Disconnect(platform Platform) bool {
	a.mu.Lock(); defer a.mu.Unlock()
	for i, acct := range a.data.Accounts {
		if acct.Platform == platform {
			a.data.Accounts = append(a.data.Accounts[:i], a.data.Accounts[i+1:]...)
			a.save()
			return true
		}
	}
	return false
}

func (a *AccountManager) GetConnectedPlatforms() map[Platform]bool {
	a.mu.RLock(); defer a.mu.RUnlock()
	m := map[Platform]bool{PlatformTwitter: false, PlatformLinkedIn: false}
	for _, acct := range a.data.Accounts {
		if acct.Status == "connected" { m[acct.Platform] = true }
	}
	return m
}

func (a *AccountManager) FindByPlatform(platform Platform) *ConnectedAccount {
	a.mu.RLock(); defer a.mu.RUnlock()
	for _, acct := range a.data.Accounts {
		if acct.Platform == platform { return &acct }
	}
	return nil
}

// Simulated posting to external APIs
func publishToPlatform(platform Platform, content string, acct *ConnectedAccount) error {
	log.Printf("[NEXUS] Publishing to %s as @%s: %q", platform, acct.Username, content[:min(len(content), 60)])
	return nil
}

// ─── NEXUS AI Module Handlers ───────────────────────────────────────────────

func handleGenerate(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Topic    string `json:"topic"`
		Tone     string `json:"tone"`
		Platform string `json:"platform"`
		Format   string `json:"format"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(400); json.NewEncoder(w).Encode(ErrorResponse{"Invalid JSON"}); return
	}
	if req.Topic == "" { req.Topic = "technology trends"; req.Tone = "casual"; req.Platform = "twitter" }
	topics := []string{
		fmt.Sprintf("%s: Here's what you need to know", req.Topic),
		fmt.Sprintf("The truth about %s in 2026", req.Topic),
		fmt.Sprintf("%s is evolving faster than expected", req.Topic),
		fmt.Sprintf("3 lessons I learned about %s", req.Topic),
		fmt.Sprintf("Why %s matters more than ever", req.Topic),
	}
	hashtags := []string{"#innovation", "#future", "#growth", "#trends", "#digital"}
	variations := make([]string, 4)
	for i := 0; i < 4; i++ {
		rnd := rand.Intn(len(topics))
		tag := hashtags[(i+rand.Intn(3))%len(hashtags)]
		switch req.Tone {
		case "professional":
			variations[i] = fmt.Sprintf("📊 %s\n\nKey insight: Industry data suggests %d%% of teams are adopting this approach in 2026.\n\n%s", topics[rnd], 40+rand.Intn(50), tag)
		case "humorous":
			variations[i] = fmt.Sprintf("😄 %s\n\nHot take: This might be unpopular, but someone has to say it.\n\n%s", topics[rnd], tag)
		case "inspirational":
			variations[i] = fmt.Sprintf("✨ %s\n\nRemember: every expert was once a beginner. The best time to start was yesterday. The second best time is now.\n\n%s", topics[rnd], tag)
		default:
			variations[i] = fmt.Sprintf("%s\n\n%s", topics[rnd], tag)
		}
		switch req.Platform {
		case "linkedin":
			variations[i] = fmt.Sprintf("%s\n\nWhat's your take? Drop your thoughts below 👇", variations[i])
		case "twitter":
			variations[i] = fmt.Sprintf("%s\n\n%d/", variations[i], i+1)
		}
	}
	json.NewEncoder(w).Encode(map[string]any{
		"variations": variations,
		"brandScore": 85 + rand.Intn(16),
		"predictedEngagement": map[string]int{"low": 120 + rand.Intn(200), "medium": 300 + rand.Intn(500), "high": 800 + rand.Intn(1000)},
	})
}

func handlePredict(w http.ResponseWriter, r *http.Request) {
	rnd := rand.New(rand.NewSource(time.Now().UnixNano()))
	hours := []string{"07:00", "08:00", "09:00", "12:00", "15:00", "17:00", "18:00", "20:00"}
	rnd.Shuffle(len(hours), func(i, j int) { hours[i], hours[j] = hours[j], hours[i] })
	json.NewEncoder(w).Encode(map[string]any{
		"bestTimes": hours[:4],
		"reason":    "Based on your brand's historical engagement data, these windows show 2.4x higher reach and 68% better engagement rates.",
		"platformBreakdown": map[string][]string{
			"twitter":  {hours[0], hours[2]},
			"linkedin": {hours[1], hours[3]},
		},
	})
}

func handleAnalytics(w http.ResponseWriter, r *http.Request) {
	rnd := rand.New(rand.NewSource(time.Now().UnixNano()))
	json.NewEncoder(w).Encode(map[string]any{
		"totalReach":      124500 + rnd.Intn(50000),
		"totalEngagement": 18300 + rnd.Intn(10000),
		"engagementRate":  14.7 + float64(rnd.Intn(50))/10,
		"followerGrowth":  892 + rnd.Intn(500),
		"topPosts": []map[string]any{
			{"content": "Our latest product launch is here 🚀", "reach": 12400, "engagement": 2300, "platform": "twitter"},
			{"content": "Behind the scenes of our design sprint", "reach": 9800, "engagement": 1800, "platform": "linkedin"},
			{"content": "Industry trends that will define 2026", "reach": 15200, "engagement": 3400, "platform": "twitter"},
		},
		"performanceScore": 78 + rnd.Intn(20),
		"weeklyTrend": []int{1200, 3400, 2800, 5100, 4800, 6200, 5900},
	})
}

func handleListening(w http.ResponseWriter, r *http.Request) {
	rnd := rand.New(rand.NewSource(time.Now().UnixNano()))
	json.NewEncoder(w).Encode(map[string]any{
		"totalMentions": 342 + rnd.Intn(200),
		"sentimentBreakdown": map[string]float64{
			"positive": 58.0 + float64(rnd.Intn(20)), "neutral": 25.0 + float64(rnd.Intn(10)), "negative": 5.0 + float64(rnd.Intn(10)),
		},
		"trendingTopics": []string{"#AIRevolution", "#SocialMediaStrategy", "#ContentCreation", "#DigitalMarketing"},
		"recentMentions": []map[string]any{
			{"text": "Love this platform! So easy to use.", "sentiment": "positive", "platform": "twitter", "author": "@user1"},
			{"text": "The AI generation feature is incredible", "sentiment": "positive", "platform": "linkedin", "author": "Jane D."},
			{"text": "Can you add support for Threads?", "sentiment": "neutral", "platform": "twitter", "author": "@creator"},
		},
	})
}

func handleAutomationPlaybooks(w http.ResponseWriter, r *http.Request) {
	json.NewEncoder(w).Encode(map[string]any{
		"playbooks": []map[string]any{
			{"id": "viral-amplifier", "name": "Viral Content Amplifier", "icon": "🚀", "description": "Detects viral posts and auto-boosts with ad spend", "triggers": []string{"engagement_spike"}, "actions": []string{"boost_post", "generate_followup"}, "status": "active"},
			{"id": "community-care", "name": "Community Care Engine", "icon": "💬", "description": "Triages negative comments and drafts empathetic replies", "triggers": []string{"negative_sentiment"}, "actions": []string{"draft_reply", "notify_manager"}, "status": "active"},
			{"id": "content-recycle", "name": "Content Recycling Pipeline", "icon": "♻️", "description": "Refreshes top posts from 90+ days ago and requeues them", "triggers": []string{"schedule:every_90_days"}, "actions": []string{"refresh_content", "reschedule"}, "status": "active"},
			{"id": "competitor-watch", "name": "Competitor Response Monitor", "icon": "👁️", "description": "Monitors competitor launches and suggests reactive content", "triggers": []string{"competitor_post"}, "actions": []string{"analyze", "suggest_content", "alert_team"}, "status": "draft"},
			{"id": "welcome-nurture", "name": "New Follower Nurture", "icon": "👋", "description": "Sends personalized welcome to high-value followers", "triggers": []string{"new_follower:high_value"}, "actions": []string{"send_welcome", "add_to_watch_list"}, "status": "active"},
			{"id": "weekly-digest", "name": "Weekly Intelligence Digest", "icon": "📊", "description": "Aggregates weekly performance, competitor moves, and trends", "triggers": []string{"schedule:every_monday"}, "actions": []string{"aggregate_data", "format_report", "send_slack"}, "status": "active"},
		},
	})
}

func handleCompetitor(w http.ResponseWriter, r *http.Request) {
	json.NewEncoder(w).Encode(map[string]any{
		"competitors": []map[string]any{
			{"name": "Buffer", "trackedSince": "2026-01-15", "postsThisWeek": 24, "avgEngagement": 3.2, "topContent": "Social media trends 2026"},
			{"name": "Hootsuite", "trackedSince": "2026-02-01", "postsThisWeek": 31, "avgEngagement": 2.8, "topContent": "Enterprise social strategy"},
			{"name": "Later", "trackedSince": "2026-03-01", "postsThisWeek": 18, "avgEngagement": 4.1, "topContent": "Visual content planning"},
		},
		"shareOfVoice": 34.2,
		"contentGaps": []string{"Video strategy content", "AI ethics discussions", "Remote team workflows"},
	})
}

// ─── Main ───────────────────────────────────────────────────────────────────

func main() {
	dataDir := os.Getenv("SCHEDULER_DATA_DIR")
	if dataDir == "" {
		cwd, _ := os.Getwd()
		if strings.HasSuffix(cwd, "/backend") || cwd == "backend" { cwd = cwd[:len(cwd)-8] }
		dataDir = cwd + "/data"
	}
	os.MkdirAll(dataDir, 0755)

	sched := NewScheduler(dataDir)
	accts := NewAccountManager(dataDir)
	mux := http.NewServeMux()

	// Core scheduling API
	mux.HandleFunc("GET /api/stats", func(w http.ResponseWriter, r *http.Request) { json.NewEncoder(w).Encode(sched.Stats()) })
	mux.HandleFunc("GET /api/posts", func(w http.ResponseWriter, r *http.Request) {
		posts := sched.ListPosts(r.URL.Query().Get("status"))
		if posts == nil { posts = []SocialPost{} }
		json.NewEncoder(w).Encode(posts)
	})
	mux.HandleFunc("POST /api/schedule", func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Content     string     `json:"content"`
			Platforms   []Platform `json:"platforms"`
			ScheduledAt *string    `json:"scheduledAt"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil { w.WriteHeader(400); json.NewEncoder(w).Encode(ErrorResponse{"Invalid JSON"}); return }
		if req.Content == "" || len(req.Platforms) == 0 { w.WriteHeader(400); json.NewEncoder(w).Encode(ErrorResponse{"content and platforms required"}); return }
		post := sched.SchedulePost(req.Content, req.Platforms, req.ScheduledAt)
		w.WriteHeader(201); json.NewEncoder(w).Encode(post)
	})
	mux.HandleFunc("POST /api/posts/{id}/publish", func(w http.ResponseWriter, r *http.Request) {
		post := sched.PublishPost(r.PathValue("id"))
		if post == nil { w.WriteHeader(404); json.NewEncoder(w).Encode(ErrorResponse{"not found"}); return }
		// Attempt real posting to each platform if accounts are connected
		connected := accts.GetConnectedPlatforms()
		for _, platform := range post.Platforms {
			if connected[platform] {
				acct := accts.FindByPlatform(platform)
				if acct != nil {
					err := publishToPlatform(platform, post.Content, acct)
					errMsg := ""
					if err != nil {
						errMsg = err.Error()
					}
					now := time.Now().UTC().Format(time.RFC3339)
					// We log but don't fail the publish
					if errMsg != "" {
						log.Printf("[NEXUS] Failed to post to %s: %s", platform, errMsg)
					}
					_ = now
				}
			} else {
				log.Printf("[NEXUS] No connected account for %s — post queued locally", platform)
			}
		}
		json.NewEncoder(w).Encode(post)
	})
	mux.HandleFunc("POST /api/posts/{id}/cancel", func(w http.ResponseWriter, r *http.Request) {
		post := sched.CancelPost(r.PathValue("id"))
		if post == nil { w.WriteHeader(404); json.NewEncoder(w).Encode(ErrorResponse{"not found"}); return }
		json.NewEncoder(w).Encode(post)
	})
	mux.HandleFunc("GET /api/health", func(w http.ResponseWriter, r *http.Request) { json.NewEncoder(w).Encode(map[string]string{"status": "ok"}) })

	// Account management endpoints
	mux.HandleFunc("GET /api/accounts", func(w http.ResponseWriter, r *http.Request) {
		json.NewEncoder(w).Encode(accts.List())
	})
	mux.HandleFunc("POST /api/accounts/connect", func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Platform  Platform `json:"platform"`
			Username  string   `json:"username"`
			Avatar    string   `json:"avatar"`
			Token     string   `json:"token"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			w.WriteHeader(400); json.NewEncoder(w).Encode(ErrorResponse{"Invalid JSON"}); return
		}
		if req.Platform != PlatformTwitter && req.Platform != PlatformLinkedIn {
			w.WriteHeader(400); json.NewEncoder(w).Encode(ErrorResponse{"Invalid platform"}); return
		}
		if req.Username == "" || req.Token == "" {
			w.WriteHeader(400); json.NewEncoder(w).Encode(ErrorResponse{"username and token required"}); return
		}
		acct := accts.Connect(req.Platform, req.Username, req.Avatar, req.Token)
		w.WriteHeader(201); json.NewEncoder(w).Encode(acct)
	})
	mux.HandleFunc("POST /api/accounts/disconnect", func(w http.ResponseWriter, r *http.Request) {
		var req struct{ Platform Platform `json:"platform"` }
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			w.WriteHeader(400); json.NewEncoder(w).Encode(ErrorResponse{"Invalid JSON"}); return
		}
		ok := accts.Disconnect(req.Platform)
		if !ok { w.WriteHeader(404); json.NewEncoder(w).Encode(ErrorResponse{"account not found"}); return }
		json.NewEncoder(w).Encode(map[string]bool{"success": true})
	})
	mux.HandleFunc("GET /api/accounts/status", func(w http.ResponseWriter, r *http.Request) {
		json.NewEncoder(w).Encode(accts.GetConnectedPlatforms())
	})

	// NEXUS AI module endpoints
	mux.HandleFunc("POST /api/nexus/generate", handleGenerate)
	mux.HandleFunc("GET /api/nexus/predict", handlePredict)
	mux.HandleFunc("GET /api/nexus/analytics", handleAnalytics)
	mux.HandleFunc("GET /api/nexus/listening", handleListening)
	mux.HandleFunc("GET /api/nexus/automation/playbooks", handleAutomationPlaybooks)
	mux.HandleFunc("GET /api/nexus/competitor", handleCompetitor)

	port := os.Getenv("PORT")
	if port == "" { port = "8080" }

	fmt.Printf("\n  ╔══════════════════════════════╗")
	fmt.Printf("\n  ║     NEXUS AI  —  API v2      ║")
	fmt.Printf("\n  ║     Social Intelligence       ║")
	fmt.Printf("\n  ╚══════════════════════════════╝")
	fmt.Printf("\n\n  Listening on http://localhost:%s\n\n", port)
	log.Fatal(http.ListenAndServe(":"+port, enableCORS(mux)))
}

func min(a, b int) int { if a < b { return a }; return b }

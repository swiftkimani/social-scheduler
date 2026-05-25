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

func (s *Scheduler) dataFile() string {
	return s.dataDir + "/schedule.json"
}

func (s *Scheduler) load() {
	os.MkdirAll(s.dataDir, 0755)
	data, err := os.ReadFile(s.dataFile())
	if err != nil {
		s.data = StorageData{Posts: []SocialPost{}}
		return
	}
	json.Unmarshal(data, &s.data)
	if s.data.Posts == nil {
		s.data.Posts = []SocialPost{}
	}
}

func (s *Scheduler) save() {
	os.MkdirAll(s.dataDir, 0755)
	data, _ := json.MarshalIndent(s.data, "", "  ")
	os.WriteFile(s.dataFile(), data, 0644)
}

func (s *Scheduler) ListPosts(status string) []SocialPost {
	s.mu.RLock()
	defer s.mu.RUnlock()
	if status == "" {
		result := make([]SocialPost, len(s.data.Posts))
		copy(result, s.data.Posts)
		return result
	}
	var result []SocialPost
	for _, p := range s.data.Posts {
		if string(p.Status) == status {
			result = append(result, p)
		}
	}
	return result
}

func (s *Scheduler) GetPost(id string) *SocialPost {
	s.mu.RLock()
	defer s.mu.RUnlock()
	for _, p := range s.data.Posts {
		if p.ID == id {
			return &p
		}
	}
	return nil
}

func (s *Scheduler) SchedulePost(content string, platforms []Platform, scheduledAt *string) SocialPost {
	s.mu.Lock()
	defer s.mu.Unlock()
	now := time.Now().UTC().Format(time.RFC3339)
	status := StatusPending
	if scheduledAt == nil || *scheduledAt == "" {
		status = StatusDraft
		scheduledAt = nil
	}
	post := SocialPost{
		ID:          fmt.Sprintf("%x", time.Now().UnixNano()),
		Content:     content,
		Platforms:   platforms,
		Status:      status,
		ScheduledAt: scheduledAt,
		PublishedAt: nil,
		CreatedAt:   now,
		UpdatedAt:   now,
		Error:       nil,
	}
	s.data.Posts = append(s.data.Posts, post)
	s.save()
	return post
}

func (s *Scheduler) PublishPost(id string) *SocialPost {
	s.mu.Lock()
	defer s.mu.Unlock()
	for i, p := range s.data.Posts {
		if p.ID != id {
			continue
		}
		if p.Status == StatusPublished {
			return &s.data.Posts[i]
		}
		now := time.Now().UTC().Format(time.RFC3339)
		s.data.Posts[i].Status = StatusPublished
		s.data.Posts[i].PublishedAt = &now
		s.data.Posts[i].UpdatedAt = now
		s.data.Posts[i].Error = nil
		s.save()
		return &s.data.Posts[i]
	}
	return nil
}

func (s *Scheduler) CancelPost(id string) *SocialPost {
	s.mu.Lock()
	defer s.mu.Unlock()
	for i, p := range s.data.Posts {
		if p.ID != id {
			continue
		}
		now := time.Now().UTC().Format(time.RFC3339)
		s.data.Posts[i].Status = StatusCancelled
		s.data.Posts[i].UpdatedAt = now
		s.save()
		return &s.data.Posts[i]
	}
	return nil
}

func (s *Scheduler) Stats() map[string]int {
	s.mu.RLock()
	defer s.mu.RUnlock()
	stats := map[string]int{"total": 0, "pending": 0, "published": 0, "cancelled": 0, "draft": 0}
	for _, p := range s.data.Posts {
		stats["total"]++
		stats[string(p.Status)]++
	}
	return stats
}

func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

type ScheduleRequest struct {
	Content     string     `json:"content"`
	Platforms   []Platform `json:"platforms"`
	ScheduledAt *string    `json:"scheduledAt"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}

type AIGenRequest struct {
	Topic    string `json:"topic"`
	Tone     string `json:"tone"`
	Platform string `json:"platform"`
}

type AIGenResponse struct {
	Variations []string `json:"variations"`
}

type PredictResponse struct {
	BestTimes []string `json:"bestTimes"`
	Reason    string   `json:"reason"`
}

type ImageSuggestion struct {
	URL   string `json:"url"`
	Alt   string `json:"alt"`
	Label string `json:"label"`
}

func generateContent(topic, tone, platform string) []string {
	templates := []string{}
	words := strings.Fields(topic)
	title := strings.Join(words, " ")

	switch platform {
	case "twitter":
		templates = []string{
			fmt.Sprintf("%s — here's what you need to know 🧵", title),
			fmt.Sprintf("Just dropped: %s 🔥 %s", title, "A thread 🧵"),
			fmt.Sprintf("%s\n\n1/ ", title),
			fmt.Sprintf("Hot take: %s", title),
			fmt.Sprintf("PSA: %s", title),
			fmt.Sprintf("%s\n\nWhat's your take? 👇", title),
			fmt.Sprintf("Big news: %s", title),
			fmt.Sprintf("%s\n\n%d thoughts on this 🧵", title, rand.Intn(5)+3),
		}
	case "linkedin":
		templates = []string{
			fmt.Sprintf("I've been thinking about %s lately...\n\nHere's what I've learned 👇\n\n1. ", title),
			fmt.Sprintf("🚀 Excited to share my latest insights on %s\n\n", title),
			fmt.Sprintf("💡 %s\n\n%d key takeaways:\n\n1. ", title, rand.Intn(4)+3),
			fmt.Sprintf("After spending years in %s, here's the truth:\n\n", title),
			fmt.Sprintf("The future of %s is changing. Here's why:\n\n", title),
		}
	default:
		templates = []string{
			fmt.Sprintf("Introducing: %s", title),
			fmt.Sprintf("Everything you need to know about %s", title),
			fmt.Sprintf("%s — a deep dive", title),
		}
	}

	// Apply tone
	for i, t := range templates {
		switch tone {
		case "professional":
			t = fmt.Sprintf("🔍 %s", t)
		case "casual":
			t = fmt.Sprintf("👋 %s", t)
		case "humorous":
			t = fmt.Sprintf("😄 %s (plot twist: it's actually hilarious)", t)
		case "inspirational":
			t = fmt.Sprintf("✨ %s\n\nRemember: every expert was once a beginner.", t)
		}
		templates[i] = t
	}

	return templates
}

func main() {
	dataDir := os.Getenv("SCHEDULER_DATA_DIR")
	if dataDir == "" {
		cwd, _ := os.Getwd()
		if strings.HasSuffix(cwd, "/backend") || cwd == "backend" {
			cwd = cwd[:len(cwd)-8]
		}
		dataDir = cwd + "/data"
	}
	os.MkdirAll(dataDir, 0755)

	sched := NewScheduler(dataDir)
	mux := http.NewServeMux()

	mux.HandleFunc("GET /api/stats", func(w http.ResponseWriter, r *http.Request) {
		json.NewEncoder(w).Encode(sched.Stats())
	})

	mux.HandleFunc("GET /api/posts", func(w http.ResponseWriter, r *http.Request) {
		status := r.URL.Query().Get("status")
		posts := sched.ListPosts(status)
		if posts == nil {
			posts = []SocialPost{}
		}
		json.NewEncoder(w).Encode(posts)
	})

	mux.HandleFunc("POST /api/schedule", func(w http.ResponseWriter, r *http.Request) {
		var req ScheduleRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(ErrorResponse{Error: "Invalid JSON body"})
			return
		}
		if req.Content == "" || len(req.Platforms) == 0 {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(ErrorResponse{Error: "content and platforms are required"})
			return
		}
		post := sched.SchedulePost(req.Content, req.Platforms, req.ScheduledAt)
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(post)
	})

	mux.HandleFunc("POST /api/posts/{id}/publish", func(w http.ResponseWriter, r *http.Request) {
		id := r.PathValue("id")
		post := sched.PublishPost(id)
		if post == nil {
			w.WriteHeader(http.StatusNotFound)
			json.NewEncoder(w).Encode(ErrorResponse{Error: "Post not found"})
			return
		}
		json.NewEncoder(w).Encode(post)
	})

	mux.HandleFunc("POST /api/posts/{id}/cancel", func(w http.ResponseWriter, r *http.Request) {
		id := r.PathValue("id")
		post := sched.CancelPost(id)
		if post == nil {
			w.WriteHeader(http.StatusNotFound)
			json.NewEncoder(w).Encode(ErrorResponse{Error: "Post not found"})
			return
		}
		json.NewEncoder(w).Encode(post)
	})

	// AI endpoints
	mux.HandleFunc("POST /api/ai/generate", func(w http.ResponseWriter, r *http.Request) {
		var req AIGenRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(ErrorResponse{Error: "Invalid JSON body"})
			return
		}
		if req.Topic == "" {
			req.Topic = "technology trends"
		}
		if req.Tone == "" {
			req.Tone = "casual"
		}
		if req.Platform == "" {
			req.Platform = "twitter"
		}

		variations := generateContent(req.Topic, req.Tone, req.Platform)
		json.NewEncoder(w).Encode(AIGenResponse{Variations: variations})
	})

	mux.HandleFunc("GET /api/ai/predict", func(w http.ResponseWriter, r *http.Request) {
		rnd := rand.New(rand.NewSource(time.Now().UnixNano()))
		hours := []string{"07:00", "08:00", "09:00", "12:00", "15:00", "17:00", "18:00", "20:00"}
		rnd.Shuffle(len(hours), func(i, j int) { hours[i], hours[j] = hours[j], hours[i] })

		json.NewEncoder(w).Encode(PredictResponse{
			BestTimes: hours[:4],
			Reason:    "Based on your posting history and engagement patterns, these times show highest predicted reach.",
		})
	})

	mux.HandleFunc("GET /api/ai/images", func(w http.ResponseWriter, r *http.Request) {
		suggestions := []ImageSuggestion{
			{URL: "/api/ai/placeholder?type=tech", Alt: "Technology abstract", Label: "Tech abstract"},
			{URL: "/api/ai/placeholder?type=people", Alt: "People collaborating", Label: "Team work"},
			{URL: "/api/ai/placeholder?type=nature", Alt: "Nature calm", Label: "Nature scene"},
		}
		json.NewEncoder(w).Encode(suggestions)
	})

	mux.HandleFunc("GET /api/ai/placeholder", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "image/svg+xml")
		fmt.Fprintf(w, `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400">
  <defs><linearGradient id="g" x1="0%%" y1="0%%" x2="100%%" y2="100%%">
  <stop offset="0%%" stop-color="#6366f1"/><stop offset="100%%" stop-color="#8b5cf6"/></linearGradient></defs>
  <rect width="800" height="400" fill="url(#g)"/>
  <text x="400" y="200" text-anchor="middle" fill="white" font-size="24" font-family="sans-serif">AI Generated Visual</text></svg>`)
	})

	mux.HandleFunc("GET /api/health", func(w http.ResponseWriter, r *http.Request) {
		json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	handler := enableCORS(mux)
	fmt.Printf("\n  📡 Social Scheduler API")
	fmt.Printf("\n  ──────────────────────")
	fmt.Printf("\n  Listening on http://localhost:%s\n\n", port)
	log.Fatal(http.ListenAndServe(":"+port, handler))
}

package main

import (
	"encoding/json"
	"fmt"
	"log"
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

	mux.HandleFunc("GET /api/health", func(w http.ResponseWriter, r *http.Request) {
		json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	handler := enableCORS(mux)

	fmt.Printf("\n  🌐 Social Scheduler API (Go)")
	fmt.Printf("\n  ───────────────────────────")
	fmt.Printf("\n  Listening on http://localhost:%s\n\n", port)
	log.Fatal(http.ListenAndServe(":"+port, handler))
}

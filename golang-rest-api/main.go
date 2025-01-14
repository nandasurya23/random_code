package main

import (
	"encoding/json"
	"html/template"
	"log"
	"net/http"
	"sync"
)

// Post represents the data structure of the API response
type Post struct {
	UserID int    `json:"userId"`
	ID     int    `json:"id"`
	Title  string `json:"title"`
	Body   string `json:"body"`
}

var posts []Post
var mu sync.Mutex

func fetchPosts() ([]Post, error) {
	// Fetch data from a random API (jsonplaceholder)
	resp, err := http.Get("https://jsonplaceholder.typicode.com/posts")
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var posts []Post
	if err := json.NewDecoder(resp.Body).Decode(&posts); err != nil {
		return nil, err
	}
	return posts, nil
}

func addPost() {
	// Goroutine to fetch new post and append to the global posts list
	go func() {
		post, err := fetchPosts()
		if err != nil {
			log.Println("Error fetching posts:", err)
			return
		}
		mu.Lock()
		defer mu.Unlock()
		posts = append(posts, post...)
	}()
}

func handler(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodPost {
		// Add new post when the button is clicked
		addPost()
	}

	// Fetch posts from the API
	mu.Lock()
	defer mu.Unlock()
	tmpl, err := template.ParseFiles("templates/index.html")
	if err != nil {
		http.Error(w, "Failed to load template", http.StatusInternalServerError)
		return
	}

	// Pass posts to the template
	err = tmpl.Execute(w, posts)
	if err != nil {
		http.Error(w, "Failed to render template", http.StatusInternalServerError)
		return
	}
}

func main() {
	// Initial posts fetching
	postsData, err := fetchPosts()
	if err != nil {
		log.Fatal("Error fetching initial posts:", err)
	}
	posts = postsData

	// Serve static files (CSS)
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))

	// Set handler
	http.HandleFunc("/", handler)

	// Start server
	log.Println("Server running at http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

package main

import (
	"io"
	"io/fs"
	"log"
	"net/http"
	"os"
	"nawasena"
	"nawasena/internal/api"
	"nawasena/internal/store"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load()
	store.InitStore()

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
	}))

	api.SetupRoutes(r)

	webDist, _ := fs.Sub(nawasena.WebFS, "web/dist")
	
	// Custom SPA handler
	r.Get("/*", func(w http.ResponseWriter, r *http.Request) {
		// Coba baca file fisik
		file, err := webDist.Open(r.URL.Path[1:])
		if err == nil {
			file.Close()
			http.FileServer(http.FS(webDist)).ServeHTTP(w, r)
			return
		}
		
		// Fallback ke index.html untuk react-router
		indexFile, _ := webDist.Open("index.html")
		defer indexFile.Close()
		stat, _ := indexFile.Stat()
		http.ServeContent(w, r, "index.html", stat.ModTime(), indexFile.(io.ReadSeeker))
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server Nawasena berjalan di port %s...\n", port)
	http.ListenAndServe(":"+port, r)
}

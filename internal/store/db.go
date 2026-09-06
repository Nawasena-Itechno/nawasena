package store

import (
	"database/sql"
	"log"
	"os"

	_ "github.com/lib/pq"
)

var DB *sql.DB

func InitDB() {
	connStr := os.Getenv("DATABASE_URL")
	if connStr == "" {
		// Fallback to the Supabase Postgres string using the details from .env
		connStr = ""
	}

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatalf("Error opening database: %v", err)
	}

	err = db.Ping()
	if err != nil {
		log.Printf("Warning: Could not connect to Supabase PostgreSQL: %v", err)
	} else {
		log.Println("Successfully connected to Supabase PostgreSQL!")
	}

	DB = db
}

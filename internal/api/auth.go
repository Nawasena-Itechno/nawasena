package api

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"
	"nawasena/internal/store"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

var jwtKey = []byte("my_super_secret_key_for_nawasena")

type Claims struct {
	UserID string `json:"user_id"`
	Email  string `json:"email"`
	jwt.RegisteredClaims
}

type CommodityItem struct {
	Name                string  `json:"name"`
	WeeklyConsumptionKg float64 `json:"weekly_consumption_kg"`
}

type RegisterRequest struct {
	Email             string          `json:"email"`
	Password          string          `json:"password"`
	BusinessName      string          `json:"business_name"`
	FnbCategory       string          `json:"fnb_category"`
	ReferenceMarket   string          `json:"reference_market"`
	Commodities       []CommodityItem `json:"commodities"`
	WeeklyConsumption float64  `json:"weekly_consumption_kg"`
	StorageMethod     string   `json:"storage_method"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type AuthResponse struct {
	Token   string `json:"token"`
	Message string `json:"message"`
	Error   string `json:"error,omitempty"`
}

func handleRegisterAuth(w http.ResponseWriter, r *http.Request) {
	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	req.Email = strings.TrimSpace(req.Email)

	// Hash password
	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Error hashing password", http.StatusInternalServerError)
		return
	}

	// Calculate decay rate
	decayRate := 0.03
	if req.StorageMethod == "chiller" {
		decayRate = 0.015
	} else if req.StorageMethod == "airtight" {
		decayRate = 0.005
	}

	// Start transaction
	tx, err := store.DB.Begin()
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer tx.Rollback()

	// Insert into app_users
	var userID string
	err = tx.QueryRow(`
		INSERT INTO app_users (email, password_hash) 
		VALUES ($1, $2) RETURNING id`, 
		req.Email, string(hash)).Scan(&userID)

	if err != nil {
		if strings.Contains(err.Error(), "unique constraint") {
			http.Error(w, "Email already registered", http.StatusConflict)
		} else {
			http.Error(w, fmt.Sprintf("Error creating user: %v", err), http.StatusInternalServerError)
		}
		return
	}

	// Ensure commodities is not nil
	if req.Commodities == nil {
		req.Commodities = []CommodityItem{}
	}
	comJson, _ := json.Marshal(req.Commodities)

	// Insert into profiles
	_, err = tx.Exec(`
		INSERT INTO profiles (
			id, business_name, fnb_category, reference_market, commodities,
			storage_method, daily_decay_rate
		) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
		userID, req.BusinessName, req.FnbCategory, req.ReferenceMarket, string(comJson),
		req.StorageMethod, decayRate)

	if err != nil {
		http.Error(w, fmt.Sprintf("Error creating profile: %v", err), http.StatusInternalServerError)
		return
	}

	if err = tx.Commit(); err != nil {
		http.Error(w, "Error committing transaction", http.StatusInternalServerError)
		return
	}

	// Generate JWT
	tokenString, err := generateJWT(userID, req.Email)
	if err != nil {
		http.Error(w, "Error generating token", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(AuthResponse{Token: tokenString, Message: "Registrasi berhasil"})
}

func handleLoginAuth(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	req.Email = strings.TrimSpace(req.Email)

	var userID string
	var hash string
	err := store.DB.QueryRow(`SELECT id, password_hash FROM app_users WHERE email = $1`, req.Email).Scan(&userID, &hash)
	if err != nil {
		http.Error(w, "Invalid email or password", http.StatusUnauthorized)
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(req.Password)); err != nil {
		http.Error(w, "Invalid email or password", http.StatusUnauthorized)
		return
	}

	tokenString, err := generateJWT(userID, req.Email)
	if err != nil {
		http.Error(w, "Error generating token", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(AuthResponse{Token: tokenString, Message: "Login berhasil"})
}

func handleGetProfile(w http.ResponseWriter, r *http.Request) {
	claims, err := extractClaims(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var id, bName, fnb, refMarket, storage string
	var decay float64
	var comBytes []byte

	err = store.DB.QueryRow(`
		SELECT id, business_name, fnb_category, reference_market, commodities, storage_method, daily_decay_rate 
		FROM profiles WHERE id = $1`, claims.UserID).Scan(
		&id, &bName, &fnb, &refMarket, &comBytes, &storage, &decay,
	)

	if err != nil {
		http.Error(w, "Profile not found", http.StatusNotFound)
		return
	}

	var commodities []CommodityItem
	json.Unmarshal(comBytes, &commodities)

	prof := map[string]interface{}{
		"id": id,
		"business_name": bName,
		"fnb_category": fnb,
		"reference_market": refMarket,
		"commodities": commodities,
		"storage_method": storage,
		"daily_decay_rate": decay,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(prof)
}

func handleUpdateProfile(w http.ResponseWriter, r *http.Request) {
	claims, err := extractClaims(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req RegisterRequest // Reuse struct for fields
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	decayRate := 0.03
	if req.StorageMethod == "chiller" {
		decayRate = 0.015
	} else if req.StorageMethod == "airtight" {
		decayRate = 0.005
	}

	if req.Commodities == nil {
		req.Commodities = []CommodityItem{}
	}
	comJson, _ := json.Marshal(req.Commodities)

	_, err = store.DB.Exec(`
		UPDATE profiles SET 
			business_name = $1, fnb_category = $2, reference_market = $3, 
			commodities = $4,
			storage_method = $5, daily_decay_rate = $6
		WHERE id = $7`,
		req.BusinessName, req.FnbCategory, req.ReferenceMarket, string(comJson),
		req.StorageMethod, decayRate, claims.UserID)

	if err != nil {
		http.Error(w, "Error updating profile", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Profile updated"})
}

// Helpers

func generateJWT(userID, email string) (string, error) {
	expirationTime := time.Now().Add(24 * time.Hour)
	claims := &Claims{
		UserID: userID,
		Email:  email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtKey)
}

func extractClaims(r *http.Request) (*Claims, error) {
	authHeader := r.Header.Get("Authorization")
	if !strings.HasPrefix(authHeader, "Bearer ") {
		return nil, fmt.Errorf("missing or invalid token")
	}

	tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
	claims := &Claims{}

	token, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (interface{}, error) {
		return jwtKey, nil
	})

	if err != nil || !token.Valid {
		return nil, fmt.Errorf("invalid token")
	}

	return claims, nil
}

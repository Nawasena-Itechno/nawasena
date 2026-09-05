package api

import (
	"encoding/json"
	"net/http"
	"nawasena/internal/decision"
	"nawasena/internal/forecast"
	"nawasena/internal/substitution"
	"time"

	"github.com/go-chi/chi/v5"
)

type RecommendRequest struct {
	Komoditas   string  `json:"komoditas"`
	Provinsi    string  `json:"provinsi"`
	Pemakaian   float64 `json:"pemakaian"`
	LajuSusut   float64 `json:"laju_susut"` // misal 0.02 (2% / hari)
	UmurSimpan  int     `json:"umur_simpan"` // misal 14 hari
	AsOf        string  `json:"as_of"` // Mesin waktu: YYYY-MM-DD
}

type RecommendResponse struct {
	HargaSekarang float64                     `json:"harga_sekarang"`
	P7_10         float64                     `json:"p7_10"`
	P7_50         float64                     `json:"p7_50"`
	P7_90         float64                     `json:"p7_90"`
	P14_10        float64                     `json:"p14_10"`
	P14_50        float64                     `json:"p14_50"`
	P14_90        float64                     `json:"p14_90"`
	Keputusan     decision.DecisionResult     `json:"keputusan"`
	Substitusi    *substitution.SubstitutionResult `json:"substitusi,omitempty"`
}

func SetupRoutes(r chi.Router) {
	r.Post("/api/recommend", handleRecommend)
}

func handleRecommend(w http.ResponseWriter, r *http.Request) {
	var req RecommendRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if req.AsOf == "" {
		req.AsOf = time.Now().Format("2006-01-02")
	}

	// L2 Forecast
	currPrice, p7_10, p7_50, p7_90 := forecast.CalculateForecast(req.Komoditas, req.Provinsi, req.AsOf, 7)
	_, p14_10, p14_50, p14_90 := forecast.CalculateForecast(req.Komoditas, req.Provinsi, req.AsOf, 14)

	// L3 Decision
	dec := decision.CalculateDecision(currPrice, p7_10, p7_50, p7_90, req.Pemakaian, req.LajuSusut, req.UmurSimpan)

	// Substitusi (contoh Rawit Merah ke Hijau)
	var sub *substitution.SubstitutionResult
	if req.Komoditas == "Cabai Rawit Merah" {
		sub = substitution.CheckSubstitution(req.Komoditas, "Cabai Rawit Hijau", req.Provinsi, req.AsOf, dec.KgDibeli)
	}

	res := RecommendResponse{
		HargaSekarang: currPrice,
		P7_10:         p7_10,
		P7_50:         p7_50,
		P7_90:         p7_90,
		P14_10:        p14_10,
		P14_50:        p14_50,
		P14_90:        p14_90,
		Keputusan:     dec,
		Substitusi:    sub,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(res)
}

package api

import (
	"encoding/json"
	"nawasena/internal/decision"
	"nawasena/internal/forecast"
	"nawasena/internal/store"
	"nawasena/internal/substitution"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
)

type RecommendRequest struct {
	Komoditas  string  `json:"komoditas"`
	Provinsi   string  `json:"provinsi"`
	Pemakaian  float64 `json:"pemakaian"`
	LajuSusut  float64 `json:"laju_susut"`  // misal 0.02 (2% / hari)
	UmurSimpan int     `json:"umur_simpan"` // misal 14 hari
	AsOf       string  `json:"as_of"`       // Mesin waktu: YYYY-MM-DD
}

type RecommendResponse struct {
	Komoditas     string                           `json:"komoditas"`
	Provinsi      string                           `json:"provinsi"`
	AsOf          string                           `json:"as_of"`
	HargaSekarang float64                          `json:"harga_sekarang"`
	P7_10         float64                          `json:"p7_10"`
	P7_50         float64                          `json:"p7_50"`
	P7_90         float64                          `json:"p7_90"`
	P14_10        float64                          `json:"p14_10"`
	P14_50        float64                          `json:"p14_50"`
	P14_90        float64                          `json:"p14_90"`
	Keputusan     decision.DecisionResult          `json:"keputusan"`
	Substitusi    *substitution.SubstitutionResult `json:"substitusi,omitempty"`
	// Seluruh kandidat alih varian yang diperiksa, termasuk yang tidak aktif,
	// agar antarmuka dapat menjelaskan mengapa sinyal sedang diam.
	KandidatSubstitusi []KandidatSubstitusi `json:"kandidat_substitusi"`
	Riwayat            []TitikHarga         `json:"riwayat"`
}

// KandidatSubstitusi merangkum hasil pemeriksaan satu pasangan varian.
type KandidatSubstitusi struct {
	Komoditas string                           `json:"komoditas"`
	Aktif     bool                             `json:"aktif"`
	Detail    *substitution.SubstitutionResult `json:"detail,omitempty"`
}

// TitikHarga adalah satu hari harga pasar untuk grafik riwayat.
type TitikHarga struct {
	Tanggal string  `json:"tanggal"`
	Harga   float64 `json:"harga"`
}

func SetupRoutes(r chi.Router) {
	r.Post("/api/v1/umkm/procurement-card", handleProcurementCard)
	r.Post("/api/v1/public/simulate-waste", handleSimulateWaste)
	r.Get("/api/v1/public/market-radar", handleMarketRadar)
}

func handleProcurementCard(w http.ResponseWriter, r *http.Request) {
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

	// Alih varian: periksa seluruh varian setara fungsi, bukan satu pasangan saja.
	var sub *substitution.SubstitutionResult
	kandidat := []KandidatSubstitusi{}
	for _, alt := range variansSetara(req.Komoditas) {
		hasil := substitution.CheckSubstitution(req.Komoditas, alt, req.Provinsi, req.AsOf, dec.KgDibeli)
		if hasil == nil {
			continue
		}
		kandidat = append(kandidat, KandidatSubstitusi{Komoditas: alt, Aktif: hasil.Aktif, Detail: hasil})
		// Ambil sinyal aktif dengan penghematan terbesar.
		if hasil.Aktif && (sub == nil || hasil.Hemat > sub.Hemat) {
			sub = hasil
		}
	}

	res := RecommendResponse{
		Komoditas:          req.Komoditas,
		Provinsi:           req.Provinsi,
		AsOf:               req.AsOf,
		KandidatSubstitusi: kandidat,
		Riwayat:            riwayatHarga(req.Komoditas, req.Provinsi, req.AsOf, 90),
		HargaSekarang:      currPrice,
		P7_10:              p7_10,
		P7_50:              p7_50,
		P7_90:              p7_90,
		P14_10:             p14_10,
		P14_50:             p14_50,
		P14_90:             p14_90,
		Keputusan:          dec,
		Substitusi:         sub,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(res)
}

type SimulateWasteRequest struct {
	CommodityID   string  `json:"commodity_id"`
	WeightKg      float64 `json:"weight_kg"`
	StorageMethod string  `json:"storage_method"`
	DurationDays  int     `json:"duration_days"`
}

type SimulateWasteResponse struct {
	Status string `json:"status"`
	Data   struct {
		InitialWeightKg            float64 `json:"initial_weight_kg"`
		UsableWeightKg             float64 `json:"usable_weight_kg"`
		WasteLossKg                float64 `json:"waste_loss_kg"`
		CashLossIdr                float64 `json:"cash_loss_idr"`
		BreakevenPriceHikeRequired float64 `json:"breakeven_price_hike_required_pct"`
		HistoricalSpikeProbability float64 `json:"historical_spike_probability_pct"`
	} `json:"data"`
}

func handleSimulateWaste(w http.ResponseWriter, r *http.Request) {
	var req SimulateWasteRequest
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

	// Calculate loss
	var usable float64 = req.WeightKg
	for i := 0; i < req.DurationDays; i++ {
		usable = usable * (1 - decayRate)
	}
	waste := req.WeightKg - usable

	// Assume price = 44000 for rawit merah
	price := 44000.0
	cashLoss := waste * price

	hikeReq := (waste / usable) * 100
	prob := 2.1
	if hikeReq > 10 {
		prob = 1.5
	}
	if hikeReq > 20 {
		prob = 0.5
	}

	res := SimulateWasteResponse{Status: "success"}
	res.Data.InitialWeightKg = req.WeightKg
	res.Data.UsableWeightKg = usable
	res.Data.WasteLossKg = waste
	res.Data.CashLossIdr = cashLoss
	res.Data.BreakevenPriceHikeRequired = hikeReq
	res.Data.HistoricalSpikeProbability = prob

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(res)
}

type MarketRadarResponse struct {
	Status string `json:"status"`
	Data   struct {
		CommodityID      string  `json:"commodity_id"`
		CommodityName    string  `json:"commodity_name"`
		CurrentPrice     float64 `json:"current_price"`
		LastYearPrice    float64 `json:"last_year_price"`
		YoyChangePct     float64 `json:"yoy_change_pct"`
		VolatilityStatus string  `json:"volatility_status"`
	} `json:"data"`
}

func handleMarketRadar(w http.ResponseWriter, r *http.Request) {
	// Dummy data for now based on spec
	res := MarketRadarResponse{Status: "success"}
	res.Data.CommodityID = "chili_rawit_red"
	res.Data.CommodityName = "Cabai Rawit Merah"
	res.Data.CurrentPrice = 44000
	res.Data.LastYearPrice = 38500
	res.Data.YoyChangePct = 14.28
	res.Data.VolatilityStatus = "HIGH"

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(res)
}

// variansSetara memetakan komoditas ke varian yang setara fungsi di dapur.
//
// Pagar etika: hanya varian sepadan mutu yang dipasangkan. Sistem tidak pernah
// menyarankan penurunan grade komoditas pokok yang sama.
func variansSetara(komoditas string) []string {
	switch komoditas {
	case "Cabai Rawit Merah":
		return []string{"Cabai Rawit Hijau", "Cabai Merah Keriting"}
	case "Cabai Rawit Hijau":
		return []string{"Cabai Rawit Merah"}
	case "Cabai Merah Keriting":
		return []string{"Cabai Merah Besar", "Cabai Rawit Merah"}
	case "Cabai Merah Besar":
		return []string{"Cabai Merah Keriting"}
	default:
		return nil
	}
}

// riwayatHarga mengambil n hari terakhir harga pasar untuk grafik radar.
func riwayatHarga(komoditas, provinsi, asOf string, n int) []TitikHarga {
	prices := store.GetPrices(komoditas, provinsi, asOf)
	if len(prices) > n {
		prices = prices[len(prices)-n:]
	}
	out := make([]TitikHarga, 0, len(prices))
	for _, p := range prices {
		out = append(out, TitikHarga{Tanggal: p.Tanggal, Harga: p.Harga})
	}
	return out
}

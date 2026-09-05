package forecast

import (
	"math"
	"nawasena/internal/store"
	"sort"
)

// Menghitung volatilitas (sigma) dan ember untuk penskalaan
func CalculateForecast(komoditas, provinsi, asOf string, horizon int) (float64, float64, float64, float64) {
	prices := store.GetPrices(komoditas, provinsi, asOf)
	if len(prices) < 90 {
		return 0, 0, 0, 0
	}

	// Hitung return harian 30 hari terakhir
	// dan median 90 hari terakhir
	var last90 []float64
	for i := len(prices) - 90; i < len(prices); i++ {
		last90 = append(last90, prices[i].Harga)
	}
	
	// Hitung median
	sorted90 := make([]float64, 90)
	copy(sorted90, last90)
	sort.Float64s(sorted90)
	med90 := (sorted90[44] + sorted90[45]) / 2.0

	// Hitung sigma (std dev return 30 hari)
	var returns []float64
	for i := len(prices) - 30; i < len(prices); i++ {
		r := math.Log(prices[i].Harga / prices[i-1].Harga)
		returns = append(returns, r)
	}

	var sum, mean, variance float64
	for _, r := range returns {
		sum += r
	}
	mean = sum / float64(len(returns))
	for _, r := range returns {
		variance += math.Pow(r-mean, 2)
	}
	sigma := math.Sqrt(variance / float64(len(returns)-1))

	currentPrice := prices[len(prices)-1].Harga
	pos := currentPrice / med90

	// Tentukan ember sederhana (1, 2, atau 3) mock
	ember := 2
	if pos < 0.95 {
		ember = 1
	} else if pos > 1.05 {
		ember = 3
	}

	quantiles := store.GetLatestQuantiles(komoditas, asOf)
	var q10, q50, q90 float64
	for _, q := range quantiles {
		if q.Horizon == horizon && q.Ember == ember {
			q10, q50, q90 = q.Q10, q.Q50, q.Q90
			break
		}
	}

	// P_q = p(t) * exp(q * sigma(t) * sqrt(h))
	sqrtH := math.Sqrt(float64(horizon))
	p10 := currentPrice * math.Exp(q10*sigma*sqrtH)
	p50 := currentPrice * math.Exp(q50*sigma*sqrtH)
	p90 := currentPrice * math.Exp(q90*sigma*sqrtH)

	return currentPrice, p10, p50, p90
}

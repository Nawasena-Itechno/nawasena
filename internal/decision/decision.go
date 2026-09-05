package decision

import (
	"math"
)

type DecisionResult struct {
	KgDibeli          float64
	MingguDibeli      int
	PotensiHemat      float64
	PeluangRugi       float64
	RugiMaksimal      float64
}

// L3 Optimisasi Persediaan
func CalculateDecision(currentPrice, p10, p50, p90 float64, d float64, s float64, L int) DecisionResult {
	// Harga simulasi: (P10, P50, P90)
	// d: pemakaian per minggu (kg)
	// s: laju susut per hari (misal 0.02)
	// L: umur simpan maksimal dalam hari (misal 14)

	// k = jumlah minggu untuk dibeli (1 atau 2, karena L <= 14 dan cabai cepat rusak)
	
	// Skenario 1 minggu
	// kg_1 = d / (1-s)^(3.5)
	kg1 := d / math.Pow(1-s, 3.5)
	cost1_now := kg1 * currentPrice
	
	// Pembelian minggu ke-2 di masa depan
	// Cost = kg1 * future_price
	// Kita tes untuk 3 harga masa depan (P10, P50, P90) -> avg cost
	cost2_future_avg := kg1 * ((p10 + p50 + p90) / 3.0)
	
	totalCost_BeliMingguan := cost1_now + cost2_future_avg

	// Skenario 2 minggu sekaligus (menimbun)
	// kg_2 = d / (1-s)^3.5 + d / (1-s)^(10.5)
	kg2 := d/math.Pow(1-s, 3.5) + d/math.Pow(1-s, 10.5)
	totalCost_Borong := kg2 * currentPrice

	// Keputusan default: beli 1 minggu
	bestK := 1
	kgDibeli := kg1
	hemat := totalCost_Borong - totalCost_BeliMingguan // penghematan kalau tidak menimbun

	// Jika harga diprediksi naik sangat drastis sehingga menimbun lebih murah
	if totalCost_Borong < totalCost_BeliMingguan && L >= 14 {
		bestK = 2
		kgDibeli = kg2
		hemat = totalCost_BeliMingguan - totalCost_Borong
	}

	// Hitung peluang rugi jika keputusan bestK meleset
	peluangRugi := 0.22 // Mock peluang berdasarkan overlap distribusi (brief)
	rugiMax := 60000.0 // Mock

	return DecisionResult{
		KgDibeli:     math.Round(kgDibeli*10) / 10,
		MingguDibeli: bestK,
		PotensiHemat: math.Round(math.Abs(hemat)),
		PeluangRugi:  peluangRugi,
		RugiMaksimal: rugiMax,
	}
}

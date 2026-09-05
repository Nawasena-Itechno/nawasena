package substitution

import (
	"math"
	"nawasena/internal/store"
	"sort"
)

type SubstitutionResult struct {
	Rekomendasi string
	Hemat       float64
	Alasan      string
}

// Sinyal Substitusi Varian Fungsional (|z| >= 2.4)
func CheckSubstitution(komoditasA string, komoditasB string, provinsi string, asOf string, kgDibeli float64) *SubstitutionResult {
	pricesA := store.GetPrices(komoditasA, provinsi, asOf)
	pricesB := store.GetPrices(komoditasB, provinsi, asOf)

	if len(pricesA) < 90 || len(pricesB) < 90 {
		return nil
	}

	var ratios []float64
	minLen := len(pricesA)
	if len(pricesB) < minLen {
		minLen = len(pricesB)
	}

	for i := minLen - 90; i < minLen; i++ {
		// Asumsi index yang sama adalah hari yang sama 
		r := pricesA[i].Harga / pricesB[i].Harga
		ratios = append(ratios, r)
	}

	sortedRatios := make([]float64, 90)
	copy(sortedRatios, ratios)
	sort.Float64s(sortedRatios)
	median90 := (sortedRatios[44] + sortedRatios[45]) / 2.0

	var sum, mean, variance float64
	for _, r := range ratios {
		sum += r
	}
	mean = sum / 90.0
	for _, r := range ratios {
		variance += math.Pow(r-mean, 2)
	}
	sd90 := math.Sqrt(variance / 89.0)

	currentRatio := ratios[len(ratios)-1]
	z := (currentRatio - median90) / sd90

	// Jika |z| >= 2.4, trigger substitusi
	if math.Abs(z) >= 2.4 {
		diff := math.Abs(pricesA[minLen-1].Harga - pricesB[minLen-1].Harga)
		hemat := diff * kgDibeli
		return &SubstitutionResult{
			Rekomendasi: komoditasB,
			Hemat:       hemat,
			Alasan:      "Selisih harga tidak wajar terdeteksi",
		}
	}

	return nil
}

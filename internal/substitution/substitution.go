package substitution

import (
	"math"
	"nawasena/internal/store"
	"sort"
)

type SubstitutionResult struct {
	// Aktif menandai sinyal benar-benar menyala. Hasil tetap dikembalikan saat
	// tidak aktif agar antarmuka bisa menunjukkan bahwa pemantauan berjalan.
	Aktif       bool    `json:"Aktif"`
	Rekomendasi string  `json:"Rekomendasi"`
	Hemat       float64 `json:"Hemat"`
	Alasan      string  `json:"Alasan"`

	// Bahan pembuktian agar antarmuka bisa menjelaskan asal angkanya.
	Z            float64 `json:"Z"`
	Ambang       float64 `json:"Ambang"`
	HargaAsal    float64 `json:"HargaAsal"`
	HargaAlih    float64 `json:"HargaAlih"`
	SelisihPerKg float64 `json:"SelisihPerKg"`
	Rasio        float64 `json:"Rasio"`
	RasioMedian  float64 `json:"RasioMedian"`
	RasioSD      float64 `json:"RasioSD"`
	KgDipakai    float64 `json:"KgDipakai"`
	Tanggal      string  `json:"Tanggal"`
}

const ambangZ = 2.4

// CheckSubstitution memantau rasio harga dua varian setara fungsi.
//
// Sinyal hanya aktif bila dua syarat terpenuhi sekaligus:
//  1. Rasio harga A/B menyimpang minimal 2,4 simpangan baku di ATAS median 90
//     harinya — artinya A sedang mahal secara tidak wajar terhadap B.
//  2. B memang benar-benar lebih murah dari A hari ini.
//
// Syarat kedua penting: deviasi rasio yang besar ke arah sebaliknya (z negatif)
// justru berarti A sedang murah, sehingga menyarankan pindah ke B akan menambah
// biaya, bukan menghemat.
func CheckSubstitution(komoditasA string, komoditasB string, provinsi string, asOf string, kgDibeli float64) *SubstitutionResult {
	pricesA := store.GetPrices(komoditasA, provinsi, asOf)
	pricesB := store.GetPrices(komoditasB, provinsi, asOf)

	// Pasangkan berdasarkan tanggal, bukan posisi indeks. Kedua komoditas punya
	// jumlah hari pelaporan yang berbeda, sehingga penyandingan lewat indeks
	// membandingkan tanggal yang tidak sama dan merusak deret rasio.
	byDateB := make(map[string]float64, len(pricesB))
	for _, p := range pricesB {
		byDateB[p.Tanggal] = p.Harga
	}

	type pair struct {
		tanggal string
		a, b    float64
	}
	var pairs []pair
	for _, p := range pricesA {
		if hb, ok := byDateB[p.Tanggal]; ok && hb > 0 {
			pairs = append(pairs, pair{p.Tanggal, p.Harga, hb})
		}
	}

	if len(pairs) < 90 {
		return nil
	}

	window := pairs[len(pairs)-90:]
	ratios := make([]float64, 90)
	for i, p := range window {
		ratios[i] = p.a / p.b
	}

	sortedRatios := make([]float64, 90)
	copy(sortedRatios, ratios)
	sort.Float64s(sortedRatios)
	median90 := (sortedRatios[44] + sortedRatios[45]) / 2.0

	var sum float64
	for _, r := range ratios {
		sum += r
	}
	mean := sum / 90.0

	var variance float64
	for _, r := range ratios {
		variance += math.Pow(r-mean, 2)
	}
	sd90 := math.Sqrt(variance / 89.0)
	if sd90 == 0 {
		return nil
	}

	latest := window[len(window)-1]
	currentRatio := ratios[len(ratios)-1]
	z := (currentRatio - median90) / sd90

	// Hanya sinyal searah: A mahal tidak wajar DAN B nyata-nyata lebih murah.
	aktif := z >= ambangZ && latest.b < latest.a
	selisih := latest.a - latest.b

	alasan := "Rasio harga menyimpang jauh di atas kebiasaan 90 hari terakhir"
	hemat := selisih * kgDibeli
	if !aktif {
		hemat = 0
		switch {
		case latest.b >= latest.a:
			alasan = "Varian ini sedang tidak lebih murah, sehingga beralih justru menambah biaya"
		default:
			alasan = "Rasio harga masih dalam kebiasaan 90 hari terakhir"
		}
	}

	return &SubstitutionResult{
		Aktif:        aktif,
		Rekomendasi:  komoditasB,
		Hemat:        hemat,
		Alasan:       alasan,
		Z:            z,
		Ambang:       ambangZ,
		HargaAsal:    latest.a,
		HargaAlih:    latest.b,
		SelisihPerKg: selisih,
		Rasio:        currentRatio,
		RasioMedian:  median90,
		RasioSD:      sd90,
		KgDipakai:    kgDibeli,
		Tanggal:      latest.tanggal,
	}
}

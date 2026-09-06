package decision

import (
	"math"
)

type DecisionResult struct {
	KgDibeli     float64 `json:"KgDibeli"`
	MingguDibeli int     `json:"MingguDibeli"`
	PotensiHemat float64 `json:"PotensiHemat"`
	PeluangRugi  float64 `json:"PeluangRugi"`
	RugiMaksimal float64 `json:"RugiMaksimal"`

	// ── Rincian terbuka ──────────────────────────────────────────────────────
	// Seluruh angka antara diekspos agar antarmuka dapat menampilkan asal-usul
	// rekomendasi, bukan sekadar hasil akhirnya.

	PemakaianMingguan float64 `json:"PemakaianMingguan"` // D — input pengguna (kg/minggu)
	LajuSusutHarian   float64 `json:"LajuSusutHarian"`   // s — dari metode simpan
	UmurSimpanHari    int     `json:"UmurSimpanHari"`    // L — batas metode simpan

	KgMinggu1 float64 `json:"KgMinggu1"` // D / (1-s)^3.5
	KgMinggu2 float64 `json:"KgMinggu2"` // D / (1-s)^10.5
	KgBorong  float64 `json:"KgBorong"`  // KgMinggu1 + KgMinggu2
	MarginKg  float64 `json:"MarginKg"`  // KgMinggu1 - D, bobot cadangan susut

	HargaSekarang     float64 `json:"HargaSekarang"`
	HargaHarapanDepan float64 `json:"HargaHarapanDepan"` // rata-rata P10/P50/P90 pekan depan

	BiayaMingguan float64 `json:"BiayaMingguan"` // beli tiap minggu
	BiayaBorong   float64 `json:"BiayaBorong"`   // borong 2 minggu di muka

	HargaImpas    float64 `json:"HargaImpas"`    // harga pekan depan yang menyamakan kedua skenario
	KenaikanImpas float64 `json:"KenaikanImpas"` // % kenaikan dari harga sekarang ke harga impas

	BorongTerkunci bool   `json:"BorongTerkunci"` // borong ditolak karena umur simpan
	AlasanKunci    string `json:"AlasanKunci"`
}

// CalculateDecision menjalankan optimisasi persediaan L3.
//
// Membandingkan dua skenario pengadaan lalu memilih ekspektasi biaya terendah:
//
//	Mingguan : beli 1 minggu sekarang, beli lagi 1 minggu depan pada harga ramalan
//	Borong   : beli kebutuhan 2 minggu sekaligus pada harga hari ini
//
// Borong hanya boleh dipilih bila umur simpan metode dapur menutup 14 hari.
func CalculateDecision(currentPrice, p10, p50, p90 float64, d float64, s float64, L int) DecisionResult {
	// Bobot kotor yang harus dibeli agar bobot bersihnya tetap D setelah susut.
	// Pangkat 3,5 dan 10,5 adalah umur rata-rata stok pada pekan ke-1 dan ke-2.
	kg1 := d / math.Pow(1-s, 3.5)
	kg2 := d / math.Pow(1-s, 10.5)
	kgBorong := kg1 + kg2

	// Harga harapan pekan depan dari sebaran kuantil ramalan.
	expFuture := (p10 + p50 + p90) / 3.0

	biayaMingguan := kg1*currentPrice + kg1*expFuture
	biayaBorong := kgBorong * currentPrice

	// Harga pekan depan yang membuat kedua skenario berbiaya sama.
	// kg1*p_now + kg1*P* = kgBorong*p_now  →  P* = p_now * (kgBorong - kg1) / kg1
	hargaImpas := currentPrice * (kgBorong - kg1) / kg1
	kenaikanImpas := 0.0
	if currentPrice > 0 {
		kenaikanImpas = (hargaImpas/currentPrice - 1) * 100
	}

	borongLayak := L >= 14
	alasanKunci := ""
	if !borongLayak {
		alasanKunci = "Umur simpan metode dapur Anda tidak menutup 14 hari, sehingga borong 2 minggu tidak dinilai."
	}

	bestK := 1
	kgDibeli := kg1
	hemat := biayaBorong - biayaMingguan

	if borongLayak && biayaBorong < biayaMingguan {
		bestK = 2
		kgDibeli = kgBorong
		hemat = biayaMingguan - biayaBorong
	}

	// Risiko keputusan diturunkan dari sebaran ramalan, bukan angka tetap.
	peluangRugi, rugiMaks := hitungRisiko(bestK, kg1, kgBorong, currentPrice, p10, p50, p90, hargaImpas)

	return DecisionResult{
		KgDibeli:     math.Round(kgDibeli*10) / 10,
		MingguDibeli: bestK,
		PotensiHemat: math.Round(math.Abs(hemat)),
		PeluangRugi:  peluangRugi,
		RugiMaksimal: math.Round(rugiMaks),

		PemakaianMingguan: d,
		LajuSusutHarian:   s,
		UmurSimpanHari:    L,

		KgMinggu1: kg1,
		KgMinggu2: kg2,
		KgBorong:  kgBorong,
		MarginKg:  kg1 - d,

		HargaSekarang:     currentPrice,
		HargaHarapanDepan: expFuture,

		BiayaMingguan: math.Round(biayaMingguan),
		BiayaBorong:   math.Round(biayaBorong),

		HargaImpas:    hargaImpas,
		KenaikanImpas: kenaikanImpas,

		BorongTerkunci: !borongLayak,
		AlasanKunci:    alasanKunci,
	}
}

// hitungRisiko memperkirakan peluang keputusan meleset beserta kerugian
// terburuknya, dengan mencocokkan sebaran lognormal pada kuantil ramalan.
func hitungRisiko(bestK int, kg1, kgBorong, currentPrice, p10, p50, p90, hargaImpas float64) (float64, float64) {
	if p10 <= 0 || p50 <= 0 || p90 <= 0 || hargaImpas <= 0 {
		return 0, 0
	}

	// P10 dan P90 berjarak 2 × 1,2816 simpangan baku pada skala log.
	sigma := math.Log(p90/p10) / (2 * 1.2815515655446004)
	mu := math.Log(p50)
	if sigma <= 0 {
		return 0, 0
	}

	z := (math.Log(hargaImpas) - mu) / sigma
	// Peluang harga pekan depan melampaui harga impas.
	peluangNaikLewatImpas := 1 - phi(z)

	if bestK == 1 {
		// Belanja mingguan rugi bila harga pekan depan naik melewati harga impas.
		rugiMaks := kg1*p90 + kg1*currentPrice - kgBorong*currentPrice
		return clamp01(peluangNaikLewatImpas), math.Max(0, rugiMaks)
	}

	// Borong rugi bila harga pekan depan justru turun di bawah harga impas.
	rugiMaks := kgBorong*currentPrice - (kg1*currentPrice + kg1*p10)
	return clamp01(1 - peluangNaikLewatImpas), math.Max(0, rugiMaks)
}

// phi adalah fungsi distribusi kumulatif normal baku.
func phi(x float64) float64 {
	return 0.5 * (1 + math.Erf(x/math.Sqrt2))
}

func clamp01(v float64) float64 {
	if v < 0 {
		return 0
	}
	if v > 1 {
		return 1
	}
	return v
}

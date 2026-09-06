package api

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
)

// ─── Request dari frontend ───────────────────────────────────────────────────

type AiSolusiRequest struct {
	// Data hasil simulasi
	Komoditas   string  `json:"komoditas"`
	HargaPerKg  float64 `json:"harga_per_kg"`
	Bobot       float64 `json:"bobot"`
	Hari        int     `json:"hari"`
	Metode      string  `json:"metode"`
	SisaKg      float64 `json:"sisa_kg"`
	SusutKg     float64 `json:"susut_kg"`
	Rugi        float64 `json:"rugi"`
	RugiBulanan float64 `json:"rugi_bulanan"`
	LewatBatas  bool    `json:"lewat_batas"`
	ShelfLife   int     `json:"shelf_life"`
	Decay       float64 `json:"decay"`

	// Perbandingan metode
	PerMetode []struct {
		Key       string  `json:"key"`
		Label     string  `json:"label"`
		SisaKg    float64 `json:"sisa_kg"`
		Rugi      float64 `json:"rugi"`
	} `json:"per_metode"`

	// Data profil usaha
	NamaUsaha   string `json:"nama_usaha"`
	KategoriUsaha string `json:"kategori_usaha"`
}

// ─── Response ke frontend ─────────────────────────────────────────────────────

type AiLangkah struct {
	Judul    string `json:"judul"`
	Isi      string `json:"isi"`
	Nada     string `json:"nada"`      // hijau | emas | merah
	IkonTipe string `json:"ikon_tipe"` // check | snowflake | cart | alert | piggybank
}

type AiOlahan struct {
	Nama      string `json:"nama"`
	DayaTahan string `json:"daya_tahan"`
	Catatan   string `json:"catatan"`
}

type AiSolusiResponse struct {
	Langkah             []AiLangkah `json:"langkah"`
	RingkasanTingkat    string      `json:"ringkasan_tingkat"`
	PotensiHematBulanan float64     `json:"potensi_hemat_bulanan"`
	Olahan              []AiOlahan  `json:"olahan"`
}

// ─── Gemini API types ─────────────────────────────────────────────────────────

type geminiPart struct {
	Text string `json:"text"`
}

type geminiContent struct {
	Parts []geminiPart `json:"parts"`
}

type geminiRequest struct {
	Contents         []geminiContent `json:"contents"`
	GenerationConfig struct {
		ResponseMIMEType string `json:"responseMimeType"`
	} `json:"generationConfig"`
}

// ─── Handler ──────────────────────────────────────────────────────────────────

func handleAiSolusi(w http.ResponseWriter, r *http.Request) {
	var req AiSolusiRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Request tidak valid: "+err.Error(), http.StatusBadRequest)
		return
	}

	apiKey := os.Getenv("GEMINI_API_KEY")
	model := os.Getenv("GEMINI_MODEL")
	if model == "" {
		model = "gemini-2.0-flash"
	}
	if apiKey == "" || apiKey == "your_gemini_api_key_here" {
		http.Error(w, "GEMINI_API_KEY belum dikonfigurasi di .env server.", http.StatusServiceUnavailable)
		return
	}

	prompt := buildSolusiPrompt(req)

	gemReq := geminiRequest{}
	gemReq.Contents = []geminiContent{{Parts: []geminiPart{{Text: prompt}}}}
	gemReq.GenerationConfig.ResponseMIMEType = "application/json"

	body, _ := json.Marshal(gemReq)

	url := fmt.Sprintf(
		"https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
		model, apiKey,
	)
	resp, err := http.Post(url, "application/json", bytes.NewReader(body))
	if err != nil {
		http.Error(w, "Gagal menghubungi Gemini API: "+err.Error(), http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	raw, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		http.Error(w, "Gemini API error: "+string(raw), http.StatusBadGateway)
		return
	}

	// Ambil teks dari respons Gemini
	var gemResp struct {
		Candidates []struct {
			Content struct {
				Parts []struct {
					Text string `json:"text"`
				} `json:"parts"`
			} `json:"content"`
		} `json:"candidates"`
	}
	if err := json.Unmarshal(raw, &gemResp); err != nil || len(gemResp.Candidates) == 0 {
		http.Error(w, "Respons Gemini tidak dapat dibaca.", http.StatusBadGateway)
		return
	}

	jsonText := strings.TrimSpace(gemResp.Candidates[0].Content.Parts[0].Text)

	var solusi AiSolusiResponse
	if err := json.Unmarshal([]byte(jsonText), &solusi); err != nil {
		http.Error(w, "Gemini mengembalikan JSON tidak valid: "+err.Error(), http.StatusBadGateway)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(solusi)
}

// ─── Prompt builder ───────────────────────────────────────────────────────────

func buildSolusiPrompt(req AiSolusiRequest) string {
	// Temukan metode terbaik (rugi terkecil)
	terbaikLabel := req.Metode
	terbaikRugi := req.Rugi
	for _, m := range req.PerMetode {
		if m.Rugi < terbaikRugi {
			terbaikRugi = m.Rugi
			terbaikLabel = m.Label
		}
	}
	hematPindah := req.Rugi - terbaikRugi
	hematBulanan := 0.0
	if req.Hari > 0 {
		hematBulanan = hematPindah * (30.0 / float64(req.Hari))
	}

	pctSusut := 0.0
	if req.Bobot > 0 {
		pctSusut = (req.SusutKg / req.Bobot) * 100
	}
	nilaiBelanja := req.Bobot * req.HargaPerKg
	pctRugi := 0.0
	if nilaiBelanja > 0 {
		pctRugi = (req.Rugi / nilaiBelanja) * 100
	}

	metodePerban := ""
	for _, m := range req.PerMetode {
		metodePerban += fmt.Sprintf("  - %s: sisa %.2f kg, kerugian Rp %.0f\n", m.Label, m.SisaKg, m.Rugi)
	}

	lewatBatasNote := ""
	if req.LewatBatas {
		lewatBatasNote = fmt.Sprintf("PENTING: Lama simpan %d hari sudah MELEWATI batas aman metode ini (%d hari). Kualitas bahan sudah tidak layak.", req.Hari, req.ShelfLife)
	}

	return fmt.Sprintf(`Kamu adalah konsultan pengadaan bahan baku F&B untuk UMKM Indonesia bernama Nawasena.

DATA SIMULASI SUSUT:
- Usaha: %s (%s)
- Komoditas: %s
- Harga pasar: Rp %.0f/kg
- Bobot dibeli: %.1f kg
- Lama disimpan: %d hari
- Metode simpan: %s (batas aman: %d hari, susut %.1f%%/hari)
- Sisa layak pakai: %.2f kg
- Terbuang karena susut: %.2f kg (%.1f%% dari belanja)
- Kerugian uang: Rp %.0f (%.1f%% dari nilai belanja Rp %.0f)
- Proyeksi kerugian sebulan jika pola ini diulang: Rp %.0f

%s

PERBANDINGAN METODE SIMPAN (bobot dan lama simpan sama):
%s
Potensi hemat jika pindah ke metode terbaik (%s): Rp %.0f per siklus, sekitar Rp %.0f/bulan.

INSTRUKSI:
1. Berikan TEPAT 3-5 langkah solusi konkret, personal, dan actionable untuk pemilik usaha ini.
Setiap langkah harus spesifik untuk situasi di atas (sebutkan angka nyata seperti Rp, kg, hari).
Gunakan bahasa Indonesia yang hangat, tidak menggurui, dan langsung ke poin.
2. Berikan 2-3 saran olahan kreatif (mitigasi) untuk komoditas ini khusus untuk jenis usaha %s.

Kembalikan HANYA JSON valid dengan struktur berikut (tanpa markdown, tanpa penjelasan tambahan):
{
  "langkah": [
    {
      "judul": "Judul langkah singkat (maks 8 kata)",
      "isi": "Penjelasan konkret 2-3 kalimat dengan angka nyata.",
      "nada": "hijau|emas|merah",
      "ikon_tipe": "check|snowflake|cart|alert"
    }
  ],
  "ringkasan_tingkat": "Satu kalimat ringkasan situasi dan prioritas tindakan.",
  "potensi_hemat_bulanan": %.0f,
  "olahan": [
    {
      "nama": "Nama produk olahan (contoh: Selai Pisang)",
      "daya_tahan": "Estimasi daya tahan (contoh: 2 minggu)",
      "catatan": "Penjelasan singkat bagaimana olahan ini cocok untuk usaha tersebut."
    }
  ]
}

Aturan nada:
- "hijau": langkah kebiasaan/operasional sederhana tanpa biaya
- "emas": langkah investasi kecil atau perubahan siklus
- "merah": peringatan mendesak, perlu tindakan segera

Aturan ikon_tipe:
- "check": kebiasaan/prosedur
- "snowflake": metode penyimpanan
- "cart": pola/frekuensi belanja
- "alert": peringatan keras`,
		req.NamaUsaha, req.KategoriUsaha,
		req.Komoditas, req.HargaPerKg,
		req.Bobot, req.Hari,
		req.Metode, req.ShelfLife, req.Decay*100,
		req.SisaKg, req.SusutKg, pctSusut,
		req.Rugi, pctRugi, nilaiBelanja,
		req.RugiBulanan,
		lewatBatasNote,
		metodePerban,
		terbaikLabel, hematPindah, hematBulanan,
		req.KategoriUsaha,
		hematBulanan,
	)
}

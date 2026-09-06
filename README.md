# Nawasena 🌿

**Sistem Pendukung Keputusan Pengadaan F&B untuk UMKM**

Nawasena (*Navigate Prices, Eliminate Waste*) adalah platform berbasis web yang membantu pelaku UMKM kuliner (warung, restoran, katering) dalam mengambil keputusan pengadaan bahan baku secara cerdas. Sistem ini menggabungkan tiga lapisan kecerdasan:
1. **Model Statistik Buatan Sendiri** — *Filtered Historical Simulation (FHS)* berbasis Python untuk prediksi rentang harga komoditas (interval kuantil P10/P50/P90) hingga 14 hari ke depan.
2. **Simulasi Fisika Susut Stok** — model peluruhan eksponensial untuk menghitung kerugian stok akibat pembusukan berdasarkan metode penyimpanan yang dipilih UMKM.
3. **Analisis Solusi AI (Google Gemini)** — menghasilkan rekomendasi aksi konkret dan mitigasi stok berlebih (resep olahan) berdasarkan kondisi pasar dan profil bisnis.

---

## 🏗️ Arsitektur Sistem

| Layer | Teknologi |
|---|---|
| **Frontend** | React 19 + TypeScript + Vite + TailwindCSS |
| **Backend** | Go (Golang) + Chi Router |
| **Database** | PostgreSQL (Supabase) |
| **Model ML/Statistik** | Python (NumPy + Pandas) — *Filtered Historical Simulation* |
| **Generative AI** | Google Gemini API |
| **Deployment** | Railway (Docker) |

**Cara kerja:** Frontend React di-*build* menjadi file statis, lalu disajikan langsung oleh server Go dalam satu binary tunggal. Model Python dijalankan secara *offline* (pipeline) untuk menghasilkan data prediksi harga yang disimpan ke database.

---

## 🤖 Model Statistik Buatan Sendiri — Filtered Historical Simulation (FHS)

Selain menggunakan Gemini untuk analisis kualitatif, Nawasena memiliki **model prediksi harga komoditas sendiri** yang dikembangkan menggunakan Python, berlokasi di folder `model/`.

### Cara Kerja Model

Model ini mengimplementasikan **Filtered Historical Simulation** — pendekatan statistik yang digunakan di dunia manajemen risiko keuangan, diadaptasi untuk prediksi harga bahan baku pangan:

```
Sumber Data (PIHPS BI)  ──►  Preprocessing  ──►  FHS Engine  ──►  Interval Kuantil
 scrape_pihps.py               (Pandas)          fit_quantiles.py    P10 / P50 / P90
```

1. **Pengumpulan Data** (`scrape_pihps.py`) — Menarik data harga historis dari PIHPS (Pusat Informasi Harga Pangan Strategis) Bank Indonesia untuk komoditas cabai.
2. **Pemodelan Volatilitas** (`fit_quantiles.py`) — Menghitung *log-return* harian, *rolling volatility* 30 hari, dan posisi harga relatif terhadap median 90 hari.
3. **Prediksi Probabilistik** — Menghasilkan interval prediksi harga untuk horizon 7 hari dan 14 hari ke depan:
   - **P10** = harga dalam skenario *optimis* (harga turun)
   - **P50** = harga dalam skenario *normal* (median)
   - **P90** = harga dalam skenario *pesimis* (harga naik)
4. **Validasi** (`backtest.py`) — Mengukur akurasi model dengan metrik MASE dan *coverage rate* interval prediksi.

### Performa Model (Hasil Backtest)

| Komoditas | Horizon | MASE | Coverage |
|---|---|---|---|
| Cabai Rawit Merah | 7 hari | 0.988 | 77.4% |
| Cabai Rawit Merah | 14 hari | 0.992 | 81.9% |
| Cabai Merah Keriting | 7 hari | 1.010 | 83.0% |
| Cabai Merah Keriting | 14 hari | 1.000 | 81.0% |

> **MASE < 1** berarti model lebih akurat dari *naïve baseline*. Coverage ~80% berarti 8 dari 10 harga aktual jatuh di dalam interval prediksi yang dihasilkan.

### Menjalankan Pipeline Python

```bash
# Masuk ke folder model
cd model

# Install dependensi Python
pip install -r requirements.txt

# Jalankan pipeline lengkap (scraping data + fit model + generate output)
python fit_quantiles.py

# Output akan tersimpan di folder data/:
# data/prices.csv       — data harga historis
# data/quantiles.csv    — snapshot prediksi per minggu
# data/metrics.csv      — metrik performa model
```

> Catatan: Untuk demo cepat, `fit_quantiles.py` menggunakan data sintetis (random walk berstruktur) yang merepresentasikan properti statistik data PIHPS nyata, sehingga pipeline dapat berjalan penuh tanpa bergantung koneksi ke server BI.

---

## ✅ Persyaratan Sistem (Prasyarat)

Pastikan komputer Anda sudah terinstal:

| Software | Versi Minimum | Kegunaan |
|---|---|---|
| **Go** | v1.21+ | Menjalankan backend |
| **Node.js** | v18+ | Mem-build frontend React |
| **Git** | Terbaru | Mengunduh kode sumber |

---

## 4. Cara Instalasi

### Langkah 1 — Clone Repositori

Buka **Terminal / Command Prompt / PowerShell**, lalu jalankan:

```bash
git clone https://github.com/Nawasena-Itechno/nawasena.git
cd nawasena
```

---

### Langkah 2 — Siapkan File Konfigurasi Environment (`.env`)

Buat file `.env` di folder root project (`nawasena/`). Anda bisa menyalin dari contoh yang tersedia:

```bash
# Di Windows (Command Prompt)
copy .env.example .env

# Di Linux / macOS / Git Bash
cp .env.example .env
```

Lalu buka file `.env` dan isi ketiga variabel berikut:

```env
# String koneksi ke database PostgreSQL (Supabase)
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require

# API Key untuk fitur Analisis AI (dapatkan dari Google AI Studio)
GEMINI_API_KEY=your_gemini_api_key_here

# Nama model Gemini yang digunakan
GEMINI_MODEL=gemini-3.6-flash
```

> **Cara mendapatkan `DATABASE_URL`:** Buka [supabase.com](https://supabase.com) → Pilih project Anda → **Settings → Database → Connection String → URI**. Salin dan ganti `[PASSWORD]` dengan password database Anda.

> **Cara mendapatkan `GEMINI_API_KEY`:** Kunjungi [aistudio.google.com](https://aistudio.google.com) → **Get API Key** → **Create API Key**.

---

### Langkah 3 — Setup Schema Database di Supabase

Buka **Dashboard Supabase** → **SQL Editor**, lalu jalankan script SQL berikut secara berurutan:

#### A. Aktifkan UUID Extension & Buat Tabel Pengguna

```sql
-- Aktifkan ekstensi UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabel pengguna aplikasi (menggantikan Supabase Auth)
CREATE TABLE IF NOT EXISTS public.app_users (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    email text UNIQUE NOT NULL,
    password_hash text NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Tabel profil bisnis UMKM
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid REFERENCES public.app_users(id) PRIMARY KEY,
    business_name text NOT NULL,
    fnb_category text,
    reference_market text,
    commodities jsonb NOT NULL DEFAULT '[]'::jsonb,
    storage_method text DEFAULT 'ambient',
    daily_decay_rate float8 DEFAULT 0.03,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);
```

#### B. Buat Tabel Master Data

```sql
-- Tabel master komoditas bahan baku
CREATE TABLE IF NOT EXISTS public.master_commodities (
    id text PRIMARY KEY,
    name text UNIQUE NOT NULL
);

-- Tabel master kategori F&B
CREATE TABLE IF NOT EXISTS public.master_fnb_categories (
    id text PRIMARY KEY,
    name text UNIQUE NOT NULL
);

-- Tabel master pasar acuan
CREATE TABLE IF NOT EXISTS public.master_markets (
    id text PRIMARY KEY,
    name text NOT NULL,
    region text
);

-- Tabel master metode penyimpanan
CREATE TABLE IF NOT EXISTS public.master_storage_methods (
    id text PRIMARY KEY,
    label text NOT NULL,
    short_label text NOT NULL,
    icon text,
    daily_decay_rate float8 NOT NULL,
    shelf_life_days int NOT NULL,
    description text,
    form_label text
);
```

#### C. Isi Data Master (Seed Data)

```sql
-- Isi komoditas
INSERT INTO master_commodities (id, name) VALUES
  ('cabai_merah_besar', 'Cabai Merah Besar'),
  ('cabai_merah_keriting', 'Cabai Merah Keriting'),
  ('cabai_rawit_hijau', 'Cabai Rawit Hijau'),
  ('cabai_rawit_merah', 'Cabai Rawit Merah')
ON CONFLICT (id) DO NOTHING;

-- Isi kategori F&B
INSERT INTO master_fnb_categories (id, name) VALUES
  ('ayam_geprek', 'Ayam Geprek'),
  ('katering', 'Katering'),
  ('restoran_padang', 'Restoran Padang'),
  ('warteg', 'Warteg')
ON CONFLICT (id) DO NOTHING;

-- Isi pasar acuan
INSERT INTO master_markets (id, name, region) VALUES
  ('pasar_induk_kramat_jati', 'Pasar Induk Kramat Jati', 'DKI Jakarta'),
  ('pasar_kebayoran_lama', 'Pasar Kebayoran Lama', 'DKI Jakarta'),
  ('pasar_mayestik', 'Pasar Mayestik', 'DKI Jakarta'),
  ('pasar_minggu', 'Pasar Minggu', 'DKI Jakarta'),
  ('pasar_pondok_labu', 'Pasar Pondok Labu', 'DKI Jakarta')
ON CONFLICT (id) DO NOTHING;

-- Isi metode penyimpanan
INSERT INTO "public"."master_storage_methods" ("id", "label", "short_label", "icon", "daily_decay_rate", "shelf_life_days", "description", "form_label") VALUES 
  ('airtight', 'Kotak Kedap Udara + Tisu Alas', 'Kedap Udara', '🥡', '0.005', 21, 'Wadah tertutup beralas tisu penyerap embun, disimpan di dalam chiller.', 'Kotak Kedap Udara + Tisu Alas — susut ±0,5%/hari, batas simpan hingga 21 hari'), 
  ('chiller', 'Chiller / Kulkas Rumah Tangga', 'Chiller', '❄️', '0.015', 14, 'Rak bawah kulkas 4–8 °C; memperlambat respirasi dan pertumbuhan jamur.', 'Chiller / Kulkas Rumah Tangga — susut ±1,5–2%/hari, batas simpan 10–14 hari'), 
  ('room', 'Suhu Ruang / Keranjang Terbuka', 'Suhu Ruang', '🧺', '0.03', 7, 'Bahan ditaruh di keranjang atau kantong di sudut dapur, tanpa pendingin.', 'Suhu Ruang / Keranjang Terbuka — susut ±3–4%/hari, batas simpan 5–7 hari')
ON CONFLICT (id) DO NOTHING;
```

---

## 5. Cara Penggunaan (Menjalankan Aplikasi)

### Mode A — Production (Paling Mudah, Cukup 1 Perintah Jalankan)

Mode ini menggabungkan frontend React dan backend Go menjadi satu program tunggal.

```bash
# Langkah 1: Install dependensi & build frontend React
cd web
npm install
npm run build
cd ..

# Langkah 2: Build backend Go (menghasilkan file server.exe)
go build -o server.exe ./cmd/server

# Langkah 3: Jalankan aplikasi
.\server.exe
```

Setelah berjalan, buka browser di: **[http://localhost:8080](http://localhost:8080)**

---

### Mode B — Development (Untuk Pengembangan / Melihat Perubahan Kode)

Jalankan frontend dan backend secara terpisah di dua terminal berbeda.

**Terminal 1 — Jalankan Backend Go:**
```bash
# Dari folder root nawasena/
go run ./cmd/server
```
Backend berjalan di: `http://localhost:8080`

**Terminal 2 — Jalankan Frontend React:**
```bash
# Dari folder root nawasena/
cd web
npm install
npm run dev
```
Frontend berjalan di: **[http://localhost:5173](http://localhost:5173)** (dengan hot-reload otomatis)

---

## 🗺️ Alur Penggunaan Aplikasi

```
1. Buka aplikasi → Halaman Landing
2. Klik "Mulai Gratis" → Halaman Registrasi
3. Daftar akun (3 langkah): Email/Password → Profil Bisnis → Detail Operasional
4. Masuk ke Dashboard utama
5. Gunakan fitur-fitur yang tersedia:
   - 📊 Ringkasan Harga — pantau harga pasar komoditas hari ini
   - 🔬 Simulasi Susut — simulasikan kerugian stok dan dapatkan solusi AI
   - 📦 Kartu Pengadaan — rekomendasi belanja mingguan
   - 🌐 Market Radar — analisis tren harga multi-komoditas
   - 📚 Ensiklopedia — referensi pengetahuan bahan baku
   - 👤 Profil — kelola data bisnis Anda
```

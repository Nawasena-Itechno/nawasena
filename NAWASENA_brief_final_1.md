# NAWASENA — Design Brief Final

**Berapa kilogram yang harus warung ini beli hari ini.**

Sistem pendukung keputusan pengadaan untuk UMKM F&B. Ia meramalkan rentang harga komoditas dari data harga publik, lalu mengubah rentang itu menjadi satu keputusan: berapa kilogram dibeli hari ini, untuk berapa minggu, dengan berapa persen kemungkinan keputusan itu keliru.

| | |
|---|---|
| **Kompetisi** | ITechno Cup 2026 — Web Development (Kategori Mahasiswa) |
| **Batas pengumpulan** | 6 September 2026, 23.59 WIB |
| **Dokumen ini** | 29 Agustus 2026 — menggantikan seluruh brief sebelumnya |
| **SDG** | 8 (Pekerjaan Layak & Pertumbuhan Ekonomi) — utama; 12 (Konsumsi & Produksi Bertanggung Jawab) — pendukung |
| **Status data** | Nyata. 2.184 hari, 4 komoditas, 8,6 tahun, sumber PIHPS Bank Indonesia |
| **Status model** | Sudah di-backtest. Angka di dokumen ini hasil pengukuran, bukan target |

---

## Daftar Isi

1. [Ringkasan](#1-ringkasan)
2. [Masalah](#2-masalah)
3. [Pengguna](#3-pengguna)
4. [Keputusan yang menopang segalanya](#4-keputusan-yang-menopang-segalanya)
5. [Empat alur P0](#5-empat-alur-p0)
6. [Layar](#6-layar)
7. [Mesin — L0 sampai L3](#7-mesin--l0-sampai-l3)
8. [Hasil terukur](#8-hasil-terukur)
9. [Substitusi varian](#9-substitusi-varian)
10. [Metrik dampak](#10-metrik-dampak)
11. [Demo yang dihitung](#11-demo-yang-dihitung)
12. [Data — sumber dan jebakannya](#12-data--sumber-dan-jebakannya)
13. [Teknologi](#13-teknologi)
14. [Pagar etika dan hukum](#14-pagar-etika-dan-hukum)
15. [Non-goals](#15-non-goals)
16. [Pemetaan ke kriteria penilaian](#16-pemetaan-ke-kriteria-penilaian)
17. [Jadwal 8 hari](#17-jadwal-8-hari)
18. [Risiko](#18-risiko)
19. [Pertanyaan juri dan jawabannya](#19-pertanyaan-juri-dan-jawabannya)
20. [Rujukan metode](#20-rujukan-metode--apa-yang-baku-apa-yang-kami-rakit)

---

## 1. Ringkasan

Nawasena menjawab dua pertanyaan dari satu mesin:

1. **Berapa harga cabai 7 dan 14 hari lagi?** → rentang P10–P50–P90, bukan angka tunggal
2. **Berapa kilogram yang harus saya beli hari ini?** → jumlah, jangka, harapan hemat, dan peluang rugi

Yang kedua memimpin; yang pertama ditampilkan di bawahnya sebagai dasar perhitungan. Urutan itu disengaja dan dijelaskan di §4.2.

**Tiga hal yang membedakan produk ini, dan ketiganya sudah terukur:**

- **Interval yang terkalibrasi.** Rentang 80% kami memuat harga sebenarnya **81,9% dari waktu** pada 237 titik uji. Label "80% keyakinan" harfiah benar dan bisa diperiksa.
- **Kami menguji premis kami sendiri dan menemukannya salah.** Menimbun cabai merugi **Rp 2,9 juta atas 4,6 tahun** bahkan pada asumsi susut paling murah hati. Jadi produk ini menyuruh warung berhenti menimbun — kebalikan dari premis awalnya.
- **Ramalan titik kami tidak lebih baik dari tebakan naif, dan kami mengatakannya.** MASE 0,99. Produk ini dirancang supaya tetap berguna dalam keadaan itu.

---

## 2. Masalah

Warung makan, katering, dan kedai membeli bahan segar secara reaktif. Mereka baru tahu harga cabai naik ketika sudah berdiri di pasar. Kalau mencoba menimbun tanpa hitungan, barangnya busuk.

**Yang hilang bukan informasi harga.** Negara sudah menerbitkannya harian lewat tiga sistem: PIHPS Bank Indonesia, Panel Harga Bapanas, dan SP2KP Kemendag. Semuanya gratis, publik, dan sebagian punya aplikasi ponsel.

**Yang hilang adalah keputusannya.** Tidak ada yang menghitung berapa kilogram yang harus dibeli hari ini oleh warung ini.

Perbedaannya struktural, bukan soal resolusi:

> Sistem nasional menjawab pertanyaan tentang **pasar** — satu jawaban yang sama untuk semua orang.
> Nawasena menjawab pertanyaan tentang **satu usaha** — jawabannya berbeda untuk tiap pengguna, karena bergantung pada pemakaian dan kondisi penyimpanan warung itu.

Dua warung di pasar yang sama, menghadapi harga yang sama, mendapat jawaban berbeda. Sistem nasional tidak bisa menghitung itu bukan karena kurang canggih, tapi karena mereka tidak memegang angka itu — dan tidak seharusnya memegangnya.

**PIHPS adalah satu dari tiga masukan kami**, bukan sesuatu yang kami bungkus: harga publik, angka pemakaian pengguna, dan kendala umur simpan.

---

## 3. Pengguna

| Peran | Siapa | Yang dilakukan | Autentikasi |
|---|---|---|---|
| **Pemilik usaha F&B** | Warung makan, katering, kedai | Mengisi pemakaian per minggu, membaca rekomendasi, menandai pembelian | Login |
| **Publik / juri** | Siapa pun | Membaca halaman prediksi, rapor model, dan metodologi | **Tanpa login** |

**Satu tipe pengguna.** Peran "penjual komoditas" (petani, pengepul) dibuang secara sadar — pengguna yang berbeda total, kerugiannya tidak berbatas, dan saran kapan menjual masuk wilayah nasihat spekulasi. Ditulis di non-goals.

Peran "Pemerintah / Command Center" juga dibuang. Alasannya di §15.

**Onboarding wajib sepuluh detik.** Pengguna mengetik satu angka: berapa kg komoditas itu dipakai per minggu. Data penjualan **tidak pernah** menjadi syarat — kalau produk baru berguna setelah pengguna mengunggah riwayat penjualan, tidak akan ada yang mencobanya.

---

## 4. Keputusan yang menopang segalanya

### 4.1 Produk ini pengambil keputusan, bukan peramal

Pertanyaan yang dijawab bukan *"berapa harga cabai minggu depan?"* melainkan *"berapa kilogram yang harus saya beli hari ini?"* — pertanyaan yang berbeda secara matematis, karena jawabannya ditentukan oleh pertukaran antara risiko harga dan risiko busuk, bukan oleh ketepatan tebakan harga.

**Konsekuensinya: produk tetap berguna meskipun ramalannya biasa saja.** Itu satu-satunya posisi yang aman, dan §8 membuktikan posisi itu memang dibutuhkan.

### 4.2 Keputusan memimpin, ramalan menopang

Ramalan tetap ditampilkan — pengguna memang menanyakannya, dan tanpa ia terlihat, rekomendasi kilogram menjadi kotak hitam. Tapi ia diletakkan **di bawah** keputusan, sebagai dasar perhitungan.

Kalau ramalan ditaruh di atas, pengguna dan juri menilai produk dari ketepatan ramalannya — satu-satunya hal yang tidak bisa dijamin.

### 4.3 Tidak pernah satu angka harga

Selalu P10–P50–P90 dengan horizonnya disebutkan. Ditegakkan lewat **satu komponen `<PerkiraanHarga>`** yang dipakai di kartu, tabel, notifikasi, halaman publik, dan ekspor — dan secara konstruksi tidak punya jalan merender angka tunggal.

Begitu "Rp 51.000" muncul telanjang sekali saja, pengguna akan mengingatnya sebagai janji.

### 4.4 Tidak ada angka akurasi tanpa tiga hal

**Horizon, baseline pembanding, dan jumlah titik uji.** Berlaku di README, di antarmuka, dan di panggung.

Ini bukan formalitas. Lihat §8.3.

### 4.5 Horizon ditentukan backtest, bukan keinginan

Sebuah horizon hanya tayang kalau lolos ambang: MASE < 1, coverage 75–85%, lebar interval < 70% terhadap nilai tengah. Yang gagal **ditolak secara terbuka**, bukan disembunyikan.

### 4.6 Data yang dipakai melatih dan menguji model selalu nyata

Suntikan hanya boleh sebagai mode berlabel **"Skenario simulasi — bukan data historis"**, dan tidak pernah menghasilkan angka yang diklaim. Profil warung demo boleh sintetis — itu data *pengguna*, bukan data *dunia*.

---

## 5. Empat alur P0

Ruang lingkup didefinisikan sebagai alur, bukan fitur, karena alur bisa didemokan utuh.

**Alur A — Warung mendapat keputusan pembelian.** *(tulang punggung)*
Login → isi pemakaian per minggu → kartu muncul: berapa kg, untuk berapa minggu, harapan hemat, peluang rugi, dan di bawahnya harga sekarang + perkiraan 7 dan 14 hari.
**Kalau hanya satu alur yang jadi, ini yang harus jadi.**

**Alur B — Mesin waktu.** Geser tanggal acuan ke titik mana pun dalam 2.184 hari riwayat nyata → sistem menghitung ulang memakai hanya data ≤ tanggal itu → tombol "apa yang sebenarnya terjadi" membuka jawabannya.

**Alur C — Sinyal substitusi.** Saat selisih harga antar varian tidak wajar, kartu muncul dengan angka penghematannya.

**Alur D — Rapor dan metodologi.** Halaman publik tanpa login: ramalan 8 minggu terakhir versus harga sebenarnya (termasuk yang meleset), lalu tautan ke tabel metrik lengkap.

---

## 6. Layar

### 6.1 Kartu keputusan *(layar utama)*

```
Beli 5 kg hari ini — cukup satu minggu
  Perkiraan hemat vs menimbun 2 minggu     Rp 84.000
  Kemungkinan rugi                         22% · hingga Rp 60.000
  ── Dasar perhitungan ──────────────────────────────
  Harga sekarang                           Rp 44.000/kg
  Perkiraan 7 hari                         Rp 40.100 – 55.300/kg
  Perkiraan 14 hari                        Rp 36.500 – 62.900/kg
  Susut diperhitungkan                     2%/hari (bisa diubah)
```

Sistem **harus** sanggup menyarankan membeli lebih sedikit. Sistem yang setiap saat menyuruh menimbun adalah sistem yang sedang menjual sesuatu.

### 6.2 Rapor model *(publik, tanpa login)*

```
Rapor 8 minggu terakhir · Cabai Rawit Merah, Jawa Barat
  11 Agt · ramalan Rp 38.000–59.000   aktual 47.000  ✓
  18 Agt · ramalan Rp 41.000–63.000   aktual 44.500  ✓
  25 Agt · ramalan Rp 36.000–55.000   aktual 61.000  ✗
  Masuk rentang 7 dari 8

Cakupan: Jawa Barat · 4 varian cabai · 2018–2026 · 2.184 hari
Sumber: PIHPS Bank Indonesia
```

**Tanda ✗ harus benar-benar ada.** Rapor yang seluruhnya centang akan dicurigai, dan wajar dicurigai.

### 6.3 `/metodologi`

Sumber data dan tanggal pengambilan, jumlah titik uji, tabel metrik per horizon per komoditas, grafik ramalan versus aktual, penanganan lubang data, dan bagian **Keterbatasan** yang ditulis sendiri.

### 6.4 `/demo`

Satu klik memuat skenario terisi. Juri tidak akan mengisi data sepuluh menit untuk melihat produk bekerja.

---

## 7. Mesin — L0 sampai L3

Dibangun dari bawah. Lapisan atas tidak boleh mulai sebelum lapisan bawahnya menghasilkan angka yang bisa dilihat.

### L0 · Data
Harga harian PIHPS · cuaca Open-Meteo di **koordinat sentra produksi pemasok** (Garut, Cianjur, Tasikmalaya, Brebes — bukan koordinat kota konsumen) · kalender hari besar 2018–2026.

Kalender adalah variabel eksogen paling jujur yang tersedia: nilainya di masa depan benar-benar sudah diketahui, tidak seperti curah hujan yang harus diramal dulu sebelum bisa dipakai meramal.

### L1 · Wasit
```
naive(h)          : p̂(t+h) = p(t)
seasonal_naive(h) : p̂(t+h) = p(t + h − 365)
moving_avg(h)     : p̂(t+h) = mean(p(t−6 … t))
```
Metrik utama **MASE** = galat model ÷ galat naif.

### L2 · Peramal — Filtered Historical Simulation terkondisi

Metodenya punya nama di literatur manajemen risiko: **Filtered Historical Simulation** (Barone-Adesi, Giannopoulos & Vosper 1999; Barone-Adesi, Engle & Mancini 2008). Strukturnya — taksir volatilitas bersyarat, standardisasi return historis dengannya, ambil kuantil empiris dari residual terstandardisasi, lalu skalakan ulang dengan volatilitas saat ini — adalah metode baku Value-at-Risk.

Tiga penyesuaian kami: penaksir volatilitas jendela bergulir 30 hari alih-alih GARCH, bekerja langsung pada return *h*-hari alih-alih agregasi satu langkah, dan satu lapis pengkondisian tambahan pada posisi harga terhadap median 90 hari.

```
r_harian(i) = ln(p_i / p_{i-1}) / sqrt(hari berlalu)     # menangani celah tak seragam
sigma(t)    = sd(r_harian, jendela 30 hari)
med90(t)    = median harga 90 hari
pos(t)      = p(t) / med90(t)

z_h(s)      = ln(p(s+h)/p(s)) / (sigma(s) * sqrt(h))
ember       = TERCILE pos — 3 ember, batas dihitung dari histori <= t saja
P_q         = p(t) * exp( kuantil_q(z dalam ember) * sigma(t) * sqrt(h) )
```

Sekitar 60 baris Python. Tidak ada kotak hitam. Saat ditanya *"kenapa angkanya segitu?"*, jawabannya bukan arsitektur model melainkan: **"karena dari sekian hari dalam sejarah yang keadaannya seperti hari ini, 10% berakhir di bawah Rp X dan 10% di atas Rp Y."**

**Tanpa kebocoran.** Pada tiap origin, hanya pasangan yang targetnya sudah terjadi (`k ≤ t`) yang dipakai — termasuk batas tercile. Diuji dengan:
```
forecast(asOf=T) pada dataset penuh  ==  forecast(asOf=T) pada dataset yang barisnya > T dihapus
```

### L3 · Pengambil keputusan

Persoalan persediaan stokastik. Masukan: sebaran harga dari L2, pemakaian per minggu **D**, laju susut **s**, umur simpan **L**.

```
kg_dibeli(k)   = Σ  D / (1−s)^((i−1)·7 + 3,5)          untuk i = 1..k
biaya_borong(k)= kg_dibeli(k) × p(t)
biaya_mingguan(k) = Σ (D / (1−s)^3,5) × p_i             p_i dari sebaran L2

k* = argmin E[biaya]  dengan syarat  7k ≤ L
```

Karena `p_i` adalah sebaran, perbandingan dijalankan di sepanjang kuantilnya → keluarannya **sebaran penghematan**, sehingga peluang rugi bisa disebutkan.

**Umur simpan di sini adalah kendala dalam optimisasi, bukan hitung mundur di layar.** Cara penyimpanan mengubah L dan s → mengubah k* → mengubah berapa kg yang disarankan.

### 7.1 Soal klaim AI — jawaban yang bertahan ke dua arah

| Lapisan | Apa yang sebenarnya terjadi | Belajar dari data? |
|---|---|---|
| L1 baseline | Aritmetika | Tidak |
| **L2 FHS terkondisi** | **Penaksir sebaran bersyarat non-parametrik** — strukturnya kNN pada ruang keadaan yang didiskretkan | **Ya** — menaksir kuantil, batas tercile, dan volatilitas dari data historis |
| L3 optimisasi persediaan | Aritmetika + pencarian atas *k* | Tidak |
| Substitusi | Rasio harga terhadap sejarahnya sendiri | Tidak |

**Jangan mengatakan "tidak ada machine learning di produk ini."** Itu overclaim ke arah sebaliknya dan bisa dipatahkan. L2 menaksir parameter dari data, dilatih pada rentang historis, dan diuji di luar sampel lewat walk-forward. Strukturnya pada dasarnya *k-nearest neighbour* pada ruang keadaan yang didiskretkan — dan kNN ada di setiap buku teks machine learning.

**Rumusan yang dipakai, hafalkan:**

> *"L2 adalah metode pembelajaran statistik non-parametrik — ia menaksir sebaran bersyarat dari data dan divalidasi walk-forward. Yang tidak ada di produk ini adalah jaringan saraf, LLM, dan optimisasi gradien. Kalau definisi machine learning yang Bapak/Ibu pakai mencakup estimasi non-parametrik seperti kNN, maka ya — ini machine learning yang sangat tua dan sangat sederhana. Kalau yang dimaksud model dengan bobot yang dilatih lewat gradient descent, tidak ada."*

Kalimat itu bertahan ke dua arah. Juri yang menyatakan "ini bukan AI" mendapat persetujuan; juri yang menyatakan "ini ML kan?" juga mendapat persetujuan. Tidak ada sisi yang bisa menjebak.

Regresi kuantil gradient boosting disiapkan sebagai Tier B dengan satu aturan: hanya masuk produk kalau MASE-nya mengalahkan Tier A pada backtest. Kalau kalah, dibuang dan kekalahannya ditulis di README.

Rubrik tidak memuat kriteria AI. Tidak ada nilai yang hilang karena jujur di sini, dan ada nilai yang hilang kalau klaimnya dipatahkan.

---

## 8. Hasil terukur

Backtest walk-forward, origin tiap ~7 hari, **2022-01 → 2026-08**, dilatih mulai 2018-01. Jawa Barat.

### 8.1 Cabai Rawit Merah

| Horizon | n uji | MAPE | MASE vs naive | Coverage | Lebar interval | Putusan |
|---|---|---|---|---|---|---|
| **7 hari** | 239 | 9,6% | **0,988** | **77,4%** | 37,5% | **TAYANG** |
| **14 hari** | 237 | 16,4% | **0,992** | **81,9%** | 69,3% | **TAYANG** |
| 21 hari | 236 | 21,8% | 0,981 | 82,2% | 98,0% | Tolak — terlalu lebar |
| 30 hari | 236 | 26,5% | 0,943 | 82,6% | 148,5% | Tolak — terlalu lebar |

**Ramalan titik praktis setara tebakan naif.** Ini sifat deret harga hortikultura, yang mendekati *random walk*. Yang berhasil adalah kalibrasi ketidakpastiannya — dan itulah yang dipakai L3.

Kebetulan yang menguntungkan: umur simpan cabai ~1–2 minggu, jadi L3 memang hanya perlu k = 1 dan 2 minggu. **Horizon yang sanggup dimodelkan sama persis dengan horizon yang dibutuhkan produk.**

### 8.2 Empat komoditas — apa yang boleh diklaim

| Komoditas | MASE h=7 | MASE h=14 | Coverage (semua horizon) |
|---|---|---|---|
| **Cabai Rawit Merah** | **0,99** | **0,99** | 77,4–82,6% |
| Cabai Rawit Hijau | 1,02 | 1,01 | 80,1–81,4% |
| Cabai Merah Keriting | 1,01 | 1,00 | 80,6–83,1% |
| Cabai Merah Besar | 1,00 | 1,02 | 79,7–79,9% |

**Dua gerbang berbeda untuk dua kegunaan berbeda:**

| Gerbang | Untuk | Syarat | Yang lulus |
|---|---|---|---|
| **Sebaran** — apa yang tayang & masuk L3 | Kartu kg, interval P10–P90 | coverage 75–85% + lebar < 70% | Keempatnya di h=7 dan h=14 |
| **Titik** — apa yang boleh diklaim | Klaim "lebih baik dari naif" | MASE < 1 | **Hanya Rawit Merah** |

### 8.3 Contoh yang wajib masuk slide

> **Cabai Rawit Hijau: MAPE 6,9% di h=7 — lebih kecil daripada Rawit Merah yang 9,6%. Tapi MASE-nya 1,02.**

Artinya untuk hijau, model kami **lebih buruk daripada menebak harga tidak berubah**, meskipun MAPE-nya terlihat lebih bagus. Hijau lebih stabil, jadi tebakan naif pun sudah cukup.

Ini bukti paling ringkas bahwa tim paham apa yang diukurnya — dan ditemukan di data sendiri, bukan dikutip dari buku.

### 8.4 Diagnostik yang membantah dugaan awal kami

**Menambah ember tidak membantu** (h=14): 1 ember 0,998 · **3 ember 0,992** · 5 ember 1,006 · 7 ember 0,996. Ember musim (3×2) lebih buruk: 1,013. **Tiga ember adalah optimumnya.**

**MASE per keadaan harga** (h=14): rendah 1,009 · **normal 0,930** · tinggi 1,030. Kami menduga model paling unggul saat harga tinggi karena mean reversion. Kenyataannya sebaliknya di horizon pendek. Mean reversion baru terbaca di h=30 (MASE 0,925, arah −9,9%).

**Akurasi arah**: 57,3% (h=7) · 53,6% (h=14) · 52,1% (h=21) · 62,7% (h=30). Sedikit di atas tebak-acak. Dilaporkan, tidak diiklankan.

### 8.5 Backtest mesin keputusan

Ambang impas — kenaikan harga yang dibutuhkan agar menimbun satu minggu ekstra untung:

| Laju susut | Ambang |
|---|---|
| 0,5%/hari | 3,6% |
| 2%/hari | 15,2% |
| 4%/hari | 33,1% |

Frekuensi kenaikan sebesar itu dalam 7 hari (2018–2026, Cabai Rawit Merah): >15% terjadi **11,6%** minggu · >35% terjadi **2,1%** minggu.

Menimbun buta, susut 0,5%/hari — asumsi paling murah hati yang masuk akal:

| Kebijakan | vs beli mingguan, 2022–2026 | Menang | Terburuk |
|---|---|---|---|
| Selalu borong 2 minggu | **−Rp 2.922.001** | 35% minggu | −Rp 194.633 |
| Selalu borong 4 minggu | **−Rp 17.222.637** | 33% minggu | −Rp 699.971 |

Sebabnya bisa dihitung:
```
titik impas rasio     = kg_borong(4) / kg_mingguan(4) = 20,88 / 20,35 = 1,0260
rasio nyata rata-rata = 1,0156       median = 0,9897
```
Kenaikan harga rata-rata dalam 4 minggu (1,6%) **lebih kecil daripada penalti susut (2,6%)**, bahkan pada susut 0,5%/hari.

**Premis brief lama — "beli lebih banyak sebelum harga naik" — salah untuk komoditas segar.** Mesin keputusan tetap berjalan; arah keluarannya yang berbalik.

*Caveat wajib: satu komoditas, satu provinsi, satu periode. Bawang merah dan beras belum diuji.*

---

## 9. Substitusi varian

### 9.1 Kelompoknya bukan kami yang tentukan

`GetCommoditiesTree` PIHPS sudah mengelompokkan komoditas lewat `TreeID` induk. Itu klasifikasi Bank Indonesia dan bisa disitir. Tabel `advice_text` yang berisi kalimat tulisan tim **dibuang seluruhnya**.

### 9.2 Dua jenis kelompok, hanya satu yang boleh disarankan

| Jenis | Kelompok | Boleh? |
|---|---|---|
| **Varian fungsional** — jenis berbeda, mutu setara | Cabai Rawit (Hijau ↔ Merah) · Cabai Merah (Besar ↔ Keriting) | **Ya** |
| **Tingkat mutu** — grade | Beras (6 tingkat) · Daging Sapi · Gula · Minyak Goreng | **Tidak pernah** |

**Nawasena tidak pernah menyarankan turun tingkat mutu.** Satu kolom boolean di tabel komoditas membuat saran "campur beras premium dengan medium" **tidak mungkin dihasilkan sistem** — bukan dilarang oleh kebijakan, tapi tidak ada jalannya di kode.

### 9.3 Pemicunya dihitung

```
rasio(A,B,t) = p_A(t) / p_B(t)
z(t)         = (rasio(t) − median90) / sd90
Sinyal bila  |z| >= 2,4  DAN kelompoknya varian_fungsional
```

Ambang 2,4 dikalibrasi dari data: pada |z| ≥ 1,5 alarm menyala **32% hari** — kelelahan alarm. Pada 2,4, sekitar 10% hari.

### 9.4 Hasil pengukuran

| Pasangan | Rasio median | Selisih saat sinyal | Untuk 5 kg | Episode | Korelasi |
|---|---|---|---|---|---|
| **Rawit Merah / Hijau** | 1,30 | **Rp 18.550/kg** | **Rp 92.750** | 56, median 9 hari | 0,54 |
| Merah Keriting / Besar | 0,95 | Rp 5.500/kg | Rp 27.500 | 97, median 3 hari | 0,79 |

**Pimpin dengan pasangan rawit.** Selisihnya 3,4× lebih besar, episodenya cukup panjang untuk ditindaklanjuti, geraknya lebih independen.

### 9.5 Jangan janjikan gapnya menutup

Saat z ≥ +1,5, rasio pasangan rawit turun hanya **47% dari waktu di h=7** — di bawah tebak-acak. Baru jelas di h=30 (76%).

Kartu substitusi hanya menyatakan keadaan **sekarang**, tidak meramalkan spread menutup. Dan wajib memuat konsekuensinya:

> *"Rawit hijau sedang murah tidak biasa dibanding rawit merah — selisih Rp 18.550/kg, hemat Rp 92.750 untuk 5 kg. Catatan: hijau bukan pengganti sempurna, rasa dan tingkat pedasnya berbeda. Ini keputusan dapur Anda, bukan keputusan kami."*

---

## 10. Metrik dampak

Resilience Score **dibuang**. Ia naik ketika pengguna mengikuti panduan Nawasena — itu metrik keterikatan produk, diberi nama dampak.

Tiga angka penggantinya, masing-masing dihitung dari harga publik dan masing-masing **bisa bernilai negatif**:

| | Metrik | Pembanding yang disebut di layar |
|---|---|---|
| **M1** | Rupiah terhindar dari menimbun | *"dibandingkan membeli 2 minggu sekaligus tiap belanja"* |
| **M2** | Rupiah dari substitusi | Hanya episode yang ditandai pengguna |
| **M3** | Selisih vs beli mingguan | Untuk cabai akan mendekati nol — **tetap tampilkan** |

M3 yang jujur bernilai nol, di sebelah M1 yang besar, membuktikan keduanya dihitung dan bukan dikarang.

**Aturan:**
- Setiap angka menyebut kebijakan pembandingnya. Sama seperti MASE — penghematan tanpa pembanding tidak berarti apa-apa
- `null`, bukan `0`, saat belum ada data → *"Belum ada data"*. Nol terbaca sebagai klaim
- Dua tingkat terpisah: **Potensi** (dari saran yang dikeluarkan, tanpa input pengguna) dan **Realisasi** (dari yang ditandai pengguna)
- **Tidak ada skor gabungan.** Menggabungkan angka terverifikasi dengan angka berasumsi menghasilkan Resilience Score jilid dua
- Laju susut adalah **asumsi**, jadi tampilkan hasilnya sebagai rentang 0,5–4%/hari, bukan satu angka

---

## 11. Demo yang dihitung

**Satu jalur kode. Tidak ada mode demo.**

Semua akses harga lewat `getPrices(komoditas, provinsi, asOf)` yang memfilter tanggal di level query. Produksi: `asOf = hari ini`. Demo: `asOf = tanggal pilihan juri`. Fungsi yang sama.

**Mesin waktu.** Juri memilih tanggal mana pun dari 2.184 hari data nyata. Sistem memakai hanya data ≤ tanggal itu, menghasilkan ramalan yang *akan* ia hasilkan hari itu, lalu tombol "apa yang sebenarnya terjadi" membuka jawabannya.

| Boleh diubah juri | Tidak boleh diubah |
|---|---|
| Tanggal acuan · pemakaian per minggu · kondisi penyimpanan · komoditas | Harga historis dan cuaca — mengubahnya berarti mengarang data |

**Nol panggilan jaringan saat demo.** Harga dan tabel kuantil ter-`go:embed` di dalam binary, lengkap dengan `source` dan `retrieved_at` per baris. Supabase hanya tersentuh saat login — seluruh permukaan demo berjalan tanpa kredensial dan tanpa jaringan.

### Urutan demo 3 menit

| Waktu | Aksi |
|---|---|
| 0:00 | Buka `/demo`, satu klik, sudah terisi |
| 0:20 | Kartu keputusan: kg di atas, dasar perhitungan di bawah |
| 0:40 | Ubah pemakaian 5 → 20 kg. Rekomendasi berubah tanpa reload |
| 1:20 | Geser ke tanggal sebelum lonjakan nyata → ramal → buka aktual → tepat |
| 2:00 | **Geser ke tanggal di mana model salah.** *"Ini yang kami maksud dengan MASE 0,99"* |
| 2:30 | Buka `/metodologi` |

Langkah 2:00 yang menentukan. Menunjukkan kegagalan sendiri, tanpa diminta, di panggung.

---

## 12. Data — sumber dan jebakannya

### Endpoint (terverifikasi 28 Agustus 2026)

```
GET https://www.bi.go.id/hargapangan/WebSite/Home/GetGridData1
    ?tanggal=2024-06-10        # WAJIB ISO
    &commodity=8_16            # TreeID dari GetCommoditiesTree
    &priceType=1               # 1 = Pasar Tradisional
    &isPasokan=1&jenis=1&periode=1
    &provId=0                  # 0 = semua provinsi sekaligus
```

Satu request = 34 provinsi. Data ada sejak **2018-01**; date picker di UI membatasi ke 2022, datanya tidak. Tingkat provinsi saja — parameter kabupaten/kota tidak berpengaruh.

### Tiga jebakan yang terbukti lewat pengujian

1. **Akhir pekan dan libur mengembalikan hari kerja terakhir, bukan error.** Minta 8 Jun 2024 (Sabtu) → dapat "07 Jun 24". Memakai tanggal yang *diminta* sebagai tanggal data akan menciptakan hari palsu ber-return nol → volatilitas ditaksir terlalu kecil → interval terlalu sempit → coverage gagal tanpa sebab yang terlihat.
   **Selalu pakai field `Tanggal` dari respons, lalu deduplikasi.**
2. **Format `10-06-2024` disalahartikan server menjadi 4 Oktober 2024.** Selalu ISO.
3. **`Nilai = 0` berarti tidak ada laporan, bukan harga nol.** Ubah jadi NULL sebelum apa pun.

### Kelengkapan (Jawa Barat, 4 komoditas)

2.184 dari 2.260 hari kerja = **96,6%**. 75 hari hilang: 19 dekat Idulfitri (25%), 11 Natal–Tahun Baru (15%), **45 tersebar (60%)**.

Blok: 39 blok 1 hari · 9 blok 2 hari · 4 blok 3 hari · **1 blok 6 hari** (pekan Idulfitri 2022).

**Penanganan:** interpolasi linear hanya untuk celah ≤ 3 hari, ditandai `imputed = true`. Blok 6 hari itu dikecualikan dari set uji, tidak ditambal. Persentase imputasi dilaporkan di `/metodologi`.

---

## 13. Teknologi

### 13.1 Stack

| Lapisan | Pilihan | Alasan |
|---|---|---|
| **Frontend** | React + Vite + TypeScript + Tailwind; Recharts untuk grafik | Iterasi cepat dalam 8 hari. SSR tidak bernilai apa pun di lomba ini, dan begitu logika ada di Go, Next.js hanya menjadi React yang lebih berat |
| **Backend** | **Go** (`net/http` + `chi`), satu binary | L3 murni kerja CPU atas array kecil; tipe statis mencegah kelas bug aritmetika yang mahal di sini |
| **Model** | **Python, luring/batch saja** | Memancarkan tabel kuantil, metrik, dan fixture paritas. **Tidak pernah ada di jalur permintaan** |
| **Data referensi**<br>(harga, kuantil, metrik) | **`go:embed` file CSV → struct di memori** | ~1 MB, ~20 ribu baris. Nol jaringan, nol kredensial, nol driver, tanpa cgo. Kueri jadi pemindaian slice — mikrodetik |
| **Data pengguna + Auth** | **Supabase** (Postgres + Auth) | Auth siap pakai; membangunnya sendiri di Go memakan satu hari yang tidak tersedia |
| **Deploy** | Satu binary Go ke Railway/Fly; bundle Vite ikut lewat `go:embed` | Satu URL, tanpa CORS, tanpa dua target deploy |
| **Data harga** | **PIHPS Bank Indonesia** via `GetGridData1` | Harian, per provinsi, 2018–2026. Atribusi + `retrieved_at` di tiap baris |
| **Cuaca** | **Open-Meteo** | Gratis, tanpa kunci API, riwayat + prakiraan 16 hari |

### 13.2 Kenapa data referensi tidak masuk Supabase

Ini satu-satunya keputusan stack yang perlu dijelaskan, dan alasannya langsung terkait penilaian.

Kalau harga dan tabel kuantil disimpan di Supabase, demo bergantung jaringan dan repo tidak bisa dijalankan tanpa kredensial. Padahal §11 mensyaratkan **nol panggilan jaringan saat demo**, dan juri akan meng-clone repo.

Dengan pembelahan ini:

- **Prediksi, mesin waktu, `/demo`, `/metodologi`, dan rapor model berjalan tanpa satu pun kredensial.** Juri clone, `go run .`, selesai.
- **Supabase hanya dipakai saat login** — menyimpan profil warung dan menandai pembelian.

Artinya seluruh bagian yang kami klaim bisa diverifikasi tanpa akses ke akun kami.

### 13.3 Kontrak modul — dua batas yang tidak boleh dilanggar

**Python memiliki (luring):** pembersihan data · penanganan lubang · pencocokan tabel kuantil per `(as_of, komoditas, horizon, ember)` · backtest · memancarkan `prices.csv`, `quantiles.csv`, `metrics.csv`, `parity_fixture.json`.

**Go memiliki (runtime):** menghitung σ(t), med90(t), pos(t) dari deret harga · menentukan ember · menerapkan penskalaan kuantil · optimisasi L3 atas *k* · z-rasio substitusi · auth · API.

> **Batas 1 — Go tidak pernah mem-*fit* apa pun.** Ia hanya menerapkan tabel yang dipancarkan Python. Kalau Go mulai menghitung kuantil sendiri, ada dua model yang akan menyimpang.
>
> **Batas 2 — tidak ada proses Python di jalur permintaan.** Tidak ada FastAPI, tidak ada subprocess. Kalau Python harus hidup saat demo, itu satu titik gagal tambahan untuk nol keuntungan.

### 13.4 Uji paritas — wajib

Rumus penskalaan `p(t) · exp(q · σ(t) · √h)` hidup di dua bahasa. Kalau keduanya menyimpang, **angka di layar berhenti cocok dengan angka di `/metodologi`** — kegagalan yang paling merusak, karena `/metodologi` adalah bagian terkuat produk ini.

```
Python  → parity_fixture.json   (~200 kasus historis: keadaan masukan → q10/q50/q90)
Go test → wajib mereproduksinya sampai pembulatan
```

Ini bukan beban tambahan melainkan satu klaim lagi yang bisa diuji, sejalan dengan uji kebocoran di §7. Tunjukkan tesnya saat ditanya.

### 13.5 Snapshot kuantil untuk mesin waktu

Alur B membutuhkan tabel kuantil **sebagaimana adanya pada tanggal yang dipilih juri**, bukan tabel terbaru — kalau tidak, terjadi kebocoran.

Python memancarkan snapshot mingguan: 240 minggu × 4 komoditas × 4 horizon × 3 ember ≈ **11.500 baris**. Go memilih snapshot dengan `as_of ≤ tanggal juri`. Mesin waktunya eksak, bebas kebocoran, dan seluruhnya dihitung di Go.

### 13.6 Struktur repo

```
nawasena/
├── cmd/server/main.go          # entry point, go:embed web/dist + data/
├── internal/
│   ├── forecast/               # sigma, med90, pos, ember, penskalaan kuantil
│   │   └── forecast_test.go    # <- uji paritas terhadap parity_fixture.json
│   ├── decision/               # L3: argmin atas k, susut, umur simpan
│   ├── substitution/           # z-rasio antar varian sekelompok
│   ├── store/                  # muat CSV ter-embed ke memori; klien Supabase
│   └── api/                    # handler chi
├── data/                       # DIPANCARKAN PYTHON, ikut di repo
│   ├── prices.csv
│   ├── quantiles.csv           # snapshot mingguan
│   ├── metrics.csv
│   └── parity_fixture.json
├── model/                      # Python, luring
│   ├── scrape_pihps.py
│   ├── clean.py
│   ├── fit_quantiles.py
│   ├── backtest.py
│   └── emit_fixture.py
├── web/                        # React + Vite + Tailwind
│   └── dist/                   # hasil build, di-embed
├── README.md
└── Makefile                    # make data · make build · make run
```

`make data` menjalankan pipeline Python dan menulis ulang `data/`. `make build` mem-build Vite lalu Go. `make run` menjalankan binary. Tiga perintah di README.

### 13.7 Yang sengaja tidak dipakai — tulis ini

- **Tidak ada jaringan saraf, LLM, atau optimisasi gradien.** Rekomendasi dihitung, bukan dibangkitkan. (Soal apakah L2 termasuk *machine learning*: lihat §7.1 — jawabannya bergantung definisi, dan kami tidak mengklaim ke arah mana pun)
- **Tidak ada Next.js.** Nilainya ada pada Server Components; begitu logika pindah ke Go, ia hanya menambah lapisan
- **Tidak ada ORM.** Datanya ~20 ribu baris di memori dan beberapa tabel Supabase. ORM menambah abstraksi tanpa menyelesaikan masalah apa pun di sini
- **Tidak ada Redis, tidak ada queue.** Tidak ada pekerjaan asinkron di jalur permintaan
- **Tidak ada PostGIS.** Tidak ada geometri di produk ini
- **Tidak ada pustaka peramalan siap pakai** (Prophet, statsmodels ARIMA). Metode kami 60 baris yang setiap angkanya bisa ditelusuri ke hari nyata di masa lalu; Prophet akan menyembunyikan itu di balik API
- **Tidak ada peta.** Lihat §15

---

## 14. Pagar etika dan hukum

**Bukan marketplace, bukan instrumen keuangan.** Hindari "kontrak berjangka", "futures", "investasi". Gunakan *rekomendasi pengadaan* dan *kalkulator belanja*. Ini Sistem Pendukung Keputusan internal.

**Menasihati pengadaan, tidak pernah menasihati perubahan produk yang disembunyikan dari pelanggan.** Batas ini menjaga produk tetap di lajurnya — pengguna Nawasena sedang *membeli*; begitu sistem mengatur apa yang mereka *jual*, risiko hukumnya berpindah ke kalian.

**Tidak pernah menyarankan turun tingkat mutu.** Ditegakkan lewat kolom `jenis_kelompok`, bukan lewat kebijakan.

**Tidak pernah menjamin.** Bahasa yang dipakai: *"berdasarkan data PIHPS sampai 28 Agustus 2026"*, bukan *"harga pasti naik"*.

**Provenans di antarmuka, bukan hanya di README.** Tiap angka membawa sumber dan tanggal pengambilannya.

**Data sintetis dilabeli sintetis.** Profil warung demo ditandai jelas. Data harga tidak pernah sintetis.

---

## 15. Non-goals

Ditulis supaya penambahan ruang lingkup harus lebih dulu berdebat melawan sesuatu yang eksplisit.

- **Tidak ada peta sebaran nasional.** Data 34 provinsi sudah kami miliki, tapi peta harga nasional adalah pertanyaan tentang *pasar*, yang sudah dijawab PIHPS lengkap dengan petanya sendiri. Nawasena menjawab pertanyaan tentang *satu usaha*. Kami memilih tidak membangun tiruan yang lebih buruk dari sistem yang sudah ada.
- **Tidak ada peran penjual komoditas.** Pengguna berbeda, kerugian tidak berbatas, dan saran kapan menjual masuk wilayah spekulasi.
- **Tidak ada dasbor pemerintah / Command Center.** Butuh banyak UMKM; kami punya nol. Mengisinya dengan warung karangan adalah hal yang paling kami hindari sepanjang proyek ini.
- **Tidak ada data penjualan sebagai syarat.** Satu angka pemakaian per minggu, sepuluh detik.
- **Tidak ada model bergradien (gradient boosting, jaringan saraf).** Disiapkan sebagai Tier B, hanya boleh masuk kalau menang backtest. Kalau kalah, dibuang dengan angkanya ditulis.
- **Tidak ada payment gateway, tidak ada aliran dana.**
- **Tidak ada aplikasi mobile native.** Web responsif.
- **Tidak ada multi-bahasa.** Bahasa Indonesia saja.

---

## 16. Pemetaan ke kriteria penilaian

### Babak penyisihan

| Kriteria (bobot) | Yang menjawabnya |
|---|---|
| Kesesuaian tema (20%) | SDG 8 lewat M1/M2/M3 yang dihitung dari harga publik; SDG 12 lewat pengurangan pembusukan. Angka yang bergerak saat datanya bergerak |
| Inovasi & orisinalitas (20%) | Mesin keputusan berbasis sebaran + temuan terukur bahwa menimbun komoditas segar merugi. Sebutkan PIHPS/Bapanas/SP2KP sebagai prior art, lalu tunjukkan celahnya |
| Fungsionalitas (20%) | Empat alur utuh + `/demo` + mesin waktu di atas 2.184 hari data nyata |
| UI/UX & responsivitas (15%) | Satu komponen `<PerkiraanHarga>`, hierarki keputusan-di-atas-ramalan, uji 360 px |
| Implementasi teknologi (15%) | L2 60 baris tanpa pustaka, uji kebocoran, protokol walk-forward, **dan daftar apa yang sengaja tidak dipakai** |
| Dokumentasi & repositori (10%) | README + `/metodologi` + bagian Keterbatasan yang ditulis sendiri |

### Babak final

Presentasi 25% + live demo 25% = separuh nilai. Alur B (mesin waktu) dan langkah 2:00 di §11 harus dilatih sampai hafal.

---

## 17. Jadwal 8 hari

**29 Agustus — pipeline Python dan kerangka repo.** Jalankan `fit_quantiles.py` atas 4 komoditas yang sudah ditarik, pancarkan `prices.csv`, `quantiles.csv` (snapshot mingguan), `metrics.csv`, dan `parity_fixture.json` ke `data/`. Bangun kerangka Go + Vite dengan `go:embed` sudah jalan, dan **uji paritas Go sudah hijau** sebelum apa pun yang lain ditulis. Struktur repo di §13.6.

**30–31 Agustus — Alur A.** Kartu keputusan, L3, `<PerkiraanHarga>`, form pemakaian. **Ini tulang punggung; kerjakan saat masih segar.**

**1 September — Alur B.** Mesin waktu, `asOf` sebagai parameter satu jalur, uji kebocoran.

**2 September — Alur C dan D.** Sinyal substitusi, rapor model, halaman publik.

**3 September — FEATURE FREEZE 18:00.** Responsif 360 px, aksesibilitas, empty state.

**4 September — `/metodologi` dan README.** Seluruh angka disalin dari `hasil_backtest.csv`, tidak diketik ulang. Bagian Keterbatasan ditulis jujur.

**5 September — uji clone dari nol dan submit.** Clone repo di laptop lain, ikuti README sendiri. Submit sebelum malam.

**6 September — cadangan. Jangan disentuh.**

---

## 18. Risiko

| Risiko | Tingkat | Mitigasi |
|---|---|---|
| Alur A tidak selesai tepat waktu | **Tinggi** | Dikerjakan 30–31 Ags saat paling segar. Cadangan: satu komoditas, satu horizon |
| Juri menganggap MASE 0,99 sebagai kegagalan | Sedang | Justru diucapkan lebih dulu, dengan coverage 81,9% sebagai jawabannya. §8.3 adalah senjatanya |
| Juri bertanya "apa bedanya dengan PIHPS" | Sedang | §2 adalah jawaban yang sudah dilatih. Sebut ketiga sistemnya lebih dulu |
| Angka di README tidak cocok dengan kode | Sedang | Semua angka disalin dari CSV hasil, tidak diketik ulang |
| Terrion (pesaing terkuat) lebih rapi secara tampilan | Sedang | Mereka berjalan di atas data sintetis dan menuliskannya sendiri. Kami mengukur diri terhadap kenyataan |
| Demo bergantung jaringan | Rendah | Nol panggilan jaringan; semua data di-seed |

---

## 19. Pertanyaan juri dan jawabannya

**"Angka ramalannya keluaran model apa, dan pernah diuji terhadap apa?"**
Kuantil empiris terkondisi atas 8,6 tahun data PIHPS. Backtest walk-forward, 237 titik uji, 2022–2026, tanpa kebocoran — dan ada uji otomatis yang membuktikannya.

**"Boleh saya ubah sendiri angkanya?"**
Curah hujan dan harga tidak, karena itu berarti mengarang data. Tanggalnya boleh — silakan pilih tanggal mana pun dari 2.184 hari, sistem menghitung ulang dengan hanya data sampai tanggal itu, lalu kita lihat bersama apa yang sebenarnya terjadi.

**"Apa bedanya dengan PIHPS Bank Indonesia?"**
PIHPS menjawab pertanyaan tentang pasar: berapa harga hari ini. Satu jawaban untuk semua orang. Kami menjawab pertanyaan tentang satu usaha: berapa kilogram yang harus warung ini beli hari ini. Dua warung di pasar yang sama, harga yang sama, mendapat jawaban berbeda — karena pemakaian dan penyimpanan mereka berbeda. Itu angka yang PIHPS tidak punya dan tidak seharusnya punya.

**"Ini AI atau bukan?"**
Tergantung definisi, dan kami tidak akan mengklaim ke arah mana pun. L2 adalah metode pembelajaran statistik non-parametrik — ia menaksir sebaran bersyarat dari data dan divalidasi walk-forward, strukturnya kNN pada ruang keadaan yang didiskretkan. Yang tidak ada di produk ini adalah jaringan saraf, LLM, dan optimisasi gradien. Kalau definisi machine learning yang Bapak/Ibu pakai mencakup estimasi non-parametrik, maka ya — ini machine learning yang sangat tua dan sangat sederhana. Kalau yang dimaksud model dengan bobot yang dilatih lewat gradient descent, tidak ada.

**"Metodenya kalian karang sendiri?"**
Tidak. L2 adalah varian *Filtered Historical Simulation*, metode baku Value-at-Risk (Barone-Adesi, Giannopoulos & Vosper 1999). MASE dari Hyndman & Koehler 2006. Validasi walk-forward praktik baku peramalan. L3 versi sederhana dari persoalan persediaan barang cepat rusak. **Yang kami rancang sendiri adalah perakitannya untuk masalah ini** — memasangkan peramalan sebaran dengan kendala umur simpan, dan memilih pengkondisian pada posisi harga terhadap median 90 hari. Daftar lengkap asal-usul tiap komponen ada di §20.

**"Saran substitusi ini datang dari mana?"**
Kelompoknya taksonomi komoditas Bank Indonesia di PIHPS. Kami menambahkan satu penanda: mana kelompok berisi varian setara, mana yang berisi tingkatan mutu. Sistem hanya menyarankan di dalam kelompok varian setara, tidak pernah menurunkan mutu.

**"Seberapa akurat?"**
Ramalan titik kami setara tebakan naif — MASE 0,99 pada 237 titik uji, dan untuk tiga varian lain bahkan sedikit lebih buruk. Yang kami lakukan dengan benar adalah mengukur ketidakpastiannya: interval 80% kami memuat harga sebenarnya 81,9% dari waktu. Mesin keputusan memakai sebaran itu, bukan titik tengahnya.

**"Datanya nyata?"**
2.184 hari harga harian dari PIHPS Bank Indonesia, 2018 sampai kemarin, kelengkapan 96,6%. Silakan buka bi.go.id/hargapangan dan periksa tanggal mana pun.

---

## 20. Rujukan metode — apa yang baku, apa yang kami rakit

Bagian ini ada supaya pertanyaan *"metodenya dari mana?"* punya jawaban tertulis. Salin ke `/metodologi`.

| Komponen | Asal | Status |
|---|---|---|
| MASE sebagai metrik utama | Hyndman & Koehler (2006), *Another look at measures of forecast accuracy* | Sitasi kanonik |
| Validasi walk-forward / rolling origin | Praktik baku peramalan deret waktu — Hyndman & Athanasopoulos, *Forecasting: Principles and Practice* | Sitasi |
| Pinball loss untuk penilaian kuantil | Proper scoring rules — Gneiting & Raftery (2007) | Sitasi |
| **Standardisasi volatilitas + kuantil empiris (inti L2)** | **Filtered Historical Simulation** — Barone-Adesi, Giannopoulos & Vosper (1999); Barone-Adesi, Engle & Mancini (2008) | **Sitasi** |
| Volatilitas bersyarat sebagai keadaan | ARCH — Engle (1982). Didukung studi ARCH harga cabai keriting Indonesia, data harian 2011–2015 | Sitasi |
| Penskalaan √h | Konvensi RiskMetrics (J.P. Morgan, 1996) | Sitasi |
| Ember posisi harga terhadap median 90 hari | Sinyal *relative value* / mean reversion yang lazim di komoditas | **Spesifikasi kami** — tidak ada satu paper kanonik |
| L3 optimisasi persediaan | Varian persoalan persediaan barang cepat rusak (tinjauan Nahmias 1982) | **Disederhanakan** — bukan newsvendor penuh |
| z-rasio sinyal substitusi | Sinyal *pairs trading* standar | **Spesifikasi kami** |
| Struktur L0–L3 dan perakitannya | Dirancang untuk masalah ini | **Milik kami** |

**Tiga ambang tayang** (§4.5) juga perlu dijelaskan asalnya:

| Ambang | Dasar |
|---|---|
| MASE < 1 | Definisi: mengalahkan baseline naif |
| Coverage 75–85% | Toleransi wajar di sekitar nominal 80% |
| **Lebar interval < 70%** | **Penilaian kami sendiri tentang kegunaan** — bukan standar literatur. Tulis begitu, jangan sajikan sebagai aturan baku |

Sikap yang dipakai: **metodenya baku dan bisa disitir; perakitannya milik kami.** Sebagian besar riset terapan bentuknya memang begitu, dan mengatakannya apa adanya lebih kuat daripada mengaku menemukan metode baru.

---

## Ringkasan

Satu warung mengetik satu angka — berapa kilogram cabai dipakai per minggu — dan mendapat satu keputusan: beli sekian kilogram hari ini, untuk sekian minggu, dengan sekian persen kemungkinan keliru. Di bawahnya, rentang harga 7 dan 14 hari yang menjadi dasarnya, dengan tingkat kesalahan yang kami umumkan sendiri.

Dan satu temuan yang membalik premis kami sendiri: untuk komoditas segar, menimbun merugi. Kami mengukurnya — Rp 2,9 juta atas 4,6 tahun — lalu membangun produk yang menyuruh berhenti melakukannya.

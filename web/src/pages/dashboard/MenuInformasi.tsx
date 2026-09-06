import { useState } from 'react';
import {
  BookOpen,
  Database,
  Filter,
  LineChart,
  Calculator,
  BellRing,
  ClipboardCheck,
  ArrowRight,
} from 'lucide-react';
import { Modal, SectionHead } from '../../components/dashboard/ui';
import { Reveal } from '../../components/motion/Reveal';

/* ──────────────────────────── Isi metodologi ──────────────────────────── */

interface Bagian {
  sub: string;
  paragraf?: string[];
  poin?: string[];
  rumus?: string;
  tabel?: { k: string; v: string }[];
}

interface Topik {
  id: string;
  judul: string;
  ringkas: string;
  detail: Bagian[];
}

interface Kelompok {
  id: string;
  label: string;
  ikon: typeof Database;
  intro: string;
  topik: Topik[];
}

const KELOMPOK: Kelompok[] = [
  {
    id: 'data',
    label: 'Dari mana data diambil',
    ikon: Database,
    intro:
      'Seluruh angka di dasbor berangkat dari empat sumber. Tidak ada angka yang dikarang sistem; yang dihasilkan model hanyalah proyeksi ke depan, dan itu pun selalu ditampilkan sebagai rentang.',
    topik: [
      {
        id: 'pihps',
        judul: 'Harga harian pasar tradisional — PIHPS Bank Indonesia',
        ringkas:
          'Basis utama sistem: 2.112 hari harga harian tingkat provinsi untuk empat varian cabai, periode 2018–2026.',
        detail: [
          {
            sub: 'Apa yang diambil',
            paragraf: [
              'Pusat Informasi Harga Pangan Strategis (PIHPS) Bank Indonesia melaporkan harga rata-rata pasar tradisional per provinsi setiap hari kerja. Sistem memakai kolom tanggal pelaporan bursa komoditas, bukan tanggal pengambilan data, agar tidak terbentuk deret harga datar palsu yang merusak estimasi volatilitas.',
              'Cakupan saat ini: provinsi Jawa Barat, dengan komoditas Cabai Rawit Merah, Cabai Rawit Hijau, Cabai Merah Keriting, dan Cabai Merah Besar.',
            ],
          },
          {
            sub: 'Untuk apa dipakai',
            poin: [
              'Menjadi harga hari ini yang tampil di menu Rekomendasi Belanja dan Radar Harga.',
              'Menjadi bahan mentah perhitungan volatilitas 30 hari dan median 90 hari.',
              'Menjadi deret rasio antar varian pada sinyal substitusi.',
              'Menjadi harga acuan yang mengubah bobot susut menjadi rupiah pada Simulasi Susut.',
            ],
          },
          {
            sub: 'Batasnya',
            paragraf: [
              'Harga PIHPS adalah rata-rata provinsi, bukan harga lapak tertentu. Harga di pasar acuan Anda bisa berbeda beberapa persen. Karena itu dasbor selalu menganjurkan membandingkan angka sistem dengan harga yang benar-benar Anda temui.',
            ],
          },
        ],
      },
      {
        id: 'kalender',
        judul: 'Kalender nasional & hijriyah',
        ringkas:
          'Hari libur, akhir pekan, Ramadan, Idulfitri, Iduladha, Natal, dan Nataru — variabel paling deterministik untuk lonjakan permintaan.',
        detail: [
          {
            sub: 'Apa yang diambil',
            paragraf: [
              'Kalender nasional dan hijriyah dipakai untuk menandai hari dengan pola permintaan menyimpang. Berbeda dengan cuaca, tanggal hari raya sudah diketahui jauh hari, sehingga menjadi variabel eksogen yang paling dapat diandalkan.',
            ],
          },
          {
            sub: 'Untuk apa dipakai',
            poin: [
              'Menjelaskan lonjakan musiman pada horizon menengah 1–3 bulan.',
              'Mengisi kalender musiman di menu Radar Harga & Anggaran.',
              'Menandai celah pelaporan struktural, misalnya pekan Idulfitri saat pasar tidak melapor.',
            ],
          },
        ],
      },
      {
        id: 'cuaca',
        judul: 'Cuaca sentra tani — Open-Meteo',
        ringkas:
          'Curah hujan, suhu, dan kelembapan harian di Garut, Brebes, Cianjur, dan Kediri, lengkap dengan prakiraan 16 hari.',
        detail: [
          {
            sub: 'Apa yang diambil',
            paragraf: [
              'Data historis dan prakiraan diambil dari Open-Meteo untuk titik koordinat sentra produksi utama. Yang dipakai bukan angka harian mentah, melainkan akumulasi curah hujan 7 dan 14 hari terakhir.',
            ],
          },
          {
            sub: 'Mengapa akumulasi, bukan harian',
            paragraf: [
              'Satu hari hujan deras jarang merusak panen. Yang merusak adalah hujan beruntun yang membuat bunga rontok dan buah membusuk di pohon sebelum sempat dipetik. Akumulasi menangkap pola itu, sementara angka harian hanya menangkap kebisingan.',
            ],
          },
        ],
      },
      {
        id: 'profil',
        judul: 'Profil dapur UMKM — isian Anda sendiri',
        ringkas:
          'Kebutuhan mingguan, metode simpan, laju susut, dan umur simpan. Inilah yang mengubah sebaran harga pasar menjadi angka kilogram belanja.',
        detail: [
          {
            sub: 'Apa yang diambil',
            tabel: [
              { k: 'D — kebutuhan mingguan', v: 'Langkah 3 pendaftaran, dalam kg per minggu' },
              { k: 's — laju susut harian', v: 'Diturunkan otomatis dari metode simpan' },
              { k: 'L — umur simpan', v: 'Batas hari kelayakan metode simpan' },
              { k: 'Pasar acuan', v: 'Konteks pembanding harga' },
              { k: 'Komoditas rutin', v: 'Menentukan komoditas yang dipantau' },
            ],
          },
          {
            sub: 'Mengapa ini yang paling menentukan',
            paragraf: [
              'Dua warung yang membeli komoditas sama pada hari sama bisa menerima rekomendasi kilogram yang berbeda jauh, semata karena metode simpannya berbeda. Model harga hanya memberi sebaran; profil dapur Andalah yang mengubahnya menjadi keputusan.',
              'Karena itu seluruh menu menampilkan bilah "Basis perhitungan" yang mengulang isian Anda — agar tidak ada angka yang muncul tanpa asal-usul yang bisa ditelusuri.',
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'praproses',
    label: 'Bagaimana data dibersihkan',
    ikon: Filter,
    intro:
      'Data harga pasar penuh lubang: hari libur, pasar tidak melapor, dan nilai nol yang sebenarnya berarti "tidak ada laporan". Penanganan yang keliru di tahap ini akan merusak seluruh estimasi volatilitas di tahap berikutnya.',
    topik: [
      {
        id: 'nol',
        judul: 'Penanganan nilai nol dan hari kosong',
        ringkas:
          'Harga 0 dikonversi menjadi NULL, bukan dianggap harga gratis. Deduplikasi memakai tanggal pelaporan aktual.',
        detail: [
          {
            sub: 'Aturannya',
            poin: [
              'Nilai harga 0 diperlakukan sebagai data hilang, bukan angka nyata.',
              'Baris ganda pada tanggal yang sama dihapus dengan mempertahankan tanggal pelaporan bursa.',
              'Deret harga per komoditas diurutkan menurut tanggal sebelum perhitungan apa pun.',
            ],
          },
          {
            sub: 'Mengapa penting',
            paragraf: [
              'Satu nilai nol yang lolos akan menghasilkan log-return sebesar minus tak hingga, dan volatilitas 30 hari yang dihitung dari sana menjadi tidak bermakna. Seluruh rentang ramalan yang bergantung padanya ikut rusak.',
            ],
          },
        ],
      },
      {
        id: 'imputasi',
        judul: 'Imputasi celah pendek dan celah struktural',
        ringkas:
          'Celah ≤ 3 hari ditambal interpolasi linier dan ditandai. Celah panjang tidak ditambal, melainkan diperlakukan sebagai celah nyata.',
        detail: [
          {
            sub: 'Aturannya',
            paragraf: [
              'Celah pelaporan tiga hari atau kurang — akhir pekan dan libur pendek — ditambal dengan interpolasi linier antara dua titik valid terdekat, lalu diberi penanda imputed = true agar jejaknya tetap terlihat saat audit.',
              'Celah lebih dari tiga hari, misalnya sepekan penuh Idulfitri saat pasar tutup, tidak ditambal. Menambal celah sepanjang itu berarti mengarang harga; sistem memilih memperlakukannya sebagai celah struktural dan melewatinya dalam perhitungan return.',
            ],
          },
          {
            sub: 'Dampak ke perhitungan',
            paragraf: [
              'Karena celah dilewati, jarak antar titik data tidak selalu satu hari. Log-return karena itu dinormalkan terhadap akar selisih hari, bukan diperlakukan seragam.',
            ],
            rumus: 'r_i = ln( p_i / p_{i−1} ) ÷ √Δt',
          },
        ],
      },
      {
        id: 'fitur',
        judul: 'Rekayasa fitur',
        ringkas:
          'Volatilitas bergulir 30 hari, posisi relatif terhadap median 90 hari, enkoding musiman siklikal, dan akumulasi curah hujan.',
        detail: [
          {
            sub: 'Volatilitas bergulir 30 hari (σ)',
            paragraf: [
              'Simpangan baku log-return 30 hari terakhir. Inilah ukuran seberapa gaduh pasar sedang berlangsung, dan menjadi pengali utama lebar rentang ramalan.',
            ],
            rumus: 'σ(t) = StDev( r_{t−29 … t} )',
          },
          {
            sub: 'Posisi relatif terhadap median 90 hari',
            paragraf: [
              'Rasio harga hari ini terhadap median 90 hari. Angka ini menentukan komoditas sedang berada di rezim harga rendah, normal, atau tinggi — dan rezim itu menentukan ember kuantil mana yang dipakai.',
            ],
            rumus: 'pos(t) = p(t) ÷ Median₉₀(t)',
          },
          {
            sub: 'Enkoding musiman siklikal',
            paragraf: [
              'Bulan dikodekan sebagai pasangan sinus dan kosinus agar Desember dan Januari dikenali model sebagai bulan yang bersebelahan, bukan berjarak sebelas bulan.',
            ],
            rumus: 'sin_month = sin(2π × bulan ÷ 12) ; cos_month = cos(2π × bulan ÷ 12)',
          },
          {
            sub: 'Akumulasi curah hujan sentra tani',
            paragraf: [
              'Penjumlahan curah hujan 7 dan 14 hari terakhir di wilayah sentra produksi, dipakai sebagai penanda potensi gangguan pasokan.',
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'model',
    label: 'Bagaimana harga diramalkan',
    ikon: LineChart,
    intro:
      'Sistem tidak pernah menjanjikan satu angka harga. Yang dihasilkan adalah rentang probabilitas: P10 sebagai skenario murah, P50 sebagai tengah, P90 sebagai skenario mahal. Menyajikan rentang adalah keputusan desain, bukan kekurangan.',
    topik: [
      {
        id: 'fhs',
        judul: 'Horizon pendek 7–14 hari — Filtered Historical Simulation',
        ringkas:
          'Metode non-parametrik turunan Value-at-Risk: return historis distandarkan volatilitas, lalu kuantilnya diskalakan kembali ke kondisi hari ini.',
        detail: [
          {
            sub: 'Langkah 1 — standardisasi return historis',
            paragraf: [
              'Untuk setiap titik histori s dan horizon h (7 atau 14 hari), dihitung return terstandardisasi: pergerakan harga selama h hari dibagi volatilitas saat itu. Hasilnya adalah pergerakan yang sudah "dilucuti" pengaruh ketenangan atau kegaduhan pasar pada masanya.',
            ],
            rumus: 'z_h(s) = ln( p(s+h) / p(s) ) ÷ ( σ(s) × √h )',
          },
          {
            sub: 'Langkah 2 — pengelompokan menurut rezim harga',
            paragraf: [
              'Seluruh histori dibagi menjadi tiga ember berdasarkan posisi harga terhadap median 90 hari: rendah (pos < 0,95), normal, dan tinggi (pos > 1,05). Pengelompokan ini penting karena perilaku harga saat sedang murah berbeda dari saat sedang mahal — harga yang sudah tinggi cenderung punya ruang turun lebih besar.',
            ],
          },
          {
            sub: 'Langkah 3 — penskalaan kembali ke hari ini',
            paragraf: [
              'Kuantil dari ember yang sesuai dikalikan volatilitas hari ini dan akar horizon, lalu ditempelkan pada harga hari ini. Hasilnya adalah tiga angka P10, P50, P90 yang tampil di Radar Harga.',
            ],
            rumus: 'P_q(t+h) = p(t) × exp( Q_q( z_h | Ember_t ) × σ(t) × √h )',
          },
          {
            sub: 'Mengapa non-parametrik',
            paragraf: [
              'Metode ini tidak mengandaikan harga pangan mengikuti distribusi normal — dan memang tidak. Harga cabai punya ekor kanan yang jauh lebih gemuk daripada normal. Dengan memakai kuantil empiris dari histori sungguhan, lonjakan ekstrem yang pernah terjadi tetap terwakili dalam rentang ramalan.',
            ],
          },
        ],
      },
      {
        id: 'menengah',
        judul: 'Horizon menengah 1–3 bulan — Quantile Gradient Boosting',
        ringkas:
          'LightGBM dengan Pinball Loss memproyeksikan persentil harga bulanan dari fitur kalender, curah hujan, dan tren makro.',
        detail: [
          {
            sub: 'Cara kerja',
            paragraf: [
              'Untuk perencanaan anggaran 30–90 hari, pendekatan FHS kurang memadai karena pada horizon sepanjang itu faktor struktural — musim panen, hari raya, cuaca sentra — lebih menentukan daripada volatilitas jangka pendek.',
              'Model gradient boosting dilatih langsung pada Pinball Loss, sehingga keluarannya berupa persentil harga, bukan satu nilai rata-rata. Fitur yang dipakai mencakup enkoding musiman siklikal, jarak hari ke hari raya terdekat, akumulasi curah hujan sentra, dan tren harga makro.',
            ],
          },
          {
            sub: 'Untuk apa dipakai di dasbor',
            poin: [
              'Menyusun kalender musiman di menu Radar Harga & Anggaran.',
              'Menandai bulan-bulan kritis yang membutuhkan cadangan kas lebih besar.',
            ],
          },
        ],
      },
      {
        id: 'rentang',
        judul: 'Cara membaca P10, P50, dan P90',
        ringkas:
          'Tiga angka ini bukan tebakan optimis, realistis, dan pesimis. Ketiganya adalah batas probabilitas yang punya arti statistik tegas.',
        detail: [
          {
            sub: 'Arti masing-masing',
            tabel: [
              { k: 'P10', v: 'Hanya 10% kemungkinan harga berada di bawah angka ini' },
              { k: 'P50', v: 'Titik tengah; peluang di atas dan di bawahnya sama besar' },
              { k: 'P90', v: 'Hanya 10% kemungkinan harga melampaui angka ini' },
            ],
          },
          {
            sub: 'Cara memakainya',
            poin: [
              'Rencanakan kas operasional pada P50 — itu angka yang paling wajar.',
              'Siapkan dana cadangan sampai P90, bukan menjadikan P90 sebagai anggaran utama.',
              'Jangan pernah merencanakan pada P10; peluangnya hanya satu dari sepuluh.',
              'Lebar rentang P90 − P10 adalah ukuran ketidakpastian. Rentang yang melebar berarti pasar sedang bergejolak, bukan berarti model sedang gagal.',
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'keputusan',
    label: 'Bagaimana kilogram ditentukan',
    ikon: Calculator,
    intro:
      'Sebaran harga baru berguna setelah diubah menjadi satu angka yang bisa dieksekusi di pasar. Lapisan ini membandingkan dua skenario pengadaan lalu memilih yang ekspektasi biayanya terendah.',
    topik: [
      {
        id: 'bobot',
        judul: 'Bobot kotor yang memperhitungkan susut',
        ringkas:
          'Yang dibeli selalu lebih banyak dari yang dipakai, karena sebagian bahan pasti menyusut sebelum sempat dimasak.',
        detail: [
          {
            sub: 'Rumusnya',
            paragraf: [
              'Agar bobot bersih yang benar-benar terpakai tetap sama dengan kebutuhan mingguan D, bobot yang dibeli harus dinaikkan sebesar susut yang akan terjadi selama stok menunggu giliran dipakai.',
              'Pangkat 3,5 pada pekan pertama dan 10,5 pada pekan kedua adalah umur rata-rata stok pada masing-masing pekan — bukan umur maksimalnya, karena stok dipakai bertahap setiap hari.',
            ],
            rumus: 'Kg_Dibeli(k) = Σᵢ₌₁..ₖ  D ÷ (1 − s)^((i−1)×7 + 3,5)',
          },
          {
            sub: 'Akibat praktisnya',
            paragraf: [
              'Semakin buruk metode simpan, semakin curam tambahan bobot yang harus dibeli — dan tambahan itu berlipat ganda untuk stok pekan kedua. Inilah sebab utama mengapa borong 2 minggu hampir selalu kalah bagi dapur bersuhu ruang.',
            ],
          },
        ],
      },
      {
        id: 'optimisasi',
        judul: 'Optimisasi 1 minggu vs 2 minggu',
        ringkas:
          'Dua skenario dihitung penuh, lalu dipilih yang ekspektasi biayanya terendah — dengan syarat tidak melanggar umur simpan.',
        detail: [
          {
            sub: 'Dua skenario yang dibandingkan',
            tabel: [
              {
                k: 'Belanja mingguan',
                v: 'Beli 1 minggu pada harga hari ini, beli lagi 1 minggu depan pada harga ramalan',
              },
              {
                k: 'Borong 2 minggu',
                v: 'Beli kebutuhan 2 minggu sekaligus, seluruhnya pada harga hari ini',
              },
            ],
          },
          {
            sub: 'Kriteria pemilihan',
            paragraf: [
              'Sistem memilih skenario dengan ekspektasi total biaya terendah. Borong hanya boleh dipilih bila umur simpan metode dapur menutup 14 hari penuh — pagar keamanan mutu yang tidak bisa dilanggar sekalipun secara harga menguntungkan.',
            ],
            rumus: 'k* = argmin_{k ∈ {1,2}}  E[ Total_Biaya(k) ]   dengan syarat  7k ≤ L',
          },
          {
            sub: 'Harga impas',
            paragraf: [
              'Titik temu kedua skenario disebut harga impas: harga pekan depan yang membuat kedua pilihan berbiaya persis sama. Bila ramalan harga pekan depan berada di bawahnya, belanja mingguan menang; bila di atasnya, borong menang.',
              'Angka inilah yang ditampilkan sebagai "Harga impas menimbun" di menu Rekomendasi Belanja, lengkap dengan persentase kenaikan yang dibutuhkan.',
            ],
            rumus: 'P* = p(t) × ( Kg_Borong − Kg_Minggu1 ) ÷ Kg_Minggu1',
          },
        ],
      },
      {
        id: 'risiko',
        judul: 'Peluang meleset dan kerugian maksimal',
        ringkas:
          'Risiko keputusan diturunkan dari sebaran ramalan itu sendiri, bukan angka tetap yang ditempelkan.',
        detail: [
          {
            sub: 'Cara menghitung peluang',
            paragraf: [
              'Sebaran lognormal dicocokkan pada tiga kuantil ramalan 7 hari. Karena P10 dan P90 berjarak 2 × 1,2816 simpangan baku pada skala logaritma, parameter sebarannya dapat dipulihkan langsung dari ketiga angka tersebut.',
              'Peluang keputusan meleset adalah peluang harga pekan depan melewati harga impas ke arah yang merugikan skenario terpilih.',
            ],
            rumus: 'σ_h = ln(P90 / P10) ÷ (2 × 1,2816) ;  μ = ln(P50) ;  peluang = 1 − Φ( (ln P* − μ) ÷ σ_h )',
          },
          {
            sub: 'Cara menghitung kerugian maksimal',
            paragraf: [
              'Bila sistem memilih belanja mingguan, kerugian terburuk terjadi saat harga pekan depan menyentuh batas atas ramalan P90. Bila sistem memilih borong, kerugian terburuk terjadi saat harga justru jatuh ke batas bawah P10.',
              'Angka nol pada kerugian maksimal bukan kesalahan: artinya bahkan pada batas ramalan terburuk pun skenario terpilih masih lebih murah daripada alternatifnya.',
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'peringatan',
    label: 'Bagaimana peringatan bekerja',
    ikon: BellRing,
    intro:
      'Sistem memiliki tiga jenis peringatan yang bekerja dengan ambang berbeda. Semuanya dirancang agar jarang menyala — peringatan yang terlalu sering muncul akan diabaikan pengguna.',
    topik: [
      {
        id: 'substitusi',
        judul: 'Peringatan alih varian (sinyal substitusi)',
        ringkas:
          'Menyala bila rasio harga antar varian menyimpang ≥ 2,4 simpangan baku DAN varian pengganti memang lebih murah.',
        detail: [
          {
            sub: 'Mekanismenya',
            paragraf: [
              'Harga antar varian cabai biasanya bergerak beriringan dengan rasio yang cukup stabil. Sistem memantau deret rasio 90 hari terakhir, lalu mengukur seberapa jauh rasio hari ini menyimpang dari median dan simpangan bakunya.',
              'Harga kedua varian disandingkan berdasarkan tanggal pelaporan yang sama, bukan urutan baris data — kedua komoditas punya jumlah hari pelaporan berbeda, sehingga penyandingan lewat indeks akan membandingkan tanggal yang keliru.',
            ],
            rumus: 'Rasio(t) = p_A(t) ÷ p_B(t) ;  z(t) = ( Rasio(t) − Median₉₀ ) ÷ StDev₉₀',
          },
          {
            sub: 'Dua syarat yang harus terpenuhi bersamaan',
            poin: [
              'z(t) ≥ 2,4 — penyimpangan rasio cukup besar untuk disebut anomali, bukan gejolak harian biasa.',
              'p_B(t) < p_A(t) — varian pengganti benar-benar lebih murah hari ini.',
            ],
          },
          {
            sub: 'Mengapa syarat arah penting',
            paragraf: [
              'Penyimpangan rasio ke arah sebaliknya berarti varian utama justru sedang murah. Tanpa syarat arah, sistem akan menyarankan beralih ke varian yang lebih mahal dan menyebutnya penghematan — kesalahan yang justru merugikan pengguna.',
            ],
          },
          {
            sub: 'Pagar etika',
            paragraf: [
              'Pasangan varian dibatasi pada yang setara fungsi dan mutu. Sistem tidak pernah menyarankan penurunan grade komoditas pokok, pencampuran bahan tidak layak, atau pengurangan takaran porsi. Rekomendasi campuran juga dibatasi 30–40% agar karakter rasa tetap terjaga.',
            ],
          },
        ],
      },
      {
        id: 'batas-simpan',
        judul: 'Peringatan batas umur simpan',
        ringkas:
          'Menyala ketika rencana penyimpanan melewati batas kelayakan metode dapur yang Anda daftarkan.',
        detail: [
          {
            sub: 'Kapan muncul',
            poin: [
              'Di Rekomendasi Belanja: sebagai pagar yang menolak skenario borong 2 minggu bila L < 14 hari.',
              'Di Simulasi Susut: sebagai peringatan merah saat lama simpan yang diuji melewati batas metode.',
              'Di kurva penyusutan: sebagai garis putus-putus merah pada hari batas.',
            ],
          },
          {
            sub: 'Mengapa bukan sekadar soal bobot',
            paragraf: [
              'Melewati batas umur simpan berbeda dari sekadar kehilangan bobot. Di luar batas itu, bahan yang tersisa mungkin masih terhitung di timbangan tetapi mutunya sudah tidak layak disajikan. Karena itu peringatannya bersifat mutlak dan tidak bisa ditawar oleh keuntungan harga.',
            ],
          },
        ],
      },
      {
        id: 'tingkat-susut',
        judul: 'Peringatan tingkat kerugian susut',
        ringkas:
          'Solusi di menu Simulasi Susut menyesuaikan diri dengan besar kerugian: ringan, sedang, berat, atau kritis.',
        detail: [
          {
            sub: 'Ambang tiap tingkat',
            tabel: [
              { k: 'Ringan', v: 'Kerugian < Rp 25.000 dan < 8% nilai belanja' },
              { k: 'Sedang', v: 'Kerugian < Rp 100.000 dan < 16% nilai belanja' },
              { k: 'Berat', v: 'Kerugian < Rp 300.000' },
              { k: 'Kritis', v: 'Kerugian ≥ Rp 300.000' },
            ],
          },
          {
            sub: 'Mengapa dua ukuran sekaligus',
            paragraf: [
              'Nilai rupiah saja tidak cukup. Kerugian Rp 80.000 dari belanja Rp 200.000 jauh lebih gawat daripada kerugian yang sama dari belanja Rp 2.000.000. Karena itu tingkat ditentukan oleh nilai absolut sekaligus porsinya terhadap nilai belanja.',
              'Solusi yang ditawarkan meningkat sesuai tingkat: dari perbaikan kebiasaan tanpa biaya, naik ke perbaikan metode simpan, lalu perubahan siklus belanja, hingga penghentian pola penimbunan.',
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'evaluasi',
    label: 'Bagaimana model diuji',
    ikon: ClipboardCheck,
    intro:
      'Model yang tidak diuji terbuka tidak layak dipakai mengambil keputusan uang. Pengujian memakai walk-forward validation tanpa kebocoran data masa depan ke masa lalu.',
    topik: [
      {
        id: 'mase',
        judul: 'MASE — apakah model mengalahkan tebakan naif',
        ringkas:
          'Rasio galat model terhadap galat tebakan "harga besok sama dengan harga hari ini". Syarat lulus: di bawah 1,0.',
        detail: [
          {
            sub: 'Definisinya',
            paragraf: [
              'Mean Absolute Scaled Error membandingkan galat model dengan galat metode paling sederhana yang mungkin: menebak harga besok sama dengan harga hari ini. Nilai di bawah 1,0 berarti model benar-benar menambah nilai; nilai di atas 1,0 berarti tebakan naif lebih baik dan model tidak layak dipakai.',
            ],
            rumus: 'MASE = MAE_model ÷ MAE_naif',
          },
          {
            sub: 'Mengapa bukan MAPE',
            paragraf: [
              'Persentase galat menjadi tidak stabil pada harga rendah dan menghukum kesalahan secara tidak seimbang antar komoditas. MASE tidak punya masalah itu karena penyebutnya adalah tolok ukur yang sama-sama diukur pada deret yang sama.',
            ],
          },
        ],
      },
      {
        id: 'coverage',
        judul: 'Cakupan interval — apakah rentangnya jujur',
        ringkas:
          'Persentase kejadian nyata yang jatuh di antara P10 dan P90. Syarat lulus: berada di 75–85%.',
        detail: [
          {
            sub: 'Cara menguji',
            paragraf: [
              'Rentang P10–P90 secara teori seharusnya memuat 80% kejadian nyata. Bila cakupan riil jauh di bawah 80%, rentangnya terlalu sempit dan model terlalu percaya diri. Bila jauh di atas 80%, rentangnya terlalu lebar sehingga benar tetapi tidak berguna.',
              'Syarat tambahan: lebar interval harus di bawah 70% terhadap nilai median. Rentang yang selalu benar karena sangat lebar tidak membantu siapa pun mengambil keputusan.',
            ],
          },
          {
            sub: 'Walk-forward validation',
            paragraf: [
              'Pengujian dilakukan dengan menggeser titik asal secara berurutan: model hanya boleh melihat data sampai tanggal tertentu, lalu diuji pada hari-hari sesudahnya. Tidak ada informasi masa depan yang bocor ke masa lalu — inilah sebabnya mesin waktu di bilah atas dasbor dapat dipakai untuk menguji ulang ramalan sistem pada tanggal historis mana pun.',
            ],
          },
        ],
      },
    ],
  },
];

/* ──────────────────────────── Komponen ──────────────────────────── */

export default function MenuInformasi() {
  const [aktif, setAktif] = useState<Topik | null>(null);

  return (
    <div className="space-y-8">
      <Reveal>
        <section className="relative overflow-hidden rounded-[32px] bg-[#0D3311] p-7 text-white">
          <div className="hairline-grid pointer-events-none absolute inset-0 opacity-10" />
          <div className="pointer-events-none absolute -right-16 -top-16 h-60 w-60 rounded-full bg-[#2E7D32] opacity-50 blur-3xl anim-float" />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#66BB6A]/40 bg-[#14471C]/70 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#A5D6A7]">
              <BookOpen className="h-3.5 w-3.5" /> Informasi tambahan
            </span>
            <h2 className="mt-4 max-w-3xl font-display text-3xl font-black leading-tight">
              Seluruh metode, sumber data, dan cara kerja peringatan — terbuka
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#C8E6C9]">
              Halaman ini menjabarkan apa yang terjadi di balik setiap angka yang Anda lihat: dari
              mana datanya diambil, bagaimana dibersihkan, model apa yang meramal harga, bagaimana
              kilogram belanja ditentukan, dan pada ambang berapa tiap peringatan menyala. Tekan{' '}
              <strong className="text-white">Lihat lebih detail</strong> pada poin mana pun untuk
              membaca mekanismenya secara lengkap.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {KELOMPOK.map((g) => (
                <a
                  key={g.id}
                  href={`#kel-${g.id}`}
                  className="rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-[#C8E6C9] transition-colors hover:bg-white/20 hover:text-white"
                >
                  {g.label}
                </a>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      {KELOMPOK.map((g, gi) => {
        const Ikon = g.ikon;
        return (
          <Reveal key={g.id} delay={gi * 40}>
            <section id={`kel-${g.id}`} className="scroll-mt-24">
              <SectionHead
                eyebrow={`Bagian ${gi + 1}`}
                title={g.label}
                desc={g.intro}
                right={
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#E8F5E9] text-[#1B5E20]">
                    <Ikon className="h-6 w-6" />
                  </span>
                }
              />

              <div className="grid gap-3 md:grid-cols-2">
                {g.topik.map((t, i) => (
                  <article
                    key={t.id}
                    className="group flex flex-col justify-between rounded-3xl border border-[#A5D6A7]/70 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#66BB6A] hover:shadow-[0_24px_48px_-34px_rgba(13,51,17,0.9)]"
                  >
                    <div>
                      <div className="flex items-start gap-3">
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#1B5E20] font-mono text-[11px] font-bold text-white">
                          {gi + 1}.{i + 1}
                        </span>
                        <h3 className="font-display text-base font-bold leading-snug text-[#0D3311]">
                          {t.judul}
                        </h3>
                      </div>
                      <p className="mt-2.5 text-sm leading-relaxed text-[#4B6149]">{t.ringkas}</p>
                    </div>

                    <button
                      onClick={() => setAktif(t)}
                      className="mt-4 inline-flex items-center gap-1.5 self-start rounded-full bg-[#E8F5E9] px-4 py-2 text-xs font-bold text-[#1B5E20] transition-colors group-hover:bg-[#1B5E20] group-hover:text-white"
                    >
                      Lihat lebih detail
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </button>
                  </article>
                ))}
              </div>
            </section>
          </Reveal>
        );
      })}

      <Reveal>
        <p className="rounded-3xl border border-[#A5D6A7]/70 bg-white p-5 text-xs leading-relaxed text-[#6B7F69]">
          Angka bobot inflasi dan harga acuan merujuk publikasi PIHPS Bank Indonesia serta rilis
          inflasi BPS. Laju susut merupakan estimasi operasional dapur yang diturunkan dari rentang
          umur simpan pascapanen, bukan hasil uji laboratorium. Seluruh rumus di halaman ini adalah
          rumus yang benar-benar dijalankan sistem, bukan penyederhanaan untuk keperluan penyajian.
        </p>
      </Reveal>

      {/* ── Popup detail ───────────────────────────────────────────────── */}
      <Modal
        open={Boolean(aktif)}
        onClose={() => setAktif(null)}
        eyebrow="Cara kerja terperinci"
        title={aktif?.judul ?? ''}
      >
        {aktif && (
          <div className="space-y-4">
            <p className="rounded-2xl bg-[#E8F5E9] p-4 text-sm font-semibold leading-relaxed text-[#1B5E20]">
              {aktif.ringkas}
            </p>

            {aktif.detail.map((b) => (
              <div key={b.sub} className="rounded-2xl border border-[#A5D6A7]/60 bg-white p-5">
                <h4 className="flex items-center gap-2 font-display text-sm font-bold text-[#0D3311]">
                  <span className="h-3.5 w-1 rounded-full bg-[#D3BE6D]" />
                  {b.sub}
                </h4>

                {b.paragraf?.map((p) => (
                  <p key={p} className="mt-2.5 text-sm leading-relaxed text-[#31462F]">
                    {p}
                  </p>
                ))}

                {b.poin && (
                  <ul className="mt-3 space-y-2">
                    {b.poin.map((p) => (
                      <li key={p} className="flex gap-2.5 text-sm leading-relaxed text-[#31462F]">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#66BB6A]" />
                        {p}
                      </li>
                    ))}
                  </ul>
                )}

                {b.tabel && (
                  <dl className="mt-3 divide-y divide-[#E8F5E9] overflow-hidden rounded-xl border border-[#E8F5E9]">
                    {b.tabel.map((r) => (
                      <div key={r.k} className="grid gap-1 p-3 sm:grid-cols-[minmax(0,10rem)_1fr] sm:gap-3">
                        <dt className="font-mono text-xs font-bold text-[#1B5E20]">{r.k}</dt>
                        <dd className="text-sm leading-relaxed text-[#31462F]">{r.v}</dd>
                      </div>
                    ))}
                  </dl>
                )}

                {b.rumus && (
                  <p className="mt-3 overflow-x-auto whitespace-nowrap rounded-xl bg-[#0D3311] px-4 py-3 font-mono text-[12px] text-[#C8E6C9]">
                    {b.rumus}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}

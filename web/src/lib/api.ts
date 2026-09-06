/** Klien API Nawasena beserta bentuk data yang dikembalikan backend. */

export const API_BASE: string =
  (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/$/, '') ||
  (import.meta.env.DEV ? 'http://localhost:8080' : '');

export interface MasterCommodity {
  id: string;
  name: string;
}

export interface MasterCategory {
  id: string;
  name: string;
}

export interface MasterMarket {
  id: string;
  name: string;
  region: string;
}

export interface MasterStorageMethod {
  id: string;
  label: string;
  short_label: string;
  icon: string;
  daily_decay_rate: number;
  shelf_life_days: number;
  description: string;
  form_label: string;
}

export interface MetadataResponse {
  commodities: MasterCommodity[];
  categories: MasterCategory[];
  markets: MasterMarket[];
  storage_methods: MasterStorageMethod[];
}

export async function fetchMetadata(signal?: AbortSignal): Promise<MetadataResponse> {
  const res = await fetch(`${API_BASE}/api/v1/public/metadata`, {
    signal,
  });
  if (!res.ok) throw new Error('Gagal memuat data master.');
  return res.json();
}

export interface SubstitutionDetail {
  /** Sinyal menyala hanya bila rasio menyimpang DAN varian alih benar-benar lebih murah. */
  Aktif: boolean;
  Rekomendasi: string;
  Hemat: number;
  Alasan: string;
  Z: number;
  Ambang: number;
  HargaAsal: number;
  HargaAlih: number;
  SelisihPerKg: number;
  Rasio: number;
  RasioMedian: number;
  RasioSD: number;
  KgDipakai: number;
  Tanggal: string;
}

export interface DecisionResult {
  KgDibeli: number;
  MingguDibeli: number;
  PotensiHemat: number;
  PeluangRugi: number;
  RugiMaksimal: number;

  PemakaianMingguan: number;
  LajuSusutHarian: number;
  UmurSimpanHari: number;

  KgMinggu1: number;
  KgMinggu2: number;
  KgBorong: number;
  MarginKg: number;

  HargaSekarang: number;
  HargaHarapanDepan: number;

  BiayaMingguan: number;
  BiayaBorong: number;

  HargaImpas: number;
  KenaikanImpas: number;

  BorongTerkunci: boolean;
  AlasanKunci: string;
}

export interface TitikHarga {
  tanggal: string;
  harga: number;
}

export interface ProcurementResponse {
  komoditas: string;
  provinsi: string;
  as_of: string;
  harga_sekarang: number;
  p7_10: number;
  p7_50: number;
  p7_90: number;
  p14_10: number;
  p14_50: number;
  p14_90: number;
  keputusan: DecisionResult;
  substitusi?: SubstitutionDetail | null;
  kandidat_substitusi: { komoditas: string; aktif: boolean; detail?: SubstitutionDetail }[];
  riwayat: TitikHarga[];
}

export interface ProcurementRequest {
  komoditas: string;
  provinsi: string;
  pemakaian: number;
  laju_susut: number;
  umur_simpan: number;
  as_of: string;
}

export async function fetchProcurementCard(
  req: ProcurementRequest,
  signal?: AbortSignal
): Promise<ProcurementResponse> {
  const res = await fetch(`${API_BASE}/api/v1/umkm/procurement-card`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
    signal,
  });
  if (!res.ok) {
    throw new Error(`Server menjawab ${res.status}. Pastikan layanan Nawasena berjalan.`);
  }
  const json = (await res.json()) as ProcurementResponse;
  if (!json?.keputusan) {
    throw new Error('Respons server tidak lengkap.');
  }
  // Rincian terbuka (KgMinggu1, HargaImpas, dan kawan-kawan) baru ada pada
  // layanan versi terbaru. Tanpa penjagaan ini, dasbor akan menampilkan angka
  // nol di mana-mana alih-alih memberi tahu bahwa layanannya perlu dijalankan ulang.
  if (json.keputusan.KgMinggu1 === undefined || json.keputusan.HargaImpas === undefined) {
    throw new Error(
      'Layanan Nawasena yang berjalan masih versi lama dan belum mengirim rincian perhitungan. Hentikan proses lama lalu jalankan ulang: go run ./cmd/server'
    );
  }
  return json;
}

// ─── AI Solusi ────────────────────────────────────────────────────────────────

export interface AiLangkah {
  judul: string;
  isi: string;
  nada: 'hijau' | 'emas' | 'merah';
  ikon_tipe: 'check' | 'snowflake' | 'cart' | 'alert';
}

export interface AiOlahan {
  nama: string;
  daya_tahan: string;
  catatan: string;
}

export interface AiSolusiResponse {
  langkah: AiLangkah[];
  ringkasan_tingkat: string;
  potensi_hemat_bulanan: number;
  olahan: AiOlahan[];
}

export interface AiSolusiPerMetode {
  key: string;
  label: string;
  sisa_kg: number;
  rugi: number;
}

export interface AiSolusiRequest {
  komoditas: string;
  harga_per_kg: number;
  bobot: number;
  hari: number;
  metode: string;
  sisa_kg: number;
  susut_kg: number;
  rugi: number;
  rugi_bulanan: number;
  lewat_batas: boolean;
  shelf_life: number;
  decay: number;
  per_metode: AiSolusiPerMetode[];
  nama_usaha: string;
  kategori_usaha: string;
}

export async function fetchAiSolusi(
  req: AiSolusiRequest,
  signal?: AbortSignal
): Promise<AiSolusiResponse> {
  const res = await fetch(`${API_BASE}/api/v1/umkm/ai-solusi`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
    signal,
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || `AI solusi gagal (${res.status})`);
  }
  return res.json() as Promise<AiSolusiResponse>;
}


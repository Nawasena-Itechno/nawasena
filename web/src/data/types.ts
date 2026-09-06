export type StorageKey = 'room' | 'chiller' | 'airtight' | 'freezer';
export type CategoryKey = 'cabai' | 'beras' | 'bumbu' | 'protein' | 'sayur' | 'dapur';
export type VolatilityLevel = 'STABIL' | 'WASPADA' | 'BERGEJOLAK';

/** Profil satu metode simpan untuk satu komoditas. */
export interface StorageProfile {
  key: StorageKey;
  /** Laju susut harian (fraksi bobot layak pakai yang hilang per hari). */
  decayPerDay: number;
  /** Batas hari komoditas masih layak jual/masak dengan metode ini. */
  shelfLifeDays: number;
  /** Catatan praktis khusus komoditas + metode ini. */
  note: string;
  /** Diisi bila metode ini justru merusak komoditas (mis. bawang di kulkas). */
  warning?: string;
}

export interface ImpactFact {
  label: string;
  value: string;
  hint: string;
}

export interface Commodity {
  id: string;
  name: string;
  shortName: string;
  category: CategoryKey;
  emoji: string;
  /** Kunci ilustrasi vektor bawaan (lihat CommodityArt). */
  art: string;
  /** Foto opsional; ilustrasi vektor tetap tampil bila foto gagal dimuat. */
  photo?: string;
  unit: string;
  /** Harga acuan nasional (Rp per unit). */
  price: number;
  /** Perubahan terhadap periode sama tahun lalu (%). */
  yoy: number;
  volatility: VolatilityLevel;
  /** Koefisien variasi harga 30 hari (%) — ukuran kegaduhan harga. */
  cv: number;
  /** Seed untuk membangkitkan sparkline deterministik. */
  seed: number;
  tagline: string;
  /** Penjelasan komoditas — paragraf. */
  description: string[];
  impact: {
    /** Bobot komoditas dalam keranjang IHK nasional (%). */
    weightCpi: number;
    /** Andil terhadap inflasi bulanan pada bulan puncaknya (persen poin). */
    andil: number;
    /** Rentang ayunan harga terendah→tertinggi dalam setahun (%). */
    swingPct: number;
    peakMonths: string;
    narrative: string[];
    facts: ImpactFact[];
  };
  decay: StorageProfile[];
  storage: {
    best: StorageKey;
    idealTemp: string;
    idealHumidity: string;
    steps: { title: string; detail: string }[];
    dos: string[];
    donts: string[];
    processing: { name: string; life: string; note: string }[];
  };
}

export const CATEGORY_META: Record<CategoryKey, { label: string; blurb: string; emoji: string }> = {
  cabai: { label: 'Cabai', blurb: 'Penyumbang gejolak harga terbesar', emoji: '🌶️' },
  beras: { label: 'Beras', blurb: 'Bobot inflasi terbesar, ayunan pelan', emoji: '🌾' },
  bumbu: { label: 'Bumbu Umbi', blurb: 'Musiman & sangat tergantung panen', emoji: '🧅' },
  protein: { label: 'Protein', blurb: 'Mahal, cepat rusak, rantai dingin wajib', emoji: '🥚' },
  sayur: { label: 'Sayur & Buah', blurb: 'Umur simpan terpendek', emoji: '🥬' },
  dapur: { label: 'Pantry Dapur', blurb: 'Stabil, aman untuk stok panjang', emoji: '🫗' },
};

export const STORAGE_META: Record<StorageKey, { label: string; short: string; icon: string; desc: string }> = {
  room: {
    label: 'Suhu Ruang / Keranjang Terbuka',
    short: 'Suhu Ruang',
    icon: '🧺',
    desc: 'Ditaruh di keranjang atau kantong plastik di sudut dapur. Termurah, paling boros.',
  },
  chiller: {
    label: 'Chiller / Kulkas Rumah Tangga',
    short: 'Chiller',
    icon: '❄️',
    desc: 'Rak bawah kulkas 4–8 °C. Memperlambat respirasi dan pertumbuhan jamur.',
  },
  airtight: {
    label: 'Kotak Kedap Udara + Tisu Alas',
    short: 'Kedap Udara',
    icon: '🥡',
    desc: 'Wadah tertutup dengan tisu penyerap embun, disimpan di chiller. Metode paling hemat.',
  },
  freezer: {
    label: 'Freezer / Beku',
    short: 'Freezer',
    icon: '🧊',
    desc: 'Di bawah −15 °C. Bobot terkunci, tetapi tekstur berubah setelah dicairkan.',
  },
};

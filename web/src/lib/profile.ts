/** Profil dapur UMKM: bentuk data, nilai bawaan, dan aturan turunannya. */

export type StorageMethod = 'room' | 'chiller' | 'airtight';

export interface CommodityConsumption {
  name: string;
  weekly_consumption_kg: number;
}

export interface UmkmProfile {
  id?: string;
  business_name: string;
  fnb_category: string;
  reference_market: string;
  /** Komoditas yang rutin dipakai usaha beserta volumenya. */
  commodities: CommodityConsumption[];
  storage_method: StorageMethod;
  /** s — laju susut harian; diturunkan dari metode simpan saat onboarding. */
  daily_decay_rate: number;
}

/**
 * Parameter tiap metode simpan sesuai formulir pendaftaran.
 *
 * `decay` dan `shelfLife` adalah angka yang dipakai mesin keputusan, jadi
 * ditampilkan apa adanya kepada pengguna agar rekomendasi bisa ditelusuri.
 */
export const STORAGE_METHODS: Record<
  StorageMethod,
  {
    label: string;
    short: string;
    icon: string;
    decay: number;
    shelfLife: number;
    desc: string;
    /** Yang dilihat pengguna saat memilih opsi ini di formulir pendaftaran. */
    formLabel: string;
  }
> = {
  room: {
    label: 'Suhu Ruang / Keranjang Terbuka',
    short: 'Suhu Ruang',
    icon: '🧺',
    decay: 0.03,
    shelfLife: 7,
    desc: 'Bahan ditaruh di keranjang atau kantong di sudut dapur, tanpa pendingin.',
    formLabel: 'Suhu Ruang / Keranjang Terbuka — susut ±3–4%/hari, batas simpan 5–7 hari',
  },
  chiller: {
    label: 'Chiller / Kulkas Rumah Tangga',
    short: 'Chiller',
    icon: '❄️',
    decay: 0.015,
    shelfLife: 14,
    desc: 'Rak bawah kulkas 4–8 °C; memperlambat respirasi dan pertumbuhan jamur.',
    formLabel: 'Chiller / Kulkas Rumah Tangga — susut ±1,5–2%/hari, batas simpan 10–14 hari',
  },
  airtight: {
    label: 'Kotak Kedap Udara + Tisu Alas',
    short: 'Kedap Udara',
    icon: '🥡',
    decay: 0.005,
    shelfLife: 21,
    desc: 'Wadah tertutup beralas tisu penyerap embun, disimpan di dalam chiller.',
    formLabel: 'Kotak Kedap Udara + Tisu Alas — susut ±0,5%/hari, batas simpan hingga 21 hari',
  },
};

export function storageOf(method: string) {
  return STORAGE_METHODS[(method as StorageMethod) in STORAGE_METHODS ? (method as StorageMethod) : 'room'];
}

/** Umur simpan yang dipakai mesin keputusan sebagai batas L. */
export function shelfLifeOf(method: string): number {
  return storageOf(method).shelfLife;
}


/**
 * Melengkapi profil yang datang dari DB atau profil tiruan agar bidang barunya
 * tidak kosong. `storage_method` sengaja diterima sebagai string bebas karena
 * nilainya berasal dari kolom basis data yang tidak bertipe ketat.
 */
type ProfilMentah = Partial<Omit<UmkmProfile, 'storage_method'>> & { storage_method?: string };

export function normalizeProfile(raw: ProfilMentah | null): UmkmProfile {
  const kunci = (raw?.storage_method ?? 'room') as StorageMethod;
  const method: StorageMethod = kunci in STORAGE_METHODS ? kunci : 'room';
  const meta = STORAGE_METHODS[method];
  return {
    id: raw?.id,
    business_name: raw?.business_name || 'Usaha Anda',
    fnb_category: raw?.fnb_category || 'Warteg',
    reference_market: raw?.reference_market || 'Pasar Tradisional',
    commodities: raw?.commodities && raw.commodities.length > 0 ? raw.commodities : [],
    storage_method: method,
    daily_decay_rate: raw?.daily_decay_rate ?? meta.decay,
  };
}

/**
 * Memetakan nama komoditas PIHPS ke id ensiklopedia, agar menu setelah login
 * dapat memakai basis pengetahuan penyimpanan yang sama dengan area publik.
 */
const PETA_ENSIKLOPEDIA: Record<string, string> = {
  'Cabai Rawit Merah': 'cabai-rawit-merah',
  'Cabai Rawit Hijau': 'cabai-rawit-hijau',
  'Cabai Merah Keriting': 'cabai-merah-keriting',
  'Cabai Merah Besar': 'cabai-merah-besar',
};

export function encyclopediaId(komoditas: string): string | undefined {
  return PETA_ENSIKLOPEDIA[komoditas];
}

import type { Commodity, StorageKey, StorageProfile } from './types';
import { CABAI } from './commodities.cabai';
import { POKOK } from './commodities.pokok';
import { SEGAR } from './commodities.segar';

export * from './types';

/**
 * Basis pengetahuan komoditas pangan bergejolak (volatile food).
 *
 * Harga acuan, bobot IHK, dan andil inflasi disusun dari rujukan publik PIHPS
 * Bank Indonesia serta rilis inflasi BPS, lalu dibulatkan sebagai angka acuan
 * edukatif. Laju susut harian adalah estimasi operasional dapur UMKM yang
 * diturunkan dari rentang umur simpan pascapanen — bukan hasil uji laboratorium.
 */
export const COMMODITIES: Commodity[] = [...CABAI, ...SEGAR, ...POKOK];

export const DATA_DISCLAIMER =
  'Harga acuan dan bobot inflasi merujuk pada publikasi PIHPS Bank Indonesia dan BPS, dibulatkan untuk keperluan edukasi. Laju susut merupakan estimasi operasional dapur, bukan hasil uji laboratorium.';

export function getCommodity(id: string): Commodity | undefined {
  return COMMODITIES.find((c) => c.id === id);
}

export function getStorage(c: Commodity, key: StorageKey): StorageProfile {
  return c.decay.find((d) => d.key === key) ?? c.decay[0];
}

// ─────────────────────────── Deret harga sintetis ───────────────────────────

/** PRNG deterministik (mulberry32) agar sparkline stabil antar render. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Membangkitkan lintasan harga 30 hari yang konsisten dengan koefisien variasi
 * komoditas: random walk beramplitudo cv, ditarik kembali ke harga acuan.
 */
export function priceSeries(c: Commodity, days = 30): number[] {
  const rand = rng(c.seed);
  const sigma = (c.cv / 100) * 0.42;
  const out: number[] = [];
  let level = 1 - sigma * 0.6;
  for (let i = 0; i < days; i++) {
    const shock = (rand() - 0.5) * 2 * sigma;
    const pull = (1 - level) * 0.18;
    level = level + shock * 0.55 + pull;
    out.push(Math.max(0.55, level) * c.price);
  }
  // Titik terakhir dikunci ke harga acuan agar sparkline dan kartu selaras.
  out[out.length - 1] = c.price;
  return out;
}

/** Mengubah deret angka menjadi path SVG halus (Catmull–Rom ke Bezier). */
export function sparkPath(values: number[], w: number, h: number, pad = 2): string {
  if (values.length < 2) return '';
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => ({
    x: (i / (values.length - 1)) * (w - pad * 2) + pad,
    y: h - pad - ((v - min) / span) * (h - pad * 2),
  }));

  let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
}

// ────────────────────────── Mesin simulasi susut ──────────────────────────

export interface WasteResult {
  initialKg: number;
  usableKg: number;
  wasteKg: number;
  cashLoss: number;
  /** Kenaikan harga (%) yang dibutuhkan agar menimbun sebanding dengan susut. */
  breakevenHikePct: number;
  /** Frekuensi historis lonjakan sebesar itu pada horizon yang sama (%). */
  spikeProbabilityPct: number;
  /** Kurva bobot layak pakai hari ke-0 sampai hari ke-n. */
  curve: number[];
  /** Hari ketika bahan melewati batas umur simpan metode ini. */
  shelfLifeDays: number;
  beyondShelfLife: boolean;
  /** Perbandingan terhadap seluruh metode simpan lain. */
  alternatives: { key: StorageKey; usableKg: number; cashLoss: number }[];
}

/**
 * Menghitung susut bobot dengan peluruhan geometrik harian, sesuai model L3:
 * bobot layak pakai hari ke-n = W0 × (1 − s)^n.
 */
export function simulateWaste(
  c: Commodity,
  weightKg: number,
  storage: StorageKey,
  days: number
): WasteResult {
  const profile = getStorage(c, storage);
  const s = profile.decayPerDay;

  const curve: number[] = [];
  for (let d = 0; d <= days; d++) curve.push(weightKg * Math.pow(1 - s, d));

  const usableKg = curve[days];
  const wasteKg = weightKg - usableKg;
  const cashLoss = wasteKg * c.price;

  // Agar menimbun impas, harga harus naik cukup untuk menutup bobot yang hilang.
  const breakevenHikePct = usableKg > 0 ? (wasteKg / usableKg) * 100 : Infinity;

  // Peluang historis lonjakan sebesar itu, diskalakan oleh volatilitas komoditas.
  // Pendekatan lognormal: sigma harian ≈ cv/100 dibagi akar 30.
  const sigmaDaily = c.cv / 100 / Math.sqrt(30);
  const sigmaH = sigmaDaily * Math.sqrt(Math.max(1, days));
  const z = Math.log(1 + breakevenHikePct / 100) / (sigmaH || 1e-6);
  const spikeProbabilityPct = Math.max(0.05, normalTail(z) * 100);

  const alternatives = c.decay.map((p) => {
    const u = weightKg * Math.pow(1 - p.decayPerDay, days);
    return { key: p.key, usableKg: u, cashLoss: (weightKg - u) * c.price };
  });

  return {
    initialKg: weightKg,
    usableKg,
    wasteKg,
    cashLoss,
    breakevenHikePct,
    spikeProbabilityPct,
    curve,
    shelfLifeDays: profile.shelfLifeDays,
    beyondShelfLife: days > profile.shelfLifeDays,
    alternatives,
  };
}

/** P(Z > z) untuk distribusi normal baku — aproksimasi Zelen & Severo. */
function normalTail(z: number): number {
  if (z < 0) return 1 - normalTail(-z);
  const t = 1 / (1 + 0.2316419 * z);
  const d = 0.3989422804014327 * Math.exp(-(z * z) / 2);
  const p =
    d * t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return p;
}

// ────────────────────────────── Pemformatan ──────────────────────────────

export const formatIDR = (v: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Math.round(v));

export const formatNumber = (v: number, decimals = 1) =>
  v.toLocaleString('id-ID', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

export const VOLATILITY_STYLE: Record<
  Commodity['volatility'],
  { bg: string; text: string; dot: string; label: string }
> = {
  STABIL: { bg: 'bg-[#E8F5E9]', text: 'text-[#1B5E20]', dot: 'bg-[#66BB6A]', label: 'Stabil' },
  WASPADA: { bg: 'bg-[#FBF3DC]', text: 'text-[#8A7420]', dot: 'bg-[#D3BE6D]', label: 'Waspada' },
  BERGEJOLAK: { bg: 'bg-[#FDECEA]', text: 'text-[#A6301C]', dot: 'bg-[#E05A3F]', label: 'Bergejolak' },
};

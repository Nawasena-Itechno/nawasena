/** Pemformatan angka untuk seluruh antarmuka berbahasa Indonesia. */

export const formatIDR = (v: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Math.round(v || 0));

/** Rupiah ringkas untuk label grafik: Rp 62,4rb / Rp 1,84jt. */
export const formatIDRShort = (v: number) => {
  const n = Math.abs(v);
  if (n >= 1_000_000) return `Rp ${(v / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 2 })}jt`;
  if (n >= 1_000) return `Rp ${(v / 1_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })}rb`;
  return `Rp ${Math.round(v)}`;
};

export const formatNumber = (v: number, decimals = 1) =>
  (v || 0).toLocaleString('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

export const formatPct = (v: number, decimals = 1) => `${formatNumber(v, decimals)}%`;

/** 2026-08-28 → 28 Agustus 2026 */
export const formatTanggal = (iso: string) => {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

/** 2026-08-28 → 28 Agu */
export const formatTanggalPendek = (iso: string) => {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
};

/** Menambah n hari pada tanggal ISO dan mengembalikannya sebagai ISO. */
export const tambahHari = (iso: string, n: number) => {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

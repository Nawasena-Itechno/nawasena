import type { Session, User } from '@supabase/supabase-js';

/**
 * Bypass autentikasi untuk keperluan development.
 *
 * Aktif HANYA jika dua syarat terpenuhi:
 *   1. Aplikasi dijalankan lewat `npm run dev` (import.meta.env.DEV === true)
 *   2. VITE_DEV_BYPASS_AUTH=true di file .env
 *
 * Vite selalu mengganti `import.meta.env.DEV` dengan `false` saat `npm run build`,
 * sehingga konstanta di bawah ikut terlipat menjadi `false` dan seluruh cabang
 * bypass terhapus dari bundle produksi. Lupa mencabut flag di .env tidak akan
 * membocorkan dasbor.
 */
export const DEV_BYPASS_AUTH =
  import.meta.env.DEV && import.meta.env.VITE_DEV_BYPASS_AUTH === 'true';

/** Profil tiruan yang dipakai dasbor selama bypass aktif (tidak menyentuh DB). */
export const DEV_PROFILE = {
  id: 'dev-local-user',
  business_name: 'Warteg Nawasena (Dev)',
  fnb_category: 'Warteg',
  reference_market: 'Pasar Induk Kramat Jati',
  weekly_consumption_kg: 10,
  storage_method: 'room',
  daily_decay_rate: 0.03,
};

/** Session tiruan agar navigasi di Layout tetap merender menu versi login. */
export const DEV_SESSION = {
  access_token: 'dev-bypass',
  refresh_token: 'dev-bypass',
  expires_in: 3600,
  token_type: 'bearer',
  user: { id: 'dev-local-user', email: 'dev@nawasena.local' } as User,
} as Session;

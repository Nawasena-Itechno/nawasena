import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sprout,
  ShoppingBasket,
  Radar,
  Shuffle,
  FlaskConical,
  Store,
  BookOpen,
  LogOut,
  Loader2,
  AlertTriangle,
  Menu,
  X,
  CalendarClock,
  RefreshCw,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { normalizeProfile, shelfLifeOf, TRACKED_COMMODITIES } from '../lib/profile';
import type { UmkmProfile } from '../lib/profile';
import { fetchProcurementCard } from '../lib/api';
import type { ProcurementResponse } from '../lib/api';
import MenuRekomendasi from './dashboard/MenuRekomendasi';
import MenuRadar from './dashboard/MenuRadar';
import MenuSubstitusi from './dashboard/MenuSubstitusi';
import MenuSimulasiSusut from './dashboard/MenuSimulasiSusut';
import MenuProfil from './dashboard/MenuProfil';
import MenuInformasi from './dashboard/MenuInformasi';

/** Rentang tanggal yang tercakup basis data harga PIHPS milik sistem. */
export const DATA_RANGE = { min: '2018-04-01', max: '2026-08-28' };

const MENUS = [
  { key: 'rekomendasi', label: 'Rekomendasi Belanja', icon: ShoppingBasket, hint: 'Berapa kg hari ini' },
  { key: 'radar', label: 'Radar Harga & Anggaran', icon: Radar, hint: 'Ke mana harga bergerak' },
  { key: 'substitusi', label: 'Sinyal Substitusi', icon: Shuffle, hint: 'Varian mana yang lebih murah' },
  { key: 'susut', label: 'Simulasi Susut', icon: FlaskConical, hint: 'Uji stok dapur Anda' },
  { key: 'profil', label: 'Profil Usaha', icon: Store, hint: 'Data & kalibrasi' },
  { key: 'informasi', label: 'Informasi Tambahan', icon: BookOpen, hint: 'Metode & sumber data' },
] as const;

type MenuKey = (typeof MENUS)[number]['key'];

export default function Dashboard() {
  const navigate = useNavigate();
  const [menu, setMenu] = useState<MenuKey>('rekomendasi');
  const [navOpen, setNavOpen] = useState(false);

  const [profile, setProfile] = useState<UmkmProfile | null>(null);
  const [data, setData] = useState<ProcurementResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [asOf, setAsOf] = useState(DATA_RANGE.max);
  const [komoditas, setKomoditas] = useState<string>(TRACKED_COMMODITIES[0]);

  /* ── Profil pengguna ─────────────────────────────────────────────────── */
  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(normalizeProfile(prof));
    };
    // Kegagalan memuat sesi tidak boleh berujung pada profil bawaan: pengguna
    // dikembalikan ke halaman masuk agar dasbor tidak pernah terbuka tanpa akun.
    load().catch(() => navigate('/login'));
  }, [navigate]);

  // Komoditas aktif selalu diambil dari daftar komoditas rutin milik pengguna.
  useEffect(() => {
    if (profile && profile.commodities.length > 0 && !profile.commodities.includes(komoditas)) {
      setKomoditas(profile.commodities[0]);
    }
  }, [profile, komoditas]);

  /* ── Data rekomendasi ────────────────────────────────────────────────── */
  const load = useCallback(
    async (signal?: AbortSignal) => {
      if (!profile) return;
      setLoading(true);
      setError('');
      try {
        const json = await fetchProcurementCard(
          {
            komoditas,
            provinsi: 'Jawa Barat',
            pemakaian: profile.weekly_consumption_kg,
            laju_susut: profile.daily_decay_rate,
            umur_simpan: shelfLifeOf(profile.storage_method),
            as_of: asOf,
          },
          signal
        );
        setData(json);
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        setError((err as Error).message);
        setData(null);
      } finally {
        setLoading(false);
      }
    },
    [profile, komoditas, asOf]
  );

  useEffect(() => {
    const ctrl = new AbortController();
    load(ctrl.signal);
    return () => ctrl.abort();
  }, [load]);

  if (!profile) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#F8FCF8]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#1B5E20]" />
          <p className="text-sm font-semibold text-[#4B6149]">Memuat profil usaha…</p>
        </div>
      </div>
    );
  }

  const initials =
    profile.business_name
      .replace(/[^A-Za-z ]/g, '')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase() || 'NW';

  return (
    <div className="min-h-screen bg-[#F8FCF8] lg:flex">
      {/* ── Bilah sisi ──────────────────────────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col bg-[#0D3311] transition-transform duration-500 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          navOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)' }}
      >
        <div className="hairline-grid pointer-events-none absolute inset-0 opacity-10" />

        <div className="relative flex items-center justify-between border-b border-[#1B5E20] px-5 py-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#66BB6A]">
              <Sprout className="h-5 w-5 text-[#0D3311]" />
            </span>
            <div className="leading-none">
              <p className="font-display text-lg font-black text-white">Nawasena</p>
              <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.2em] text-[#8FBF8F]">
                Ruang Kerja UMKM
              </p>
            </div>
          </div>
          <button
            onClick={() => setNavOpen(false)}
            aria-label="Tutup menu"
            className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-white lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative border-b border-[#1B5E20] px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#1B5E20] font-display text-sm font-black text-[#D3BE6D]">
              {initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">{profile.business_name}</p>
              <p className="truncate text-xs text-[#8FBF8F]">
                {profile.fnb_category} · {profile.reference_market}
              </p>
            </div>
          </div>
        </div>

        <nav className="relative flex-1 space-y-1 overflow-y-auto p-4">
          {MENUS.map((m) => {
            const Icon = m.icon;
            const active = menu === m.key;
            return (
              <button
                key={m.key}
                onClick={() => {
                  setMenu(m.key);
                  setNavOpen(false);
                }}
                aria-current={active ? 'page' : undefined}
                className={`group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl px-4 py-3 text-left transition-colors duration-300 ${
                  active ? 'text-white' : 'text-[#A5D6A7] hover:text-white'
                }`}
              >
                <span
                  className={`absolute inset-0 rounded-2xl bg-[#1B5E20] transition-all duration-300 ${
                    active ? 'scale-100 opacity-100' : 'scale-95 opacity-0 group-hover:opacity-60'
                  }`}
                />
                <span
                  className={`absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-[#D3BE6D] transition-all duration-300 ${
                    active ? 'opacity-100' : 'opacity-0'
                  }`}
                />
                <Icon className="relative z-10 h-4 w-4 shrink-0" />
                <span className="relative z-10 min-w-0">
                  <span className="block text-sm font-bold leading-tight">{m.label}</span>
                  <span
                    className={`block text-[11px] leading-tight ${
                      active ? 'text-[#A5D6A7]' : 'text-[#6B8F6B]'
                    }`}
                  >
                    {m.hint}
                  </span>
                </span>
              </button>
            );
          })}
        </nav>

        <div className="relative border-t border-[#1B5E20] p-4">
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              navigate('/');
            }}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-semibold text-[#8FBF8F] transition-colors hover:bg-[#5A1F14]/40 hover:text-[#FFB4A2]"
          >
            <LogOut className="h-4 w-4" /> Keluar
          </button>
        </div>
      </aside>

      {navOpen && (
        <button
          aria-label="Tutup menu"
          onClick={() => setNavOpen(false)}
          className="anim-fade fixed inset-0 z-40 bg-[#0D3311]/50 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* ── Isi ─────────────────────────────────────────────────────────── */}
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-[#A5D6A7]/60 bg-[#F8FCF8]/90 backdrop-blur-xl">
          <div className="flex flex-wrap items-center gap-3 px-5 py-3.5 lg:px-8">
            <button
              onClick={() => setNavOpen(true)}
              aria-label="Buka menu"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#A5D6A7] bg-white text-[#1B5E20] lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#2E7D32]">
                {MENUS.find((m) => m.key === menu)?.label}
              </p>
              <p className="truncate text-sm font-bold text-[#0D3311]">{profile.business_name}</p>
            </div>

            <label className="flex items-center gap-2 rounded-2xl border border-[#A5D6A7] bg-white px-3 py-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A8C78]">
                Komoditas
              </span>
              <select
                value={komoditas}
                onChange={(e) => setKomoditas(e.target.value)}
                className="bg-transparent text-sm font-bold text-[#0D3311] outline-none"
              >
                {(profile.commodities.length ? profile.commodities : [...TRACKED_COMMODITIES]).map(
                  (k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  )
                )}
              </select>
            </label>

            <label className="flex items-center gap-2 rounded-2xl border border-[#A5D6A7] bg-white px-3 py-2">
              <CalendarClock className="h-4 w-4 shrink-0 text-[#7A8C78]" />
              <span className="sr-only">Tanggal acuan</span>
              <input
                type="date"
                value={asOf}
                min={DATA_RANGE.min}
                max={DATA_RANGE.max}
                onChange={(e) => setAsOf(e.target.value)}
                className="bg-transparent text-sm font-bold text-[#0D3311] outline-none"
              />
            </label>

            <button
              onClick={() => load()}
              disabled={loading}
              aria-label="Muat ulang data"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#A5D6A7] bg-white text-[#1B5E20] transition-colors hover:bg-[#E8F5E9] disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loading && (
            <div className="h-0.5 w-full overflow-hidden bg-[#E8F5E9]">
              <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-[#1B5E20] to-transparent" />
            </div>
          )}
        </header>

        <main className="px-5 py-7 lg:px-8 lg:py-9">
          {error && (
            <div className="mb-6 flex flex-col gap-3 rounded-3xl border border-[#E7B4A6] bg-[#FDECEA] p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#A6301C]" />
                <div>
                  <p className="text-sm font-bold text-[#7E2416]">Data belum bisa dimuat</p>
                  <p className="mt-0.5 text-sm text-[#7E2416]/85">{error}</p>
                  <p className="mt-1 text-xs text-[#7E2416]/70">
                    Jalankan layanan Nawasena lebih dulu:{' '}
                    <code className="rounded bg-white/60 px-1.5 py-0.5 font-mono">
                      go run ./cmd/server
                    </code>
                  </p>
                </div>
              </div>
              <button
                onClick={() => load()}
                className="shrink-0 rounded-full bg-[#A6301C] px-5 py-2.5 text-sm font-bold text-white"
              >
                Coba lagi
              </button>
            </div>
          )}

          <div key={menu} className="anim-rise">
            {menu === 'rekomendasi' && (
              <MenuRekomendasi
                profile={profile}
                data={data}
                loading={loading}
                komoditas={komoditas}
                asOf={asOf}
              />
            )}
            {menu === 'radar' && (
              <MenuRadar profile={profile} data={data} komoditas={komoditas} asOf={asOf} />
            )}
            {menu === 'substitusi' && (
              <MenuSubstitusi
                profile={profile}
                data={data}
                komoditas={komoditas}
                asOf={asOf}
                onPickDate={setAsOf}
              />
            )}
            {menu === 'susut' && (
              <MenuSimulasiSusut profile={profile} data={data} komoditas={komoditas} />
            )}
            {menu === 'profil' && <MenuProfil profile={profile} onChange={setProfile} />}
            {menu === 'informasi' && <MenuInformasi />}
          </div>
        </main>
      </div>
    </div>
  );
}

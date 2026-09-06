import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  TrendingUp,
  TrendingDown,
  Thermometer,
  Droplets,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  Gauge,
} from 'lucide-react';
import type { Commodity, StorageKey } from '../data/types';
import { STORAGE_META } from '../data/types';
import {
  formatIDR,
  formatNumber,
  getStorage,
  priceSeries,
  simulateWaste,
  VOLATILITY_STYLE,
} from '../data/commodities';
import Sparkline from './Sparkline';
import CommodityArt from './CommodityArt';
import { useLockBody } from './motion/hooks';

const TABS = [
  { key: 'profil', label: 'Profil' },
  { key: 'dampak', label: 'Dampak Harga' },
  { key: 'susut', label: 'Laju Susut' },
  { key: 'simpan', label: 'Cara Simpan' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

export default function CommodityDrawer({
  commodity,
  onClose,
}: {
  commodity: Commodity | null;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<TabKey>('profil');
  const open = Boolean(commodity);
  useLockBody(open);

  useEffect(() => {
    if (commodity) setTab('profil');
  }, [commodity]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className={`fixed inset-0 z-[70] ${open ? '' : 'pointer-events-none'}`}
      aria-hidden={!open}
    >
      {/* Latar gelap */}
      <button
        aria-label="Tutup detail komoditas"
        onClick={onClose}
        className={`absolute inset-0 bg-[#0D3311]/55 backdrop-blur-sm transition-opacity duration-400 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Panel geser */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={commodity ? `Detail ${commodity.name}` : 'Detail komoditas'}
        className={`absolute inset-y-0 right-0 flex w-full max-w-[640px] flex-col bg-[#F8FCF8] shadow-[0_0_80px_-10px_rgba(13,51,17,0.6)] transition-transform duration-500 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)' }}
      >
        {commodity && <DrawerContent c={commodity} tab={tab} setTab={setTab} onClose={onClose} />}
      </aside>
    </div>
  );
}

function DrawerContent({
  c,
  tab,
  setTab,
  onClose,
}: {
  c: Commodity;
  tab: TabKey;
  setTab: (t: TabKey) => void;
  onClose: () => void;
}) {
  const series = useMemo(() => priceSeries(c), [c]);
  const style = VOLATILITY_STYLE[c.volatility];
  const up = c.yoy >= 0;

  return (
    <>
      {/* Kepala panel */}
      <div className="relative shrink-0 overflow-hidden bg-[#0D3311]">
        <CommodityArt
          art={c.art}
          photo={c.photo}
          alt={c.name}
          className="absolute inset-0 h-full w-full opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D3311] via-[#0D3311]/80 to-[#0D3311]/40" />

        <button
          onClick={onClose}
          aria-label="Tutup"
          className="absolute right-4 top-4 z-20 grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/30"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative z-10 px-6 pb-5 pt-8">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full ${style.bg} ${style.text} px-3 py-1 text-[11px] font-bold uppercase tracking-wider`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
              {style.label}
            </span>
            <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold text-[#C8E6C9]">
              CV 30 hari {formatNumber(c.cv)}%
            </span>
          </div>

          <h2 className="mt-3 font-display text-3xl font-black leading-tight text-white">
            {c.name}
          </h2>
          <p className="mt-1.5 max-w-md text-sm text-[#A5D6A7]">{c.tagline}</p>

          <div className="mt-5 flex flex-wrap items-end gap-x-6 gap-y-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8FBF8F]">
                Harga acuan
              </p>
              <p className="font-mono text-2xl font-bold text-white">
                {formatIDR(c.price)}
                <span className="ml-1 text-sm font-normal text-[#A5D6A7]">/{c.unit}</span>
              </p>
            </div>
            <div
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold ${
                up ? 'bg-[#5A1F14]/70 text-[#FFB4A2]' : 'bg-[#14471C]/80 text-[#A5D6A7]'
              }`}
            >
              {up ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {up ? '+' : ''}
              {formatNumber(c.yoy)}% YoY
            </div>
            <div className="ml-auto w-40">
              <Sparkline values={series} stroke="#A5D6A7" fill="#66BB6A" width={160} height={40} />
            </div>
          </div>
        </div>
      </div>

      {/* Tab */}
      <div
        role="tablist"
        aria-label="Bagian detail komoditas"
        className="sticky top-0 z-10 flex shrink-0 gap-1 overflow-x-auto border-b border-[#A5D6A7]/60 bg-[#F8FCF8]/95 px-4 py-2 backdrop-blur no-bar"
      >
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`relative whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              tab === t.key ? 'text-white' : 'text-[#4B6149] hover:text-[#1B5E20]'
            }`}
          >
            <span className="relative z-10">{t.label}</span>
            {tab === t.key && (
              <span className="absolute inset-0 rounded-full bg-[#1B5E20] anim-fade" />
            )}
          </button>
        ))}
      </div>

      {/* Isi */}
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
        <div key={tab} role="tabpanel" className="anim-rise">
          {tab === 'profil' && <TabProfil c={c} />}
          {tab === 'dampak' && <TabDampak c={c} />}
          {tab === 'susut' && <TabSusut c={c} />}
          {tab === 'simpan' && <TabSimpan c={c} />}
        </div>
      </div>

      {/* Aksi bawah */}
      <div className="shrink-0 border-t border-[#A5D6A7]/60 bg-white/70 px-6 py-4 backdrop-blur">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            to={`/simulator?komoditas=${c.id}`}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#1B5E20] px-5 py-3 text-sm font-bold text-white transition-transform duration-300 hover:-translate-y-0.5"
          >
            Simulasikan susut {c.shortName}
            <ChevronRight className="h-4 w-4" />
          </Link>
          <Link
            to="/login"
            className="flex items-center justify-center rounded-2xl border border-[#1B5E20]/25 px-5 py-3 text-sm font-bold text-[#1B5E20] transition-colors hover:bg-[#E8F5E9]"
          >
            Daftarkan usaha
          </Link>
        </div>
      </div>
    </>
  );
}

/* ───────────────────────────── Tab: Profil ───────────────────────────── */

function TabProfil({ c }: { c: Commodity }) {
  const best = getStorage(c, c.storage.best);
  return (
    <div className="space-y-6">
      <section>
        <SectionTitle>Penjelasan komoditas</SectionTitle>
        <div className="mt-3 space-y-3.5">
          {c.description.map((p, i) => (
            <p key={i} className="text-[15px] leading-relaxed text-[#31462F]">
              {p}
            </p>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <MiniStat
          label="Metode simpan terbaik"
          value={STORAGE_META[c.storage.best].short}
          sub={`${STORAGE_META[c.storage.best].icon} ${best.shelfLifeDays} hari`}
        />
        <MiniStat
          label="Laju susut terbaik"
          value={`${formatNumber(best.decayPerDay * 100, 2)}%`}
          sub="per hari"
        />
        <MiniStat label="Suhu ideal" value={c.storage.idealTemp} sub="ruang simpan" />
        <MiniStat label="Kelembapan ideal" value={c.storage.idealHumidity} sub="relatif" />
      </div>

      <section className="rounded-3xl border border-[#D3BE6D]/50 bg-[#FBF6E4] p-5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#8A7420]" />
          <h4 className="text-sm font-bold text-[#5F5015]">Bulan yang perlu diwaspadai</h4>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-[#6B5A1E]">{c.impact.peakMonths}</p>
      </section>
    </div>
  );
}

/* ──────────────────────────── Tab: Dampak ──────────────────────────── */

function TabDampak({ c }: { c: Commodity }) {
  // Skala gauge: 4% adalah bobot IHK tertinggi di basis data (beras premium).
  const gaugePct = Math.min(100, (c.impact.weightCpi / 4) * 100);

  return (
    <div className="space-y-6">
      <section>
        <SectionTitle>Dampak terhadap volatilitas harga pangan</SectionTitle>
        <div className="mt-3 space-y-3.5">
          {c.impact.narrative.map((p, i) => (
            <p key={i} className="text-[15px] leading-relaxed text-[#31462F]">
              {p}
            </p>
          ))}
        </div>
      </section>

      {/* Gauge bobot inflasi */}
      <section className="rounded-3xl border border-[#A5D6A7]/70 bg-white p-5">
        <div className="flex items-center gap-2">
          <Gauge className="h-4 w-4 text-[#1B5E20]" />
          <h4 className="text-sm font-bold text-[#0D3311]">
            Bobot dalam keranjang inflasi nasional
          </h4>
        </div>
        <div className="mt-4 flex items-end gap-4">
          <div className="font-display text-4xl font-black text-[#1B5E20]">
            {formatNumber(c.impact.weightCpi, 2)}
            <span className="text-xl">%</span>
          </div>
          <div className="flex-1 pb-2">
            <div className="h-3 overflow-hidden rounded-full bg-[#E8F5E9]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#1B5E20] to-[#66BB6A] transition-[width] duration-1000"
                style={{ width: `${gaugePct}%` }}
              />
            </div>
            <div className="mt-1.5 flex justify-between text-[10px] font-semibold uppercase tracking-wider text-[#7A8C78]">
              <span>0%</span>
              <span>4% (bobot beras premium)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Ayunan tahunan */}
      <section className="rounded-3xl bg-[#0D3311] p-5 text-white">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8FBF8F]">
          Ayunan harga dalam setahun
        </p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-display text-4xl font-black text-[#D3BE6D]">
            ±{c.impact.swingPct}%
          </span>
          <span className="text-sm text-[#A5D6A7]">dari titik terendah ke tertinggi</span>
        </div>
        <div className="relative mt-5 h-2 rounded-full bg-[#14471C]">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#66BB6A] via-[#D3BE6D] to-[#E05A3F]"
            style={{ width: `${Math.min(100, (c.impact.swingPct / 240) * 100)}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-[10px] font-semibold uppercase tracking-wider text-[#7FA982]">
          <span>tenang</span>
          <span>bergejolak ekstrem</span>
        </div>
      </section>

      <section>
        <SectionTitle>Angka kunci</SectionTitle>
        <div className="mt-3 space-y-2">
          {c.impact.facts.map((f) => (
            <div
              key={f.label}
              className="group flex items-center justify-between gap-4 rounded-2xl border border-[#A5D6A7]/60 bg-white px-4 py-3 transition-colors hover:border-[#66BB6A]"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#25422A]">{f.label}</p>
                <p className="text-xs text-[#7A8C78]">{f.hint}</p>
              </div>
              <span className="shrink-0 font-mono text-base font-bold text-[#1B5E20]">
                {f.value}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ───────────────────────────── Tab: Susut ───────────────────────────── */

function TabSusut({ c }: { c: Commodity }) {
  const [storage, setStorage] = useState<StorageKey>(c.storage.best);
  const [days, setDays] = useState(7);
  const profile = getStorage(c, storage);
  const sim = useMemo(() => simulateWaste(c, 10, storage, days), [c, storage, days]);

  const W = 320;
  const H = 120;
  const pad = 6;
  // Sumbu Y dikunci 0–10 kg (bukan skala relatif) agar kecuraman kurva antar
  // metode simpan bisa dibandingkan secara jujur.
  const toX = (d: number) => (d / Math.max(1, days)) * (W - pad * 2) + pad;
  const toY = (v: number) => H - pad - (v / 10) * (H - pad * 2);
  const path = sim.curve
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(v).toFixed(1)}`)
    .join(' ');

  return (
    <div className="space-y-6">
      <section>
        <SectionTitle>Laju susut pembusukan</SectionTitle>
        <p className="mt-2 text-[15px] leading-relaxed text-[#31462F]">
          Bobot layak pakai menyusut secara geometrik: setiap hari, sebagian bobot hilang karena
          penguapan air dan pembusukan. Pilih metode simpan untuk melihat kurvanya.
        </p>
      </section>

      {/* Pemilih metode simpan */}
      <div className="grid grid-cols-2 gap-2">
        {c.decay.map((d) => {
          const active = storage === d.key;
          const risky = Boolean(d.warning);
          return (
            <button
              key={d.key}
              onClick={() => setStorage(d.key)}
              className={`rounded-2xl border p-3 text-left transition-all duration-300 ${
                active
                  ? 'border-[#1B5E20] bg-[#1B5E20] text-white shadow-[0_14px_30px_-18px_rgba(27,94,32,1)]'
                  : 'border-[#A5D6A7]/70 bg-white text-[#25422A] hover:border-[#66BB6A]'
              }`}
            >
              <span className="text-lg">{STORAGE_META[d.key].icon}</span>
              <p className="mt-1 text-sm font-bold leading-tight">{STORAGE_META[d.key].short}</p>
              <p className={`mt-1 font-mono text-xs ${active ? 'text-[#A5D6A7]' : 'text-[#6B7F69]'}`}>
                {formatNumber(d.decayPerDay * 100, 2)}%/hari · {d.shelfLifeDays} hari
              </p>
              {risky && (
                <span
                  className={`mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide ${
                    active ? 'text-[#F3C6A0]' : 'text-[#A6301C]'
                  }`}
                >
                  <AlertTriangle className="h-3 w-3" /> tidak disarankan
                </span>
              )}
            </button>
          );
        })}
      </div>

      {profile.warning && (
        <div className="flex items-start gap-3 rounded-2xl border border-[#E7B4A6] bg-[#FDECEA] p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#A6301C]" />
          <p className="text-sm font-semibold leading-relaxed text-[#7E2416]">{profile.warning}</p>
        </div>
      )}

      {/* Kurva susut */}
      <section className="rounded-3xl border border-[#A5D6A7]/70 bg-white p-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-[#0D3311]">Sisa bobot dari 10 kg</h4>
          <span className="font-mono text-xs text-[#6B7F69]">hari ke-{days}</span>
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 w-full">
          <defs>
            <linearGradient id={`decay-${c.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#66BB6A" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#66BB6A" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[2.5, 5, 7.5, 10].map((kg) => (
            <g key={kg}>
              <line x1={pad} x2={W - pad} y1={toY(kg)} y2={toY(kg)} stroke="#E8F5E9" strokeWidth="1.2" />
              <text x={pad} y={toY(kg) - 3} fill="#9AAE98" fontSize="8" fontWeight="700">
                {kg} kg
              </text>
            </g>
          ))}
          <path
            d={`${path} L ${toX(days).toFixed(1)} ${H - pad} L ${toX(0).toFixed(1)} ${H - pad} Z`}
            fill={`url(#decay-${c.id})`}
          />
          <path
            d={path}
            fill="none"
            stroke="#1B5E20"
            strokeWidth="2.6"
            strokeLinecap="round"
            className="anim-draw"
            style={{ '--dash': 800 } as React.CSSProperties}
          />
          {/* Penanda batas umur simpan */}
          {profile.shelfLifeDays <= days && (
            <g>
              <line
                x1={toX(profile.shelfLifeDays)}
                x2={toX(profile.shelfLifeDays)}
                y1="0"
                y2={H}
                stroke="#E05A3F"
                strokeWidth="1.8"
                strokeDasharray="5 4"
              />
              <text
                x={toX(profile.shelfLifeDays) + 4}
                y="14"
                fill="#A6301C"
                fontSize="10"
                fontWeight="700"
              >
                batas simpan
              </text>
            </g>
          )}
        </svg>

        <label className="mt-4 block">
          <span className="text-xs font-bold uppercase tracking-wider text-[#4B6149]">
            Lama simpan: {days} hari
          </span>
          <input
            type="range"
            min={1}
            max={30}
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="nw-range mt-2 w-full"
            style={{
              background: `linear-gradient(90deg, #1B5E20 ${((days - 1) / 29) * 100}%, #C8E6C9 ${((days - 1) / 29) * 100}%)`,
            }}
          />
        </label>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl bg-[#E8F5E9] p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#4B6149]">
              Sisa layak
            </p>
            <p className="font-mono text-lg font-bold text-[#1B5E20]">
              {formatNumber(sim.usableKg, 2)} kg
            </p>
          </div>
          <div className="rounded-2xl bg-[#FDECEA] p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#A6301C]">Terbuang</p>
            <p className="font-mono text-lg font-bold text-[#A6301C]">
              {formatNumber(sim.wasteKg, 2)} kg
            </p>
          </div>
          <div className="rounded-2xl bg-[#FBF3DC] p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A7420]">Kerugian</p>
            <p className="font-mono text-sm font-bold text-[#8A7420]">
              {formatIDR(sim.cashLoss)}
            </p>
          </div>
        </div>

        {sim.beyondShelfLife && (
          <p className="mt-3 rounded-2xl bg-[#FDECEA] px-4 py-2.5 text-xs font-semibold text-[#7E2416]">
            Melewati batas {profile.shelfLifeDays} hari — bahan sudah tidak layak jual meski angka
            bobotnya masih tersisa.
          </p>
        )}

        <p className="mt-3 text-xs leading-relaxed text-[#6B7F69]">{profile.note}</p>
      </section>
    </div>
  );
}

/* ───────────────────────────── Tab: Simpan ──────────────────────────── */

function TabSimpan({ c }: { c: Commodity }) {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-gradient-to-br from-[#1B5E20] to-[#2E7D32] p-5 text-white">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A5D6A7]">
          Tempat simpan terbaik
        </p>
        <p className="mt-1.5 font-display text-2xl font-black">
          {STORAGE_META[c.storage.best].icon} {STORAGE_META[c.storage.best].label}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-[#C8E6C9]">
          {STORAGE_META[c.storage.best].desc}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold">
            <Thermometer className="h-3.5 w-3.5" /> {c.storage.idealTemp}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold">
            <Droplets className="h-3.5 w-3.5" /> {c.storage.idealHumidity}
          </span>
        </div>
      </section>

      <section>
        <SectionTitle>Langkah simpan agar tidak cepat busuk</SectionTitle>
        <ol className="mt-3 space-y-2.5">
          {c.storage.steps.map((s, i) => (
            <li
              key={s.title}
              className="group flex gap-3 rounded-2xl border border-[#A5D6A7]/60 bg-white p-4 transition-all duration-300 hover:border-[#66BB6A] hover:shadow-[0_16px_36px_-28px_rgba(13,51,17,0.9)]"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#E8F5E9] font-mono text-sm font-bold text-[#1B5E20] transition-colors group-hover:bg-[#1B5E20] group-hover:text-white">
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-bold text-[#0D3311]">{s.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-[#4B6149]">{s.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        <section className="rounded-3xl border border-[#A5D6A7] bg-[#E8F5E9] p-4">
          <h4 className="flex items-center gap-2 text-sm font-bold text-[#1B5E20]">
            <CheckCircle2 className="h-4 w-4" /> Lakukan
          </h4>
          <ul className="mt-3 space-y-2">
            {c.storage.dos.map((d) => (
              <li key={d} className="flex gap-2 text-sm leading-relaxed text-[#25422A]">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#66BB6A]" />
                {d}
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-3xl border border-[#E7B4A6] bg-[#FDECEA] p-4">
          <h4 className="flex items-center gap-2 text-sm font-bold text-[#A6301C]">
            <XCircle className="h-4 w-4" /> Hindari
          </h4>
          <ul className="mt-3 space-y-2">
            {c.storage.donts.map((d) => (
              <li key={d} className="flex gap-2 text-sm leading-relaxed text-[#7E2416]">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#E05A3F]" />
                {d}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section>
        <SectionTitle>Solusi olahan bila stok berlebih</SectionTitle>
        <div className="mt-3 space-y-2">
          {c.storage.processing.map((p) => (
            <div
              key={p.name}
              className="rounded-2xl border border-[#D3BE6D]/60 bg-[#FBF6E4] p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-[#5F5015]">{p.name}</p>
                <span className="shrink-0 rounded-full bg-[#D3BE6D] px-2.5 py-1 font-mono text-[11px] font-bold text-[#3A3113]">
                  {p.life}
                </span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-[#6B5A1E]">{p.note}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ───────────────────────────── Potongan UI ──────────────────────────── */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-2.5 font-display text-lg font-bold text-[#0D3311]">
      <span className="h-4 w-1.5 rounded-full bg-[#D3BE6D]" />
      {children}
    </h3>
  );
}

function MiniStat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-[#A5D6A7]/60 bg-white p-4">
      <p className="text-[10px] font-bold uppercase tracking-wider text-[#7A8C78]">{label}</p>
      <p className="mt-1 text-sm font-bold leading-tight text-[#0D3311]">{value}</p>
      <p className="mt-0.5 font-mono text-xs text-[#6B7F69]">{sub}</p>
    </div>
  );
}

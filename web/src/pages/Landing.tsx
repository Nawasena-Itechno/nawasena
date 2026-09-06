import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowDown,
  Library,
  FlaskConical,
  ShieldCheck,
  Scale,
  TrendingUp,
  TrendingDown,
  Snowflake,
  CloudRain,
  Sparkles,
  LineChart,
  ChevronRight,
} from 'lucide-react';
import type { Commodity } from '../data/types';
import { STORAGE_META } from '../data/types';
import {
  COMMODITIES,
  formatIDR,
  formatNumber,
  getCommodity,
  getStorage,
  priceSeries,
  simulateWaste,
  VOLATILITY_STYLE,
} from '../data/commodities';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import CommodityArt from '../components/CommodityArt';
import CommodityCard from '../components/CommodityCard';
import CommodityDrawer from '../components/CommodityDrawer';
import Sparkline from '../components/Sparkline';
import { Reveal, CountUp } from '../components/motion/Reveal';
import { useScrollProgress, usePointerTilt } from '../components/motion/hooks';

const FEATURED_IDS = ['cabai-rawit-merah', 'bawang-merah', 'beras-premium', 'sawi-hijau'];

export default function Landing() {
  const [active, setActive] = useState<Commodity | null>(null);

  return (
    <div className="min-h-screen bg-[#F8FCF8]">
      <SiteHeader />
      <Hero />
      <PriceTicker onOpen={setActive} />
      <TwoRisks />
      <StatBand />
      <EncyclopediaPreview onOpen={setActive} />
      <SimulatorTeaser />
      <HowItWorks />
      <TrustSection />
      <FinalCta />
      <CommodityDrawer commodity={active} onClose={() => setActive(null)} />
      <SiteFooter />
    </div>
  );
}

/* ───────────────────────────────── Hero ───────────────────────────────── */

function Hero() {
  const { scrollY } = useScrollProgress();
  const { ref, style, pointer } = usePointerTilt<HTMLDivElement>(9);

  const floats = useMemo(
    () =>
      [
        { id: 'cabai-rawit-merah', top: '24%', side: 'left' as const, size: 104, depth: 0.22, delay: '0s' },
        { id: 'bawang-merah', top: '66%', side: 'left' as const, size: 86, depth: 0.34, delay: '1.2s' },
        { id: 'tomat', top: '18%', side: 'right' as const, size: 88, depth: 0.28, delay: '0.6s' },
        { id: 'beras-premium', top: '70%', side: 'right' as const, size: 96, depth: 0.4, delay: '1.8s' },
      ].map((f) => ({ ...f, c: getCommodity(f.id)! })),
    []
  );

  const headline = ['Berapa', 'kilogram', 'yang', 'harus', 'warung', 'Anda', 'beli', 'hari', 'ini?'];

  return (
    <section className="relative -mt-[76px] overflow-hidden bg-[#0D3311] pb-32 pt-40">
      {/* Lapisan latar */}
      <div className="hairline-grid absolute inset-0 opacity-[0.18]" />
      <div
        className="absolute -left-32 top-0 h-[520px] w-[520px] rounded-full bg-[#1B5E20] opacity-80 blur-[110px]"
        style={{ transform: `translateY(${scrollY * 0.12}px)` }}
      />
      <div
        className="absolute -right-24 top-40 h-[460px] w-[460px] rounded-full bg-[#2E7D32] opacity-60 blur-[120px]"
        style={{ transform: `translateY(${scrollY * -0.08}px)` }}
      />
      <div
        className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-[#D3BE6D] opacity-[0.14] blur-[90px]"
        style={{ transform: `translateY(${scrollY * 0.05}px)` }}
      />

      {/* Komoditas melayang dengan parallax — hanya pada layar sangat lebar,
          agar tidak pernah menabrak kolom teks atau kartu keputusan. */}
      {floats.map((f) => (
        <div
          key={f.id}
          className={`pointer-events-none absolute hidden 2xl:block ${
            f.side === 'left' ? 'left-6' : 'right-6'
          }`}
          style={{ top: f.top, transform: `translateY(${scrollY * f.depth * -1}px)` }}
          aria-hidden="true"
        >
          <div
            className="anim-float relative overflow-hidden rounded-[28px] border border-[#66BB6A]/25 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.7)]"
            style={{ width: f.size, height: f.size, animationDelay: f.delay }}
          >
            <CommodityArt art={f.c.art} photo={f.c.photo} alt="" className="h-full w-full" />
            {/* Selubung gelap agar ilustrasi menyatu dengan latar hero. */}
            <span className="absolute inset-0 bg-[#0D3311]/45 mix-blend-multiply" />
          </div>
        </div>
      ))}

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div>
          <h1 className="mt-7 font-display text-[2.6rem] font-black leading-[1.04] text-white sm:text-6xl lg:text-[4.2rem]">
            {headline.map((w, i) => (
              <span
                key={i}
                className="anim-rise mr-[0.28em] inline-block"
                style={{ animationDelay: `${120 + i * 70}ms` }}
              >
                {w === 'kilogram' ? <span className="shimmer-text">{w}</span> : w}
              </span>
            ))}
          </h1>

          <Reveal delay={280}>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-[#A5D6A7]">
              Nawasena menimbang dua risiko yang selalu bertabrakan di dapur UMKM: harga pasar yang
              bisa melonjak kapan saja, dan stok segar yang membusuk sejak hari pertama. Hasilnya
              satu angka yang bisa langsung dipakai — berapa kilogram yang dibeli hari ini.
            </p>
          </Reveal>

          <Reveal delay={360}>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/login"
                className="group relative overflow-hidden rounded-full bg-[#D3BE6D] px-7 py-4 text-center text-sm font-bold text-[#3A3113] shadow-[0_20px_44px_-22px_rgba(211,190,109,0.9)] transition-transform duration-300 hover:-translate-y-1"
              >
                <span className="relative z-10 inline-flex items-center gap-2">
                  Daftarkan Usaha UMKM
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Link>
              <Link
                to="/simulator"
                className="group rounded-full border border-[#66BB6A]/50 bg-white/5 px-7 py-4 text-center text-sm font-bold text-white backdrop-blur transition-all duration-300 hover:border-[#66BB6A] hover:bg-white/10"
              >
                <span className="inline-flex items-center gap-2">
                  <FlaskConical className="h-4 w-4 text-[#66BB6A]" />
                  Coba Simulator Dapur
                </span>
              </Link>
            </div>
          </Reveal>

          <Reveal delay={440}>
            <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 text-xs font-semibold text-[#8FBF8F]">
              <span className="inline-flex items-center gap-1.5">
                <LineChart className="h-4 w-4 text-[#66BB6A]" /> 2.184 hari data harga riil
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CloudRain className="h-4 w-4 text-[#66BB6A]" /> Cuaca sentra tani
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[#66BB6A]" /> Metodologi terbuka
              </span>
            </div>
          </Reveal>
        </div>

        {/* Kartu keputusan melayang */}
        <Reveal dir="scale" delay={200}>
          <div ref={ref} style={style} className="relative transition-transform duration-300 ease-out">
            <div
              className="pointer-events-none absolute -inset-6 rounded-[42px] opacity-70 blur-2xl transition-opacity duration-500"
              style={{
                background: `radial-gradient(320px circle at ${pointer.x * 100}% ${pointer.y * 100}%, rgba(211,190,109,0.35), transparent 65%)`,
              }}
            />
            <div className="relative overflow-hidden rounded-[32px] border border-[#66BB6A]/30 bg-[#F8FCF8] shadow-[0_50px_100px_-40px_rgba(0,0,0,0.8)]">
              <div className="flex items-center gap-2 border-b border-[#A5D6A7]/60 bg-[#E8F5E9] px-5 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[#E05A3F]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#D3BE6D]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#66BB6A]" />
                <span className="ml-3 font-mono text-[11px] text-[#4B6149]">
                  nawasena — rekomendasi hari ini
                </span>
              </div>

              <div className="p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7A8C78]">
                  Cabai Rawit Merah · Warteg Barokah
                </p>
                <p className="mt-2 font-display text-3xl font-black leading-tight text-[#0D3311]">
                  Beli <span className="text-[#1B5E20]">12,9 kg</span> hari ini
                </p>
                <p className="mt-1 text-sm font-semibold text-[#4B6149]">
                  Cukup untuk 1 minggu — jangan borong 2 minggu.
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-[#E8F5E9] p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#4B6149]">
                      Hemat vs borong
                    </p>
                    <p className="mt-1 font-mono text-lg font-bold text-[#1B5E20]">Rp 84.000</p>
                  </div>
                  <div className="rounded-2xl bg-[#FDECEA] p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#A6301C]">
                      Peluang keliru
                    </p>
                    <p className="mt-1 font-mono text-lg font-bold text-[#A6301C]">22%</p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-[#A5D6A7]/60 p-4">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#7A8C78]">
                    <span>Proyeksi 14 hari (P10–P90)</span>
                    <span className="font-mono">Rp 36,5rb – 62,9rb</span>
                  </div>
                  <Sparkline
                    values={priceSeries(getCommodity('cabai-rawit-merah')!)}
                    width={260}
                    height={56}
                    className="mt-2 w-full"
                  />
                </div>

                <div className="mt-4 flex items-center gap-2 rounded-2xl bg-[#FBF6E4] px-4 py-3">
                  <Sparkles className="h-4 w-4 shrink-0 text-[#B9A24F]" />
                  <p className="text-xs font-semibold leading-relaxed text-[#6B5A1E]">
                    Rawit hijau sedang 31% lebih murah — campur 30% pada sambal untuk hemat Rp
                    55.650/minggu.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Petunjuk scroll */}
      <a
        href="#dua-risiko"
        className="absolute inset-x-0 bottom-8 mx-auto flex w-fit flex-col items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.24em] text-[#8FBF8F] transition-colors hover:text-[#A5D6A7]"
      >
        Gulir untuk melihat
        <ArrowDown className="h-4 w-4 anim-bob" />
      </a>

      <svg
        viewBox="0 0 1440 90"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-0 h-16 w-full text-[#F8FCF8]"
        aria-hidden="true"
      >
        <path d="M0,52 C 240,92 420,14 720,42 C 1020,70 1200,96 1440,52 L1440,90 L0,90 Z" fill="currentColor" />
      </svg>
    </section>
  );
}

/* ──────────────────────────── Pita harga ──────────────────────────── */

function PriceTicker({ onOpen }: { onOpen: (c: Commodity) => void }) {
  const items = [...COMMODITIES, ...COMMODITIES];
  return (
    <section className="relative border-y border-[#A5D6A7]/50 bg-white py-4">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-white to-transparent" />
      <div className="group flex overflow-hidden">
        <div className="anim-marquee flex shrink-0 gap-3 pr-3 group-hover:[animation-play-state:paused]">
          {items.map((c, i) => {
            const up = c.yoy >= 0;
            const style = VOLATILITY_STYLE[c.volatility];
            return (
              <button
                key={`${c.id}-${i}`}
                onClick={() => onOpen(c)}
                className="flex shrink-0 items-center gap-3 rounded-2xl border border-[#A5D6A7]/50 bg-[#F8FCF8] px-4 py-2.5 transition-colors hover:border-[#66BB6A]"
              >
                <span className="text-base">{c.emoji}</span>
                <span className="text-xs font-bold text-[#25422A]">{c.shortName}</span>
                <span className="font-mono text-xs font-bold text-[#1B5E20]">
                  {formatIDR(c.price)}
                </span>
                <span
                  className={`flex items-center gap-0.5 font-mono text-[11px] font-bold ${
                    up ? 'text-[#A6301C]' : 'text-[#2E7D32]'
                  }`}
                >
                  {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {up ? '+' : ''}
                  {formatNumber(c.yoy)}%
                </span>
                <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── Dua risiko ─────────────────────────── */

function TwoRisks() {
  const [side, setSide] = useState<'harga' | 'susut'>('harga');

  return (
    <section id="dua-risiko" className="relative overflow-hidden py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#2E7D32]">
            Masalah yang sebenarnya
          </p>
          <h2 className="mt-3 max-w-3xl font-display text-4xl font-black leading-tight text-[#0D3311] md:text-5xl">
            Dua risiko yang selalu bertabrakan di dapur
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[#4B6149]">
            Belanja sedikit, harga naik dan margin habis. Belanja banyak, stok membusuk sebelum
            terjual. Nawasena menghitung keduanya sekaligus, bukan salah satunya.
          </p>
        </Reveal>

        {/* Sakelar sisi */}
        <Reveal delay={80}>
          <div className="mt-9 inline-flex rounded-full border border-[#A5D6A7] bg-white p-1">
            {(
              [
                { k: 'harga', label: 'Risiko harga naik', icon: <TrendingUp className="h-4 w-4" /> },
                { k: 'susut', label: 'Risiko stok busuk', icon: <Snowflake className="h-4 w-4" /> },
              ] as const
            ).map((t) => (
              <button
                key={t.k}
                onClick={() => setSide(t.k)}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-all duration-300 ${
                  side === t.k
                    ? 'bg-[#1B5E20] text-white shadow-[0_12px_26px_-16px_rgba(27,94,32,1)]'
                    : 'text-[#4B6149] hover:text-[#1B5E20]'
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
        </Reveal>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Reveal dir="left" delay={120}>
            <div
              key={side}
              className="anim-rise h-full rounded-[32px] border border-[#A5D6A7]/70 bg-white p-7"
            >
              {side === 'harga' ? (
                <>
                  <h3 className="font-display text-2xl font-black text-[#0D3311]">
                    Harga bisa naik 210% dalam satu musim
                  </h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-[#4B6149]">
                    Cabai rawit merah bergerak dari Rp 25.000 ke Rp 110.000 per kg dalam rentang
                    beberapa minggu. Untuk warung dengan pemakaian 10 kg per minggu, itu berarti
                    tambahan beban belanja hingga Rp 2,7 juta per bulan untuk bahan yang persis sama.
                  </p>
                  <ul className="mt-5 space-y-2.5">
                    {[
                      ['Ayunan tahunan rawit merah', '±210%'],
                      ['Andil inflasi bulan puncak', '±0,12 poin'],
                      ['Frekuensi lonjakan >35% dalam 10 hari', '<3%'],
                    ].map(([l, v]) => (
                      <li
                        key={l}
                        className="flex items-center justify-between gap-4 rounded-2xl bg-[#E8F5E9] px-4 py-3"
                      >
                        <span className="text-sm font-semibold text-[#25422A]">{l}</span>
                        <span className="font-mono text-sm font-bold text-[#1B5E20]">{v}</span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <>
                  <h3 className="font-display text-2xl font-black text-[#0D3311]">
                    Stok segar menyusut sejak hari pertama
                  </h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-[#4B6149]">
                    Di keranjang terbuka, cabai kehilangan sekitar 3,5% bobot layak pakai setiap
                    hari. Sepuluh kilogram yang disimpan sepekan menyisakan 7,8 kg — lebih dari 2 kg
                    menguap dan membusuk sebelum sempat dimasak.
                  </p>
                  <ul className="mt-5 space-y-2.5">
                    {[
                      ['Susut suhu ruang per hari', '3,5%'],
                      ['Susut wadah kedap udara per hari', '0,7%'],
                      ['Selisih kerugian pada 10 kg / 7 hari', '±Rp 87.000'],
                    ].map(([l, v]) => (
                      <li
                        key={l}
                        className="flex items-center justify-between gap-4 rounded-2xl bg-[#FDECEA] px-4 py-3"
                      >
                        <span className="text-sm font-semibold text-[#25422A]">{l}</span>
                        <span className="font-mono text-sm font-bold text-[#A6301C]">{v}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </Reveal>

          <Reveal dir="right" delay={180}>
            <div className="relative h-full overflow-hidden rounded-[32px] bg-[#0D3311] p-7 text-white">
              <div className="hairline-grid absolute inset-0 opacity-10" />
              <div className="relative">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8FBF8F]">
                  Cara Nawasena memutuskan
                </p>
                <h3 className="mt-3 font-display text-2xl font-black">
                  Menimbun hanya jika kenaikan harga menutup biaya susut
                </h3>

                <div className="mt-6 space-y-3">
                  {[
                    {
                      t: 'Sebaran harga 7–14 hari',
                      d: 'Filtered Historical Simulation menghasilkan rentang P10–P50–P90, bukan satu tebakan tunggal.',
                    },
                    {
                      t: 'Bobot kotor yang memperhitungkan susut',
                      d: 'Kilogram yang dibeli dihitung ulang agar bobot bersihnya tetap memenuhi kebutuhan dapur.',
                    },
                    {
                      t: 'Optimisasi 1 minggu vs 2 minggu',
                      d: 'Sistem memilih skenario dengan ekspektasi biaya terendah, dengan syarat tidak melampaui umur simpan.',
                    },
                  ].map((s, i) => (
                    <div
                      key={s.t}
                      className="flex gap-3 rounded-2xl border border-[#1B5E20] bg-[#0A2A0D]/60 p-4"
                    >
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#66BB6A] font-mono text-sm font-bold text-[#0D3311]">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-white">{s.t}</p>
                        <p className="mt-1 text-sm leading-relaxed text-[#A5D6A7]">{s.d}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl bg-[#14471C]/70 p-4 font-mono text-xs leading-relaxed text-[#C8E6C9]">
                  k* = arg min E[Total_Biaya(k)] , syarat 7k ≤ L
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────── Pita angka ──────────────────────────── */

function StatBand() {
  const stats = [
    { v: 2184, l: 'Hari data harga riil', s: '' },
    { v: COMMODITIES.length, l: 'Komoditas terdokumentasi', s: '' },
    { v: 4, l: 'Metode simpan dikalibrasi', s: '' },
    { v: 80, l: 'Cakupan interval prediksi', s: '%' },
  ];
  return (
    <section className="border-y border-[#A5D6A7]/50 bg-gradient-to-r from-[#E8F5E9] via-[#F3FAF4] to-[#E8F5E9] py-14">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-5 lg:grid-cols-4 lg:px-8">
        {stats.map((s, i) => (
          <Reveal key={s.l} delay={i * 80} className="text-center">
            <p className="font-display text-4xl font-black text-[#1B5E20] md:text-5xl">
              <CountUp to={s.v} suffix={s.s} />
            </p>
            <p className="mt-2 text-xs font-bold uppercase leading-tight tracking-wider text-[#4B6149]">
              {s.l}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────── Pratinjau ensiklopedia ─────────────────────── */

function EncyclopediaPreview({ onOpen }: { onOpen: (c: Commodity) => void }) {
  const featured = FEATURED_IDS.map((id) => getCommodity(id)!).filter(Boolean);

  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Reveal>
            <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[#2E7D32]">
              <Library className="h-4 w-4" /> Ensiklopedia komoditas volatil
            </p>
            <h2 className="mt-3 max-w-2xl font-display text-4xl font-black leading-tight text-[#0D3311] md:text-5xl">
              Setiap bahan punya watak harga dan watak busuknya sendiri
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[#4B6149]">
              {COMMODITIES.length} komoditas, lengkap dengan penjelasan dampaknya terhadap
              volatilitas harga pangan, laju susut per metode simpan, dan cara menyimpan agar
              bertahan lama. Klik kartu untuk membuka detailnya.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <Link
              to="/ensiklopedia"
              className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-[#1B5E20] px-6 py-3.5 text-sm font-bold text-white transition-transform duration-300 hover:-translate-y-0.5"
            >
              Buka ensiklopedia
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((c, i) => (
            <Reveal key={c.id} dir="scale" delay={i * 90}>
              <CommodityCard c={c} onOpen={onOpen} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── Cuplikan simulator ─────────────────────── */

function SimulatorTeaser() {
  const [weight, setWeight] = useState(10);
  const c = getCommodity('cabai-rawit-merah')!;
  const room = simulateWaste(c, weight, 'room', 7);
  const airtight = simulateWaste(c, weight, 'airtight', 7);
  const saving = room.cashLoss - airtight.cashLoss;

  return (
    <section className="relative overflow-hidden bg-[#0D3311] py-24">
      <div className="hairline-grid absolute inset-0 opacity-[0.14]" />
      <div className="absolute -left-20 top-10 h-80 w-80 rounded-full bg-[#1B5E20] opacity-70 blur-3xl anim-float-slow" />
      <div className="absolute -right-16 bottom-10 h-72 w-72 rounded-full bg-[#2E7D32] opacity-50 blur-3xl anim-float" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-2 lg:px-8">
        <Reveal dir="left">
          <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[#66BB6A]">
            <FlaskConical className="h-4 w-4" /> Simulator kerugian dapur
          </p>
          <h2 className="mt-3 font-display text-4xl font-black leading-tight text-white md:text-5xl">
            Geser satu slider, lihat uang yang membusuk
          </h2>
          <p className="mt-4 max-w-lg text-lg leading-relaxed text-[#A5D6A7]">
            Simulator penuh punya empat parameter, kurva penyusutan harian, perbandingan metode
            simpan, dan tombol penjelasan pada setiap kendali — apa yang digerakkannya dan bagaimana
            menekan susut.
          </p>

          <div className="mt-8 rounded-3xl border border-[#1B5E20] bg-[#0A2A0D]/70 p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8FBF8F]">
                Belanja cabai rawit merah
              </span>
              <span className="rounded-full bg-[#1B5E20] px-3 py-1 font-mono text-xs font-bold text-white">
                {weight} kg · 7 hari
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={30}
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="nw-range mt-4 w-full"
              style={{
                background: `linear-gradient(90deg, #66BB6A ${((weight - 1) / 29) * 100}%, #14471C ${((weight - 1) / 29) * 100}%)`,
              }}
              aria-label="Bobot belanja simulasi"
            />

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#2A0F09]/70 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#F3A48E]">
                  🧺 Keranjang terbuka
                </p>
                <p className="mt-1 font-mono text-xl font-black text-[#FF8F6E]">
                  {formatIDR(room.cashLoss)}
                </p>
                <p className="mt-0.5 font-mono text-[11px] text-[#C88C7A]">
                  sisa {formatNumber(room.usableKg, 2)} kg
                </p>
              </div>
              <div className="rounded-2xl bg-[#14471C]/80 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#A5D6A7]">
                  🥡 Kedap udara
                </p>
                <p className="mt-1 font-mono text-xl font-black text-[#8FE096]">
                  {formatIDR(airtight.cashLoss)}
                </p>
                <p className="mt-0.5 font-mono text-[11px] text-[#7FA982]">
                  sisa {formatNumber(airtight.usableKg, 2)} kg
                </p>
              </div>
            </div>

            <p className="mt-4 rounded-2xl bg-[#D3BE6D]/15 px-4 py-3 text-sm font-semibold leading-relaxed text-[#E3D49A]">
              Selisihnya <span className="font-mono">{formatIDR(saving)}</span> hanya dari memindah
              tempat simpan — tanpa mengubah harga beli sama sekali.
            </p>
          </div>

          <Link
            to="/simulator"
            className="group mt-6 inline-flex items-center gap-2 rounded-full bg-[#D3BE6D] px-6 py-3.5 text-sm font-bold text-[#3A3113] transition-transform duration-300 hover:-translate-y-0.5"
          >
            Buka simulator lengkap
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Reveal>

        <Reveal dir="right" delay={120}>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: <Scale className="h-5 w-5" />, t: 'Bobot belanja', d: '1–30 kg, dengan penjelasan dampaknya pada rupiah yang hilang.' },
              { icon: <Snowflake className="h-5 w-5" />, t: 'Metode simpan', d: 'Empat metode terkalibrasi, lengkap dengan peringatan metode yang justru merusak.' },
              { icon: <LineChart className="h-5 w-5" />, t: 'Kurva penyusutan', d: 'Bobot layak pakai hari ke-1 hingga ke-30 beserta batas umur simpan.' },
              { icon: <ShieldCheck className="h-5 w-5" />, t: 'Ambang impas', d: 'Kenaikan harga yang dibutuhkan vs peluang historisnya benar-benar terjadi.' },
            ].map((f, i) => (
              <div
                key={f.t}
                className="rounded-3xl border border-[#1B5E20] bg-[#0A2A0D]/60 p-5 transition-transform duration-500 hover:-translate-y-1"
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#66BB6A] text-[#0D3311]">
                  {f.icon}
                </span>
                <p className="mt-4 font-display text-lg font-bold text-white">{f.t}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-[#A5D6A7]">{f.d}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ────────────────────────── Alur penggunaan ────────────────────────── */

function HowItWorks() {
  const steps = [
    {
      t: 'Daftarkan profil dapur',
      d: 'Nama usaha, pasar acuan, komoditas rutin, pemakaian mingguan, dan fasilitas simpan yang benar-benar Anda punya.',
    },
    {
      t: 'Sistem menghitung sebaran harga',
      d: 'Data harga harian, kalender hari raya, dan curah hujan sentra tani diolah menjadi rentang harga 7–14 hari ke depan.',
    },
    {
      t: 'Terima satu angka kilogram',
      d: 'Rekomendasi belanja hari ini, estimasi penghematan, dan batas maksimal kerugian bila ramalannya keliru.',
    },
  ];

  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal className="text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#2E7D32]">
            Alur penggunaan
          </p>
          <h2 className="mx-auto mt-3 max-w-3xl font-display text-4xl font-black leading-tight text-[#0D3311] md:text-5xl">
            Tiga langkah dari daftar sampai keputusan belanja
          </h2>
        </Reveal>

        <div className="relative mt-16 grid gap-8 md:grid-cols-3">
          <div className="absolute left-0 right-0 top-8 hidden h-0.5 bg-gradient-to-r from-transparent via-[#A5D6A7] to-transparent md:block" />
          {steps.map((s, i) => (
            <Reveal key={s.t} delay={i * 140} className="relative">
              <div className="flex flex-col items-center text-center">
                <span className="relative z-10 grid h-16 w-16 place-items-center rounded-full border-[6px] border-[#F8FCF8] bg-[#1B5E20] font-display text-xl font-black text-[#D3BE6D] shadow-[0_18px_36px_-20px_rgba(27,94,32,1)]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-6 font-display text-xl font-bold text-[#0D3311]">{s.t}</h3>
                <p className="mt-2.5 max-w-xs text-sm leading-relaxed text-[#4B6149]">{s.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────────── Kepercayaan ───────────────────────────── */

function TrustSection() {
  const c = getCommodity('cabai-rawit-merah')!;
  const best = getStorage(c, c.storage.best);

  return (
    <section className="bg-[#E8F5E9] py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <Reveal dir="left">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#2E7D32]">
              Transparansi model
            </p>
            <h2 className="mt-3 font-display text-4xl font-black leading-tight text-[#0D3311] md:text-5xl">
              Angka yang bisa diperiksa, bukan diyakini
            </h2>
            <p className="mt-4 max-w-lg text-lg leading-relaxed text-[#4B6149]">
              Setiap rekomendasi disertai dasar perhitungan terbuka: harga acuan, laju susut yang
              dipakai, ambang impas, dan rentang ramalan. Rapor akurasi delapan minggu terakhir
              ditampilkan apa adanya, termasuk saat model meleset.
            </p>

            <div className="mt-7 space-y-3">
              {[
                ['MASE < 1,0', 'Model harus mengalahkan tebakan "harga kemarin".'],
                ['Cakupan 75–85%', 'Harga riil harus jatuh di antara P10 dan P90 sesering itu.'],
                ['Walk-forward validation', 'Tanpa kebocoran data masa depan ke masa lalu.'],
              ].map(([t, d]) => (
                <div
                  key={t}
                  className="flex gap-3 rounded-2xl border border-[#A5D6A7] bg-white p-4"
                >
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#1B5E20]" />
                  <div>
                    <p className="text-sm font-bold text-[#0D3311]">{t}</p>
                    <p className="mt-0.5 text-sm text-[#4B6149]">{d}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              to="/metodologi"
              className="group mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#1B5E20] hover:underline"
            >
              Baca metodologi lengkap
              <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Reveal>

          <Reveal dir="right" delay={120}>
            <div className="overflow-hidden rounded-[32px] border border-[#A5D6A7] bg-white shadow-[0_40px_80px_-56px_rgba(13,51,17,0.9)]">
              <div className="border-b border-[#A5D6A7]/60 bg-[#F3FAF4] px-6 py-4">
                <p className="font-display text-lg font-bold text-[#0D3311]">
                  Contoh dasar perhitungan
                </p>
                <p className="mt-0.5 text-xs text-[#6B7F69]">
                  {c.name} · 10 kg · {STORAGE_META[c.storage.best].short}
                </p>
              </div>
              <div className="divide-y divide-[#E8F5E9]">
                {[
                  ['Harga acuan pasar', formatIDR(c.price) + '/kg'],
                  ['Laju susut harian', `${formatNumber(best.decayPerDay * 100, 2)}%`],
                  ['Batas umur simpan', `${best.shelfLifeDays} hari`],
                  [
                    'Sisa bobot layak hari ke-7',
                    `${formatNumber(simulateWaste(c, 10, c.storage.best, 7).usableKg, 2)} kg`,
                  ],
                  [
                    'Kerugian susut 7 hari',
                    formatIDR(simulateWaste(c, 10, c.storage.best, 7).cashLoss),
                  ],
                  [
                    'Ambang impas menimbun',
                    `+${formatNumber(simulateWaste(c, 10, c.storage.best, 7).breakevenHikePct, 1)}%`,
                  ],
                ].map(([l, v]) => (
                  <div key={l} className="flex items-center justify-between gap-4 px-6 py-3.5">
                    <span className="text-sm text-[#4B6149]">{l}</span>
                    <span className="font-mono text-sm font-bold text-[#1B5E20]">{v}</span>
                  </div>
                ))}
              </div>
              <div className="bg-[#FBF6E4] px-6 py-4 text-xs leading-relaxed text-[#6B5A1E]">
                Semua angka di atas dihitung ulang secara langsung di halaman simulator dengan
                parameter dapur Anda sendiri.
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── Ajakan penutup ─────────────────────────── */

function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-[#F8FCF8] py-24">
      <div className="mx-auto max-w-5xl px-5 lg:px-8">
        <Reveal dir="scale">
          <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-[#1B5E20] via-[#2E7D32] to-[#0D3311] px-8 py-16 text-center">
            <div className="hairline-grid absolute inset-0 opacity-[0.12]" />
            <div className="absolute -left-10 -top-10 h-52 w-52 rounded-full bg-[#66BB6A] opacity-20 blur-3xl anim-float" />
            <div className="absolute -bottom-12 -right-8 h-60 w-60 rounded-full bg-[#D3BE6D] opacity-20 blur-3xl anim-float-slow" />

            <div className="relative">
              <h2 className="mx-auto max-w-2xl font-display text-4xl font-black leading-tight text-white md:text-5xl">
                Berhenti menebak. Mulai menimbang.
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-[#A5D6A7]">
                Masukkan pemakaian mingguan dan fasilitas simpan warung Anda, lalu terima
                rekomendasi kilogram yang bisa langsung dipakai besok pagi di pasar.
              </p>
              <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  to="/login"
                  className="group rounded-full bg-[#D3BE6D] px-8 py-4 text-sm font-bold text-[#3A3113] transition-transform duration-300 hover:-translate-y-1"
                >
                  <span className="inline-flex items-center gap-2">
                    Daftarkan Usaha UMKM
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </Link>
                <Link
                  to="/ensiklopedia"
                  className="rounded-full border border-[#66BB6A]/50 px-8 py-4 text-sm font-bold text-white transition-colors hover:bg-white/10"
                >
                  Jelajahi ensiklopedia dulu
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

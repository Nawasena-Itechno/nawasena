import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import type { CategoryKey, Commodity } from '../data/types';
import { CATEGORY_META } from '../data/types';
import { COMMODITIES, DATA_DISCLAIMER, getCommodity } from '../data/commodities';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import CommodityCard from '../components/CommodityCard';
import CommodityDrawer from '../components/CommodityDrawer';
import { Reveal, CountUp } from '../components/motion/Reveal';

type SortKey = 'volatil' | 'termahal' | 'tercepat-busuk' | 'nama';

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'volatil', label: 'Paling bergejolak' },
  { key: 'tercepat-busuk', label: 'Tercepat busuk' },
  { key: 'termahal', label: 'Harga tertinggi' },
  { key: 'nama', label: 'Nama A–Z' },
];

const CATEGORY_ORDER: CategoryKey[] = ['cabai', 'beras', 'bumbu', 'protein', 'sayur', 'dapur'];

export default function Encyclopedia() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [cats, setCats] = useState<CategoryKey[]>([]);
  const [sort, setSort] = useState<SortKey>('volatil');
  const [active, setActive] = useState<Commodity | null>(null);

  // Deep-link: /ensiklopedia?komoditas=cabai-rawit-merah membuka panel langsung.
  useEffect(() => {
    const id = params.get('komoditas');
    if (id) {
      const found = getCommodity(id);
      if (found) setActive(found);
    }
  }, [params]);

  const closeDrawer = () => {
    setActive(null);
    if (params.get('komoditas')) {
      params.delete('komoditas');
      setParams(params, { replace: true });
    }
  };

  const toggleCat = (c: CategoryKey) =>
    setCats((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = COMMODITIES.filter((c) => {
      const matchCat = cats.length === 0 || cats.includes(c.category);
      const matchQ =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.tagline.toLowerCase().includes(q) ||
        CATEGORY_META[c.category].label.toLowerCase().includes(q);
      return matchCat && matchQ;
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case 'volatil':
          return b.cv - a.cv;
        case 'termahal':
          return b.price - a.price;
        case 'tercepat-busuk': {
          const sa = a.decay.find((d) => d.key === 'room')?.shelfLifeDays ?? 999;
          const sb = b.decay.find((d) => d.key === 'room')?.shelfLifeDays ?? 999;
          return sa - sb;
        }
        default:
          return a.name.localeCompare(b.name, 'id');
      }
    });
    return list;
  }, [query, cats, sort]);

  const mostVolatile = useMemo(
    () => COMMODITIES.reduce((a, b) => (b.cv > a.cv ? b : a)),
    []
  );

  return (
    <div className="min-h-screen bg-[#F8FCF8]">
      <SiteHeader />

      {/* Kepala halaman */}
      <section className="relative -mt-[76px] overflow-hidden bg-[#0D3311] pb-20 pt-32">
        <div className="hairline-grid absolute inset-0 opacity-[0.15]" />
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#1B5E20] opacity-70 blur-3xl anim-float-slow" />
        <div className="absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-[#2E7D32] opacity-50 blur-3xl anim-float" />

        <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
          <Reveal delay={80}>
            <h1 className="mt-5 max-w-3xl font-display text-4xl font-black leading-[1.08] text-white md:text-6xl">
              Kenali bahan yang{' '}
              <span className="shimmer-text">menguras kas warung</span> Anda
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[#A5D6A7]">
              {COMMODITIES.length} komoditas pangan bergejolak, lengkap dengan dampaknya terhadap
              volatilitas harga pangan, laju susut pembusukan per metode simpan, dan cara menyimpan
              agar bahan bertahan lebih lama. Klik kartu mana pun untuk membuka detailnya.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-10 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
              <HeroStat value={COMMODITIES.length} label="Komoditas" />
              <HeroStat value={CATEGORY_ORDER.length} label="Kategori" />
              <HeroStat value={4} label="Metode simpan" />
              <HeroStat
                value={mostVolatile.cv}
                decimals={1}
                suffix="%"
                label={`CV tertinggi · ${mostVolatile.shortName}`}
              />
            </div>
          </Reveal>
        </div>

        <svg
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          className="absolute inset-x-0 bottom-0 h-14 w-full text-[#F8FCF8]"
          aria-hidden="true"
        >
          <path d="M0,50 C 240,84 480,10 720,38 C 960,66 1200,88 1440,44 L1440,80 L0,80 Z" fill="currentColor" />
        </svg>
      </section>

      {/* Panel pencarian & filter */}
      <section className="sticky top-[68px] z-30 border-b border-[#A5D6A7]/50 bg-[#F8FCF8]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-5 py-4 lg:px-8">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <label className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7A8C78]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari komoditas — cabai, beras, bawang…"
                className="w-full rounded-full border border-[#A5D6A7] bg-white py-3 pl-11 pr-10 text-sm font-medium text-[#25422A] outline-none transition-all duration-300 placeholder:text-[#9AAE98] focus:border-[#1B5E20] focus:ring-4 focus:ring-[#66BB6A]/20"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  aria-label="Bersihkan pencarian"
                  className="absolute right-3 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full bg-[#E8F5E9] text-[#4B6149]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </label>

            <label className="relative shrink-0">
              <SlidersHorizontal className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7A8C78]" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="w-full appearance-none rounded-full border border-[#A5D6A7] bg-white py-3 pl-11 pr-9 text-sm font-semibold text-[#25422A] outline-none transition-colors focus:border-[#1B5E20] lg:w-56"
              >
                {SORTS.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="no-bar mt-3 flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setCats([])}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all duration-300 ${
                cats.length === 0
                  ? 'bg-[#1B5E20] text-white shadow-[0_10px_24px_-16px_rgba(27,94,32,1)]'
                  : 'bg-white text-[#4B6149] ring-1 ring-[#A5D6A7] hover:ring-[#66BB6A]'
              }`}
            >
              Semua ({COMMODITIES.length})
            </button>
            {CATEGORY_ORDER.map((k) => {
              const meta = CATEGORY_META[k];
              const count = COMMODITIES.filter((c) => c.category === k).length;
              const on = cats.includes(k);
              return (
                <button
                  key={k}
                  onClick={() => toggleCat(k)}
                  title={meta.blurb}
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all duration-300 ${
                    on
                      ? 'bg-[#1B5E20] text-white shadow-[0_10px_24px_-16px_rgba(27,94,32,1)]'
                      : 'bg-white text-[#4B6149] ring-1 ring-[#A5D6A7] hover:ring-[#66BB6A]'
                  }`}
                >
                  {meta.emoji} {meta.label} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Kisi kartu */}
      <main className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <p className="mb-6 text-sm font-semibold text-[#4B6149]">
          Menampilkan <span className="font-mono text-[#1B5E20]">{results.length}</span> komoditas
          {cats.length > 0 && ` dalam ${cats.length} kategori`}
          {query && ` untuk "${query}"`}
        </p>

        {results.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#A5D6A7] bg-white py-20 text-center">
            <p className="font-display text-xl font-bold text-[#0D3311]">
              Tidak ada komoditas yang cocok
            </p>
            <p className="mt-2 text-sm text-[#6B7F69]">
              Coba kata kunci lain atau bersihkan filter kategori.
            </p>
            <button
              onClick={() => {
                setQuery('');
                setCats([]);
              }}
              className="mt-5 rounded-full bg-[#1B5E20] px-6 py-2.5 text-sm font-bold text-white"
            >
              Tampilkan semua
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {results.map((c, i) => (
              <Reveal key={c.id} dir="scale" delay={(i % 4) * 70}>
                <CommodityCard c={c} onOpen={setActive} />
              </Reveal>
            ))}
          </div>
        )}

        <Reveal>
          <p className="mx-auto mt-14 max-w-3xl rounded-3xl border border-[#A5D6A7]/60 bg-white p-5 text-center text-xs leading-relaxed text-[#6B7F69]">
            {DATA_DISCLAIMER}
          </p>
        </Reveal>
      </main>

      <CommodityDrawer commodity={active} onClose={closeDrawer} />
      <SiteFooter />
    </div>
  );
}

function HeroStat({
  value,
  label,
  suffix = '',
  decimals = 0,
}: {
  value: number;
  label: string;
  suffix?: string;
  decimals?: number;
}) {
  return (
    <div className="rounded-2xl border border-[#1B5E20] bg-[#0A2A0D]/60 p-4">
      <p className="font-display text-3xl font-black text-[#D3BE6D]">
        <CountUp to={value} decimals={decimals} suffix={suffix} />
      </p>
      <p className="mt-1 text-[11px] font-semibold uppercase leading-tight tracking-wider text-[#8FBF8F]">
        {label}
      </p>
    </div>
  );
}

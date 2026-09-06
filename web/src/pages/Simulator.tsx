import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  FlaskConical,
  AlertTriangle,
  ArrowRight,
  Scale,
  CalendarDays,
  Snowflake,
  Leaf,
  TrendingDown,
  Lock,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import type { Commodity, StorageKey } from '../data/types';
import { STORAGE_META } from '../data/types';
import {
  COMMODITIES,
  DATA_DISCLAIMER,
  formatIDR,
  formatNumber,
  getCommodity,
  getStorage,
  simulateWaste,
} from '../data/commodities';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import CommodityArt from '../components/CommodityArt';
import { ExplainToggle, ExplainPanel } from '../components/ExplainButton';
import type { Explanation } from '../components/ExplainButton';
import { Reveal } from '../components/motion/Reveal';

/** Angka yang bergerak halus setiap kali nilainya berubah (efek odometer). */
function useAnimatedNumber(target: number, duration = 650) {
  const [value, setValue] = useState(target);
  const from = useRef(target);
  const raf = useRef(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target);
      return;
    }
    const start = performance.now();
    const a = from.current;
    const b = target;
    cancelAnimationFrame(raf.current);
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(a + (b - a) * eased);
      if (p < 1) raf.current = requestAnimationFrame(tick);
      else from.current = b;
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);

  return value;
}

export default function Simulator() {
  const [params, setParams] = useSearchParams();

  const initial = getCommodity(params.get('komoditas') ?? '') ?? COMMODITIES[0];
  const [commodity, setCommodity] = useState<Commodity>(initial);
  const [weight, setWeight] = useState(10);
  const [days, setDays] = useState(7);
  const [pickedStorage, setPickedStorage] = useState<StorageKey>('room');

  // Diturunkan saat render, bukan lewat efek: komoditas yang tidak punya metode
  // yang sedang dipilih otomatis jatuh kembali ke suhu ruang tanpa render ganda.
  const storage: StorageKey = commodity.decay.some((d) => d.key === pickedStorage)
    ? pickedStorage
    : 'room';
  const setStorage = setPickedStorage;

  const pickCommodity = (c: Commodity) => {
    setCommodity(c);
    params.set('komoditas', c.id);
    setParams(params, { replace: true });
  };

  const reset = () => {
    setWeight(10);
    setDays(7);
    setPickedStorage('room');
  };

  const sim = useMemo(
    () => simulateWaste(commodity, weight, storage, days),
    [commodity, weight, storage, days]
  );
  const profile = getStorage(commodity, storage);

  const animLoss = useAnimatedNumber(sim.cashLoss);
  const animUsable = useAnimatedNumber(sim.usableKg);
  const animWaste = useAnimatedNumber(sim.wasteKg);

  // Saran perbaikan memakai metode terbaik yang dikurasi per komoditas, bukan
  // sekadar laju susut terendah — freezer paling hemat bobot tetapi merusak
  // sebagian komoditas (bawang utuh, kentang) sehingga tidak layak disarankan.
  const bestAlt = useMemo(
    () =>
      sim.alternatives.find((a) => a.key === commodity.storage.best) ?? sim.alternatives[0],
    [sim, commodity]
  );
  const savingVsCurrent = sim.cashLoss - bestAlt.cashLoss;

  const worthStockpiling = sim.spikeProbabilityPct > 25;

  return (
    <div className="min-h-screen bg-[#F8FCF8]">
      <SiteHeader />

      {/* Kepala halaman */}
      <section className="relative overflow-hidden bg-[#0D3311] pb-24 pt-16">
        <div className="hairline-grid absolute inset-0 opacity-[0.15]" />
        <div className="absolute -right-20 top-0 h-80 w-80 rounded-full bg-[#2E7D32] opacity-60 blur-3xl anim-float" />
        <div className="absolute -left-24 bottom-4 h-72 w-72 rounded-full bg-[#1B5E20] opacity-70 blur-3xl anim-float-slow" />

        <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#66BB6A]/40 bg-[#14471C]/70 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#A5D6A7]">
              <FlaskConical className="h-3.5 w-3.5" />
              Simulator Kerugian Dapur
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-5 max-w-3xl font-display text-4xl font-black leading-[1.08] text-white md:text-6xl">
              Berapa rupiah yang <span className="shimmer-text">membusuk</span> di dapur Anda
              minggu ini?
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[#A5D6A7]">
              Geser parameternya dan lihat bobot yang hilang, uang yang menguap, serta kenaikan
              harga yang dibutuhkan agar menimbun tetap masuk akal. Setiap parameter punya tombol
              penjelasan — tekan untuk tahu apa yang digerakkannya dan bagaimana menekan susut.
            </p>
          </Reveal>
        </div>

        <svg
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          className="absolute inset-x-0 bottom-0 h-14 w-full text-[#F8FCF8]"
          aria-hidden="true"
        >
          <path d="M0,44 C 240,88 480,12 720,40 C 960,68 1200,86 1440,48 L1440,80 L0,80 Z" fill="currentColor" />
        </svg>
      </section>

      <main className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          {/* ─────────────── Panel kendali ─────────────── */}
          <Reveal dir="left" className="lg:sticky lg:top-24 lg:self-start">
            <div className="-mt-12 rounded-[32px] border border-[#A5D6A7]/70 bg-white p-6 shadow-[0_40px_80px_-52px_rgba(13,51,17,0.9)]">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-bold text-[#0D3311]">Parameter dapur</h2>
                <button
                  onClick={reset}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F5E9] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#1B5E20] transition-colors hover:bg-[#A5D6A7]"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Atur ulang
                </button>
              </div>

              {/* Komoditas */}
              <div className="mt-6">
                <ControlHeader
                  icon={<Leaf className="h-4 w-4" />}
                  label="Komoditas"
                  value={commodity.name}
                  explanation={EXPLAIN.commodity(commodity)}
                />
                <div className="no-bar mt-3 flex gap-2 overflow-x-auto pb-2">
                  {COMMODITIES.map((c) => {
                    const on = c.id === commodity.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() => pickCommodity(c)}
                        className={`group flex w-[104px] shrink-0 flex-col overflow-hidden rounded-2xl border transition-all duration-300 ${
                          on
                            ? 'border-[#1B5E20] shadow-[0_16px_32px_-20px_rgba(27,94,32,1)]'
                            : 'border-[#A5D6A7]/70 hover:border-[#66BB6A]'
                        }`}
                      >
                        <CommodityArt
                          art={c.art}
                          photo={c.photo}
                          alt={c.name}
                          className="h-16 w-full"
                        />
                        <span
                          className={`px-2 py-2 text-[11px] font-bold leading-tight ${
                            on ? 'bg-[#1B5E20] text-white' : 'bg-white text-[#25422A]'
                          }`}
                        >
                          {c.shortName}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bobot belanja */}
              <div className="mt-7">
                <ControlHeader
                  icon={<Scale className="h-4 w-4" />}
                  label="Bobot belanja"
                  value={`${weight} kg`}
                  explanation={EXPLAIN.weight(commodity)}
                />
                <input
                  type="range"
                  min={1}
                  max={30}
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="nw-range mt-3 w-full"
                  style={{ background: rangeFill((weight - 1) / 29) }}
                  aria-label="Bobot belanja dalam kilogram"
                />
                <div className="mt-1.5 flex justify-between font-mono text-[11px] text-[#7A8C78]">
                  <span>1 kg</span>
                  <span>30 kg</span>
                </div>
              </div>

              {/* Lama simpan */}
              <div className="mt-7">
                <ControlHeader
                  icon={<CalendarDays className="h-4 w-4" />}
                  label="Lama simpan"
                  value={`${days} hari`}
                  explanation={EXPLAIN.days(commodity, profile.shelfLifeDays)}
                />
                <input
                  type="range"
                  min={1}
                  max={30}
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="nw-range mt-3 w-full"
                  style={{ background: rangeFill((days - 1) / 29) }}
                  aria-label="Lama penyimpanan dalam hari"
                />
                <div className="mt-1.5 flex justify-between font-mono text-[11px] text-[#7A8C78]">
                  <span>1 hari</span>
                  <span className="font-bold text-[#A6301C]">
                    batas metode ini: {profile.shelfLifeDays} hari
                  </span>
                  <span>30 hari</span>
                </div>
              </div>

              {/* Metode simpan */}
              <div className="mt-7">
                <ControlHeader
                  icon={<Snowflake className="h-4 w-4" />}
                  label="Metode simpan"
                  value={STORAGE_META[storage].short}
                  explanation={EXPLAIN.storage(commodity)}
                />
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {commodity.decay.map((d) => {
                    const on = storage === d.key;
                    return (
                      <button
                        key={d.key}
                        onClick={() => setStorage(d.key)}
                        className={`rounded-2xl border p-3 text-left transition-all duration-300 ${
                          on
                            ? 'border-[#1B5E20] bg-[#1B5E20] text-white shadow-[0_16px_32px_-20px_rgba(27,94,32,1)]'
                            : 'border-[#A5D6A7]/70 bg-white text-[#25422A] hover:border-[#66BB6A]'
                        }`}
                      >
                        <span className="text-lg">{STORAGE_META[d.key].icon}</span>
                        <p className="mt-1 text-sm font-bold leading-tight">
                          {STORAGE_META[d.key].short}
                        </p>
                        <p
                          className={`mt-1 font-mono text-[11px] ${on ? 'text-[#A5D6A7]' : 'text-[#6B7F69]'}`}
                        >
                          {formatNumber(d.decayPerDay * 100, 2)}%/hari
                        </p>
                        {d.warning && (
                          <span
                            className={`mt-1 inline-flex items-center gap-1 text-[10px] font-bold uppercase ${
                              on ? 'text-[#F3C6A0]' : 'text-[#A6301C]'
                            }`}
                          >
                            <AlertTriangle className="h-3 w-3" /> hindari
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-3 rounded-2xl bg-[#E8F5E9] px-4 py-3 text-xs leading-relaxed text-[#31462F]">
                  {profile.note}
                </p>
                {profile.warning && (
                  <p className="mt-2 flex items-start gap-2 rounded-2xl border border-[#E7B4A6] bg-[#FDECEA] px-4 py-3 text-xs font-semibold leading-relaxed text-[#7E2416]">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    {profile.warning}
                  </p>
                )}
              </div>
            </div>
          </Reveal>

          {/* ─────────────── Panel hasil ─────────────── */}
          <div className="space-y-6">
            {/* Tabung bobot ganda */}
            <Reveal dir="right">
              <div className="relative overflow-hidden rounded-[32px] bg-[#0D3311] p-6 text-white shadow-[0_40px_80px_-52px_rgba(13,51,17,1)] lg:-mt-12">
                <div className="hairline-grid absolute inset-0 opacity-10" />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-xl font-bold">Bobot yang benar-benar terpakai</h2>
                    <span className="rounded-full bg-white/10 px-3 py-1 font-mono text-[11px] text-[#A5D6A7]">
                      hari ke-{days}
                    </span>
                  </div>

                  <div className="mt-7 flex items-end justify-center gap-8">
                    <Tube
                      label="Dibeli"
                      caption={`${formatNumber(weight, 1)} kg`}
                      usableRatio={1}
                      tone="full"
                    />
                    <div className="mb-16 flex flex-col items-center gap-1 text-[#66BB6A]">
                      <ArrowRight className="h-6 w-6 anim-bob" />
                      <span className="font-mono text-[10px] uppercase tracking-wider">
                        {days} hari
                      </span>
                    </div>
                    <Tube
                      label="Sisa layak"
                      caption={`${formatNumber(animUsable, 2)} kg`}
                      usableRatio={sim.usableKg / weight}
                      tone="split"
                      wasteCaption={`${formatNumber(animWaste, 2)} kg busuk`}
                    />
                  </div>

                  {/* Penghitung kas berjalan */}
                  <div className="mt-8 rounded-3xl border border-[#5A1F14] bg-[#2A0F09]/70 p-5 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#F3A48E]">
                      Uang kas yang membusuk
                    </p>
                    <p className="mt-2 font-mono text-4xl font-black tracking-tight text-[#FF8F6E] md:text-5xl">
                      {formatIDR(animLoss)}
                    </p>
                    <p className="mt-2 flex items-center justify-center gap-1.5 text-xs font-semibold text-[#F3A48E]">
                      <TrendingDown className="h-3.5 w-3.5" />
                      {formatNumber(sim.wasteKg, 2)} kg dari {formatNumber(weight, 1)} kg —{' '}
                      {formatNumber((sim.wasteKg / weight) * 100, 1)}% belanja Anda
                    </p>
                  </div>

                  {sim.beyondShelfLife && (
                    <p className="mt-3 flex items-start gap-2 rounded-2xl bg-[#5A1F14]/60 px-4 py-3 text-xs font-semibold leading-relaxed text-[#FFB4A2]">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                      Hari ke-{days} sudah melewati batas simpan {profile.shelfLifeDays} hari untuk
                      metode {STORAGE_META[storage].short}. Sisa bobot pada layar tidak lagi layak
                      dijual meski secara timbangan masih ada.
                    </p>
                  )}
                </div>
              </div>
            </Reveal>

            {/* Kurva susut */}
            <Reveal dir="right" delay={60}>
              <DecayChart sim={sim} days={days} shelfLife={profile.shelfLifeDays} weight={weight} />
            </Reveal>

            {/* Ambang impas */}
            <Reveal dir="right" delay={120}>
              <div className="rounded-[32px] border border-[#A5D6A7]/70 bg-white p-6">
                <h3 className="font-display text-lg font-bold text-[#0D3311]">
                  Apakah menimbun {days} hari masuk akal?
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#4B6149]">
                  Agar penimbunan ini impas, harga pasar harus naik melebihi bobot yang hilang.
                  Bandingkan ambangnya dengan seberapa sering lonjakan sebesar itu benar-benar
                  terjadi.
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl bg-[#FBF6E4] p-5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A7420]">
                      Kenaikan harga yang dibutuhkan
                    </p>
                    <p className="mt-1 font-mono text-3xl font-black text-[#8A7420]">
                      +{formatNumber(sim.breakevenHikePct, 1)}%
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-[#6B5A1E]">
                      dalam {days} hari, hanya untuk menutup bobot yang membusuk.
                    </p>
                  </div>
                  <div
                    className={`rounded-3xl p-5 ${worthStockpiling ? 'bg-[#E8F5E9]' : 'bg-[#FDECEA]'}`}
                  >
                    <p
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        worthStockpiling ? 'text-[#1B5E20]' : 'text-[#A6301C]'
                      }`}
                    >
                      Peluang lonjakan itu terjadi
                    </p>
                    <p
                      className={`mt-1 font-mono text-3xl font-black ${
                        worthStockpiling ? 'text-[#1B5E20]' : 'text-[#A6301C]'
                      }`}
                    >
                      {formatNumber(sim.spikeProbabilityPct, 1)}%
                    </p>
                    <p
                      className={`mt-1.5 text-xs leading-relaxed ${
                        worthStockpiling ? 'text-[#31462F]' : 'text-[#7E2416]'
                      }`}
                    >
                      berdasarkan volatilitas historis {commodity.shortName} (CV{' '}
                      {formatNumber(commodity.cv)}%).
                    </p>
                  </div>
                </div>

                <div
                  className={`mt-4 rounded-3xl border p-5 ${
                    worthStockpiling
                      ? 'border-[#A5D6A7] bg-[#E8F5E9]'
                      : 'border-[#E7B4A6] bg-[#FDECEA]'
                  }`}
                >
                  <p
                    className={`text-sm font-bold leading-relaxed ${
                      worthStockpiling ? 'text-[#1B5E20]' : 'text-[#7E2416]'
                    }`}
                  >
                    {worthStockpiling
                      ? `Menimbun ${weight} kg selama ${days} hari layak dipertimbangkan — peluang harga naik cukup besar untuk menutup susut. Pastikan metode simpannya benar.`
                      : `Menimbun ${weight} kg selama ${days} hari kemungkinan besar merugi. Lonjakan sebesar +${formatNumber(sim.breakevenHikePct, 1)}% jarang terjadi pada horizon sependek ini. Belanja lebih sering dengan bobot lebih kecil.`}
                  </p>
                </div>
              </div>
            </Reveal>

            {/* Perbandingan metode simpan */}
            <Reveal dir="right" delay={180}>
              <div className="rounded-[32px] border border-[#A5D6A7]/70 bg-white p-6">
                <h3 className="font-display text-lg font-bold text-[#0D3311]">
                  Cara menghindari susut: bandingkan metode simpan
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#4B6149]">
                  Angka di bawah memakai bobot dan lama simpan yang sedang Anda pilih. Selisihnya
                  adalah uang yang bisa diselamatkan hanya dengan memindahkan tempat simpan.
                </p>

                <div className="mt-5 space-y-2.5">
                  {sim.alternatives.map((alt) => {
                    const meta = STORAGE_META[alt.key];
                    const p = getStorage(commodity, alt.key);
                    const worst = Math.max(...sim.alternatives.map((a) => a.cashLoss), 1);
                    const on = alt.key === storage;
                    return (
                      <button
                        key={alt.key}
                        onClick={() => setStorage(alt.key)}
                        className={`w-full rounded-2xl border p-4 text-left transition-all duration-300 ${
                          on
                            ? 'border-[#1B5E20] bg-[#F3FAF4]'
                            : 'border-[#A5D6A7]/60 bg-white hover:border-[#66BB6A]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="flex items-center gap-2 text-sm font-bold text-[#0D3311]">
                            <span className="text-base">{meta.icon}</span>
                            {meta.short}
                            {p.warning && (
                              <span className="rounded-full bg-[#FDECEA] px-2 py-0.5 text-[10px] font-bold uppercase text-[#A6301C]">
                                hindari
                              </span>
                            )}
                            {on && (
                              <span className="rounded-full bg-[#1B5E20] px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                                dipakai
                              </span>
                            )}
                            {alt.key === commodity.storage.best && (
                              <span className="rounded-full bg-[#D3BE6D] px-2 py-0.5 text-[10px] font-bold uppercase text-[#3A3113]">
                                terbaik
                              </span>
                            )}
                          </span>
                          <span className="shrink-0 font-mono text-sm font-bold text-[#A6301C]">
                            {formatIDR(alt.cashLoss)}
                          </span>
                        </div>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#E8F5E9]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#66BB6A] to-[#E05A3F] transition-[width] duration-700"
                            style={{ width: `${(alt.cashLoss / worst) * 100}%` }}
                          />
                        </div>
                        <p className="mt-1.5 font-mono text-[11px] text-[#6B7F69]">
                          sisa {formatNumber(alt.usableKg, 2)} kg · batas {p.shelfLifeDays} hari
                        </p>
                      </button>
                    );
                  })}
                </div>

                {savingVsCurrent > 500 && (
                  <p className="mt-4 flex items-start gap-2 rounded-2xl border border-[#D3BE6D]/60 bg-[#FBF6E4] px-4 py-3 text-sm font-semibold leading-relaxed text-[#6B5A1E]">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#B9A24F]" />
                    Metode terbaik untuk {commodity.shortName} adalah{' '}
                    {STORAGE_META[bestAlt.key].short} — memindahkannya ke sana menyelamatkan{' '}
                    <span className="font-mono text-[#8A7420]">{formatIDR(savingVsCurrent)}</span>{' '}
                    pada belanja ini, atau sekitar{' '}
                    {formatIDR(savingVsCurrent * (30 / Math.max(1, days)))} per bulan bila pola
                    belanja ini berulang.
                  </p>
                )}
              </div>
            </Reveal>

            {/* Langkah menekan susut */}
            <Reveal dir="right" delay={240}>
              <div className="rounded-[32px] border border-[#A5D6A7]/70 bg-gradient-to-br from-[#F3FAF4] to-[#E8F5E9] p-6">
                <h3 className="font-display text-lg font-bold text-[#0D3311]">
                  Lima langkah menekan susut {commodity.shortName}
                </h3>
                <ol className="mt-4 space-y-2.5">
                  {commodity.storage.steps.map((s, i) => (
                    <li key={s.title} className="flex gap-3 rounded-2xl bg-white/80 p-4">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#1B5E20] font-mono text-xs font-bold text-white">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-[#0D3311]">{s.title}</p>
                        <p className="mt-1 text-sm leading-relaxed text-[#4B6149]">{s.detail}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <Link
                  to={`/ensiklopedia?komoditas=${commodity.id}`}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[#1B5E20] hover:underline"
                >
                  Baca profil lengkap {commodity.shortName}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Reveal>

            {/* Konversi */}
            <Reveal dir="right" delay={300}>
              <div className="overflow-hidden rounded-[32px] bg-gradient-to-br from-[#1B5E20] to-[#2E7D32] p-7 text-white">
                <h3 className="font-display text-2xl font-black leading-tight">
                  Kunci angka ini untuk warung Anda
                </h3>
                <p className="mt-2 max-w-lg text-sm leading-relaxed text-[#C8E6C9]">
                  Daftarkan usaha, masukkan pemakaian mingguan dan fasilitas simpan Anda, lalu
                  Nawasena menghitung berapa kilogram yang sebaiknya dibeli hari ini — bukan angka
                  contoh, tetapi angka dapur Anda sendiri.
                </p>
                <Link
                  to={`/login?komoditas=${commodity.id}&kg=${weight}&simpan=${storage}&hari=${days}`}
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#D3BE6D] px-6 py-3 text-sm font-bold text-[#3A3113] transition-transform duration-300 hover:-translate-y-0.5"
                >
                  <Lock className="h-4 w-4" />
                  Kunci parameter &amp; buat akun usaha
                </Link>
              </div>
            </Reveal>

            <p className="rounded-3xl border border-[#A5D6A7]/60 bg-white p-5 text-xs leading-relaxed text-[#6B7F69]">
              {DATA_DISCLAIMER} Peluang lonjakan diperkirakan dari sebaran lognormal dengan
              volatilitas historis komoditas, sebagai pendekatan cepat atas metode Filtered
              Historical Simulation yang dipakai pada dasbor UMKM.
            </p>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

/* ───────────────────────────── Potongan UI ──────────────────────────── */

function rangeFill(t: number) {
  const pct = Math.max(0, Math.min(1, t)) * 100;
  return `linear-gradient(90deg, #1B5E20 ${pct}%, #C8E6C9 ${pct}%)`;
}

function ControlHeader({
  icon,
  label,
  value,
  explanation,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  explanation: Explanation;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#E8F5E9] text-[#1B5E20]">
          {icon}
        </span>
        <span className="text-sm font-bold text-[#0D3311]">{label}</span>
        <span className="rounded-full bg-[#1B5E20] px-3 py-1 font-mono text-xs font-bold text-white">
          {value}
        </span>
        <span className="ml-auto">
          <ExplainToggle open={open} onToggle={() => setOpen((v) => !v)} label={label} />
        </span>
      </div>
      <ExplainPanel
        open={open}
        title={label}
        explanation={explanation}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}

function Tube({
  label,
  caption,
  usableRatio,
  tone,
  wasteCaption,
}: {
  label: string;
  caption: string;
  usableRatio: number;
  tone: 'full' | 'split';
  wasteCaption?: string;
}) {
  const pct = Math.max(0, Math.min(1, usableRatio)) * 100;
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-52 w-24 overflow-hidden rounded-3xl border border-[#2E7D32]/60 bg-[#0A2A0D]">
        {/* Arsir bagian yang membusuk */}
        {tone === 'split' && (
          <div
            className="absolute inset-x-0 top-0 bg-[repeating-linear-gradient(45deg,rgba(224,90,63,0.55),rgba(224,90,63,0.55)_6px,transparent_6px,transparent_12px)] transition-[height] duration-700"
            style={{ height: `${100 - pct}%` }}
          />
        )}
        <div
          className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1B5E20] to-[#66BB6A] transition-[height] duration-700"
          style={{ height: `${pct}%`, transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)' }}
        >
          <div className="absolute inset-x-0 top-0 h-2 bg-[#A5D6A7]/70" />
        </div>
        {/* Garis takar */}
        {[25, 50, 75].map((g) => (
          <div
            key={g}
            className="absolute inset-x-0 border-t border-dashed border-white/15"
            style={{ bottom: `${g}%` }}
          />
        ))}
        <span className="absolute inset-x-0 bottom-3 text-center font-mono text-xs font-bold text-white drop-shadow">
          {caption}
        </span>
      </div>
      <p className="mt-2.5 text-[11px] font-bold uppercase tracking-wider text-[#A5D6A7]">{label}</p>
      {wasteCaption && (
        <p className="mt-0.5 font-mono text-[11px] text-[#FF8F6E]">{wasteCaption}</p>
      )}
    </div>
  );
}

function DecayChart({
  sim,
  days,
  shelfLife,
  weight,
}: {
  sim: ReturnType<typeof simulateWaste>;
  days: number;
  shelfLife: number;
  weight: number;
}) {
  const W = 560;
  const H = 200;
  const pad = 10;
  // Sumbu Y selalu 0..bobot awal agar bentuk kurva jujur, bukan skala relatif.
  const scaled = sim.curve;

  const toX = (d: number) => (d / Math.max(1, days)) * (W - pad * 2) + pad;
  const toY = (v: number) => H - pad - (v / weight) * (H - pad * 2);

  let d = `M ${toX(0).toFixed(1)} ${toY(scaled[0]).toFixed(1)}`;
  scaled.forEach((v, i) => {
    if (i > 0) d += ` L ${toX(i).toFixed(1)} ${toY(v).toFixed(1)}`;
  });
  const area = `${d} L ${toX(days).toFixed(1)} ${H - pad} L ${toX(0).toFixed(1)} ${H - pad} Z`;

  return (
    <div className="rounded-[32px] border border-[#A5D6A7]/70 bg-white p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-[#0D3311]">Kurva penyusutan harian</h3>
        <span className="rounded-full bg-[#E8F5E9] px-3 py-1 font-mono text-[11px] font-bold text-[#1B5E20]">
          {formatNumber(weight, 1)} kg → {formatNumber(sim.usableKg, 2)} kg
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="mt-4 w-full" role="img" aria-label="Kurva penyusutan bobot harian">
        <defs>
          <linearGradient id="decay-main" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#66BB6A" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#66BB6A" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75, 1].map((g) => (
          <g key={g}>
            <line x1={pad} x2={W - pad} y1={toY(weight * g)} y2={toY(weight * g)} stroke="#E8F5E9" strokeWidth="1.4" />
            <text x={pad} y={toY(weight * g) - 4} fill="#9AAE98" fontSize="9" fontWeight="700">
              {formatNumber(weight * g, 1)} kg
            </text>
          </g>
        ))}

        <path d={area} fill="url(#decay-main)" />
        <path
          d={d}
          fill="none"
          stroke="#1B5E20"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="anim-draw"
          style={{ '--dash': 1400 } as React.CSSProperties}
        />

        {shelfLife <= days && (
          <g>
            <line
              x1={toX(shelfLife)}
              x2={toX(shelfLife)}
              y1={pad}
              y2={H - pad}
              stroke="#E05A3F"
              strokeWidth="2"
              strokeDasharray="6 5"
            />
            <rect x={toX(shelfLife) + 4} y={pad} width="96" height="18" rx="9" fill="#FDECEA" />
            <text x={toX(shelfLife) + 12} y={pad + 13} fill="#A6301C" fontSize="10" fontWeight="700">
              batas simpan
            </text>
          </g>
        )}

        <circle cx={toX(days)} cy={toY(sim.usableKg)} r="6" fill="#1B5E20" />
        <circle cx={toX(days)} cy={toY(sim.usableKg)} r="6" fill="#1B5E20" opacity="0.3">
          <animate attributeName="r" values="6;15;6" dur="2.2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.3;0;0.3" dur="2.2s" repeatCount="indefinite" />
        </circle>
      </svg>

      <div className="mt-2 flex justify-between font-mono text-[11px] text-[#7A8C78]">
        <span>hari 0</span>
        <span>hari {days}</span>
      </div>
    </div>
  );
}

/* ────────────────────── Naskah penjelasan parameter ────────────────────── */

const EXPLAIN = {
  commodity: (c: Commodity): Explanation => ({
    what: `Komoditas menentukan tiga angka sekaligus: harga acuan (${formatIDR(c.price)}/${c.unit}), laju susut per metode simpan, dan volatilitas historis (CV ${formatNumber(c.cv)}%). ${c.shortName} tergolong ${c.volatility.toLowerCase()} dengan ayunan harga tahunan sekitar ${c.impact.swingPct}%.`,
    produces: [
      'Harga acuan mengubah bobot yang membusuk menjadi rupiah pada penghitung kas.',
      'Laju susut komoditas menentukan kecuraman kurva penyusutan harian.',
      'Volatilitas historisnya dipakai untuk memperkirakan peluang lonjakan harga pada kotak ambang impas.',
    ],
    avoid: [
      `Untuk ${c.shortName}, metode simpan terbaik adalah ${STORAGE_META[c.storage.best].short} dengan batas ${getStorage(c, c.storage.best).shelfLifeDays} hari.`,
      'Komoditas dengan kadar air tinggi selalu lebih mahal disimpan daripada dibeli lebih sering — bandingkan keduanya di kotak ambang impas.',
      'Bila harga sedang di titik nadir tahunan, alihkan kelebihan stok ke olahan yang tahan lama alih-alih menyimpannya mentah.',
    ],
  }),

  weight: (c: Commodity): Explanation => ({
    what: 'Bobot belanja adalah jumlah kilogram yang Anda beli dalam satu kali kulakan. Ia tidak mengubah persentase susut, tetapi mengalikan kerugian rupiahnya secara langsung.',
    produces: [
      'Menggandakan bobot menggandakan kilogram yang terbuang dan rupiah yang hilang, pada lama simpan yang sama.',
      'Tinggi kedua tabung serta titik awal kurva penyusutan mengikuti angka ini.',
      'Ambang impas tidak berubah — persentase susut tetap sama berapa pun bobotnya.',
    ],
    avoid: [
      'Beli sebanyak yang benar-benar terpakai sebelum batas umur simpan, bukan sebanyak yang muat di keranjang.',
      `Pemakaian mingguan yang wajar untuk ${c.shortName} sebaiknya dipecah menjadi dua kali belanja bila fasilitas simpan Anda hanya suhu ruang.`,
      'Bila harga sedang murah dan Anda tetap ingin membeli banyak, siapkan rencana olahan sejak hari pembelian.',
    ],
  }),

  days: (c: Commodity, shelfLife: number): Explanation => ({
    what: `Lama simpan adalah jarak hari antara pembelian dan pemakaian terakhir. Susut bersifat geometrik: bobot layak pakai pada hari ke-n adalah bobot awal dikali (1 − laju susut) pangkat n. Untuk metode yang sedang dipilih, batas kelayakannya ${shelfLife} hari.`,
    produces: [
      'Setiap hari tambahan memangkas bobot dari sisa hari sebelumnya, bukan dari bobot awal — inilah sebabnya kurvanya melengkung, bukan lurus.',
      'Ambang impas naik cepat seiring hari: makin lama disimpan, makin besar kenaikan harga yang dibutuhkan agar menimbun tidak merugi.',
      'Garis merah putus-putus pada kurva menandai batas kelayakan jual metode simpan yang dipilih.',
    ],
    avoid: [
      `Jangan pernah merencanakan simpan melebihi ${shelfLife} hari untuk metode ini — di luar itu bahan tetap ada di timbangan tetapi tidak layak disajikan.`,
      'Terapkan urutan masuk-pertama-keluar-pertama dengan label tanggal agar tidak ada stok yang tanpa sengaja tersimpan terlalu lama.',
      `Untuk ${c.shortName}, memperpendek siklus belanja satu hari saja sudah memangkas susut sekitar ${formatNumber(getStorage(c, 'room').decayPerDay * 100, 1)}% dari sisa bobot.`,
    ],
  }),

  storage: (c: Commodity): Explanation => ({
    what: 'Metode simpan menentukan laju susut harian — satu-satunya parameter yang benar-benar bisa Anda perbaiki tanpa mengubah pola belanja. Perbedaan antara keranjang terbuka dan wadah kedap udara bisa mencapai lima kali lipat laju susut.',
    produces: [
      'Laju susut harian yang dipakai seluruh perhitungan, sehingga mengubahnya menggeser seluruh kurva sekaligus.',
      'Batas umur simpan yang muncul sebagai garis merah pada kurva dan peringatan ketika terlampaui.',
      'Daftar perbandingan di bawah menghitung ulang kerugian untuk setiap metode pada bobot dan hari yang sama.',
    ],
    avoid: [
      `Untuk ${c.shortName}, metode terbaik adalah ${STORAGE_META[c.storage.best].short}: ${formatNumber(getStorage(c, c.storage.best).decayPerDay * 100, 2)}% per hari dibanding ${formatNumber(getStorage(c, 'room').decayPerDay * 100, 2)}% di suhu ruang.`,
      'Perhatikan tanda "hindari" — beberapa komoditas justru lebih cepat rusak di kulkas atau wadah kedap udara.',
      'Wadah kedap udara berharga puluhan ribu rupiah umumnya terbayar dalam dua sampai tiga kali belanja; bandingkan sendiri pada daftar perbandingan metode.',
    ],
  }),
};

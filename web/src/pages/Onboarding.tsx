import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronLeft,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Minus,
  Package,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBasket,
  Sparkles,
  Store,
  Tags,
  TrendingUp,
  X,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../lib/auth';
import { fetchMetadata } from '../lib/api';
import type { MetadataResponse } from '../lib/api';
import { COMMODITIES, getCommodity } from '../data/commodities';
import CommodityArt from '../components/CommodityArt';
import Select from '../components/ui/Select';
import LogoFull from '../assets/nawasena-logo-full.svg';
import LogoMark from '../assets/nawasena-logo-logo.svg';
import { usePointerTilt } from '../components/motion/hooks';

const STEPS = [
  { num: 1, title: 'Akun', icon: Lock, judul: 'Buat Akun Nawasena', sub: 'Akun ini menjadi pintu masuk dasbor pengadaan Anda.' },
  { num: 2, title: 'Profil', icon: Store, judul: 'Profil Bisnis Anda', sub: 'Kategori dan pasar acuan menentukan harga mana yang dipakai mesin keputusan.' },
  { num: 3, title: 'Operasional', icon: Package, judul: 'Detail Operasional', sub: 'Volume pemakaian dan cara simpan menentukan berapa kilogram yang aman dibeli.' },
] as const;

/** Nilai jual yang ditampilkan di panel kiri saat mode masuk. */
const KEUNGGULAN = [
  { icon: ShoppingBasket, judul: 'Satu angka yang bisa dieksekusi', teks: 'Berapa kilogram yang dibeli hari ini — bukan sekadar grafik harga.' },
  { icon: TrendingUp, judul: '2.184 hari data harga riil', teks: 'Volatilitas pasar diukur dari rekaman harga harian, bukan tebakan.' },
  { icon: ShieldCheck, judul: 'Setiap angka bisa ditelusuri', teks: 'Rumus, sumber, dan asumsi terbuka di setiap kartu dasbor.' },
];

/**
 * Skor sandi sederhana: panjang dan ragam karakter, tanpa pustaka tambahan.
 * Warnanya memakai nada yang sama dengan kartu dasbor — bahaya, waspada, baik —
 * agar arti merah dan emas konsisten di seluruh aplikasi.
 */
function kekuatanSandi(pw: string) {
  if (!pw) return { skor: 0, label: 'Belum diisi', warna: '#9AAE98' };
  let skor = 0;
  if (pw.length >= 6) skor++;
  if (pw.length >= 10) skor++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) skor++;
  if (/\d/.test(pw)) skor++;
  if (/[^A-Za-z0-9]/.test(pw)) skor++;
  const tabel = [
    { label: 'Terlalu pendek', warna: '#A6301C' },
    { label: 'Lemah', warna: '#A6301C' },
    { label: 'Cukup', warna: '#B9A24F' },
    { label: 'Baik', warna: '#66BB6A' },
    { label: 'Kuat', warna: '#2E7D32' },
    { label: 'Sangat kuat', warna: '#1B5E20' },
  ];
  return { skor, ...tabel[skor] };
}

export default function Onboarding() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1);
  /** Arah perpindahan langkah — dipakai untuk menentukan arah animasi geser. */
  const [arah, setArah] = useState<'next' | 'prev'>('next');

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [lihatSandi, setLihatSandi] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [fnbCategory, setFnbCategory] = useState('');
  const [referenceMarket, setReferenceMarket] = useState('');
  const [storageMethod, setStorageMethod] = useState('');
  const [commodities, setCommodities] = useState<{ name: string; weekly_consumption_kg: number }[]>([]);
  const [cariKomoditas, setCariKomoditas] = useState('');

  const [metadata, setMetadata] = useState<MetadataResponse | null>(null);

  useEffect(() => {
    fetchMetadata()
      .then((res) => {
        setMetadata(res);
        if (res.categories.length) setFnbCategory(res.categories[0].name);
        if (res.markets.length) setReferenceMarket(res.markets[0].name);
        if (res.storage_methods.length) setStorageMethod(res.storage_methods[0].id);
      })
      .catch(console.error);
  }, []);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError('');
    try {
      const { token } = await auth.fetchAuth('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password }),
      });
      auth.setToken(token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      const { token } = await auth.fetchAuth('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: email.trim(),
          password,
          business_name: businessName,
          fnb_category: fnbCategory,
          reference_market: referenceMarket,
          commodities:
            commodities.length > 0
              ? commodities
              : metadata?.commodities.length
                ? [{ name: metadata.commodities[0].name, weekly_consumption_kg: 5 }]
                : [],
          storage_method: storageMethod,
        }),
      });

      auth.setToken(token);
      setSuccess('Registrasi berhasil! Anda akan dialihkan…');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const majuLangkah = (e: React.FormEvent) => {
    e.preventDefault();
    setArah('next');
    setStep((s) => s + 1);
  };

  const mundurLangkah = () => {
    setArah('prev');
    setStep((s) => Math.max(1, s - 1));
  };

  const gantiMode = (login: boolean) => {
    setIsLogin(login);
    setStep(1);
    setArah('next');
    setError('');
  };

  /* ── Turunan untuk panel kiri & ringkasan ──────────────────────────── */
  const totalKg = useMemo(
    () => commodities.reduce((a, c) => a + (Number(c.weekly_consumption_kg) || 0), 0),
    [commodities]
  );
  const metodeAktif = metadata?.storage_methods.find((s) => s.id === storageMethod);
  const pasarAktif = metadata?.markets.find((m) => m.name === referenceMarket);
  const sandi = kekuatanSandi(password);

  const daftarKomoditas = useMemo(() => {
    const q = cariKomoditas.trim().toLowerCase();
    const semua = metadata?.commodities ?? [];
    return q ? semua.filter((c) => c.name.toLowerCase().includes(q)) : semua;
  }, [metadata, cariKomoditas]);

  const toggleKomoditas = (nama: string) => {
    setCommodities((prev) =>
      prev.some((x) => x.name === nama)
        ? prev.filter((x) => x.name !== nama)
        : [...prev, { name: nama, weekly_consumption_kg: 5 }]
    );
  };

  const ubahVolume = (nama: string, nilai: number) => {
    setCommodities((prev) =>
      prev.map((x) =>
        x.name === nama ? { ...x, weekly_consumption_kg: Math.max(0.1, Number(nilai.toFixed(1))) } : x
      )
    );
  };

  const langkahAktif = STEPS[step - 1];

  return (
    <div className="min-h-screen bg-[#F8FCF8] lg:grid lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)]">
      <PanelKiri
        isLogin={isLogin}
        step={step}
        businessName={businessName}
        fnbCategory={fnbCategory}
        referenceMarket={referenceMarket}
        wilayahPasar={pasarAktif?.region}
        jumlahKomoditas={commodities.length}
        totalKg={totalKg}
        metode={metodeAktif ? { label: metodeAktif.short_label, hari: metodeAktif.shelf_life_days, ikon: metodeAktif.icon } : null}
      />

      {/* ── Kolom formulir ─────────────────────────────────────────────── */}
      <div className="relative flex min-h-screen flex-col">
        {/* Sapuan warna lembut agar kolom formulir tidak terasa datar. */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="anim-aurora absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full bg-[#A5D6A7]/35 blur-[110px]" />
          <div
            className="anim-aurora absolute -bottom-32 -left-20 h-[380px] w-[380px] rounded-full bg-[#D3BE6D]/20 blur-[110px]"
            style={{ animationDelay: '-7s' }}
          />
          <div className="hairline-grid absolute inset-0 opacity-40" />
        </div>

        <div className="relative flex flex-1 flex-col px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
          {/* Bilah atas: kembali ke beranda + logo untuk layar kecil */}
          <div className="mb-7 flex items-center justify-between gap-4">
            <Link
              to="/"
              className="group inline-flex items-center gap-1.5 rounded-full border border-[#A5D6A7] bg-white/70 px-3.5 py-2 text-xs font-bold text-[#1B5E20] backdrop-blur transition-all duration-300 hover:border-[#66BB6A] hover:bg-white"
            >
              <ChevronLeft className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-0.5" />
              Beranda
            </Link>
            <img src={LogoFull} alt="Nawasena" className="h-8 object-contain lg:hidden" />
          </div>

          {/* Pita hero ringkas — pengganti panel kiri pada layar kecil, agar
              halaman masuk di ponsel tidak kehilangan konteksnya. */}
          <div className="anim-rise relative mx-auto mb-5 w-full max-w-xl overflow-hidden rounded-[26px] bg-[#0D3311] p-5 lg:hidden">
            <div className="hairline-grid pointer-events-none absolute inset-0 opacity-[0.16]" />
            <p className="relative text-[10px] font-bold uppercase tracking-[0.2em] text-[#66BB6A]">
              {isLogin ? 'Dasbor pengadaan UMKM' : `Pendaftaran usaha · langkah ${step} dari 3`}
            </p>
            <h1 className="relative mt-2 font-display text-2xl font-black leading-tight text-white">
              {isLogin ? (
                <>
                  Belanja hari ini, <span className="shimmer-text">tanpa menebak.</span>
                </>
              ) : (
                <>
                  Tiga langkah menuju <span className="shimmer-text">angka belanja</span> Anda.
                </>
              )}
            </h1>
            {!isLogin && (
              <span className="relative mt-4 block h-1.5 w-full overflow-hidden rounded-full bg-[#1B5E20]">
                <span
                  className="meter-fill block h-full rounded-full bg-[#D3BE6D]"
                  style={{ width: `${(step / 3) * 100}%` }}
                />
              </span>
            )}
          </div>

          {/* Sakelar mode */}
          <div className="mx-auto w-full max-w-xl">
            <div className="relative flex rounded-full border border-[#A5D6A7] bg-white/80 p-1.5 backdrop-blur">
              <span
                className="absolute inset-y-1.5 w-[calc(50%-0.375rem)] rounded-full bg-[#1B5E20] shadow-[0_12px_26px_-14px_rgba(27,94,32,1)] transition-transform duration-500"
                style={{
                  transform: isLogin ? 'translateX(0)' : 'translateX(calc(100% + 0.75rem))',
                  transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />
              {[
                { login: true, label: 'Masuk' },
                { login: false, label: 'Daftar Usaha' },
              ].map((t) => (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => gantiMode(t.login)}
                  aria-pressed={isLogin === t.login}
                  className={`relative z-10 flex-1 rounded-full py-2.5 text-sm font-bold transition-colors duration-300 ${
                    isLogin === t.login ? 'text-white' : 'text-[#4B6149] hover:text-[#1B5E20]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Kartu formulir */}
          <div
            className={`mx-auto mt-6 w-full transition-[max-width] duration-500 ${
              isLogin ? 'max-w-xl' : 'max-w-2xl'
            }`}
            style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            <div className="glass-card rounded-[32px] border border-[#A5D6A7]/80 p-6 shadow-[0_36px_80px_-40px_rgba(13,51,17,0.5)] sm:p-8">
              {error && (
                <div className="anim-rise mb-6 flex items-start gap-3 rounded-2xl border border-[#E7B4A6] bg-[#FDECEA] p-4 text-sm text-[#A6301C]">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                  <span className="font-semibold">{error}</span>
                </div>
              )}
              {success && (
                <div className="anim-rise mb-6 flex items-start gap-3 rounded-2xl border border-[#66BB6A] bg-[#E8F5E9] p-4 text-sm text-[#1B5E20]">
                  <CheckCircle2 className="anim-check mt-0.5 h-5 w-5 shrink-0" />
                  <span className="font-semibold">{success}</span>
                </div>
              )}

              {isLogin ? (
                /* ================= FORMULIR MASUK ================= */
                <form onSubmit={handleLogin} className="anim-rise">
                  <div className="mb-7">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#2E7D32]">
                      Selamat datang kembali
                    </p>
                    <h2 className="mt-1.5 font-display text-3xl font-black leading-tight text-[#0D3311]">
                      Masuk ke Dasbor
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-[#4B6149]">
                      Rekomendasi belanja hari ini sudah dihitung ulang dengan harga pasar terbaru.
                    </p>
                  </div>

                  <div className="space-y-5">
                    <Bidang label="Email" ikon={<Mail className="h-4 w-4" />}>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={INPUT}
                        placeholder="admin@usaha.com"
                      />
                    </Bidang>

                    <Bidang label="Password" ikon={<Lock className="h-4 w-4" />}>
                      <input
                        type={lihatSandi ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`${INPUT} pr-12`}
                        placeholder="••••••••"
                      />
                      <TombolSandi on={lihatSandi} onToggle={() => setLihatSandi((v) => !v)} />
                    </Bidang>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`${TOMBOL_UTAMA} mt-8 w-full`}
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        Masuk
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </>
                    )}
                  </button>

                  <p className="mt-6 text-center text-sm text-[#4B6149]">
                    Belum punya akun?{' '}
                    <button
                      type="button"
                      onClick={() => gantiMode(false)}
                      className="font-bold text-[#1B5E20] underline decoration-[#66BB6A] decoration-2 underline-offset-4 transition-colors hover:text-[#2E7D32]"
                    >
                      Daftarkan usaha Anda
                    </button>
                  </p>
                </form>
              ) : (
                /* ================= WIZARD PENDAFTARAN ================= */
                <form onSubmit={step === 3 ? handleRegister : majuLangkah}>
                  <Stepper step={step} onGoTo={(n) => { setArah(n > step ? 'next' : 'prev'); setStep(n); }} />

                  <div className="mt-8 min-h-[320px]">
                    <div
                      key={step}
                      className={`relative z-20 ${
                        arah === 'next' ? 'anim-step-next' : 'anim-step-prev'
                      }`}
                    >
                      <div className="mb-6">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#2E7D32]">
                          Langkah {step} dari 3
                        </p>
                        <h2 className="mt-1.5 font-display text-2xl font-black leading-tight text-[#0D3311] sm:text-3xl">
                          {langkahAktif.judul}
                        </h2>
                        <p className="mt-2 text-sm leading-relaxed text-[#4B6149]">
                          {langkahAktif.sub}
                        </p>
                      </div>

                      {step === 1 && (
                        <div className="space-y-5">
                          <Bidang label="Email pemilik usaha" ikon={<Mail className="h-4 w-4" />}>
                            <input
                              type="email"
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className={INPUT}
                              placeholder="Misal: admin@usaha.com"
                            />
                          </Bidang>

                          <Bidang label="Password" ikon={<Lock className="h-4 w-4" />}>
                            <input
                              type={lihatSandi ? 'text' : 'password'}
                              required
                              minLength={6}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className={`${INPUT} pr-12`}
                              placeholder="Minimal 6 karakter"
                            />
                            <TombolSandi on={lihatSandi} onToggle={() => setLihatSandi((v) => !v)} />
                          </Bidang>

                          {/* Pengukur kekuatan sandi */}
                          <div>
                            <div className="flex gap-1.5">
                              {[0, 1, 2, 3, 4].map((i) => (
                                <span
                                  key={i}
                                  className="meter-fill h-1.5 flex-1 rounded-full"
                                  style={{
                                    backgroundColor: i < sandi.skor ? sandi.warna : '#DCE9DB',
                                    transitionDelay: `${i * 45}ms`,
                                  }}
                                />
                              ))}
                            </div>
                            <p className="mt-2 text-xs font-semibold" style={{ color: sandi.warna }}>
                              Kekuatan sandi: {sandi.label}
                            </p>
                          </div>
                        </div>
                      )}

                      {step === 2 && (
                        <div className="space-y-5">
                          <Bidang label="Nama usaha / warung" ikon={<Store className="h-4 w-4" />}>
                            <input
                              type="text"
                              required
                              value={businessName}
                              onChange={(e) => setBusinessName(e.target.value)}
                              className={INPUT}
                              placeholder="Cth: Ayam Geprek Bu Siti"
                            />
                          </Bidang>

                          <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                              <Label>Kategori F&B</Label>
                              <Select
                                value={fnbCategory}
                                onChange={setFnbCategory}
                                ariaLabel="Kategori F&B"
                                icon={<Tags className="h-4 w-4" />}
                                placeholder="Pilih kategori"
                                options={(metadata?.categories ?? []).map((c) => ({
                                  value: c.name,
                                  label: c.name,
                                }))}
                              />
                            </div>

                            <div>
                              <Label>Pasar acuan belanja</Label>
                              <Select
                                value={referenceMarket}
                                onChange={setReferenceMarket}
                                ariaLabel="Pasar acuan belanja"
                                icon={<ShoppingBasket className="h-4 w-4" />}
                                placeholder="Pilih pasar"
                                options={(metadata?.markets ?? []).map((m) => ({
                                  value: m.name,
                                  label: m.name,
                                  hint: m.region,
                                }))}
                              />
                            </div>
                          </div>

                          <div className="flex items-start gap-3 rounded-2xl border border-[#D3BE6D]/50 bg-[#FBF6E4] p-4">
                            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#8A7420]" />
                            <p className="text-xs leading-relaxed text-[#6E5C18]">
                              Pasar acuan menentukan seri harga mana yang dipakai sebagai dasar
                              perhitungan. Pilih pasar tempat Anda benar-benar berbelanja agar
                              selisihnya tidak menyesatkan.
                            </p>
                          </div>
                        </div>
                      )}

                      {step === 3 && (
                        <div className="space-y-7">
                          {/* Komoditas rutin */}
                          <div>
                            <div className="flex flex-wrap items-end justify-between gap-3">
                              <Label className="mb-0">Kebutuhan rutin per komoditas</Label>
                              <span className="rounded-full bg-[#E8F5E9] px-3 py-1 font-mono text-[11px] font-bold text-[#1B5E20]">
                                {commodities.length} dipilih · {totalKg.toLocaleString('id-ID')} kg/minggu
                              </span>
                            </div>

                            <label className="relative mt-3 block">
                              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7A8C78]" />
                              <input
                                value={cariKomoditas}
                                onChange={(e) => setCariKomoditas(e.target.value)}
                                placeholder="Cari komoditas — cabai, bawang, beras…"
                                className="w-full rounded-full border border-[#A5D6A7] bg-white py-2.5 pl-11 pr-10 text-sm font-medium text-[#25422A] outline-none transition-all duration-300 placeholder:text-[#9AAE98] focus:border-[#1B5E20] focus:ring-4 focus:ring-[#66BB6A]/20"
                              />
                              {cariKomoditas && (
                                <button
                                  type="button"
                                  onClick={() => setCariKomoditas('')}
                                  aria-label="Bersihkan pencarian"
                                  className="absolute right-3 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full bg-[#E8F5E9] text-[#4B6149] transition-colors hover:bg-[#A5D6A7]"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </label>

                            <div className="no-bar mt-3 max-h-[19rem] space-y-2.5 overflow-y-auto pr-1">
                              {daftarKomoditas.length === 0 && (
                                <p className="rounded-2xl border border-dashed border-[#A5D6A7] bg-white/60 px-4 py-6 text-center text-xs font-semibold text-[#7A8C78]">
                                  {metadata ? 'Tidak ada komoditas yang cocok.' : 'Memuat daftar komoditas…'}
                                </p>
                              )}

                              {daftarKomoditas.map((c, i) => {
                                const dipilih = commodities.find((x) => x.name === c.name);
                                const lokal = getCommodity(
                                  COMMODITIES.find((k) => k.name.toLowerCase() === c.name.toLowerCase())?.id ?? ''
                                );
                                return (
                                  <div
                                    key={c.id}
                                    style={{ animationDelay: `${Math.min(i, 10) * 28}ms` }}
                                    className={`anim-rise overflow-hidden rounded-2xl border transition-all duration-300 ${
                                      dipilih
                                        ? 'border-[#1B5E20] bg-[#E8F5E9] shadow-[0_14px_30px_-22px_rgba(27,94,32,1)]'
                                        : 'border-[#A5D6A7]/70 bg-white hover:border-[#66BB6A]'
                                    }`}
                                  >
                                    <button
                                      type="button"
                                      onClick={() => toggleKomoditas(c.name)}
                                      aria-pressed={!!dipilih}
                                      className="flex w-full items-center gap-3 px-3.5 py-3 text-left"
                                    >
                                      <span
                                        className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 transition-all duration-300 ${
                                          dipilih
                                            ? 'border-[#1B5E20] bg-[#1B5E20]'
                                            : 'border-[#A5D6A7] bg-white'
                                        }`}
                                      >
                                        {dipilih && <Check className="anim-check h-3 w-3 text-white" />}
                                      </span>

                                      <span className="text-lg leading-none">{lokal?.emoji ?? '🧺'}</span>

                                      <span className="min-w-0 flex-1 truncate text-sm font-bold text-[#0D3311]">
                                        {c.name}
                                      </span>

                                      {dipilih && (
                                        <span className="shrink-0 font-mono text-xs font-bold text-[#1B5E20]">
                                          {dipilih.weekly_consumption_kg.toLocaleString('id-ID')} kg
                                        </span>
                                      )}
                                    </button>

                                    {dipilih && (
                                      <div className="anim-rise flex flex-wrap items-center gap-3 border-t border-[#A5D6A7]/60 px-3.5 py-3">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#2E7D32]">
                                          Pemakaian dapur
                                        </span>
                                        <div className="flex items-center gap-1.5 rounded-full border border-[#A5D6A7] bg-white p-1">
                                          <button
                                            type="button"
                                            aria-label={`Kurangi ${c.name}`}
                                            onClick={() =>
                                              ubahVolume(c.name, dipilih.weekly_consumption_kg - 0.5)
                                            }
                                            className="grid h-7 w-7 place-items-center rounded-full bg-[#E8F5E9] text-[#1B5E20] transition-colors hover:bg-[#A5D6A7]"
                                          >
                                            <Minus className="h-3.5 w-3.5" />
                                          </button>
                                          <input
                                            type="number"
                                            min="0.1"
                                            step="0.1"
                                            value={dipilih.weekly_consumption_kg}
                                            onChange={(e) => ubahVolume(c.name, Number(e.target.value))}
                                            className="w-16 bg-transparent text-center font-mono text-sm font-bold text-[#0D3311] outline-none"
                                          />
                                          <button
                                            type="button"
                                            aria-label={`Tambah ${c.name}`}
                                            onClick={() =>
                                              ubahVolume(c.name, dipilih.weekly_consumption_kg + 0.5)
                                            }
                                            className="grid h-7 w-7 place-items-center rounded-full bg-[#E8F5E9] text-[#1B5E20] transition-colors hover:bg-[#A5D6A7]"
                                          >
                                            <Plus className="h-3.5 w-3.5" />
                                          </button>
                                        </div>
                                        <span className="text-xs font-bold text-[#2E7D32]">kg / minggu</span>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            <p className="mt-2.5 text-xs leading-relaxed text-[#7A8C78]">
                              Centang komoditas yang sering Anda beli, lalu setel rata-rata pemakaian
                              dapur per minggunya. Nilai ini bisa diubah kapan saja dari menu Profil.
                            </p>
                          </div>

                          {/* Metode penyimpanan */}
                          <div>
                            <Label>Metode penyimpanan dapur</Label>
                            <div className="grid gap-2.5 sm:grid-cols-3">
                              {metadata?.storage_methods.map((sm) => {
                                const on = storageMethod === sm.id;
                                return (
                                  <button
                                    key={sm.id}
                                    type="button"
                                    onClick={() => setStorageMethod(sm.id)}
                                    aria-pressed={on}
                                    className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 ${
                                      on
                                        ? 'border-[#1B5E20] bg-[#1B5E20] text-white shadow-[0_18px_36px_-22px_rgba(27,94,32,1)]'
                                        : 'border-[#A5D6A7]/70 bg-white hover:-translate-y-0.5 hover:border-[#66BB6A]'
                                    }`}
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <span className="text-2xl leading-none">{sm.icon}</span>
                                      <span
                                        className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition-colors ${
                                          on ? 'border-white bg-white' : 'border-[#A5D6A7]'
                                        }`}
                                      >
                                        {on && <Check className="anim-check h-3 w-3 text-[#1B5E20]" />}
                                      </span>
                                    </div>
                                    <p
                                      className={`mt-3 text-sm font-bold leading-tight ${
                                        on ? 'text-white' : 'text-[#0D3311]'
                                      }`}
                                    >
                                      {sm.short_label}
                                    </p>
                                    <p
                                      className={`mt-1 font-mono text-[11px] ${
                                        on ? 'text-[#A5D6A7]' : 'text-[#4B6149]'
                                      }`}
                                    >
                                      tahan ~{sm.shelf_life_days} hari
                                    </p>

                                    {/* Bar umur simpan — 21 hari dipakai sebagai batas atas. */}
                                    <span
                                      className={`mt-3 block h-1.5 w-full overflow-hidden rounded-full ${
                                        on ? 'bg-white/25' : 'bg-[#E8F5E9]'
                                      }`}
                                    >
                                      <span
                                        className="meter-fill block h-full rounded-full"
                                        style={{
                                          width: `${Math.min(100, (sm.shelf_life_days / 21) * 100)}%`,
                                          backgroundColor: on ? '#D3BE6D' : '#66BB6A',
                                        }}
                                      />
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Navigasi langkah */}
                  <div className="relative z-10 mt-8 flex gap-3 border-t border-[#A5D6A7]/60 pt-6">
                    {step > 1 && (
                      <button
                        type="button"
                        onClick={mundurLangkah}
                        className="group inline-flex items-center gap-2 rounded-2xl border border-[#A5D6A7] bg-white px-5 py-3.5 text-sm font-bold text-[#1B5E20] transition-all duration-300 hover:border-[#66BB6A] hover:bg-[#E8F5E9]"
                      >
                        <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
                        Kembali
                      </button>
                    )}
                    <button type="submit" disabled={loading} className={`${TOMBOL_UTAMA} flex-1`}>
                      {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : step === 3 ? (
                        <>
                          Selesaikan Registrasi
                          <CheckCircle2 className="h-4 w-4" />
                        </>
                      ) : (
                        <>
                          Langkah Selanjutnya
                          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </>
                      )}
                    </button>
                  </div>

                  <p className="mt-6 text-center text-sm text-[#4B6149]">
                    Sudah punya akun?{' '}
                    <button
                      type="button"
                      onClick={() => gantiMode(true)}
                      className="font-bold text-[#1B5E20] underline decoration-[#66BB6A] decoration-2 underline-offset-4 transition-colors hover:text-[#2E7D32]"
                    >
                      Masuk di sini
                    </button>
                  </p>
                </form>
              )}
            </div>
          </div>

          <p className="mx-auto mt-8 max-w-xl text-center text-xs leading-relaxed text-[#7A8C78]">
            Data usaha hanya dipakai untuk mengalibrasi perhitungan pengadaan Anda sendiri.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════ Panel kiri ═══════════════════════════ */

function PanelKiri({
  isLogin,
  step,
  businessName,
  fnbCategory,
  referenceMarket,
  wilayahPasar,
  jumlahKomoditas,
  totalKg,
  metode,
}: {
  isLogin: boolean;
  step: number;
  businessName: string;
  fnbCategory: string;
  referenceMarket: string;
  wilayahPasar?: string;
  jumlahKomoditas: number;
  totalKg: number;
  metode: { label: string; hari: number; ikon: string } | null;
}) {
  const { ref, style } = usePointerTilt<HTMLDivElement>(7);

  /* Ilustrasi hanya menempati pita kanan panel; kolom teks dan kartu ringkasan
     dibatasi max-w-md agar keduanya tidak pernah bertumpuk. */
  const floats = useMemo(
    () =>
      [
        { id: 'beras-premium', top: '4%', right: '-3%', size: 84, delay: '0s' },
        { id: 'cabai-rawit-merah', top: '27%', right: '4%', size: 96, delay: '1.4s' },
        { id: 'tomat', top: '54%', right: '-4%', size: 76, delay: '0.7s' },
        { id: 'bawang-merah', top: '76%', right: '5%', size: 88, delay: '2.1s' },
      ]
        .map((f) => ({ ...f, c: getCommodity(f.id) }))
        .filter((f) => f.c),
    []
  );

  return (
    <aside className="relative hidden overflow-hidden bg-[#0D3311] lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
      {/* Lapisan latar */}
      <div className="hairline-grid absolute inset-0 opacity-[0.16]" />
      <div className="diagonal-weave absolute inset-0" />
      <div className="anim-aurora absolute -left-28 top-0 h-[460px] w-[460px] rounded-full bg-[#1B5E20] opacity-90 blur-[110px]" />
      <div
        className="anim-aurora absolute -right-20 top-1/3 h-[400px] w-[400px] rounded-full bg-[#2E7D32] opacity-70 blur-[120px]"
        style={{ animationDelay: '-9s' }}
      />
      <div
        className="anim-aurora absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-[#D3BE6D] opacity-[0.16] blur-[90px]"
        style={{ animationDelay: '-4s' }}
      />

      {/* Komoditas melayang */}
      {floats.map((f) => (
        <div
          key={f.id}
          aria-hidden="true"
          className="anim-float pointer-events-none absolute overflow-hidden rounded-[26px] border border-[#66BB6A]/20 opacity-60 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8)]"
          style={{ top: f.top, right: f.right, width: f.size, height: f.size, animationDelay: f.delay }}
        >
          <CommodityArt art={f.c!.art} photo={f.c!.photo} alt="" className="h-full w-full" />
          <span className="absolute inset-0 bg-[#0D3311]/60 mix-blend-multiply" />
        </div>
      ))}

      <div className="relative flex flex-1 flex-col justify-between p-10 xl:p-12">
        <Link to="/" className="inline-flex w-fit items-center gap-3">
          <img src={LogoMark} alt="" className="h-10 w-10 object-contain" />
          <span className="font-display text-xl font-black tracking-tight text-white">Nawasena</span>
        </Link>

        <div className="my-10 max-w-md">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#66BB6A]">
            {isLogin ? 'Dasbor pengadaan UMKM' : 'Pendaftaran usaha'}
          </p>
          <h2 className="mt-3 font-display text-[2.5rem] font-black leading-[1.08] text-white xl:text-[3rem]">
            {isLogin ? (
              <>
                Belanja hari ini,
                <br />
                <span className="shimmer-text">tanpa menebak.</span>
              </>
            ) : (
              <>
                Tiga langkah menuju
                <br />
                <span className="shimmer-text">angka belanja</span> Anda.
              </>
            )}
          </h2>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-[#A5D6A7]">
            {isLogin
              ? 'Nawasena menimbang harga pasar yang bisa melonjak kapan saja melawan stok segar yang membusuk sejak hari pertama — lalu memberi satu angka yang bisa langsung dipakai.'
              : 'Semakin tepat profil dapur Anda, semakin jujur perhitungan susut dan volatilitas yang dipakai mesin keputusan.'}
          </p>
        </div>

        {/* Kartu kanan bawah: keunggulan (masuk) atau ringkasan langsung (daftar) */}
        <div
          ref={ref}
          style={style}
          className="max-w-md transition-transform duration-300 will-change-transform"
        >
          {isLogin ? (
            <ul className="space-y-3">
              {KEUNGGULAN.map((k, i) => (
                <li
                  key={k.judul}
                  style={{ animationDelay: `${180 + i * 110}ms` }}
                  className="anim-rise flex items-start gap-3.5 rounded-2xl border border-[#1B5E20] bg-[#0D3311]/70 p-4 backdrop-blur-md"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#1B5E20] text-[#A5D6A7]">
                    <k.icon className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-white">{k.judul}</span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-[#8FBF8F]">{k.teks}</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-[26px] border border-[#1B5E20] bg-[#0D3311]/75 p-5 backdrop-blur-md">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#66BB6A]">
                  Profil terisi langsung
                </p>
                <span className="rounded-full bg-[#1B5E20] px-2.5 py-1 font-mono text-[10px] font-bold text-[#A5D6A7]">
                  {step}/3
                </span>
              </div>

              <p className="mt-3 font-display text-2xl font-black leading-tight text-white">
                {businessName || (
                  <span className="text-[#66BB6A]/60">
                    Nama usaha Anda<span className="anim-caret">|</span>
                  </span>
                )}
              </p>

              <dl className="mt-4 space-y-2.5">
                <BarisRingkas ikon={<Tags className="h-3.5 w-3.5" />} label="Kategori" nilai={fnbCategory || '—'} />
                <BarisRingkas
                  ikon={<ShoppingBasket className="h-3.5 w-3.5" />}
                  label="Pasar acuan"
                  nilai={referenceMarket || '—'}
                  jejak={wilayahPasar}
                />
                <BarisRingkas
                  ikon={<Package className="h-3.5 w-3.5" />}
                  label="Komoditas rutin"
                  nilai={
                    jumlahKomoditas > 0
                      ? `${jumlahKomoditas} komoditas · ${totalKg.toLocaleString('id-ID')} kg/minggu`
                      : 'Belum dipilih'
                  }
                />
                <BarisRingkas
                  ikon={<CalendarClock className="h-3.5 w-3.5" />}
                  label="Cara simpan"
                  nilai={metode ? `${metode.ikon} ${metode.label}` : '—'}
                  jejak={metode ? `batas simpan ~${metode.hari} hari` : undefined}
                />
              </dl>

              {/* Bar kemajuan langkah */}
              <span className="mt-5 block h-1.5 w-full overflow-hidden rounded-full bg-[#1B5E20]">
                <span
                  className="meter-fill block h-full rounded-full bg-[#D3BE6D]"
                  style={{ width: `${(step / 3) * 100}%` }}
                />
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

function BarisRingkas({
  ikon,
  label,
  nilai,
  jejak,
}: {
  ikon: React.ReactNode;
  label: string;
  nilai: string;
  jejak?: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 shrink-0 text-[#66BB6A]">{ikon}</span>
      <div className="min-w-0">
        <dt className="text-[10px] font-bold uppercase tracking-wider text-[#8FBF8F]">{label}</dt>
        <dd className="truncate text-sm font-bold text-white">{nilai}</dd>
        {jejak && <dd className="text-[11px] text-[#8FBF8F]">{jejak}</dd>}
      </div>
    </div>
  );
}

/* ═══════════════════════════ Stepper ═══════════════════════════ */

function Stepper({ step, onGoTo }: { step: number; onGoTo: (n: number) => void }) {
  return (
    <div className="px-2 sm:px-6">
      {/* Kotak berposisi ini sengaja tanpa padding: persentase pada rel diukur
          dari kotak padding induknya, sehingga padding apa pun akan menggeser
          rel keluar dari pusat bulatan langkah. */}
      <div className="relative">
      {/* Rel dan kemajuan berada di belakang bulatan langkah. Setiap langkah
          menempati sepertiga lebar yang sama, sehingga pusat bulatannya jatuh
          tepat di 1/6, 3/6, dan 5/6 — itulah jangkar kedua garis di bawah ini. */}
      <div className="absolute left-[16.667%] right-[16.667%] top-6 h-[3px] rounded-full bg-[#DCE9DB]" />
      <div
        className="meter-fill absolute left-[16.667%] top-6 h-[3px] rounded-full bg-[#1B5E20]"
        style={{ width: `${((step - 1) / 2) * 66.667}%` }}
      />

      <div className="relative flex items-start">
        {STEPS.map((s) => {
          const selesai = step > s.num;
          const aktif = step === s.num;
          const bisaKlik = step > s.num;
          const Ikon = s.icon;
          return (
            <button
              key={s.num}
              type="button"
              disabled={!bisaKlik}
              onClick={() => bisaKlik && onGoTo(s.num)}
              aria-label={`Langkah ${s.num}: ${s.title}`}
              aria-current={aktif ? 'step' : undefined}
              className={`flex flex-1 basis-0 flex-col items-center gap-2.5 ${
                bisaKlik ? 'cursor-pointer' : 'cursor-default'
              }`}
            >
              <span
                className={`relative grid h-12 w-12 place-items-center rounded-2xl transition-all duration-500 ${
                  selesai
                    ? 'bg-[#1B5E20] text-white shadow-[0_14px_28px_-16px_rgba(27,94,32,1)]'
                    : aktif
                      ? 'scale-110 bg-[#1B5E20] text-white shadow-[0_18px_34px_-16px_rgba(27,94,32,1)] ring-4 ring-[#66BB6A]/30'
                      : 'bg-white text-[#9AAE98] ring-2 ring-[#DCE9DB]'
                }`}
              >
                {selesai ? <Check className="anim-check h-5 w-5" /> : <Ikon className="h-5 w-5" />}
              </span>
              <span
                className={`text-center text-[11px] font-bold uppercase tracking-wider transition-colors duration-300 ${
                  step >= s.num ? 'text-[#1B5E20]' : 'text-[#9AAE98]'
                }`}
              >
                {s.title}
              </span>
            </button>
          );
        })}
      </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════ Primitif form ═══════════════════════════ */

const INPUT =
  'w-full rounded-2xl border border-[#A5D6A7] bg-white py-3.5 pl-11 pr-4 text-sm font-semibold text-[#0D3311] outline-none transition-all duration-300 placeholder:font-medium placeholder:text-[#9AAE98] focus:border-[#1B5E20] focus:ring-4 focus:ring-[#66BB6A]/25';

const TOMBOL_UTAMA =
  'sheen group inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1B5E20] px-6 py-3.5 text-sm font-bold text-white shadow-[0_20px_40px_-20px_rgba(27,94,32,1)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#2E7D32] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0';

function Label({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`mb-2 text-[11px] font-bold uppercase tracking-wider text-[#2E7D32] ${className}`}>
      {children}
    </p>
  );
}

/** Bidang teks dengan ikon di dalam kotak — memberi bobot visual pada formulir. */
function Bidang({
  label,
  ikon,
  children,
}: {
  label: string;
  ikon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <span className="group relative block">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#7A8C78] transition-colors duration-300 group-focus-within:text-[#1B5E20]">
          {ikon}
        </span>
        {children}
      </span>
    </label>
  );
}

function TombolSandi({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={on ? 'Sembunyikan password' : 'Tampilkan password'}
      className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-xl text-[#7A8C78] transition-colors duration-300 hover:bg-[#E8F5E9] hover:text-[#1B5E20]"
    >
      {on ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );
}

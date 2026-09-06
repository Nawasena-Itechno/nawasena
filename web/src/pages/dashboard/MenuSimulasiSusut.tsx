import { useMemo, useState } from 'react';
import {
  FlaskConical,
  Play,
  RotateCcw,
  Lightbulb,
  TriangleAlert,
  CircleCheck,
  Snowflake,
  Loader2,
  ArrowRight,
  ChefHat,
  ShoppingCart,
  PiggyBank,
} from 'lucide-react';
import type { UmkmProfile, StorageMethod } from '../../lib/profile';
import { STORAGE_METHODS, storageOf, encyclopediaId } from '../../lib/profile';
import type { ProcurementResponse } from '../../lib/api';
import { getCommodity } from '../../data/commodities';
import { formatIDR, formatNumber, formatPct } from '../../lib/format';
import { InfoPop, SectionHead } from '../../components/dashboard/ui';
import { Reveal, CountUp } from '../../components/motion/Reveal';

interface HasilSimulasi {
  komoditas: string;
  harga: number;
  bobot: number;
  hari: number;
  metode: StorageMethod;
  decay: number;
  shelfLife: number;
  sisaKg: number;
  susutKg: number;
  rugi: number;
  kurva: number[];
  lewatBatas: boolean;
  perMetode: { key: StorageMethod; sisaKg: number; rugi: number }[];
  /** Proyeksi kerugian sebulan bila pola belanja ini berulang. */
  rugiBulanan: number;
}

export default function MenuSimulasiSusut({
  profile,
  data,
  komoditas,
}: {
  profile: UmkmProfile;
  data: ProcurementResponse | null;
  komoditas: string;
}) {
  const simpanTerdaftar = storageOf(profile.storage_method);
  const hargaPasar = data?.harga_sekarang ?? 0;
  const kgRekomendasi = data?.keputusan.KgDibeli ?? profile.weekly_consumption_kg;

  const [bobot, setBobot] = useState(Math.round(kgRekomendasi * 10) / 10);
  const [hari, setHari] = useState(7);
  const [metode, setMetode] = useState<StorageMethod>(profile.storage_method);

  const [hasil, setHasil] = useState<HasilSimulasi | null>(null);
  const [menjalankan, setMenjalankan] = useState(false);
  const [solusiTampil, setSolusiTampil] = useState(false);

  // Parameter berubah setelah simulasi dijalankan → hasil ditandai kedaluwarsa.
  const [snapshot, setSnapshot] = useState('');
  const kunciSekarang = `${komoditas}|${bobot}|${hari}|${metode}|${hargaPasar}`;
  const kedaluwarsa = Boolean(hasil) && snapshot !== kunciSekarang;

  const jalankan = () => {
    if (hargaPasar <= 0) return;
    setMenjalankan(true);
    setSolusiTampil(false);

    // Jeda pendek agar peralihan keadaan terbaca sebagai proses, bukan kedipan.
    window.setTimeout(() => {
      const meta = STORAGE_METHODS[metode];
      const kurva: number[] = [];
      for (let d = 0; d <= hari; d++) kurva.push(bobot * Math.pow(1 - meta.decay, d));
      const sisaKg = kurva[hari];
      const susutKg = bobot - sisaKg;
      const rugi = susutKg * hargaPasar;

      const perMetode = (Object.keys(STORAGE_METHODS) as StorageMethod[]).map((key) => {
        const m = STORAGE_METHODS[key];
        const sisa = bobot * Math.pow(1 - m.decay, hari);
        return { key, sisaKg: sisa, rugi: (bobot - sisa) * hargaPasar };
      });

      setHasil({
        komoditas,
        harga: hargaPasar,
        bobot,
        hari,
        metode,
        decay: meta.decay,
        shelfLife: meta.shelfLife,
        sisaKg,
        susutKg,
        rugi,
        kurva,
        lewatBatas: hari > meta.shelfLife,
        perMetode,
        rugiBulanan: rugi * (30 / Math.max(1, hari)),
      });
      setSnapshot(kunciSekarang);
      setMenjalankan(false);
    }, 550);
  };

  const kembalikan = () => {
    setBobot(Math.round(kgRekomendasi * 10) / 10);
    setHari(7);
    setMetode(profile.storage_method);
  };

  if (!data) {
    return (
      <div className="grid min-h-[50vh] place-items-center rounded-3xl border border-dashed border-[#A5D6A7] bg-white">
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2 className="h-7 w-7 animate-spin text-[#1B5E20]" />
          <p className="text-sm font-semibold text-[#4B6149]">
            Menunggu harga pasar untuk komoditas Anda…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* ── Penjelasan menu ────────────────────────────────────────────── */}
      <Reveal>
        <section className="relative overflow-hidden rounded-[32px] bg-[#0D3311] p-6 text-white">
          <div className="hairline-grid pointer-events-none absolute inset-0 opacity-10" />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#66BB6A]/40 bg-[#14471C]/70 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#A5D6A7]">
              <FlaskConical className="h-3.5 w-3.5" /> Simulasi susut · versi usaha Anda
            </span>
            <h2 className="mt-4 max-w-3xl font-display text-2xl font-black leading-tight md:text-3xl">
              Uji stok dapur Anda sendiri, bukan angka contoh
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#C8E6C9]">
              Simulator di halaman publik memakai harga contoh dan parameter bebas — itu peragaan.
              Simulasi di sini memakai{' '}
              <strong className="text-white">harga pasar {komoditas.toLowerCase()} hari ini</strong>{' '}
              dari data PIHPS, kilogram rekomendasi sistem untuk usaha Anda, serta{' '}
              <strong className="text-white">metode simpan {simpanTerdaftar.short.toLowerCase()}</strong>{' '}
              yang Anda daftarkan. Hasilnya adalah kerugian rupiah yang benar-benar terjadi di dapur
              Anda.
            </p>
            <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
              {[
                { l: 'Harga acuan', v: `${formatIDR(hargaPasar)}/kg`, d: komoditas },
                {
                  l: 'Rekomendasi sistem',
                  v: `${formatNumber(kgRekomendasi, 1)} kg`,
                  d: 'jadi bobot awal simulasi',
                },
                {
                  l: 'Metode terdaftar',
                  v: simpanTerdaftar.short,
                  d: `${formatPct(simpanTerdaftar.decay * 100, 1)}/hari`,
                },
              ].map((x) => (
                <div key={x.l} className="rounded-2xl bg-white/10 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#8FBF8F]">
                    {x.l}
                  </p>
                  <p className="mt-0.5 font-mono text-lg font-bold">{x.v}</p>
                  <p className="text-[11px] text-[#A5D6A7]">{x.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      {/* ── Parameter + tombol jalankan ────────────────────────────────── */}
      <Reveal delay={60}>
        <section className="rounded-[32px] border border-[#A5D6A7]/70 bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-lg font-bold text-[#0D3311]">Atur skenario</h3>
              <p className="mt-1 text-sm text-[#4B6149]">
                Nilai awal diambil dari data usaha Anda. Ubah untuk menguji "bagaimana kalau…".
              </p>
            </div>
            <button
              onClick={kembalikan}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F5E9] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#1B5E20] transition-colors hover:bg-[#A5D6A7]"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Kembalikan ke data usaha saya
            </button>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div>
              <LabelSlider
                label="Bobot belanja"
                nilai={`${formatNumber(bobot, 1)} kg`}
                catatan={`Rekomendasi sistem hari ini ${formatNumber(kgRekomendasi, 1)} kg`}
              />
              <input
                type="range"
                min={1}
                max={40}
                step={0.5}
                value={bobot}
                onChange={(e) => setBobot(Number(e.target.value))}
                className="nw-range mt-3 w-full"
                style={{ background: isiRange((bobot - 1) / 39) }}
                aria-label="Bobot belanja"
              />
              <div className="mt-1.5 flex justify-between font-mono text-[11px] text-[#7A8C78]">
                <span>1 kg</span>
                <span>40 kg</span>
              </div>
            </div>

            <div>
              <LabelSlider
                label="Lama simpan"
                nilai={`${hari} hari`}
                catatan={`Batas metode terpilih ${STORAGE_METHODS[metode].shelfLife} hari`}
              />
              <input
                type="range"
                min={1}
                max={30}
                value={hari}
                onChange={(e) => setHari(Number(e.target.value))}
                className="nw-range mt-3 w-full"
                style={{ background: isiRange((hari - 1) / 29) }}
                aria-label="Lama simpan"
              />
              <div className="mt-1.5 flex justify-between font-mono text-[11px] text-[#7A8C78]">
                <span>1 hari</span>
                <span>30 hari</span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm font-bold text-[#0D3311]">Metode simpan yang diuji</p>
            <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
              {(Object.keys(STORAGE_METHODS) as StorageMethod[]).map((key) => {
                const m = STORAGE_METHODS[key];
                const on = metode === key;
                const terdaftar = profile.storage_method === key;
                return (
                  <button
                    key={key}
                    onClick={() => setMetode(key)}
                    className={`rounded-2xl border p-4 text-left transition-all duration-300 ${
                      on
                        ? 'border-[#1B5E20] bg-[#1B5E20] text-white shadow-[0_16px_32px_-22px_rgba(27,94,32,1)]'
                        : 'border-[#A5D6A7]/70 bg-white text-[#25422A] hover:border-[#66BB6A]'
                    }`}
                  >
                    <span className="text-lg">{m.icon}</span>
                    <p className="mt-1 text-sm font-bold leading-tight">{m.short}</p>
                    <p className={`mt-1 font-mono text-[11px] ${on ? 'text-[#A5D6A7]' : 'text-[#6B7F69]'}`}>
                      {formatPct(m.decay * 100, 1)}/hari · {m.shelfLife} hari
                    </p>
                    {terdaftar && (
                      <span
                        className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                          on ? 'bg-[#D3BE6D] text-[#3A3113]' : 'bg-[#E8F5E9] text-[#1B5E20]'
                        }`}
                      >
                        Terdaftar
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 flex flex-col items-start gap-3 border-t border-[#E8F5E9] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[#4B6149]">
              {hasil
                ? kedaluwarsa
                  ? 'Parameter berubah sejak simulasi terakhir — jalankan ulang untuk memperbarui hasil.'
                  : 'Hasil di bawah sesuai parameter saat ini.'
                : 'Tekan tombol untuk menjalankan simulasi pada parameter di atas.'}
            </p>
            <button
              onClick={jalankan}
              disabled={menjalankan}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold transition-transform duration-300 hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-70 ${
                kedaluwarsa || !hasil
                  ? 'bg-[#1B5E20] text-white'
                  : 'bg-[#E8F5E9] text-[#1B5E20]'
              }`}
            >
              {menjalankan ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Menghitung…
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" /> {hasil ? 'Jalankan ulang simulasi' : 'Jalankan simulasi'}
                </>
              )}
            </button>
          </div>
        </section>
      </Reveal>

      {/* ── Hasil ──────────────────────────────────────────────────────── */}
      {!hasil && !menjalankan && (
        <Reveal delay={90}>
          <div className="rounded-[32px] border border-dashed border-[#A5D6A7] bg-white py-16 text-center">
            <FlaskConical className="mx-auto h-10 w-10 text-[#A5D6A7]" />
            <p className="mt-4 font-display text-lg font-bold text-[#0D3311]">
              Hasil simulasi akan muncul di sini
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#6B7F69]">
              Atur parameter di atas lalu tekan <strong>Jalankan simulasi</strong>. Setelah hasilnya
              keluar, Anda bisa meminta solusi yang disesuaikan dengan besar kerugiannya.
            </p>
          </div>
        </Reveal>
      )}

      {hasil && (
        <div className={kedaluwarsa ? 'opacity-60 transition-opacity duration-500' : ''}>
          <HasilPanel hasil={hasil} kedaluwarsa={kedaluwarsa} profile={profile} />

          {/* Gerbang solusi */}
          <Reveal delay={60}>
            <section className="mt-6">
              {!solusiTampil ? (
                <div className="flex flex-col items-center gap-4 rounded-[32px] border border-[#D3BE6D]/60 bg-[#FBF6E4] p-8 text-center">
                  <span className="grid h-14 w-14 place-items-center rounded-full bg-[#D3BE6D] text-[#3A3113]">
                    <Lightbulb className="h-7 w-7" />
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-black text-[#5F5015]">
                      Sudah tahu kerugiannya. Sekarang, apa yang harus dilakukan?
                    </h3>
                    <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-[#6B5A1E]">
                      Solusi yang diberikan menyesuaikan besar kerugian hasil simulasi Anda —
                      kerugian kecil cukup diperbaiki dengan kebiasaan, kerugian besar butuh
                      perubahan cara belanja dan investasi penyimpanan.
                    </p>
                  </div>
                  <button
                    onClick={() => setSolusiTampil(true)}
                    disabled={kedaluwarsa}
                    className="inline-flex items-center gap-2 rounded-full bg-[#1B5E20] px-7 py-3.5 text-sm font-bold text-white transition-transform duration-300 hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-50"
                  >
                    Minta solusi berdasarkan hasil ini
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  {kedaluwarsa && (
                    <p className="text-xs font-semibold text-[#A6301C]">
                      Jalankan ulang simulasi lebih dulu agar solusinya sesuai parameter terbaru.
                    </p>
                  )}
                </div>
              ) : (
                <PanelSolusi hasil={hasil} profile={profile} />
              )}
            </section>
          </Reveal>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────── Bagian hasil ─────────────────────────── */

function HasilPanel({
  hasil,
  kedaluwarsa,
  profile,
}: {
  hasil: HasilSimulasi;
  kedaluwarsa: boolean;
  profile: UmkmProfile;
}) {
  const pctSusut = (hasil.susutKg / hasil.bobot) * 100;
  const meta = STORAGE_METHODS[hasil.metode];
  const terbaik = [...hasil.perMetode].sort((a, b) => a.rugi - b.rugi)[0];
  const hematPindah = hasil.rugi - terbaik.rugi;

  return (
    <div className="space-y-6">
      <Reveal>
        <SectionHead
          eyebrow={kedaluwarsa ? 'Hasil kedaluwarsa' : 'Hasil simulasi'}
          title={`${formatNumber(hasil.bobot, 1)} kg disimpan ${hasil.hari} hari dengan ${meta.short.toLowerCase()}`}
          desc={`Dihitung pada harga ${formatIDR(hasil.harga)}/kg untuk ${hasil.komoditas.toLowerCase()}, memakai laju susut ${formatPct(hasil.decay * 100, 1)} per hari sesuai metode simpan yang dipilih.`}
        />

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <KartuHasil
            label="Sisa layak pakai"
            nilai={`${formatNumber(hasil.sisaKg, 2)} kg`}
            nada="baik"
            catatan={`Dari ${formatNumber(hasil.bobot, 1)} kg yang dibeli`}
            penjelasan={{
              guna: 'Bobot yang benar-benar bisa Anda masak dan jual setelah masa simpan berakhir.',
              sumber: 'Peluruhan geometrik harian sesuai laju susut metode simpan yang dipilih.',
              rumus: `${formatNumber(hasil.bobot, 1)} × (1 − ${hasil.decay})^${hasil.hari} = ${formatNumber(hasil.sisaKg, 2)} kg`,
              aksi: 'Bandingkan dengan kebutuhan dapur Anda. Bila sisanya kurang, tambah bobot belanja atau perbaiki metode simpan.',
            }}
          />
          <KartuHasil
            label="Terbuang"
            nilai={`${formatNumber(hasil.susutKg, 2)} kg`}
            nada="bahaya"
            catatan={`${formatPct(pctSusut)} dari belanja Anda`}
            penjelasan={{
              guna: 'Bobot yang hilang karena penguapan air dan pembusukan — dibayar, tetapi tidak pernah masuk ke masakan.',
              sumber: 'Selisih bobot awal dan sisa layak pakai pada hari terakhir simulasi.',
              rumus: `${formatNumber(hasil.bobot, 1)} − ${formatNumber(hasil.sisaKg, 2)} = ${formatNumber(hasil.susutKg, 2)} kg`,
              aksi: 'Di atas 15% biasanya menandakan metode simpan atau siklus belanja perlu diubah.',
            }}
          />
          <KartuHasil
            label="Kerugian uang"
            nilai={formatIDR(hasil.rugi)}
            nada="gelap"
            catatan={`Setara ${formatPct(pctSusut)} nilai belanja`}
            penjelasan={{
              guna: 'Nilai rupiah bahan yang membusuk. Inilah angka yang dipakai untuk menentukan tingkat solusi.',
              sumber: 'Bobot terbuang dikali harga pasar hari ini untuk komoditas ini.',
              rumus: `${formatNumber(hasil.susutKg, 2)} kg × ${formatIDR(hasil.harga)} = ${formatIDR(hasil.rugi)}`,
              aksi: 'Bandingkan dengan margin harian usaha Anda untuk menilai seberapa mendesak perbaikannya.',
            }}
          />
          <KartuHasil
            label="Bila pola ini berulang"
            nilai={formatIDR(hasil.rugiBulanan)}
            nada="waspada"
            catatan="Proyeksi kerugian sebulan"
            penjelasan={{
              guna: 'Menunjukkan dampak kumulatif. Kerugian kecil per siklus bisa menjadi besar dalam sebulan.',
              sumber: 'Kerugian satu siklus diproyeksikan ke 30 hari dengan panjang siklus yang sama.',
              rumus: `${formatIDR(hasil.rugi)} × (30 ÷ ${hasil.hari}) = ${formatIDR(hasil.rugiBulanan)}`,
              aksi: 'Pakai angka ini untuk menilai apakah investasi wadah atau chiller layak dibeli.',
            }}
          />
        </div>
      </Reveal>

      {hasil.lewatBatas && (
        <Reveal delay={40}>
          <div className="flex items-start gap-3 rounded-3xl border border-[#E7B4A6] bg-[#FDECEA] p-5">
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-[#A6301C]" />
            <p className="text-sm leading-relaxed text-[#7E2416]">
              Hari ke-{hasil.hari} sudah melewati batas simpan {meta.shelfLife} hari untuk metode{' '}
              {meta.short.toLowerCase()}. Sisa {formatNumber(hasil.sisaKg, 2)} kg pada layar masih
              terhitung sebagai bobot, tetapi mutunya sudah tidak layak disajikan ke pelanggan.
            </p>
          </div>
        </Reveal>
      )}

      {/* Kurva */}
      <Reveal delay={80}>
        <KurvaSusut hasil={hasil} />
      </Reveal>

      {/* Perbandingan metode */}
      <Reveal delay={120}>
        <section className="rounded-[32px] border border-[#A5D6A7]/70 bg-white p-6">
          <h3 className="font-display text-lg font-bold text-[#0D3311]">
            Kerugian yang sama, dengan metode simpan berbeda
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-[#4B6149]">
            Bobot dan lama simpan dipertahankan sama persis. Yang berubah hanya tempat menyimpannya.
          </p>

          <div className="mt-5 space-y-2.5">
            {hasil.perMetode.map((m) => {
              const meta2 = STORAGE_METHODS[m.key];
              const terburuk = Math.max(...hasil.perMetode.map((x) => x.rugi), 1);
              const dipakai = m.key === hasil.metode;
              const terdaftar = m.key === profile.storage_method;
              return (
                <div
                  key={m.key}
                  className={`rounded-2xl border p-4 ${
                    dipakai ? 'border-[#1B5E20] bg-[#F3FAF4]' : 'border-[#A5D6A7]/60 bg-white'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-sm font-bold text-[#0D3311]">
                      <span className="text-base">{meta2.icon}</span>
                      {meta2.short}
                      {dipakai && (
                        <span className="rounded-full bg-[#1B5E20] px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                          disimulasikan
                        </span>
                      )}
                      {terdaftar && !dipakai && (
                        <span className="rounded-full bg-[#E8F5E9] px-2 py-0.5 text-[10px] font-bold uppercase text-[#1B5E20]">
                          terdaftar
                        </span>
                      )}
                    </span>
                    <span className="font-mono text-sm font-bold text-[#A6301C]">
                      {formatIDR(m.rugi)}
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#E8F5E9]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#66BB6A] to-[#E05A3F] transition-[width] duration-1000"
                      style={{
                        width: `${(m.rugi / terburuk) * 100}%`,
                        transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)',
                      }}
                    />
                  </div>
                  <p className="mt-1.5 font-mono text-[11px] text-[#6B7F69]">
                    sisa {formatNumber(m.sisaKg, 2)} kg · batas {meta2.shelfLife} hari
                  </p>
                </div>
              );
            })}
          </div>

          {hematPindah > 1000 && (
            <p className="mt-4 flex items-start gap-2 rounded-2xl bg-[#E8F5E9] px-4 py-3 text-sm leading-relaxed text-[#1B5E20]">
              <Snowflake className="mt-0.5 h-4 w-4 shrink-0" />
              Memindahkan stok ke {STORAGE_METHODS[terbaik.key].short.toLowerCase()} menyelamatkan{' '}
              <strong className="font-mono">{formatIDR(hematPindah)}</strong> pada siklus ini saja.
            </p>
          )}
        </section>
      </Reveal>
    </div>
  );
}

function KartuHasil({
  label,
  nilai,
  catatan,
  nada,
  penjelasan,
}: {
  label: string;
  nilai: string;
  catatan: string;
  nada: 'baik' | 'bahaya' | 'gelap' | 'waspada';
  penjelasan: Parameters<typeof InfoPop>[0]['isi'];
}) {
  const gaya = {
    baik: 'border-[#A5D6A7] bg-[#E8F5E9] text-[#1B5E20]',
    bahaya: 'border-[#E7B4A6] bg-[#FDECEA] text-[#A6301C]',
    gelap: 'border-[#1B5E20] bg-[#0D3311] text-white',
    waspada: 'border-[#D3BE6D]/60 bg-[#FBF6E4] text-[#8A7420]',
  }[nada];
  const gelap = nada === 'gelap';

  return (
    <div className={`rounded-3xl border p-5 ${gaya}`}>
      <div className="flex items-start justify-between gap-2">
        <p className={`text-[10px] font-bold uppercase tracking-wider ${gelap ? 'text-[#8FBF8F]' : 'opacity-75'}`}>
          {label}
        </p>
        <InfoPop judul={label} isi={penjelasan} />
      </div>
      <p className="mt-2 font-mono text-2xl font-black tracking-tight">{nilai}</p>
      <p className={`mt-1 text-xs ${gelap ? 'text-[#A5D6A7]' : 'text-[#4B6149]'}`}>{catatan}</p>
    </div>
  );
}

function LabelSlider({
  label,
  nilai,
  catatan,
}: {
  label: string;
  nilai: string;
  catatan: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-bold text-[#0D3311]">{label}</span>
      <span className="rounded-full bg-[#1B5E20] px-3 py-1 font-mono text-xs font-bold text-white">
        {nilai}
      </span>
      <span className="text-[11px] text-[#6B7F69]">{catatan}</span>
    </div>
  );
}

function isiRange(t: number) {
  const pct = Math.max(0, Math.min(1, t)) * 100;
  return `linear-gradient(90deg, #1B5E20 ${pct}%, #C8E6C9 ${pct}%)`;
}

function KurvaSusut({ hasil }: { hasil: HasilSimulasi }) {
  const W = 640;
  const H = 200;
  const pad = 34;
  const toX = (d: number) => pad + (d / Math.max(1, hasil.hari)) * (W - pad * 2);
  const toY = (v: number) => H - pad - (v / hasil.bobot) * (H - pad * 2);
  const path = hasil.kurva
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(v).toFixed(1)}`)
    .join(' ');

  return (
    <section className="rounded-[32px] border border-[#A5D6A7]/70 bg-white p-6">
      <h3 className="font-display text-lg font-bold text-[#0D3311]">Kurva penyusutan harian</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-[#4B6149]">
        Sumbu tegak memakai skala mutlak 0 hingga {formatNumber(hasil.bobot, 1)} kg, sehingga
        kecuraman kurva dapat dibandingkan langsung antar metode simpan.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="mt-4 w-full" role="img" aria-label="Kurva penyusutan">
        <defs>
          <linearGradient id="susut-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#66BB6A" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#66BB6A" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75, 1].map((g) => (
          <g key={g}>
            <line x1={pad} x2={W - pad} y1={toY(hasil.bobot * g)} y2={toY(hasil.bobot * g)} stroke="#EDF5ED" strokeWidth="1.2" />
            <text x={6} y={toY(hasil.bobot * g) + 3} fill="#9AAE98" fontSize="9" fontWeight="700">
              {formatNumber(hasil.bobot * g, 1)}
            </text>
          </g>
        ))}

        <path d={`${path} L ${toX(hasil.hari)} ${H - pad} L ${toX(0)} ${H - pad} Z`} fill="url(#susut-grad)" />
        <path
          d={path}
          fill="none"
          stroke="#1B5E20"
          strokeWidth="3"
          strokeLinecap="round"
          className="anim-draw"
          style={{ '--dash': 1400 } as React.CSSProperties}
        />

        {hasil.shelfLife <= hasil.hari && (
          <g>
            <line
              x1={toX(hasil.shelfLife)}
              x2={toX(hasil.shelfLife)}
              y1={pad - 14}
              y2={H - pad}
              stroke="#E05A3F"
              strokeWidth="2"
              strokeDasharray="6 5"
            />
            <text x={toX(hasil.shelfLife) + 5} y={pad - 5} fill="#A6301C" fontSize="10" fontWeight="700">
              batas simpan
            </text>
          </g>
        )}

        <circle cx={toX(hasil.hari)} cy={toY(hasil.sisaKg)} r="6" fill="#1B5E20" />
        <text x={W - pad} y={H - 10} fill="#7A8C78" fontSize="10" fontWeight="700" textAnchor="end">
          hari {hasil.hari}
        </text>
        <text x={pad} y={H - 10} fill="#7A8C78" fontSize="10" fontWeight="700" textAnchor="middle">
          hari 0
        </text>
      </svg>
    </section>
  );
}

/* ─────────────────────────── Panel solusi ─────────────────────────── */

type Tingkat = 'ringan' | 'sedang' | 'berat' | 'kritis';

function tingkatDari(rugi: number, nilaiBelanja: number): Tingkat {
  const pct = nilaiBelanja > 0 ? (rugi / nilaiBelanja) * 100 : 0;
  if (rugi < 25_000 && pct < 8) return 'ringan';
  if (rugi < 100_000 && pct < 16) return 'sedang';
  if (rugi < 300_000) return 'berat';
  return 'kritis';
}

const META_TINGKAT: Record<
  Tingkat,
  { label: string; warna: string; bg: string; border: string; ringkas: string }
> = {
  ringan: {
    label: 'Kerugian ringan',
    warna: 'text-[#1B5E20]',
    bg: 'bg-[#E8F5E9]',
    border: 'border-[#A5D6A7]',
    ringkas:
      'Susut Anda masih dalam batas wajar. Perbaikan kebiasaan kecil sudah cukup — belum perlu mengeluarkan biaya.',
  },
  sedang: {
    label: 'Kerugian sedang',
    warna: 'text-[#8A7420]',
    bg: 'bg-[#FBF6E4]',
    border: 'border-[#D3BE6D]/60',
    ringkas:
      'Kerugiannya sudah terasa di kas. Perbaiki cara simpan dan mulai olah kelebihan stok sebelum melewati batas simpan.',
  },
  berat: {
    label: 'Kerugian berat',
    warna: 'text-[#A6301C]',
    bg: 'bg-[#FDECEA]',
    border: 'border-[#E7B4A6]',
    ringkas:
      'Kerugian sebesar ini memakan margin harian. Ubah siklus belanja dan naikkan kelas penyimpanan — investasinya akan terbayar cepat.',
  },
  kritis: {
    label: 'Kerugian kritis',
    warna: 'text-[#7E2416]',
    bg: 'bg-[#FBE3DE]',
    border: 'border-[#D98E7C]',
    ringkas:
      'Pola pengadaan ini tidak berkelanjutan. Hentikan penimbunan, pecah belanja menjadi beberapa kali, dan alihkan kelebihan stok menjadi produk olahan hari ini juga.',
  },
};

function PanelSolusi({ hasil, profile }: { hasil: HasilSimulasi; profile: UmkmProfile }) {
  const nilaiBelanja = hasil.bobot * hasil.harga;
  const tingkat = tingkatDari(hasil.rugi, nilaiBelanja);
  const meta = META_TINGKAT[tingkat];
  const komoditasEnsiklopedia = getCommodity(encyclopediaId(hasil.komoditas) ?? '');

  const terbaik = [...hasil.perMetode].sort((a, b) => a.rugi - b.rugi)[0];
  const hematPindah = hasil.rugi - terbaik.rugi;
  const hematBulanan = hematPindah * (30 / Math.max(1, hasil.hari));

  // Investasi wadah kedap udara diasumsikan Rp 150.000 untuk skala dapur UMKM.
  const biayaWadah = 150_000;
  const balikModalHari = hematBulanan > 0 ? (biayaWadah / hematBulanan) * 30 : Infinity;

  const siklusDisarankan = Math.max(2, Math.min(hasil.hari, Math.round(hasil.shelfLife / 2)));
  const rugiSiklusPendek =
    (hasil.bobot / (hasil.hari / siklusDisarankan)) *
    (1 - Math.pow(1 - hasil.decay, siklusDisarankan)) *
    hasil.harga *
    (hasil.hari / siklusDisarankan);

  const langkah = useMemo(() => {
    const out: { ikon: React.ReactNode; judul: string; isi: string; nada: 'hijau' | 'emas' | 'merah' }[] = [];

    // Selalu: kebiasaan dasar dari basis pengetahuan komoditas.
    const langkahSimpan = komoditasEnsiklopedia?.storage.steps.slice(0, 2) ?? [];
    langkahSimpan.forEach((s) => {
      out.push({
        ikon: <CircleCheck className="h-5 w-5" />,
        judul: s.title,
        isi: s.detail,
        nada: 'hijau',
      });
    });

    if (tingkat !== 'ringan') {
      out.push({
        ikon: <Snowflake className="h-5 w-5" />,
        judul: `Pindahkan stok ke ${STORAGE_METHODS[terbaik.key].short}`,
        isi: `Pada bobot dan lama simpan yang sama, metode ini menekan kerugian dari ${formatIDR(hasil.rugi)} menjadi ${formatIDR(terbaik.rugi)} — selisih ${formatIDR(hematPindah)} per siklus, atau sekitar ${formatIDR(hematBulanan)} sebulan. ${
          Number.isFinite(balikModalHari) && balikModalHari < 90
            ? `Wadah kedap udara seharga sekitar ${formatIDR(biayaWadah)} akan balik modal dalam ${Math.ceil(balikModalHari)} hari.`
            : ''
        }`,
        nada: 'emas',
      });
    }

    if (tingkat === 'berat' || tingkat === 'kritis') {
      out.push({
        ikon: <ShoppingCart className="h-5 w-5" />,
        judul: `Pecah belanja menjadi tiap ${siklusDisarankan} hari`,
        isi: `Menyimpan ${formatNumber(hasil.bobot, 1)} kg selama ${hasil.hari} hari membuat sebagian besar stok menunggu terlalu lama. Membeli lebih sering dengan bobot lebih kecil menekan kerugian menjadi sekitar ${formatIDR(rugiSiklusPendek)} untuk periode yang sama, karena tidak ada stok yang menua melewati separuh umur simpannya.`,
        nada: 'emas',
      });
    }

    if (tingkat === 'kritis') {
      out.push({
        ikon: <TriangleAlert className="h-5 w-5" />,
        judul: 'Hentikan pola penimbunan ini',
        isi: `Kerugian ${formatIDR(hasil.rugi)} setara ${formatPct((hasil.rugi / nilaiBelanja) * 100)} dari nilai belanja. Bila diteruskan, kerugiannya mencapai ${formatIDR(hasil.rugiBulanan)} sebulan — hampir pasti melebihi selisih harga apa pun yang Anda kejar dengan menimbun. Kembali ke rekomendasi kilogram yang dihitung sistem di menu Rekomendasi Belanja.`,
        nada: 'merah',
      });
    }

    return out;
  }, [
    tingkat,
    komoditasEnsiklopedia,
    terbaik,
    hasil,
    hematPindah,
    hematBulanan,
    balikModalHari,
    siklusDisarankan,
    rugiSiklusPendek,
    nilaiBelanja,
  ]);

  // Katalog olahan hanya relevan bila kerugiannya sudah tidak sepele.
  const olahan = komoditasEnsiklopedia?.storage.processing ?? [];
  const tampilkanOlahan = tingkat !== 'ringan';

  return (
    <div className="space-y-5">
      {/* Ringkasan tingkat */}
      <div className={`rounded-[32px] border p-6 ${meta.border} ${meta.bg}`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <span
              className={`inline-flex items-center gap-2 rounded-full bg-white/70 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] ${meta.warna}`}
            >
              <Lightbulb className="h-3.5 w-3.5" /> {meta.label}
            </span>
            <h3 className={`mt-3 font-display text-2xl font-black leading-tight ${meta.warna}`}>
              Kerugian <CountUp to={hasil.rugi} prefix="Rp " /> pada siklus ini
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#4B6149]">{meta.ringkas}</p>
          </div>

          <div className="rounded-2xl bg-white/70 p-4 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#7A8C78]">
              Porsi nilai belanja
            </p>
            <p className={`mt-1 font-mono text-2xl font-black ${meta.warna}`}>
              {formatPct((hasil.rugi / nilaiBelanja) * 100)}
            </p>
            <p className="mt-0.5 text-[11px] text-[#6B7F69]">dari {formatIDR(nilaiBelanja)}</p>
          </div>
        </div>

        {/* Meteran tingkat */}
        <div className="mt-5">
          <div className="flex h-2.5 overflow-hidden rounded-full">
            {(['ringan', 'sedang', 'berat', 'kritis'] as Tingkat[]).map((t) => (
              <div
                key={t}
                className={`flex-1 transition-opacity duration-500 ${
                  t === 'ringan'
                    ? 'bg-[#66BB6A]'
                    : t === 'sedang'
                      ? 'bg-[#D3BE6D]'
                      : t === 'berat'
                        ? 'bg-[#E08A2E]'
                        : 'bg-[#E05A3F]'
                } ${tingkat === t ? 'opacity-100' : 'opacity-25'}`}
              />
            ))}
          </div>
          <div className="mt-1.5 flex justify-between text-[10px] font-bold uppercase tracking-wider text-[#7A8C78]">
            <span>Ringan</span>
            <span>Sedang</span>
            <span>Berat</span>
            <span>Kritis</span>
          </div>
        </div>
      </div>

      {/* Langkah */}
      <section>
        <SectionHead
          eyebrow="Langkah yang disarankan"
          title={`${langkah.length} tindakan untuk ${profile.business_name}`}
          desc="Urutan ini disusun dari yang paling murah dan paling cepat dampaknya. Kerjakan dari atas."
        />
        <div className="space-y-3">
          {langkah.map((l, i) => {
            const gaya = {
              hijau: 'border-[#A5D6A7] bg-[#E8F5E9] text-[#1B5E20]',
              emas: 'border-[#D3BE6D]/60 bg-[#FBF6E4] text-[#8A7420]',
              merah: 'border-[#E7B4A6] bg-[#FDECEA] text-[#A6301C]',
            }[l.nada];
            return (
              <div key={l.judul} className={`flex gap-4 rounded-3xl border p-5 ${gaya}`}>
                <span className="mt-0.5 shrink-0">{l.ikon}</span>
                <div>
                  <p className="font-display text-base font-bold text-[#0D3311]">
                    {i + 1}. {l.judul}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#4B6149]">{l.isi}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Katalog olahan */}
      {tampilkanOlahan && olahan.length > 0 && (
        <section>
          <SectionHead
            eyebrow="Mitigasi stok berlebih"
            title="Ubah stok yang terancam busuk menjadi produk tahan lama"
            desc={`Pilihan ini muncul karena kerugian Anda tergolong ${meta.label.toLowerCase()}. Mengolah sekarang jauh lebih murah daripada membuang ${formatNumber(hasil.susutKg, 2)} kg minggu depan.`}
          />
          <div className="grid gap-3 md:grid-cols-3">
            {olahan.map((o) => (
              <div
                key={o.name}
                className="rounded-3xl border border-[#A5D6A7]/70 bg-white p-5 transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between gap-2">
                  <ChefHat className="h-5 w-5 shrink-0 text-[#2E7D32]" />
                  <span className="rounded-full bg-[#E8F5E9] px-2.5 py-1 font-mono text-[10px] font-bold text-[#1B5E20]">
                    {o.life}
                  </span>
                </div>
                <p className="mt-3 font-display text-base font-bold text-[#0D3311]">{o.name}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-[#4B6149]">{o.note}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Nilai penyelamatan */}
      <section className="flex flex-col items-start gap-4 rounded-[32px] bg-[#0D3311] p-6 text-white sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <PiggyBank className="mt-0.5 h-6 w-6 shrink-0 text-[#D3BE6D]" />
          <div>
            <p className="font-display text-lg font-black">
              Bila seluruh langkah di atas dijalankan
            </p>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-[#A5D6A7]">
              Kerugian per siklus turun dari {formatIDR(hasil.rugi)} menjadi{' '}
              {formatIDR(terbaik.rugi)}, dan dalam sebulan usaha Anda menyelamatkan sekitar{' '}
              <strong className="font-mono text-white">{formatIDR(hematBulanan)}</strong>.
            </p>
          </div>
        </div>
        <div className="rounded-2xl bg-[#14471C] px-5 py-4 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#8FBF8F]">
            Potensi hemat bulanan
          </p>
          <p className="mt-1 font-mono text-2xl font-black text-[#D3BE6D]">
            {formatIDR(hematBulanan)}
          </p>
        </div>
      </section>
    </div>
  );
}

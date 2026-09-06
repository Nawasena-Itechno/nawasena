import { useMemo, useState } from 'react';
import { Radar, Wallet, CalendarRange, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import type { UmkmProfile } from '../../lib/profile';
import { storageOf } from '../../lib/profile';
import type { ProcurementResponse } from '../../lib/api';
import {
  formatIDR,
  formatIDRShort,
  formatNumber,
  formatPct,
  formatTanggal,
  formatTanggalPendek,
  tambahHari,
} from '../../lib/format';
import { InfoPop, PriceStat, SectionHead } from '../../components/dashboard/ui';
import { Reveal } from '../../components/motion/Reveal';

export default function MenuRadar({
  profile,
  data,
  komoditas,
  asOf,
}: {
  profile: UmkmProfile;
  data: ProcurementResponse | null;
  komoditas: string;
  asOf: string;
}) {
  if (!data) {
    return (
      <div className="grid min-h-[50vh] place-items-center rounded-3xl border border-dashed border-[#A5D6A7] bg-white">
        <Loader2 className="h-7 w-7 animate-spin text-[#1B5E20]" />
      </div>
    );
  }

  const simpan = storageOf(profile.storage_method);
  const activeCommodity = profile.commodities.find(c => c.name === komoditas);
  const D = activeCommodity ? activeCommodity.weekly_consumption_kg : 10;
  // Bobot kotor: jumlah yang benar-benar harus dibeli agar sisa bersihnya = D.
  const kgKotorMingguan = D / Math.pow(1 - simpan.decay, 3.5);
  const kgBulanan = kgKotorMingguan * 4;

  const anggaranTengah = kgBulanan * data.p14_50;
  const anggaranAman = kgBulanan * data.p14_90;
  const anggaranMurah = kgBulanan * data.p14_10;

  const arah7 = data.p7_50 - data.harga_sekarang;
  const arah7Pct = (arah7 / data.harga_sekarang) * 100;
  // Pergerakan di bawah 0,5% praktis tidak berarti apa-apa bagi keputusan belanja.
  const arahDatar = Math.abs(arah7Pct) < 0.5;
  const lebar7 = ((data.p7_90 - data.p7_10) / data.p7_50) * 100;
  const lebar14 = ((data.p14_90 - data.p14_10) / data.p14_50) * 100;

  return (
    <div className="space-y-7">
      {/* ── Penjelasan menu ────────────────────────────────────────────── */}
      <Reveal>
        <section className="relative overflow-hidden rounded-[32px] bg-[#0D3311] p-6 text-white">
          <div className="hairline-grid pointer-events-none absolute inset-0 opacity-10" />
          <div className="pointer-events-none absolute -right-14 -top-14 h-52 w-52 rounded-full bg-[#2E7D32] opacity-50 blur-3xl anim-float" />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#66BB6A]/40 bg-[#14471C]/70 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#A5D6A7]">
              <Radar className="h-3.5 w-3.5" /> Apa itu radar harga
            </span>
            <h2 className="mt-4 max-w-3xl font-display text-2xl font-black leading-tight md:text-3xl">
              Radar menjawab dua pertanyaan: ke mana harga bergerak, dan berapa kas yang harus
              disiapkan
            </h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#D3BE6D]">
                  Bagian 1 — Radar harga
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-[#C8E6C9]">
                  Menampilkan riwayat harga {komoditas.toLowerCase()} 90 hari terakhir, lalu
                  memproyeksikan rentang kemungkinan harga 7 dan 14 hari ke depan. Gunanya untuk
                  memutuskan <strong className="text-white">kapan</strong> belanja, bukan berapa
                  banyak.
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#D3BE6D]">
                  Bagian 2 — Anggaran usaha
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-[#C8E6C9]">
                  Mengubah rentang harga itu menjadi rupiah: berapa kas yang perlu Anda siapkan untuk
                  belanja {komoditas.toLowerCase()} selama sebulan penuh, memakai pemakaian{' '}
                  {formatNumber(D, 0)} kg/minggu milik Anda.
                </p>
              </div>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-[#8FBF8F]">
              Semua angka di halaman ini berlaku untuk {komoditas} di provinsi {data.provinsi}, dengan
              tanggal acuan {formatTanggal(asOf)}.
            </p>
          </div>
        </section>
      </Reveal>

      {/* ── Grafik ─────────────────────────────────────────────────────── */}
      <Reveal delay={60}>
        <section>
          <SectionHead
            eyebrow="Bagian 1 · Radar harga"
            title="Riwayat 90 hari dan proyeksi 14 hari ke depan"
            desc="Garis gelap adalah harga yang sudah terjadi. Area berwarna di sebelah kanan adalah rentang kemungkinan harga ke depan — makin lebar areanya, makin tidak pasti pasarnya. Arahkan kursor ke grafik untuk membaca angka per hari."
          />
          <GrafikRadar data={data} asOf={asOf} />
        </section>
      </Reveal>

      {/* ── Harga dijelaskan ───────────────────────────────────────────── */}
      <Reveal delay={90}>
        <section>
          <SectionHead
            eyebrow="Arti setiap angka"
            title="Tujuh harga di radar, dan gunanya masing-masing"
            desc="Model tidak memberi satu tebakan harga, melainkan rentang. Tiga angka untuk pekan depan, tiga untuk dua pekan, plus harga hari ini sebagai titik berangkat."
          />

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <PriceStat
              label="Harga hari ini"
              value={formatIDR(data.harga_sekarang)}
              unit="/kg"
              tone="gelap"
              purpose="Titik berangkat semua proyeksi."
              penjelasan={{
                guna: 'Menjadi patokan: seluruh rentang ramalan dihitung sebagai kelipatan dari harga ini.',
                sumber: `Harga pasar tradisional ${data.provinsi} pada ${formatTanggal(asOf)} dari basis data PIHPS.`,
                aksi: 'Pakai sebagai pembanding saat menawar di pasar hari ini.',
              }}
            />
            <PriceStat
              label="Arah 7 hari (P50)"
              value={`${arah7 >= 0 ? '+' : ''}${formatPct(arah7Pct)}`}
              tone={arahDatar ? 'netral' : arah7 > 0 ? 'waspada' : 'baik'}
              purpose={
                arahDatar
                  ? 'Praktis datar — tidak ada alasan mempercepat atau menunda belanja.'
                  : arah7 > 0
                    ? 'Kecenderungan naik — jangan tunda belanja rutin.'
                    : 'Kecenderungan turun — belanja secukupnya, tunggu harga melunak.'
              }
              penjelasan={{
                guna: 'Menunjukkan arah pergerakan harga tengah dalam sepekan, untuk memutuskan waktu belanja.',
                sumber: 'Selisih ramalan tengah 7 hari (P50) terhadap harga hari ini.',
                rumus: `${formatIDRShort(data.p7_50)} − ${formatIDRShort(data.harga_sekarang)} = ${formatIDRShort(arah7)}`,
                aksi: arahDatar
                  ? 'Ramalan tengah praktis sama dengan harga hari ini, jadi waktu belanja tidak menentukan. Untuk jumlah kilogram, ikuti menu Rekomendasi Belanja.'
                  : 'Arah ini hanya soal waktu. Untuk jumlah kilogram, tetap ikuti menu Rekomendasi Belanja.',
              }}
            />
            <PriceStat
              label="Lebar ketidakpastian 7 hari"
              value={formatPct(lebar7)}
              tone={lebar7 > 40 ? 'bahaya' : lebar7 > 20 ? 'waspada' : 'baik'}
              purpose="Seberapa gaduh pasar minggu ini menurut model."
              penjelasan={{
                guna: 'Mengukur ketidakpastian. Rentang lebar berarti harga bisa bergerak jauh ke dua arah, sehingga rencana belanja perlu lebih hati-hati.',
                sumber: 'Jarak antara batas atas (P90) dan batas bawah (P10) dibagi ramalan tengah (P50).',
                rumus: `(${formatIDRShort(data.p7_90)} − ${formatIDRShort(data.p7_10)}) ÷ ${formatIDRShort(data.p7_50)} = ${formatPct(lebar7)}`,
                aksi:
                  lebar7 > 40
                    ? 'Pasar sedang bergejolak. Perpendek siklus belanja dan hindari menimbun.'
                    : 'Pasar relatif tenang. Rencana belanja rutin aman dijalankan.',
              }}
            />
            <PriceStat
              label="Lebar ketidakpastian 14 hari"
              value={formatPct(lebar14)}
              tone={lebar14 > 50 ? 'bahaya' : lebar14 > 30 ? 'waspada' : 'baik'}
              purpose="Ketidakpastian dua pekan — dasar anggaran bulanan."
              penjelasan={{
                guna: 'Dipakai untuk menyusun anggaran: makin lebar, makin besar cadangan kas yang perlu disiapkan.',
                sumber: 'Jarak P90 dan P10 pada horizon 14 hari dibagi P50.',
                rumus: `(${formatIDRShort(data.p14_90)} − ${formatIDRShort(data.p14_10)}) ÷ ${formatIDRShort(data.p14_50)} = ${formatPct(lebar14)}`,
                aksi: 'Semakin lebar, semakin besar jarak antara anggaran tengah dan anggaran aman di bawah.',
              }}
            />
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <BlokHorizon
              judul="Ramalan 7 hari"
              subjudul={`Berlaku hingga ${formatTanggal(tambahHari(asOf, 7))}`}
              p10={data.p7_10}
              p50={data.p7_50}
              p90={data.p7_90}
              guna="Dipakai mesin keputusan untuk memilih antara belanja mingguan atau borong 2 minggu."
            />
            <BlokHorizon
              judul="Ramalan 14 hari"
              subjudul={`Berlaku hingga ${formatTanggal(tambahHari(asOf, 14))}`}
              p10={data.p14_10}
              p50={data.p14_50}
              p90={data.p14_90}
              guna="Dipakai kalkulator anggaran untuk memperkirakan kas belanja sebulan."
            />
          </div>
        </section>
      </Reveal>

      {/* ── Anggaran ───────────────────────────────────────────────────── */}
      <Reveal delay={120}>
        <section>
          <SectionHead
            eyebrow="Bagian 2 · Anggaran usaha"
            title={`Kas yang perlu disiapkan untuk ${komoditas.toLowerCase()} sebulan`}
            desc={`Simulasi ini menjawab satu pertanyaan: berapa uang yang harus dicadangkan bulan depan hanya untuk komoditas ini. Dihitung dari pemakaian ${formatNumber(D, 0)} kg/minggu milik Anda, ditambah margin susut metode ${simpan.short.toLowerCase()}, dikali rentang harga 14 hari.`}
          />

          <div className="rounded-[32px] border border-[#A5D6A7]/70 bg-white p-6">
            {/* Rantai perhitungan */}
            <div className="grid gap-2.5 sm:grid-cols-4">
              {[
                {
                  l: 'Pemakaian bersih',
                  v: `${formatNumber(D * 4, 0)} kg`,
                  d: `${formatNumber(D, 0)} kg × 4 minggu`,
                },
                {
                  l: 'Margin susut',
                  v: `+ ${formatNumber(kgBulanan - D * 4, 2)} kg`,
                  d: `metode ${simpan.short.toLowerCase()}`,
                },
                {
                  l: 'Harus dibeli',
                  v: `${formatNumber(kgBulanan, 1)} kg`,
                  d: 'bobot kotor sebulan',
                },
                {
                  l: 'Harga acuan',
                  v: `${formatIDRShort(data.p14_50)}`,
                  d: 'ramalan tengah 14 hari',
                },
              ].map((x, i) => (
                <div key={x.l} className="relative rounded-2xl bg-[#F3FAF4] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#2E7D32]">
                    {x.l}
                  </p>
                  <p className="mt-1 font-mono text-lg font-bold text-[#0D3311]">{x.v}</p>
                  <p className="mt-0.5 text-[11px] text-[#6B7F69]">{x.d}</p>
                  {i < 3 && (
                    <span className="absolute -right-1.5 top-1/2 hidden h-3 w-3 -translate-y-1/2 rotate-45 border-r border-t border-[#A5D6A7] bg-[#F3FAF4] sm:block" />
                  )}
                </div>
              ))}
            </div>

            {/* Tiga tingkat anggaran */}
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <KartuAnggaran
                nada="baik"
                label="Skenario murah (P10)"
                nilai={anggaranMurah}
                deskripsi="Bila harga sebulan ke depan cenderung turun. Jangan memakai angka ini sebagai patokan kas — peluangnya hanya 10%."
                harga={data.p14_10}
                kg={kgBulanan}
              />
              <KartuAnggaran
                nada="utama"
                label="Anggaran yang disarankan (P50)"
                nilai={anggaranTengah}
                deskripsi="Inilah angka yang sebaiknya Anda pakai untuk merencanakan kas bulanan. Peluang harga di atas dan di bawahnya sama besar."
                harga={data.p14_50}
                kg={kgBulanan}
              />
              <KartuAnggaran
                nada="waspada"
                label="Cadangan aman (P90)"
                nilai={anggaranAman}
                deskripsi="Batas atas yang masuk akal. Sediakan selisihnya sebagai dana cadangan agar dapur tetap jalan saat harga melonjak."
                harga={data.p14_90}
                kg={kgBulanan}
              />
            </div>

            {/* Batang perbandingan */}
            <div className="mt-5">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#7A8C78]">
                <span>Rentang kas bulanan</span>
                <span className="font-mono">
                  selisih {formatIDR(anggaranAman - anggaranMurah)}
                </span>
              </div>
              <div className="relative mt-2 h-10 overflow-hidden rounded-2xl bg-[#F1F7F1]">
                <div
                  className="absolute inset-y-0 rounded-2xl bg-gradient-to-r from-[#A5D6A7] via-[#66BB6A] to-[#D3BE6D] transition-all duration-1000"
                  style={{
                    left: '0%',
                    width: '100%',
                    transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)',
                  }}
                />
                <div
                  className="absolute inset-y-0 w-1 bg-[#0D3311]"
                  style={{
                    left: `${((anggaranTengah - anggaranMurah) / (anggaranAman - anggaranMurah || 1)) * 100}%`,
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-between px-3 font-mono text-[11px] font-bold text-[#0D3311]">
                  <span>{formatIDRShort(anggaranMurah)}</span>
                  <span>{formatIDRShort(anggaranAman)}</span>
                </div>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-[#4B6149]">
                Garis hitam menandai anggaran yang disarankan. Siapkan{' '}
                <strong className="font-mono text-[#1B5E20]">{formatIDR(anggaranTengah)}</strong>{' '}
                sebagai kas utama, plus{' '}
                <strong className="font-mono text-[#8A7420]">
                  {formatIDR(anggaranAman - anggaranTengah)}
                </strong>{' '}
                sebagai cadangan bila pasar bergejolak.
              </p>
            </div>
          </div>
        </section>
      </Reveal>

      {/* ── Kalender musiman ───────────────────────────────────────────── */}
      <Reveal delay={150}>
        <KalenderMusiman asOf={asOf} />
      </Reveal>
    </div>
  );
}

/* ─────────────────────────── Grafik radar ─────────────────────────── */

function GrafikRadar({ data, asOf }: { data: ProcurementResponse; asOf: string }) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const hist = data.riwayat ?? [];
  const W = 760;
  const H = 300;
  const padL = 58;
  const padR = 18;
  const padT = 18;
  const padB = 34;

  const chart = useMemo(() => {
    const semua = [
      ...hist.map((h) => h.harga),
      data.p7_10,
      data.p7_90,
      data.p14_10,
      data.p14_90,
    ].filter((v) => v > 0);
    if (semua.length === 0) return null;

    const lo = Math.min(...semua) * 0.96;
    const hi = Math.max(...semua) * 1.04;

    // Sumbu X: 90 hari riwayat lalu 14 hari ramalan.
    const totalHari = hist.length + 14;
    const toX = (i: number) => padL + (i / (totalHari - 1)) * (W - padL - padR);
    const toY = (v: number) => padT + (1 - (v - lo) / (hi - lo)) * (H - padT - padB);

    const histPath = hist
      .map((h, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(h.harga).toFixed(1)}`)
      .join(' ');

    const iNow = hist.length - 1;
    const i7 = hist.length - 1 + 7;
    const i14 = hist.length - 1 + 14;

    // Kipas ramalan: batas atas ke kanan, lalu batas bawah kembali ke kiri.
    const fan =
      `M ${toX(iNow)} ${toY(data.harga_sekarang)} ` +
      `L ${toX(i7)} ${toY(data.p7_90)} L ${toX(i14)} ${toY(data.p14_90)} ` +
      `L ${toX(i14)} ${toY(data.p14_10)} L ${toX(i7)} ${toY(data.p7_10)} Z`;

    const median =
      `M ${toX(iNow)} ${toY(data.harga_sekarang)} ` +
      `L ${toX(i7)} ${toY(data.p7_50)} L ${toX(i14)} ${toY(data.p14_50)}`;

    return { lo, hi, toX, toY, histPath, fan, median, iNow, i7, i14, totalHari };
  }, [hist, data]);

  if (!chart || hist.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-[#A5D6A7] bg-white p-10 text-center text-sm text-[#6B7F69]">
        Riwayat harga belum tersedia untuk tanggal ini.
      </div>
    );
  }

  const tick = [0, 0.25, 0.5, 0.75, 1].map((t) => chart.lo + (chart.hi - chart.lo) * t);
  const hovered = hoverIdx !== null ? hist[hoverIdx] : null;

  return (
    <div className="rounded-3xl border border-[#A5D6A7]/70 bg-white p-5">
      {/* Legenda */}
      <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-semibold text-[#4B6149]">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-5 rounded bg-[#1B5E20]" /> Harga yang sudah terjadi
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-5 rounded bg-[#2E7D32]" style={{ borderTop: '2px dashed' }} />{' '}
          Ramalan tengah (P50)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-5 rounded bg-gradient-to-r from-[#A5D6A7] to-[#D3BE6D] opacity-70" />{' '}
          Rentang P10–P90
        </span>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          role="img"
          aria-label="Grafik riwayat dan proyeksi harga"
          onMouseLeave={() => setHoverIdx(null)}
          onMouseMove={(e) => {
            const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * W;
            const i = Math.round(
              ((x - padL) / (W - padL - padR)) * (chart.totalHari - 1)
            );
            setHoverIdx(i >= 0 && i < hist.length ? i : null);
          }}
        >
          <defs>
            <linearGradient id="fan-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#66BB6A" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#D3BE6D" stopOpacity="0.35" />
            </linearGradient>
            <linearGradient id="hist-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#66BB6A" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#66BB6A" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Kisi + sumbu harga */}
          {tick.map((v) => (
            <g key={v}>
              <line
                x1={padL}
                x2={W - padR}
                y1={chart.toY(v)}
                y2={chart.toY(v)}
                stroke="#EDF5ED"
                strokeWidth="1.2"
              />
              <text x={padL - 8} y={chart.toY(v) + 3} fill="#9AAE98" fontSize="10" fontWeight="700" textAnchor="end">
                {formatIDRShort(v)}
              </text>
            </g>
          ))}

          {/* Area riwayat */}
          <path
            d={`${chart.histPath} L ${chart.toX(chart.iNow)} ${H - padB} L ${chart.toX(0)} ${H - padB} Z`}
            fill="url(#hist-grad)"
          />

          {/* Kipas ramalan */}
          <path d={chart.fan} fill="url(#fan-grad)" />
          <path
            d={chart.median}
            fill="none"
            stroke="#2E7D32"
            strokeWidth="2.4"
            strokeDasharray="7 5"
            strokeLinecap="round"
          />

          {/* Garis riwayat */}
          <path
            d={chart.histPath}
            fill="none"
            stroke="#1B5E20"
            strokeWidth="2.4"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Batas hari ini */}
          <line
            x1={chart.toX(chart.iNow)}
            x2={chart.toX(chart.iNow)}
            y1={padT}
            y2={H - padB}
            stroke="#0D3311"
            strokeWidth="1.6"
          />
          <circle cx={chart.toX(chart.iNow)} cy={chart.toY(data.harga_sekarang)} r="5" fill="#0D3311" />
          <text
            x={chart.toX(chart.iNow) - 6}
            y={padT + 10}
            fill="#0D3311"
            fontSize="10"
            fontWeight="700"
            textAnchor="end"
          >
            hari ini
          </text>

          {/* Penanda horizon */}
          {[
            { i: chart.i7, l: '+7 hari' },
            { i: chart.i14, l: '+14 hari' },
          ].map((p) => (
            <g key={p.l}>
              <line
                x1={chart.toX(p.i)}
                x2={chart.toX(p.i)}
                y1={padT}
                y2={H - padB}
                stroke="#C8E6C9"
                strokeWidth="1.2"
                strokeDasharray="4 4"
              />
              <text
                x={chart.toX(p.i)}
                y={H - 10}
                fill="#7A8C78"
                fontSize="10"
                fontWeight="700"
                textAnchor="middle"
              >
                {p.l}
              </text>
            </g>
          ))}

          {/* Label tanggal riwayat */}
          {[0, Math.floor(hist.length / 2)].map((i) => (
            <text
              key={i}
              x={chart.toX(i)}
              y={H - 10}
              fill="#7A8C78"
              fontSize="10"
              fontWeight="700"
              textAnchor="middle"
            >
              {formatTanggalPendek(hist[i].tanggal)}
            </text>
          ))}

          {/* Kursor pembaca */}
          {hoverIdx !== null && hovered && (
            <g>
              <line
                x1={chart.toX(hoverIdx)}
                x2={chart.toX(hoverIdx)}
                y1={padT}
                y2={H - padB}
                stroke="#66BB6A"
                strokeWidth="1.4"
              />
              <circle cx={chart.toX(hoverIdx)} cy={chart.toY(hovered.harga)} r="4.5" fill="#1B5E20" />
            </g>
          )}
        </svg>

        {hoverIdx !== null && hovered && (
          <div
            className="pointer-events-none absolute top-2 rounded-2xl bg-[#0D3311] px-3 py-2 text-white shadow-lg"
            style={{
              left: `${(chart.toX(hoverIdx) / W) * 100}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#8FBF8F]">
              {formatTanggal(hovered.tanggal)}
            </p>
            <p className="font-mono text-sm font-bold">{formatIDR(hovered.harga)}/kg</p>
          </div>
        )}
      </div>

      <p className="mt-3 text-xs leading-relaxed text-[#6B7F69]">
        Riwayat {hist.length} hari terakhir hingga {formatTanggal(asOf)}. Area ramalan melebar seiring
        waktu karena ketidakpastian bertambah — itu sifat pasar, bukan kelemahan model.
      </p>
    </div>
  );
}

/* ─────────────────────────── Blok horizon ─────────────────────────── */

function BlokHorizon({
  judul,
  subjudul,
  p10,
  p50,
  p90,
  guna,
}: {
  judul: string;
  subjudul: string;
  p10: number;
  p50: number;
  p90: number;
  guna: string;
}) {
  return (
    <div className="rounded-3xl border border-[#A5D6A7]/70 bg-white p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-base font-bold text-[#0D3311]">{judul}</h3>
          <p className="text-xs text-[#6B7F69]">{subjudul}</p>
        </div>
        <InfoPop
          judul={judul}
          isi={{
            guna,
            sumber:
              'Filtered Historical Simulation: return historis distandarkan volatilitas, dikelompokkan menurut posisi harga terhadap median 90 hari, lalu kuantilnya diskalakan kembali.',
            rumus: `P = harga hari ini × exp(q × σ × √h)`,
            aksi: 'Rentang inilah yang dipakai sistem, bukan satu angka tunggal. Rencanakan kas pada P50 dan siapkan cadangan hingga P90.',
          }}
        />
      </div>

      <div className="mt-4 space-y-2">
        {[
          { l: 'P10 · murah', v: p10, c: '#66BB6A', w: 34 },
          { l: 'P50 · tengah', v: p50, c: '#2E7D32', w: 67 },
          { l: 'P90 · mahal', v: p90, c: '#D3BE6D', w: 100 },
        ].map((r) => (
          <div key={r.l}>
            <div className="flex items-center justify-between text-[11px] font-bold text-[#4B6149]">
              <span>{r.l}</span>
              <span className="font-mono text-[#0D3311]">{formatIDR(r.v)}</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#F1F7F1]">
              <div
                className="h-full rounded-full transition-[width] duration-1000"
                style={{ width: `${r.w}%`, background: r.c }}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="mt-3 text-xs leading-relaxed text-[#4B6149]">{guna}</p>
    </div>
  );
}

/* ─────────────────────────── Kartu anggaran ─────────────────────────── */

function KartuAnggaran({
  nada,
  label,
  nilai,
  deskripsi,
  harga,
  kg,
}: {
  nada: 'baik' | 'utama' | 'waspada';
  label: string;
  nilai: number;
  deskripsi: string;
  harga: number;
  kg: number;
}) {
  const gaya = {
    baik: 'border-[#A5D6A7] bg-[#E8F5E9] text-[#1B5E20]',
    utama: 'border-[#1B5E20] bg-[#0D3311] text-white',
    waspada: 'border-[#D3BE6D]/60 bg-[#FBF6E4] text-[#8A7420]',
  }[nada];
  const gelap = nada === 'utama';

  return (
    <div className={`rounded-3xl border p-5 ${gaya}`}>
      <div className="flex items-start justify-between gap-2">
        <p
          className={`text-[10px] font-bold uppercase leading-tight tracking-wider ${
            gelap ? 'text-[#D3BE6D]' : 'opacity-75'
          }`}
        >
          {label}
        </p>
        <InfoPop
          judul={label}
          isi={{
            guna: 'Menyatakan berapa kas yang perlu disiapkan untuk membeli komoditas ini selama empat minggu.',
            sumber:
              'Bobot kotor bulanan (pemakaian Anda ditambah margin susut) dikali harga pada kuantil ini.',
            rumus: `${formatNumber(kg, 1)} kg × ${formatIDRShort(harga)}/kg = ${formatIDRShort(nilai)}`,
            aksi: deskripsi,
          }}
        />
      </div>
      <p className="mt-2 font-mono text-2xl font-black tracking-tight">{formatIDR(nilai)}</p>
      <p className={`mt-1 font-mono text-[11px] ${gelap ? 'text-[#A5D6A7]' : 'opacity-70'}`}>
        {formatNumber(kg, 1)} kg × {formatIDRShort(harga)}
      </p>
      <p className={`mt-2 text-xs leading-relaxed ${gelap ? 'text-[#C8E6C9]' : 'text-[#4B6149]'}`}>
        {deskripsi}
      </p>
    </div>
  );
}

/* ─────────────────────────── Kalender musiman ─────────────────────────── */

const BULAN = [
  { n: 'Jan', s: 'merah', k: 'Puncak paceklik & curah hujan tinggi' },
  { n: 'Feb', s: 'merah', k: 'Pasokan tersendat, harga puncak' },
  { n: 'Mar', s: 'hijau', k: 'Awal panen raya, harga mulai turun' },
  { n: 'Apr', s: 'hijau', k: 'Panen raya, harga terendah tahunan' },
  { n: 'Mei', s: 'kuning', k: 'Permintaan naik jelang hari raya' },
  { n: 'Jun', s: 'hijau', k: 'Pasokan stabil' },
  { n: 'Jul', s: 'kuning', k: 'Musim hajatan, permintaan meningkat' },
  { n: 'Agu', s: 'hijau', k: 'Pasokan stabil' },
  { n: 'Sep', s: 'kuning', k: 'Peralihan musim, pasokan mulai turun' },
  { n: 'Okt', s: 'kuning', k: 'Awal musim hujan di sentra tani' },
  { n: 'Nov', s: 'merah', k: 'Curah hujan puncak, panen rusak' },
  { n: 'Des', s: 'merah', k: 'Nataru, permintaan & harga melonjak' },
];

function KalenderMusiman({ asOf }: { asOf: string }) {
  const bulanIni = new Date(`${asOf}T00:00:00`).getMonth();
  const gaya = {
    merah: 'bg-[#FDECEA] text-[#A6301C] border-[#E7B4A6]',
    kuning: 'bg-[#FBF6E4] text-[#8A7420] border-[#D3BE6D]/60',
    hijau: 'bg-[#E8F5E9] text-[#1B5E20] border-[#A5D6A7]',
  } as const;

  return (
    <section>
      <SectionHead
        eyebrow="Konteks musiman"
        title="Bulan-bulan yang perlu diwaspadai"
        desc="Harga pangan segar mengikuti pola tahunan yang cukup konsisten. Kalender ini membantu Anda merencanakan kas beberapa bulan ke depan, bukan hanya minggu ini."
        right={
          <div className="flex flex-wrap gap-2 text-[11px] font-bold">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FDECEA] px-3 py-1.5 text-[#A6301C]">
              <TrendingUp className="h-3 w-3" /> Rawan lonjakan
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FBF6E4] px-3 py-1.5 text-[#8A7420]">
              <CalendarRange className="h-3 w-3" /> Waspada
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F5E9] px-3 py-1.5 text-[#1B5E20]">
              <TrendingDown className="h-3 w-3" /> Panen / stabil
            </span>
          </div>
        }
      />

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
        {BULAN.map((b, i) => (
          <div
            key={b.n}
            className={`relative rounded-2xl border p-3.5 transition-transform duration-300 hover:-translate-y-0.5 ${
              gaya[b.s as keyof typeof gaya]
            } ${i === bulanIni ? 'ring-2 ring-[#0D3311] ring-offset-2 ring-offset-[#F8FCF8]' : ''}`}
          >
            <p className="font-display text-base font-black">{b.n}</p>
            {i === bulanIni && (
              <span className="absolute right-2 top-2 rounded-full bg-[#0D3311] px-2 py-0.5 text-[9px] font-bold uppercase text-white">
                kini
              </span>
            )}
            <p className="mt-1 text-[11px] font-medium leading-tight opacity-90">{b.k}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-start gap-3 rounded-3xl border border-[#A5D6A7]/70 bg-white p-5">
        <Wallet className="mt-0.5 h-5 w-5 shrink-0 text-[#2E7D32]" />
        <p className="text-sm leading-relaxed text-[#4B6149]">
          Gunakan kalender ini bersama anggaran di atas: pada bulan bertanda merah, siapkan kas
          mendekati batas P90; pada bulan panen, kas di P50 biasanya sudah cukup dan selisihnya bisa
          dialihkan untuk stok komoditas kering yang tahan lama.
        </p>
      </div>
    </section>
  );
}

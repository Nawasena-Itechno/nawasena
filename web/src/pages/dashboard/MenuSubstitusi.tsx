import { useState } from 'react';
import {
  Shuffle,
  ArrowRight,
  ShieldCheck,
  Loader2,
  Activity,
  CalendarClock,
  Sparkles,
  CircleCheck,
} from 'lucide-react';
import type { UmkmProfile } from '../../lib/profile';
import type { ProcurementResponse, SubstitutionDetail } from '../../lib/api';
import { formatIDR, formatNumber, formatTanggal } from '../../lib/format';
import { InfoPop, SectionHead, Modal } from '../../components/dashboard/ui';
import { Reveal, CountUp } from '../../components/motion/Reveal';

/** Tanggal historis yang terbukti menyalakan sinyal, untuk peragaan. */
const CONTOH_PEMICU = [
  {
    tanggal: '2024-09-09',
    komoditas: 'Cabai Rawit Merah',
    catatan: 'Rawit merah melonjak ke Rp 73.807 sementara dua varian lain tertinggal jauh.',
  },
  {
    tanggal: '2025-04-23',
    komoditas: 'Cabai Rawit Merah',
    catatan: 'Rawit merah Rp 65.557 vs rawit hijau Rp 59.184 — rasio menyimpang 2,4 simpangan baku.',
  },
];

export default function MenuSubstitusi({
  profile,
  data,
  komoditas,
  asOf,
  onPickDate,
}: {
  profile: UmkmProfile;
  data: ProcurementResponse | null;
  komoditas: string;
  asOf: string;
  onPickDate: (d: string) => void;
}) {
  const [modalCara, setModalCara] = useState(false);

  if (!data) {
    return (
      <div className="grid min-h-[50vh] place-items-center rounded-3xl border border-dashed border-[#A5D6A7] bg-white">
        <Loader2 className="h-7 w-7 animate-spin text-[#1B5E20]" />
      </div>
    );
  }

  const kandidat = data.kandidat_substitusi ?? [];
  const aktif = data.substitusi ?? null;

  return (
    <div className="space-y-7">
      {/* ── Penjelasan ─────────────────────────────────────────────────── */}
      <Reveal>
        <section className="relative overflow-hidden rounded-[32px] bg-[#0D3311] p-6 text-white">
          <div className="hairline-grid pointer-events-none absolute inset-0 opacity-10" />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#66BB6A]/40 bg-[#14471C]/70 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#A5D6A7]">
              <Shuffle className="h-3.5 w-3.5" /> Apa itu sinyal substitusi
            </span>
            <h2 className="mt-4 max-w-3xl font-display text-2xl font-black leading-tight md:text-3xl">
              Sistem memantau kapan satu varian menjadi mahal secara tidak wajar
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#C8E6C9]">
              Harga antar varian cabai biasanya bergerak beriringan dengan rasio yang cukup stabil.
              Ketika rasio itu menyimpang jauh dari kebiasaannya, artinya satu varian sedang mahal
              sendirian — dan mengalihkan sebagian resep ke varian lain bisa memangkas belanja tanpa
              mengubah rasa masakan secara berarti.
            </p>
            <button
              onClick={() => setModalCara(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#D3BE6D] px-5 py-2.5 text-sm font-bold text-[#3A3113] transition-transform duration-300 hover:-translate-y-0.5"
            >
              Lihat cara kerja sinyalnya
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      </Reveal>

      {/* ── Status sinyal ──────────────────────────────────────────────── */}
      <Reveal delay={60}>
        {aktif ? (
          <KartuSinyalAktif detail={aktif} asal={komoditas} kg={aktif.KgDipakai} />
        ) : (
          <KartuSinyalDiam komoditas={komoditas} asOf={asOf} />
        )}
      </Reveal>

      {/* ── Pemantauan tiap kandidat ───────────────────────────────────── */}
      <Reveal delay={90}>
        <section>
          <SectionHead
            eyebrow="Pemantauan berjalan"
            title="Posisi setiap varian terhadap ambang sinyal"
            desc={`Sistem terus mengukur rasio harga ${komoditas.toLowerCase()} terhadap tiap varian setara. Meteran di bawah menunjukkan seberapa jauh rasio hari ini menyimpang dari kebiasaan 90 harinya. Sinyal menyala pada 2,4 simpangan baku.`}
          />
          <div className="grid gap-3 md:grid-cols-2">
            {kandidat.length === 0 && (
              <p className="rounded-3xl border border-dashed border-[#A5D6A7] bg-white p-6 text-sm text-[#6B7F69]">
                Belum ada varian pembanding untuk komoditas ini.
              </p>
            )}
            {kandidat.map((c, i) => (
              <MeteranKandidat key={c.komoditas} detail={c.detail} nama={c.komoditas} delay={i * 90} />
            ))}
          </div>
        </section>
      </Reveal>

      {/* ── Peragaan pemicu ────────────────────────────────────────────── */}
      <Reveal delay={120}>
        <section>
          <SectionHead
            eyebrow="Peragaan"
            title="Coba lihat sinyal ini menyala"
            desc="Sinyal substitusi jarang aktif — itu memang tujuannya, agar tidak mengganggu saat pasar normal. Untuk melihat tampilannya saat menyala, pindahkan tanggal acuan ke salah satu tanggal historis berikut yang terbukti memicu sinyal."
          />
          <div className="grid gap-3 md:grid-cols-2">
            {CONTOH_PEMICU.map((c) => {
              const cocok = c.komoditas === komoditas;
              return (
                <div
                  key={c.tanggal}
                  className="flex flex-col justify-between gap-4 rounded-3xl border border-[#D3BE6D]/60 bg-[#FBF6E4] p-5"
                >
                  <div>
                    <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#8A7420]">
                      <CalendarClock className="h-3.5 w-3.5" /> {formatTanggal(c.tanggal)}
                    </p>
                    <p className="mt-1.5 font-display text-base font-bold text-[#5F5015]">
                      {c.komoditas}
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-[#6B5A1E]">{c.catatan}</p>
                  </div>
                  <button
                    onClick={() => onPickDate(c.tanggal)}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1B5E20] px-5 py-2.5 text-sm font-bold text-white transition-transform duration-300 hover:-translate-y-0.5"
                  >
                    {cocok ? 'Pindah ke tanggal ini' : `Pindah tanggal (pilih ${c.komoditas})`}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
          <p className="mt-3 rounded-2xl bg-[#E8F5E9] px-4 py-3 text-xs leading-relaxed text-[#31462F]">
            Tombol ini hanya menggeser tanggal acuan di bilah atas — komoditas tetap perlu diatur ke{' '}
            <strong>Cabai Rawit Merah</strong> agar pasangan varian yang dipantau sesuai contoh.
          </p>
        </section>
      </Reveal>

      {/* ── Pagar etika ────────────────────────────────────────────────── */}
      <Reveal delay={150}>
        <section className="flex items-start gap-4 rounded-3xl border border-[#A5D6A7] bg-[#E8F5E9] p-6">
          <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-[#1B5E20]" />
          <div>
            <h3 className="font-display text-base font-bold text-[#0D3311]">
              Pagar etika: sistem tidak menyarankan penurunan mutu
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#31462F]">
              Sinyal hanya memasangkan varian yang setara fungsi dan mutu — rawit merah dengan rawit
              hijau, cabai keriting dengan cabai besar. Sistem tidak akan pernah menyarankan mengganti
              bahan dengan grade yang lebih rendah, mencampur bahan busuk, atau mengurangi takaran
              porsi pelanggan demi menekan biaya. Penghematan harus datang dari keputusan pengadaan,
              bukan dari mutu yang dikurangi diam-diam.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[#31462F]">
              Rekomendasi campuran juga dibatasi maksimal 30–40% agar karakter rasa masakan{' '}
              {profile.business_name} tetap terjaga.
            </p>
          </div>
        </section>
      </Reveal>

      {/* ── Modal cara kerja ───────────────────────────────────────────── */}
      <Modal
        open={modalCara}
        onClose={() => setModalCara(false)}
        eyebrow="Cara kerja"
        title="Bagaimana sinyal substitusi dihitung"
      >
        <div className="space-y-4">
          {[
            {
              t: '1. Menyandingkan harga per tanggal',
              d: 'Harga kedua varian dipasangkan berdasarkan tanggal pelaporan yang sama, bukan urutan baris data. Hari yang tidak dilaporkan pada salah satu varian dilewati agar rasionya tidak membandingkan tanggal berbeda.',
            },
            {
              t: '2. Menghitung rasio harga',
              d: 'Untuk setiap hari dihitung Rasio = harga varian utama ÷ harga varian pembanding. Deret rasio 90 hari terakhir inilah yang dipantau, bukan harga mentahnya — karena rasio menyaring pengaruh musim yang menaikkan harga keduanya bersamaan.',
            },
            {
              t: '3. Mengukur penyimpangan (z-score)',
              d: 'Rasio hari ini dibandingkan dengan median dan simpangan baku 90 hari: z = (rasio hari ini − median 90 hari) ÷ simpangan baku 90 hari. Nilai z menyatakan seberapa tidak biasa selisih harga hari ini.',
            },
            {
              t: '4. Ambang dan arah',
              d: 'Sinyal menyala hanya bila z ≥ 2,4 DAN varian pembanding memang lebih murah hari ini. Syarat arah ini penting: z yang menyimpang ke arah sebaliknya berarti varian utama justru sedang murah, sehingga beralih akan menambah biaya.',
            },
            {
              t: '5. Menghitung penghematan',
              d: 'Potensi hemat = selisih harga per kg × kilogram yang direkomendasikan sistem hari ini. Angka ini otomatis mengikuti pemakaian mingguan dan metode simpan yang Anda daftarkan.',
            },
          ].map((s) => (
            <div key={s.t} className="rounded-2xl border border-[#A5D6A7]/60 bg-white p-4">
              <p className="font-display text-sm font-bold text-[#0D3311]">{s.t}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-[#4B6149]">{s.d}</p>
            </div>
          ))}
          <div className="rounded-2xl bg-[#0D3311] p-4 font-mono text-[11px] leading-relaxed text-[#C8E6C9]">
            Rasio(t) = p_utama(t) / p_pembanding(t)
            <br />
            z(t) = ( Rasio(t) − Median₉₀ ) / StDev₉₀
            <br />
            Sinyal aktif ⟺ z(t) ≥ 2,4 dan p_pembanding(t) &lt; p_utama(t)
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ─────────────────────────── Sinyal aktif ─────────────────────────── */

function KartuSinyalAktif({
  detail,
  asal,
  kg,
}: {
  detail: SubstitutionDetail;
  asal: string;
  kg: number;
}) {
  const porsi = 0.3;
  const hematPorsi = detail.SelisihPerKg * kg * porsi;

  return (
    <section className="relative overflow-hidden rounded-[32px] border border-[#D3BE6D] bg-gradient-to-br from-[#FBF6E4] via-[#F7EFD6] to-[#EFE3B8] p-7">
      <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-[#D3BE6D] opacity-30 blur-3xl anim-float" />

      <div className="relative">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#8A7420] px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#FBF6E4]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FBF6E4] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#FBF6E4]" />
          </span>
          Sinyal aktif
        </span>

        <h2 className="mt-4 font-display text-3xl font-black leading-tight text-[#5F5015] md:text-4xl">
          Alihkan sebagian resep ke {detail.Rekomendasi}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#6B5A1E]">
          {detail.Alasan}. Pada {formatTanggal(detail.Tanggal)}, {asal.toLowerCase()} berada{' '}
          <strong>{formatNumber(detail.Z, 2)} simpangan baku</strong> di atas kebiasaan rasionya —
          melewati ambang {formatNumber(detail.Ambang, 1)}.
        </p>

        {/* Visual alih varian */}
        <div className="mt-6 grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
          <KotakVarian nama={asal} harga={detail.HargaAsal} nada="mahal" />
          <div className="flex flex-col items-center gap-1 py-2">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-[#8A7420] text-[#FBF6E4] anim-bob">
              <Shuffle className="h-5 w-5" />
            </span>
            <span className="font-mono text-[11px] font-bold text-[#8A7420]">
              −{formatIDR(detail.SelisihPerKg)}/kg
            </span>
          </div>
          <KotakVarian nama={detail.Rekomendasi} harga={detail.HargaAlih} nada="murah" />
        </div>

        {/* Angka penghematan */}
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-3xl bg-[#5F5015] p-5 text-[#FBF6E4]">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#D3BE6D]">
                Hemat bila dialihkan penuh
              </p>
              <InfoPop
                judul="Hemat bila dialihkan penuh"
                isi={{
                  guna: 'Batas atas penghematan bila seluruh kebutuhan hari ini dibeli dalam varian pengganti.',
                  sumber: 'Selisih harga per kg dikali kilogram yang direkomendasikan sistem hari ini.',
                  rumus: `${formatIDR(detail.SelisihPerKg)} × ${formatNumber(kg, 1)} kg = ${formatIDR(detail.Hemat)}`,
                  aksi: 'Jarang realistis dipakai penuh — pakai angka campuran 30% di sebelahnya sebagai target yang aman.',
                }}
              />
            </div>
            <p className="mt-2 font-mono text-2xl font-black">
              <CountUp to={detail.Hemat} prefix="Rp " />
            </p>
            <p className="mt-1 text-[11px] text-[#D3BE6D]">
              {formatNumber(kg, 1)} kg × {formatIDR(detail.SelisihPerKg)}
            </p>
          </div>

          <div className="rounded-3xl border border-[#D3BE6D] bg-white p-5">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A7420]">
                Hemat dengan campuran 30%
              </p>
              <InfoPop
                judul="Hemat dengan campuran 30%"
                isi={{
                  guna: 'Target penghematan yang realistis tanpa mengubah karakter rasa masakan Anda.',
                  sumber: 'Tiga puluh persen dari kebutuhan dialihkan ke varian pengganti.',
                  rumus: `${formatIDR(detail.SelisihPerKg)} × ${formatNumber(kg, 1)} kg × 30% = ${formatIDR(hematPorsi)}`,
                  aksi: 'Mulai dari 20% pada beberapa porsi, naikkan bertahap sambil memperhatikan tanggapan pelanggan.',
                }}
              />
            </div>
            <p className="mt-2 font-mono text-2xl font-black text-[#8A7420]">
              {formatIDR(hematPorsi)}
            </p>
            <p className="mt-1 text-[11px] text-[#6B5A1E]">per siklus belanja ini</p>
          </div>

          <div className="rounded-3xl border border-[#D3BE6D] bg-white p-5">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A7420]">
                Kekuatan sinyal
              </p>
              <InfoPop
                judul="Kekuatan sinyal (z-score)"
                isi={{
                  guna: 'Menyatakan seberapa tidak biasa selisih harga hari ini. Makin tinggi, makin kuat alasan untuk beralih.',
                  sumber: 'Rasio harga hari ini dibandingkan median dan simpangan baku 90 hari terakhir.',
                  rumus: `(${formatNumber(detail.Rasio, 3)} − ${formatNumber(detail.RasioMedian, 3)}) ÷ ${formatNumber(detail.RasioSD, 3)} = ${formatNumber(detail.Z, 2)}`,
                  aksi: 'Di atas 2,4 dianggap anomali nyata, bukan gejolak harian biasa.',
                }}
              />
            </div>
            <p className="mt-2 font-mono text-2xl font-black text-[#8A7420]">
              z = {formatNumber(detail.Z, 2)}
            </p>
            <p className="mt-1 text-[11px] text-[#6B5A1E]">
              ambang {formatNumber(detail.Ambang, 1)}
            </p>
          </div>
        </div>

        {/* Saran resep */}
        <div className="mt-4 flex items-start gap-3 rounded-3xl bg-white/70 p-5">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[#B9A24F]" />
          <div>
            <p className="font-display text-sm font-bold text-[#5F5015]">Saran penerapan di dapur</p>
            <p className="mt-1.5 text-sm leading-relaxed text-[#6B5A1E]">
              Campurkan {Math.round(porsi * 100)}% {detail.Rekomendasi.toLowerCase()} pada olahan
              sambal dan bumbu ulek yang berwarna gelap — perubahan warna dan rasanya paling tidak
              kentara di sana. Pertahankan {asal.toLowerCase()} penuh pada menu andalan yang
              mengandalkan warna atau tingkat pedas tertentu.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function KotakVarian({
  nama,
  harga,
  nada,
}: {
  nama: string;
  harga: number;
  nada: 'mahal' | 'murah';
}) {
  return (
    <div
      className={`rounded-3xl border-2 p-5 transition-transform duration-500 ${
        nada === 'mahal'
          ? 'border-[#E7B4A6] bg-[#FDECEA]'
          : 'border-[#A5D6A7] bg-[#E8F5E9] hover:-translate-y-1'
      }`}
    >
      <p
        className={`text-[10px] font-bold uppercase tracking-wider ${
          nada === 'mahal' ? 'text-[#A6301C]' : 'text-[#1B5E20]'
        }`}
      >
        {nada === 'mahal' ? 'Sedang mahal · varian Anda' : 'Lebih murah · varian pengganti'}
      </p>
      <p className="mt-1.5 font-display text-lg font-bold leading-tight text-[#0D3311]">{nama}</p>
      <p
        className={`mt-2 font-mono text-2xl font-black ${
          nada === 'mahal' ? 'text-[#A6301C]' : 'text-[#1B5E20]'
        }`}
      >
        {formatIDR(harga)}
        <span className="text-sm font-bold">/kg</span>
      </p>
    </div>
  );
}

/* ─────────────────────────── Sinyal diam ─────────────────────────── */

function KartuSinyalDiam({ komoditas, asOf }: { komoditas: string; asOf: string }) {
  return (
    <section className="relative overflow-hidden rounded-[32px] border border-[#A5D6A7] bg-white p-8">
      <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-[#E8F5E9] blur-2xl" />
      <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        <span className="relative grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#E8F5E9] text-[#1B5E20]">
          <CircleCheck className="h-8 w-8" />
          <span className="pulse-ring absolute inset-0 text-[#66BB6A]" />
        </span>
        <div>
          <h2 className="font-display text-2xl font-black leading-tight text-[#0D3311]">
            Tidak ada anomali harga hari ini
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#4B6149]">
            Pada {formatTanggal(asOf)}, rasio harga {komoditas.toLowerCase()} terhadap varian
            setaranya masih berada dalam kebiasaan 90 hari terakhir. Tidak ada alasan kuat untuk
            mengubah komposisi resep — beralih sekarang justru berisiko menambah biaya tanpa
            penghematan berarti.
          </p>
          <p className="mt-2 flex items-center gap-2 text-xs font-semibold text-[#2E7D32]">
            <Activity className="h-3.5 w-3.5" />
            Pemantauan tetap berjalan setiap hari. Meteran di bawah menunjukkan posisi terkini.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── Meteran kandidat ─────────────────────────── */

function MeteranKandidat({
  detail,
  nama,
  delay,
}: {
  detail?: SubstitutionDetail;
  nama: string;
  delay: number;
}) {
  if (!detail) {
    return (
      <div className="rounded-3xl border border-dashed border-[#A5D6A7] bg-white p-5">
        <p className="font-display text-base font-bold text-[#0D3311]">{nama}</p>
        <p className="mt-1.5 text-sm text-[#6B7F69]">
          Data 90 hari belum lengkap untuk memantau pasangan ini.
        </p>
      </div>
    );
  }

  // Meteran dipetakan pada rentang z −4 … +4, dengan ambang di +2,4.
  const posisi = ((Math.max(-4, Math.min(4, detail.Z)) + 4) / 8) * 100;
  const posisiAmbang = ((detail.Ambang + 4) / 8) * 100;
  const lebihMurah = detail.HargaAlih < detail.HargaAsal;

  return (
    <div
      className={`rounded-3xl border p-5 transition-all duration-500 ${
        detail.Aktif ? 'border-[#D3BE6D] bg-[#FBF6E4]' : 'border-[#A5D6A7]/70 bg-white'
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-base font-bold text-[#0D3311]">{nama}</p>
          <p className="mt-0.5 font-mono text-xs text-[#6B7F69]">
            {formatIDR(detail.HargaAlih)}/kg · {lebihMurah ? 'lebih murah' : 'lebih mahal'} dari
            varian Anda
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
            detail.Aktif ? 'bg-[#8A7420] text-white' : 'bg-[#E8F5E9] text-[#2E7D32]'
          }`}
        >
          {detail.Aktif ? 'Menyala' : 'Diam'}
        </span>
      </div>

      {/* Meteran z */}
      <div className="mt-4">
        <div className="relative h-3 rounded-full bg-gradient-to-r from-[#E8F5E9] via-[#F1F7F1] to-[#FBF6E4]">
          <span
            className="absolute top-1/2 h-5 w-0.5 -translate-y-1/2 bg-[#A6301C]"
            style={{ left: `${posisiAmbang}%` }}
            aria-hidden="true"
          />
          <span
            className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white shadow-md transition-all duration-1000"
            style={{
              left: `${posisi}%`,
              background: detail.Aktif ? '#8A7420' : '#1B5E20',
              transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)',
            }}
          />
        </div>
        <div className="mt-1.5 flex justify-between font-mono text-[10px] font-bold text-[#7A8C78]">
          <span>z = −4</span>
          <span className="text-[#A6301C]">ambang +{formatNumber(detail.Ambang, 1)}</span>
          <span>z = +4</span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-[#F3FAF4] px-4 py-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#2E7D32]">
            Posisi sekarang
          </p>
          <p className="font-mono text-lg font-bold text-[#0D3311]">z = {formatNumber(detail.Z, 2)}</p>
        </div>
        <InfoPop
          judul={`Rasio harga vs ${nama}`}
          isi={{
            guna: 'Mengukur apakah selisih harga hari ini tergolong biasa atau anomali yang layak ditindaklanjuti.',
            sumber: 'Rasio harga 90 hari terakhir antara varian Anda dan varian ini.',
            rumus: `rasio ${formatNumber(detail.Rasio, 3)} · median ${formatNumber(detail.RasioMedian, 3)} · sd ${formatNumber(detail.RasioSD, 3)} → z ${formatNumber(detail.Z, 2)}`,
            aksi: detail.Alasan,
          }}
        />
      </div>

      <p className="mt-2 text-xs leading-relaxed text-[#4B6149]">{detail.Alasan}.</p>
    </div>
  );
}

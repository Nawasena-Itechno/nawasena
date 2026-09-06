import { useMemo, useState } from 'react';
import {
  ShoppingBasket,
  Store,
  Scale,
  Snowflake,
  CalendarClock,
  MapPin,
  Loader2,
  ArrowRight,
  ArrowDown,
  TriangleAlert,
  CircleCheck,
  Wallet,
} from 'lucide-react';
import type { UmkmProfile } from '../../lib/profile';
import { storageOf } from '../../lib/profile';
import type { ProcurementResponse } from '../../lib/api';
import { formatIDR, formatIDRShort, formatNumber, formatPct, formatTanggal, tambahHari } from '../../lib/format';
import { BasisChip, FormulaCard, InfoPop, PriceStat, SectionHead } from '../../components/dashboard/ui';
import { Reveal, CountUp } from '../../components/motion/Reveal';

export default function MenuRekomendasi({
  profile,
  data,
  loading,
  komoditas,
  asOf,
}: {
  profile: UmkmProfile;
  data: ProcurementResponse | null;
  loading: boolean;
  komoditas: string;
  asOf: string;
}) {
  if (!data) {
    return (
      <div className="grid min-h-[50vh] place-items-center rounded-3xl border border-dashed border-[#A5D6A7] bg-white">
        <div className="flex flex-col items-center gap-3 text-center">
          {loading ? (
            <>
              <Loader2 className="h-7 w-7 animate-spin text-[#1B5E20]" />
              <p className="text-sm font-semibold text-[#4B6149]">Menghitung rekomendasi…</p>
            </>
          ) : (
            <>
              <ShoppingBasket className="h-8 w-8 text-[#A5D6A7]" />
              <p className="text-sm font-semibold text-[#4B6149]">
                Belum ada data untuk tanggal ini.
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  const k = data.keputusan;
  const simpan = storageOf(profile.storage_method);
  const activeCommodity = profile.commodities.find(c => c.name === komoditas);
  const D = activeCommodity ? activeCommodity.weekly_consumption_kg : 10;
  const nilaiBelanja = k.KgDibeli * data.harga_sekarang;
  const tanggalBeliLagi = tambahHari(asOf, 7 * k.MingguDibeli);

  return (
    <div className="space-y-7">
      {/* ── 1. Basis perhitungan dari data pendaftaran ──────────────────── */}
      <Reveal>
        <section className="relative overflow-hidden rounded-[32px] bg-[#0D3311] p-6">
          <div className="hairline-grid pointer-events-none absolute inset-0 opacity-10" />
          <div className="relative">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D3BE6D]">
                  Basis perhitungan
                </p>
                <h2 className="mt-1.5 font-display text-xl font-black text-white">
                  Semua angka di halaman ini dihitung dari data usaha Anda
                </h2>
                <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-[#A5D6A7]">
                  Enam nilai di bawah adalah isian yang Anda berikan saat mendaftar. Mengubah salah
                  satunya di menu <strong className="text-white">Profil Usaha</strong> akan langsung
                  mengubah seluruh rekomendasi di halaman ini.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              <BasisChip
                icon={<Store className="h-4 w-4" />}
                label="Usaha Anda"
                value={profile.business_name}
                hint={profile.fnb_category}
              />
              <BasisChip
                icon={<ShoppingBasket className="h-4 w-4" />}
                label="Komoditas dinilai"
                value={komoditas}
                hint="Dari daftar komoditas rutin Anda"
              />
              <BasisChip
                icon={<Scale className="h-4 w-4" />}
                label="Pemakaian rutin (D)"
                value={`${formatNumber(D, 0)} kg / minggu`}
                hint="Angka yang Anda isi saat mendaftar"
              />
              <BasisChip
                icon={<Snowflake className="h-4 w-4" />}
                label="Metode simpan"
                value={simpan.short}
                hint={`Susut ${formatPct(simpan.decay * 100, 1)}/hari · batas ${simpan.shelfLife} hari`}
              />
              <BasisChip
                icon={<MapPin className="h-4 w-4" />}
                label="Pasar acuan"
                value={profile.reference_market}
                hint={`Harga provinsi ${data.provinsi}`}
              />
              <BasisChip
                icon={<CalendarClock className="h-4 w-4" />}
                label="Tanggal acuan"
                value={formatTanggal(asOf)}
                hint="Harga & ramalan dihitung pada tanggal ini"
              />
            </div>
          </div>
        </section>
      </Reveal>

      {/* ── 2. Kartu keputusan ─────────────────────────────────────────── */}
      <Reveal delay={60}>
        <KartuKeputusan
          kg={k.KgDibeli}
          minggu={k.MingguDibeli}
          D={D}
          margin={k.MarginKg}
          nilaiBelanja={nilaiBelanja}
          harga={data.harga_sekarang}
          komoditas={komoditas}
          tanggalBeliLagi={tanggalBeliLagi}
          simpanLabel={simpan.short}
          decay={simpan.decay}
          shelfLife={simpan.shelfLife}
        />
      </Reveal>

      {/* ── 3. Harga-harga yang dipakai ────────────────────────────────── */}
      <Reveal delay={90}>
        <section>
          <SectionHead
            eyebrow="Rincian harga"
            title="Setiap harga di sini punya tugasnya masing-masing"
            desc="Empat harga dipakai untuk mengambil satu keputusan. Tekan ikon informasi pada tiap kartu untuk melihat kegunaannya, asal angkanya, dan apa yang perlu Anda lakukan."
          />

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <PriceStat
              label="Harga pasar hari ini"
              value={formatIDR(data.harga_sekarang)}
              unit="/kg"
              purpose="Harga yang benar-benar Anda bayar bila belanja hari ini."
              tone="netral"
              penjelasan={{
                guna: 'Menjadi dasar nilai belanja hari ini dan pembanding untuk semua skenario. Semua perhitungan lain berangkat dari angka ini.',
                sumber: `Harga rata-rata pasar tradisional ${data.provinsi} untuk ${komoditas} pada ${formatTanggal(asOf)}, dari basis data PIHPS Bank Indonesia.`,
                aksi: `Bandingkan dengan harga di ${profile.reference_market}. Bila selisihnya lebih dari 10%, pasar acuan Anda sedang tidak mewakili — catat dan pertimbangkan pasar lain.`,
              }}
            />

            <PriceStat
              label="Harga harapan pekan depan"
              value={formatIDR(k.HargaHarapanDepan)}
              unit="/kg"
              purpose="Perkiraan harga saat Anda belanja lagi minggu depan."
              tone="netral"
              penjelasan={{
                guna: 'Dipakai untuk menghitung biaya skenario belanja mingguan — yaitu berapa yang Anda bayar minggu depan bila hari ini hanya beli untuk seminggu.',
                sumber: 'Rata-rata tiga kuantil ramalan 7 hari (P10, P50, P90) dari model Filtered Historical Simulation.',
                rumus: `(${formatIDRShort(data.p7_10)} + ${formatIDRShort(data.p7_50)} + ${formatIDRShort(data.p7_90)}) ÷ 3 = ${formatIDRShort(k.HargaHarapanDepan)}`,
                aksi:
                  k.HargaHarapanDepan > data.harga_sekarang
                    ? 'Ramalan sedikit naik. Tetap belanja sesuai rekomendasi, jangan menambah hanya karena takut naik.'
                    : 'Ramalan datar atau turun. Tidak ada alasan menimbun lebih banyak dari kebutuhan.',
              }}
            />

            <PriceStat
              label="Harga impas menimbun"
              value={formatIDR(k.HargaImpas)}
              unit="/kg"
              purpose="Batas harga yang harus dilewati agar borong 2 minggu baru untung."
              tone="waspada"
              penjelasan={{
                guna: 'Ini ambang keputusannya. Bila harga pekan depan diperkirakan MELEBIHI angka ini, borong 2 minggu jadi lebih murah. Bila di bawahnya, belanja mingguan menang.',
                sumber: `Dihitung dari selisih bobot kotor kedua skenario dan harga hari ini. Kenaikan yang dibutuhkan: ${formatPct(k.KenaikanImpas)}.`,
                rumus: `${formatIDRShort(data.harga_sekarang)} × (${formatNumber(k.KgBorong, 2)} − ${formatNumber(k.KgMinggu1, 2)}) ÷ ${formatNumber(k.KgMinggu1, 2)} = ${formatIDRShort(k.HargaImpas)}`,
                aksi: `Harapan pekan depan ${formatIDRShort(k.HargaHarapanDepan)} ${
                  k.HargaHarapanDepan > k.HargaImpas ? 'sudah melewati' : 'masih di bawah'
                } ambang ini, sehingga sistem memilih ${
                  k.MingguDibeli === 2 ? 'borong 2 minggu' : 'belanja mingguan'
                }.`,
              }}
            />

            <PriceStat
              label="Nilai belanja hari ini"
              value={formatIDR(nilaiBelanja)}
              purpose="Uang tunai yang perlu Anda bawa ke pasar hari ini."
              tone="gelap"
              size="lg"
              penjelasan={{
                guna: 'Jumlah uang yang harus disiapkan untuk transaksi hari ini, sesuai kilogram yang direkomendasikan.',
                sumber: 'Kilogram rekomendasi dikali harga pasar hari ini.',
                rumus: `${formatNumber(k.KgDibeli, 1)} kg × ${formatIDRShort(data.harga_sekarang)}/kg = ${formatIDRShort(nilaiBelanja)}`,
                aksi: `Bawa uang setidaknya sebesar ini. Bila pedagang menawar di atas ${formatIDRShort(data.harga_sekarang * 1.1)}/kg, tunda dan cek lapak lain.`,
              }}
            />
          </div>
        </section>
      </Reveal>

      {/* ── 4. Perbandingan skenario ───────────────────────────────────── */}
      <Reveal delay={120}>
        <PerbandinganSkenario data={data} />
      </Reveal>

      {/* ── 5. Peta ambang impas ───────────────────────────────────────── */}
      <Reveal delay={150}>
        <PetaAmbang data={data} />
      </Reveal>

      {/* ── 6. Risiko keputusan ────────────────────────────────────────── */}
      <Reveal delay={180}>
        <section>
          <SectionHead
            eyebrow="Risiko keputusan"
            title="Seberapa besar kemungkinan rekomendasi ini meleset"
            desc="Rekomendasi ini bukan ramalan pasti. Dua angka berikut menyatakan seberapa sering keputusan seperti ini keliru, dan berapa rupiah paling banyak yang bisa hilang bila memang keliru."
          />
          <div className="grid gap-3 sm:grid-cols-3">
            <PriceStat
              label="Peluang keputusan meleset"
              value={k.PeluangRugi < 0.001 ? '< 0,1%' : formatPct(k.PeluangRugi * 100)}
              purpose={
                k.MingguDibeli === 1
                  ? 'Peluang harga pekan depan melonjak melewati ambang impas.'
                  : 'Peluang harga pekan depan justru turun di bawah ambang impas.'
              }
              tone={k.PeluangRugi > 0.35 ? 'bahaya' : k.PeluangRugi > 0.2 ? 'waspada' : 'baik'}
              penjelasan={{
                guna: 'Menakar seberapa yakin sistem pada rekomendasinya. Semakin kecil, semakin aman mengikuti anjuran ini.',
                sumber:
                  'Sebaran lognormal dicocokkan pada kuantil ramalan 7 hari (P10–P50–P90), lalu dihitung peluang harga melewati harga impas.',
                rumus: `P(harga pekan depan > ${formatIDRShort(k.HargaImpas)}) = ${
                  k.PeluangRugi < 0.001 ? '< 0,1%' : formatPct(k.PeluangRugi * 100)
                }`,
                aksi:
                  k.PeluangRugi > 0.3
                    ? 'Peluangnya cukup besar. Pertimbangkan membeli sedikit di atas rekomendasi bila kas Anda longgar.'
                    : 'Peluangnya kecil. Ikuti rekomendasi apa adanya, jangan menambah stok karena cemas.',
              }}
            />
            <PriceStat
              label="Kerugian maksimal bila meleset"
              value={k.RugiMaksimal > 0 ? formatIDR(k.RugiMaksimal) : 'Rp 0'}
              purpose="Batas atas kerugian pada skenario terburuk yang masuk akal."
              tone={k.RugiMaksimal > 0 ? 'waspada' : 'baik'}
              penjelasan={{
                guna: 'Memberi batas kerugian terburuk agar Anda bisa menilai apakah risikonya sanggup ditanggung usaha Anda.',
                sumber:
                  k.MingguDibeli === 1
                    ? 'Selisih biaya bila pekan depan harga menyentuh batas atas ramalan (P90), dibandingkan bila hari ini borong 2 minggu.'
                    : 'Selisih biaya bila pekan depan harga jatuh ke batas bawah ramalan (P10), dibandingkan bila belanja mingguan.',
                rumus:
                  k.RugiMaksimal > 0
                    ? `Skenario P90 ${formatIDRShort(data.p7_90)}/kg → selisih ${formatIDRShort(k.RugiMaksimal)}`
                    : 'Pada batas ramalan terburuk pun skenario ini masih lebih murah, sehingga kerugiannya nol.',
                aksi:
                  k.RugiMaksimal > 0
                    ? 'Siapkan cadangan kas sebesar angka ini agar operasional tetap aman bila harga melonjak.'
                    : 'Tidak ada cadangan tambahan yang perlu disiapkan untuk risiko ini.',
              }}
            />
            <PriceStat
              label="Potensi penghematan"
              value={formatIDR(k.PotensiHemat)}
              purpose={
                k.MingguDibeli === 1
                  ? 'Uang yang Anda hindari buang dengan tidak memborong 2 minggu.'
                  : 'Uang yang dihemat dengan memborong 2 minggu sekarang.'
              }
              tone="baik"
              penjelasan={{
                guna: 'Menunjukkan nilai konkret dari mengikuti rekomendasi, dibanding mengambil skenario satunya.',
                sumber: 'Selisih total biaya dua skenario pengadaan untuk cakupan waktu yang sama (2 minggu).',
                rumus: `${formatIDRShort(Math.max(k.BiayaBorong, k.BiayaMingguan))} − ${formatIDRShort(
                  Math.min(k.BiayaBorong, k.BiayaMingguan)
                )} = ${formatIDRShort(k.PotensiHemat)}`,
                aksi: 'Catat angka ini di log belanja Anda; akumulasinya adalah penghematan riil usaha selama sebulan.',
              }}
            />
          </div>
        </section>
      </Reveal>

      {/* ── 7. Kurva susut stok ────────────────────────────────────────── */}
      <Reveal delay={210}>
        <KurvaStok
          kgDibeli={k.KgDibeli}
          D={D}
          decay={simpan.decay}
          shelfLife={simpan.shelfLife}
          minggu={k.MingguDibeli}
          simpanLabel={simpan.short}
        />
      </Reveal>

      {/* ── 8. Dasar perhitungan terbuka ───────────────────────────────── */}
      <Reveal delay={240}>
        <FormulaCard
          title="Dasar perhitungan terbuka"
          steps={[
            {
              label: 'Bobot kotor pekan ke-1 — agar sisa bersihnya tetap cukup',
              expr: `D ÷ (1 − s)^3,5  =  ${formatNumber(D, 0)} ÷ (1 − ${k.LajuSusutHarian})^3,5`,
              result: `${formatNumber(k.KgMinggu1, 2)} kg`,
              note: `Pangkat 3,5 adalah umur rata-rata stok selama sepekan. Tambahan ${formatNumber(k.MarginKg, 2)} kg di atas pemakaian ${formatNumber(D, 0)} kg adalah margin yang akan hilang karena susut.`,
            },
            {
              label: 'Bobot kotor pekan ke-2 bila diborong hari ini',
              expr: `D ÷ (1 − s)^10,5  =  ${formatNumber(D, 0)} ÷ (1 − ${k.LajuSusutHarian})^10,5`,
              result: `${formatNumber(k.KgMinggu2, 2)} kg`,
              note: 'Stok pekan kedua menunggu lebih lama di dapur, sehingga margin susutnya jauh lebih besar.',
            },
            {
              label: 'Total biaya bila belanja tiap minggu',
              expr: `${formatNumber(k.KgMinggu1, 2)} × ${formatIDRShort(data.harga_sekarang)} + ${formatNumber(k.KgMinggu1, 2)} × ${formatIDRShort(k.HargaHarapanDepan)}`,
              result: formatIDR(k.BiayaMingguan),
              note: 'Beli seminggu sekarang, lalu beli seminggu lagi pekan depan pada harga ramalan.',
            },
            {
              label: 'Total biaya bila borong 2 minggu sekaligus',
              expr: `${formatNumber(k.KgBorong, 2)} × ${formatIDRShort(data.harga_sekarang)}`,
              result: formatIDR(k.BiayaBorong),
              note: k.BorongTerkunci
                ? k.AlasanKunci
                : 'Semua dibeli pada harga hari ini, tetapi menanggung susut yang jauh lebih besar.',
            },
            {
              label: 'Keputusan akhir — pilih ekspektasi biaya terendah',
              expr: `k* = argmin { ${formatIDRShort(k.BiayaMingguan)} ; ${formatIDRShort(k.BiayaBorong)} }   syarat 7k ≤ L (${k.UmurSimpanHari} hari)`,
              result: `${k.MingguDibeli} minggu → beli ${formatNumber(k.KgDibeli, 1)} kg`,
              note: `Selisihnya ${formatIDR(k.PotensiHemat)}.`,
            },
          ]}
        />
      </Reveal>
    </div>
  );
}

/* ─────────────────────────── Kartu keputusan ─────────────────────────── */

function KartuKeputusan({
  kg,
  minggu,
  D,
  margin,
  nilaiBelanja,
  harga,
  komoditas,
  tanggalBeliLagi,
  simpanLabel,
  decay,
  shelfLife,
}: {
  kg: number;
  minggu: number;
  D: number;
  margin: number;
  nilaiBelanja: number;
  harga: number;
  komoditas: string;
  tanggalBeliLagi: string;
  simpanLabel: string;
  decay: number;
  shelfLife: number;
}) {
  const pctBersih = (D / kg) * 100;

  return (
    <section className="relative overflow-hidden rounded-[32px] border border-[#A5D6A7] bg-gradient-to-br from-[#1B5E20] via-[#2E7D32] to-[#0D3311] p-7 text-white">
      <div className="hairline-grid pointer-events-none absolute inset-0 opacity-[0.12]" />
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#66BB6A] opacity-25 blur-3xl anim-float" />

      <div className="relative">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#66BB6A]/50 bg-[#0D3311]/50 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#A5D6A7]">
          <CircleCheck className="h-3.5 w-3.5" />
          Keputusan hari ini
        </span>

        <h2 className="mt-4 font-display text-4xl font-black leading-[1.05] md:text-5xl">
          Beli{' '}
          <span className="text-[#D3BE6D]">
            <CountUp to={kg} decimals={1} /> kg
          </span>{' '}
          {komoditas.toLowerCase()} hari ini
        </h2>

        <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#C8E6C9]">
          Jumlah ini menutup pemakaian dapur Anda selama{' '}
          <strong className="text-white">{minggu} minggu</strong> — yaitu{' '}
          <strong className="text-white">{formatNumber(D * minggu, 0)} kg</strong> yang benar-benar
          terpakai, ditambah <strong className="text-white">{formatNumber(margin, 2)} kg</strong>{' '}
          cadangan karena sebagian bahan pasti menyusut di penyimpanan{' '}
          {simpanLabel.toLowerCase()}. Belanja berikutnya dijadwalkan{' '}
          <strong className="text-white">{formatTanggal(tanggalBeliLagi)}</strong>.
        </p>

        {/* Rantai turunan angka */}
        <div className="mt-6 flex flex-wrap items-center gap-2.5">
          <RantaiKotak
            label="Pemakaian Anda"
            value={`${formatNumber(D, 0)} kg`}
            sub="dari pendaftaran"
          />
          <ArrowRight className="h-4 w-4 shrink-0 text-[#66BB6A]" />
          <RantaiKotak
            label="Margin susut"
            value={`+ ${formatNumber(margin, 2)} kg`}
            sub={`${formatPct(decay * 100, 1)}/hari × 3,5 hari`}
          />
          <ArrowRight className="h-4 w-4 shrink-0 text-[#66BB6A]" />
          <RantaiKotak
            label="Dibeli hari ini"
            value={`${formatNumber(kg, 1)} kg`}
            sub={formatIDR(nilaiBelanja)}
            emphasise
          />
        </div>

        {/* Batang komposisi */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#8FBF8F]">
            <span>Isi kantong belanja Anda</span>
            <span className="font-mono">{formatNumber(kg, 1)} kg total</span>
          </div>
          <div className="mt-2 flex h-9 overflow-hidden rounded-2xl border border-[#66BB6A]/40">
            <div
              className="flex items-center justify-center bg-[#66BB6A] text-[11px] font-bold text-[#0D3311] transition-[width] duration-1000"
              style={{ width: `${pctBersih}%`, transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)' }}
            >
              {formatNumber(D * minggu, 0)} kg terpakai
            </div>
            <div
              className="flex items-center justify-center bg-[repeating-linear-gradient(45deg,rgba(224,90,63,0.75),rgba(224,90,63,0.75)_6px,transparent_6px,transparent_12px)] text-[11px] font-bold text-white transition-[width] duration-1000"
              style={{ width: `${100 - pctBersih}%` }}
            >
              {formatNumber(margin, 1)} kg
            </div>
          </div>
          <p className="mt-2 text-xs text-[#A5D6A7]">
            Bagian bergaris adalah bobot yang akan hilang karena penguapan dan pembusukan — bukan
            pemborosan, melainkan cadangan yang memang harus dibeli agar dapur tidak kekurangan.
          </p>
        </div>

        {/* Catatan umur simpan */}
        <div className="mt-5 flex flex-wrap items-center gap-2 rounded-2xl bg-[#0D3311]/60 px-4 py-3">
          <Wallet className="h-4 w-4 shrink-0 text-[#D3BE6D]" />
          <p className="text-sm leading-relaxed text-[#C8E6C9]">
            Bawa <strong className="font-mono text-white">{formatIDR(nilaiBelanja)}</strong> ke pasar
            — {formatNumber(kg, 1)} kg × {formatIDR(harga)}/kg. Habiskan stok ini dalam{' '}
            {7 * minggu} hari; batas aman metode simpan Anda {shelfLife} hari.
          </p>
        </div>
      </div>
    </section>
  );
}

function RantaiKotak({
  label,
  value,
  sub,
  emphasise = false,
}: {
  label: string;
  value: string;
  sub: string;
  emphasise?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl px-4 py-3 ${
        emphasise ? 'bg-[#D3BE6D] text-[#3A3113]' : 'bg-white/10 text-white'
      }`}
    >
      <p
        className={`text-[10px] font-bold uppercase tracking-wider ${
          emphasise ? 'text-[#6B5A1E]' : 'text-[#8FBF8F]'
        }`}
      >
        {label}
      </p>
      <p className="mt-0.5 font-mono text-lg font-black leading-none">{value}</p>
      <p className={`mt-1 text-[11px] ${emphasise ? 'text-[#6B5A1E]' : 'text-[#A5D6A7]'}`}>{sub}</p>
    </div>
  );
}

/* ────────────────────── Perbandingan dua skenario ────────────────────── */

function PerbandinganSkenario({ data }: { data: ProcurementResponse }) {
  const k = data.keputusan;
  const maks = Math.max(k.BiayaMingguan, k.BiayaBorong) || 1;
  const mingguanMenang = k.MingguDibeli === 1;

  const baris = [
    {
      nama: 'Belanja mingguan',
      sub: 'Beli 1 minggu sekarang, 1 minggu lagi pekan depan',
      kg: k.KgMinggu1 * 2,
      biaya: k.BiayaMingguan,
      menang: mingguanMenang,
      terkunci: false,
    },
    {
      nama: 'Borong 2 minggu',
      sub: k.BorongTerkunci
        ? 'Tidak dinilai — melebihi umur simpan dapur Anda'
        : 'Semua dibeli hari ini pada harga sekarang',
      kg: k.KgBorong,
      biaya: k.BiayaBorong,
      menang: !mingguanMenang && !k.BorongTerkunci,
      terkunci: k.BorongTerkunci,
    },
  ];

  return (
    <section>
      <SectionHead
        eyebrow="Panel A · Perbandingan total biaya"
        title="Dua cara belanja, cakupan waktu yang sama"
        desc="Keduanya sama-sama menutup kebutuhan dapur selama 2 minggu. Yang berbeda hanya kapan Anda membayarnya dan berapa banyak bahan yang keburu busuk sebelum sempat dipakai."
      />

      <div className="space-y-3">
        {baris.map((b) => (
          <div
            key={b.nama}
            className={`rounded-3xl border p-5 transition-all duration-500 ${
              b.menang
                ? 'border-[#1B5E20] bg-[#E8F5E9] shadow-[0_20px_44px_-30px_rgba(27,94,32,0.9)]'
                : b.terkunci
                  ? 'border-[#D9D9D9] bg-[#F4F4F2] opacity-80'
                  : 'border-[#A5D6A7]/70 bg-white'
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-lg font-bold text-[#0D3311]">{b.nama}</h3>
                  {b.menang && (
                    <span className="rounded-full bg-[#1B5E20] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                      Dipilih sistem
                    </span>
                  )}
                  {b.terkunci && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#EDE7D5] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#8A7420]">
                      <TriangleAlert className="h-3 w-3" /> Terkunci
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-[#4B6149]">{b.sub}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-2xl font-black text-[#0D3311]">{formatIDR(b.biaya)}</p>
                <p className="font-mono text-xs text-[#6B7F69]">
                  {formatNumber(b.kg, 2)} kg dibeli total
                </p>
              </div>
            </div>

            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#E8F5E9]">
              <div
                className={`h-full rounded-full transition-[width] duration-1000 ${
                  b.menang ? 'bg-[#1B5E20]' : 'bg-[#A5D6A7]'
                }`}
                style={{
                  width: `${(b.biaya / maks) * 100}%`,
                  transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-start gap-3 rounded-3xl border border-[#D3BE6D]/60 bg-[#FBF6E4] p-5">
        <ArrowDown className="mt-0.5 h-5 w-5 shrink-0 text-[#B9A24F]" />
        <p className="text-sm leading-relaxed text-[#6B5A1E]">
          Selisihnya <strong className="font-mono">{formatIDR(k.PotensiHemat)}</strong>. Borong
          terlihat praktis karena harganya dikunci hari ini, tetapi Anda harus membeli{' '}
          <strong className="font-mono">{formatNumber(k.KgBorong - k.KgMinggu1 * 2, 2)} kg</strong>{' '}
          lebih banyak hanya untuk menutup bahan yang akan membusuk selama menunggu dipakai.
        </p>
      </div>
    </section>
  );
}

/* ────────────────────────── Peta ambang impas ────────────────────────── */

function PetaAmbang({ data }: { data: ProcurementResponse }) {
  const k = data.keputusan;
  const [hover, setHover] = useState<string | null>(null);

  const titik = useMemo(() => {
    const lo = Math.min(data.p7_10, data.harga_sekarang) * 0.97;
    const hi = Math.max(data.p7_90, k.HargaImpas) * 1.03;
    const span = hi - lo || 1;
    const pos = (v: number) => ((v - lo) / span) * 100;
    return { lo, hi, pos };
  }, [data, k]);

  const impasDiLuar = k.HargaImpas > data.p7_90;

  const penanda = [
    { id: 'now', label: 'Harga hari ini', v: data.harga_sekarang, warna: '#1B5E20', atas: true },
    { id: 'p10', label: 'Batas bawah ramalan (P10)', v: data.p7_10, warna: '#66BB6A', atas: false },
    { id: 'p50', label: 'Ramalan tengah (P50)', v: data.p7_50, warna: '#2E7D32', atas: false },
    { id: 'p90', label: 'Batas atas ramalan (P90)', v: data.p7_90, warna: '#D3BE6D', atas: false },
    { id: 'impas', label: 'Harga impas menimbun', v: k.HargaImpas, warna: '#E05A3F', atas: true },
  ];

  return (
    <section>
      <SectionHead
        eyebrow="Panel B · Ambang keputusan"
        title="Mengapa sistem memilih skenario ini"
        desc="Garis di bawah adalah rentang harga pekan depan menurut model. Bila ambang impas (merah) berada di luar rentang itu, artinya harga hampir mustahil naik cukup tinggi untuk membuat penimbunan menguntungkan."
      />

      <div className="rounded-3xl border border-[#A5D6A7]/70 bg-white p-6">
        <div className="relative h-[132px]">
          {/* Pita rentang P10–P90 */}
          <div className="absolute inset-x-0 top-[58px] h-4 rounded-full bg-[#F1F7F1]" />
          <div
            className="absolute top-[58px] h-4 rounded-full bg-gradient-to-r from-[#A5D6A7] via-[#66BB6A] to-[#D3BE6D] transition-all duration-1000"
            style={{
              left: `${titik.pos(data.p7_10)}%`,
              width: `${titik.pos(data.p7_90) - titik.pos(data.p7_10)}%`,
              transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)',
            }}
          />

          {penanda.map((p) => {
            const left = Math.max(0, Math.min(100, titik.pos(p.v)));
            const aktif = hover === p.id;
            return (
              <button
                key={p.id}
                onMouseEnter={() => setHover(p.id)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(p.id)}
                onBlur={() => setHover(null)}
                className="absolute top-0 h-full -translate-x-1/2 cursor-help"
                style={{ left: `${left}%` }}
                aria-label={`${p.label}: ${formatIDR(p.v)}`}
              >
                <span
                  className="absolute top-[52px] h-7 w-[3px] -translate-x-1/2 rounded-full transition-all duration-300"
                  style={{ background: p.warna, transform: aktif ? 'scaleY(1.35)' : undefined }}
                />
                <span
                  className={`absolute w-[104px] -translate-x-1/2 text-center transition-all duration-300 ${
                    p.atas ? 'top-1' : 'bottom-1'
                  }`}
                  style={{ opacity: aktif || !hover ? 1 : 0.35 }}
                >
                  <span className="block font-mono text-[11px] font-bold" style={{ color: p.warna }}>
                    {formatIDRShort(p.v)}
                  </span>
                  <span className="mt-0.5 block text-[9px] font-bold uppercase leading-tight tracking-wide text-[#7A8C78]">
                    {p.label}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div
          className={`mt-3 flex items-start gap-3 rounded-2xl p-4 ${
            impasDiLuar ? 'bg-[#E8F5E9]' : 'bg-[#FBF6E4]'
          }`}
        >
          <span className="mt-0.5 shrink-0">
            {impasDiLuar ? (
              <CircleCheck className="h-5 w-5 text-[#1B5E20]" />
            ) : (
              <TriangleAlert className="h-5 w-5 text-[#B9A24F]" />
            )}
          </span>
          <p
            className={`text-sm leading-relaxed ${
              impasDiLuar ? 'text-[#1B5E20]' : 'text-[#6B5A1E]'
            }`}
          >
            {impasDiLuar ? (
              <>
                Ambang impas <strong className="font-mono">{formatIDR(k.HargaImpas)}</strong> berada
                di <strong>luar</strong> batas atas ramalan{' '}
                <strong className="font-mono">{formatIDR(data.p7_90)}</strong>. Harga perlu naik{' '}
                <strong>{formatPct(k.KenaikanImpas)}</strong> dalam sepekan agar menimbun impas —
                jauh di luar yang diperkirakan model. Karena itu belanja mingguan dipilih.
              </>
            ) : (
              <>
                Ambang impas <strong className="font-mono">{formatIDR(k.HargaImpas)}</strong> masih{' '}
                <strong>di dalam</strong> rentang ramalan. Ada kemungkinan nyata harga melewatinya,
                jadi selisih kedua skenario tipis. Perhatikan juga peluang meleset di bawah sebelum
                memutuskan.
              </>
            )}
          </p>
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {[
            {
              l: 'P10 — skenario murah',
              v: data.p7_10,
              d: 'Hanya 10% kemungkinan harga turun di bawah ini.',
            },
            {
              l: 'P50 — skenario tengah',
              v: data.p7_50,
              d: 'Titik tengah; peluang di atas dan di bawahnya sama besar.',
            },
            {
              l: 'P90 — skenario mahal',
              v: data.p7_90,
              d: 'Hanya 10% kemungkinan harga naik melebihi ini.',
            },
          ].map((x) => (
            <div key={x.l} className="rounded-2xl bg-[#F3FAF4] p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#2E7D32]">
                  {x.l}
                </p>
                <InfoPop
                  judul={x.l}
                  isi={{
                    guna: 'Menyatakan rentang kemungkinan harga pekan depan, bukan satu tebakan tunggal. Rentang inilah yang dibandingkan dengan ambang impas.',
                    sumber:
                      'Kuantil hasil Filtered Historical Simulation pada horizon 7 hari, diskalakan volatilitas 30 hari komoditas ini.',
                    rumus: `P = harga hari ini × exp(q × σ × √7) = ${formatIDRShort(x.v)}`,
                    aksi: x.d,
                  }}
                />
              </div>
              <p className="mt-1.5 font-mono text-lg font-bold text-[#0D3311]">{formatIDR(x.v)}</p>
              <p className="mt-1 text-xs leading-relaxed text-[#4B6149]">{x.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── Kurva stok dapur ─────────────────────────── */

function KurvaStok({
  kgDibeli,
  D,
  decay,
  shelfLife,
  minggu,
  simpanLabel,
}: {
  kgDibeli: number;
  D: number;
  decay: number;
  shelfLife: number;
  minggu: number;
  simpanLabel: string;
}) {
  const hari = 7 * minggu;
  const pakaiHarian = D / 7;

  // Stok berkurang karena dua sebab sekaligus: dipakai memasak dan menyusut.
  const kurva = useMemo(() => {
    const out: { hari: number; sisa: number; tanpaSusut: number }[] = [];
    let stok = kgDibeli;
    let ideal = kgDibeli;
    for (let d = 0; d <= hari; d++) {
      out.push({ hari: d, sisa: Math.max(0, stok), tanpaSusut: Math.max(0, ideal) });
      stok = Math.max(0, stok - pakaiHarian) * (1 - decay);
      ideal = Math.max(0, ideal - pakaiHarian);
    }
    return out;
  }, [kgDibeli, hari, pakaiHarian, decay]);

  const W = 640;
  const H = 190;
  const pad = 30;
  const toX = (d: number) => pad + (d / hari) * (W - pad * 2);
  const toY = (v: number) => H - pad - (v / kgDibeli) * (H - pad * 2);
  const path = (key: 'sisa' | 'tanpaSusut') =>
    kurva.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(p.hari).toFixed(1)} ${toY(p[key]).toFixed(1)}`).join(' ');

  const sisaAkhir = kurva[kurva.length - 1].sisa;

  return (
    <section>
      <SectionHead
        eyebrow="Panel C · Perjalanan stok"
        title={`Bagaimana ${formatNumber(kgDibeli, 1)} kg ini habis dalam ${hari} hari`}
        desc={`Garis gelap adalah stok nyata di dapur ${simpanLabel.toLowerCase()} Anda: berkurang karena dimasak, sekaligus menyusut ${formatPct(decay * 100, 1)} setiap hari. Garis putus-putus adalah kondisi ideal seandainya tidak ada susut sama sekali.`}
      />

      <div className="rounded-3xl border border-[#A5D6A7]/70 bg-white p-6">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Kurva sisa stok harian">
          <defs>
            <linearGradient id="stok-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#66BB6A" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#66BB6A" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {[0, 0.25, 0.5, 0.75, 1].map((g) => (
            <g key={g}>
              <line
                x1={pad}
                x2={W - pad}
                y1={toY(kgDibeli * g)}
                y2={toY(kgDibeli * g)}
                stroke="#E8F5E9"
                strokeWidth="1.2"
              />
              <text x={4} y={toY(kgDibeli * g) + 3} fill="#9AAE98" fontSize="9" fontWeight="700">
                {formatNumber(kgDibeli * g, 1)}
              </text>
            </g>
          ))}

          <path
            d={`${path('sisa')} L ${toX(hari)} ${H - pad} L ${toX(0)} ${H - pad} Z`}
            fill="url(#stok-grad)"
          />
          <path
            d={path('tanpaSusut')}
            fill="none"
            stroke="#A5D6A7"
            strokeWidth="2"
            strokeDasharray="6 5"
          />
          <path
            d={path('sisa')}
            fill="none"
            stroke="#1B5E20"
            strokeWidth="3"
            strokeLinecap="round"
            className="anim-draw"
            style={{ '--dash': 1600 } as React.CSSProperties}
          />

          {/* Penanda batas umur simpan */}
          {shelfLife <= hari && (
            <g>
              <line
                x1={toX(shelfLife)}
                x2={toX(shelfLife)}
                y1={pad - 12}
                y2={H - pad}
                stroke="#E05A3F"
                strokeWidth="2"
                strokeDasharray="6 5"
              />
              <text x={toX(shelfLife) + 6} y={pad - 4} fill="#A6301C" fontSize="10" fontWeight="700">
                batas simpan {shelfLife} hari
              </text>
            </g>
          )}

          {[0, 7, 14].filter((d) => d <= hari).map((d) => (
            <text key={d} x={toX(d)} y={H - 8} fill="#7A8C78" fontSize="10" fontWeight="700" textAnchor="middle">
              hari {d}
            </text>
          ))}
        </svg>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-[#E8F5E9] p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#2E7D32]">
              Dipakai memasak
            </p>
            <p className="mt-1 font-mono text-lg font-bold text-[#1B5E20]">
              {formatNumber(D * minggu, 1)} kg
            </p>
            <p className="mt-1 text-xs text-[#4B6149]">
              ±{formatNumber(pakaiHarian, 2)} kg per hari sesuai pemakaian rutin Anda.
            </p>
          </div>
          <div className="rounded-2xl bg-[#FDECEA] p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#A6301C]">
              Hilang karena susut
            </p>
            <p className="mt-1 font-mono text-lg font-bold text-[#A6301C]">
              {formatNumber(Math.max(0, kgDibeli - D * minggu - sisaAkhir), 2)} kg
            </p>
            <p className="mt-1 text-xs text-[#7E2416]">
              Menguap dan membusuk selama menunggu giliran dipakai.
            </p>
          </div>
          <div className="rounded-2xl bg-[#FBF6E4] p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A7420]">
              Sisa di hari ke-{hari}
            </p>
            <p className="mt-1 font-mono text-lg font-bold text-[#8A7420]">
              {formatNumber(sisaAkhir, 2)} kg
            </p>
            <p className="mt-1 text-xs text-[#6B5A1E]">
              Mendekati nol berarti takaran belanjanya pas — tidak kurang, tidak menumpuk.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

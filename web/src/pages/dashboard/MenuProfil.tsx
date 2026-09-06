import { useState, useEffect } from 'react';
import {
  Store,
  Pencil,
  Check,
  X,
  Scale,
  Snowflake,
  MapPin,
  UtensilsCrossed,
  Sprout,
  TriangleAlert,
  Loader2,
} from 'lucide-react';
import type { UmkmProfile, StorageMethod } from '../../lib/profile';
import { STORAGE_METHODS, storageOf } from '../../lib/profile';
import { fetchMetadata } from '../../lib/api';
import type { MetadataResponse } from '../../lib/api';
import { auth } from '../../lib/auth';
import { formatPct } from '../../lib/format';
import { InfoPop, SectionHead } from '../../components/dashboard/ui';
import Select from '../../components/ui/Select';
import { Reveal } from '../../components/motion/Reveal';

// KATEGORI removed in favor of dynamic metadata

export default function MenuProfil({
  profile,
  onChange,
}: {
  profile: UmkmProfile;
  onChange: (p: UmkmProfile) => void;
}) {
  const [edit, setEdit] = useState(false);
  const [draft, setDraft] = useState<UmkmProfile>(profile);
  const [menyimpan, setMenyimpan] = useState(false);
  const [pesan, setPesan] = useState('');
  const [metadata, setMetadata] = useState<MetadataResponse | null>(null);

  useEffect(() => {
    fetchMetadata().then(setMetadata).catch(console.error);
  }, []);

  const simpan = storageOf(profile.storage_method);

  const mulaiEdit = () => {
    setDraft(profile);
    setPesan('');
    setEdit(true);
  };

  const batal = () => {
    setDraft(profile);
    setEdit(false);
    setPesan('');
  };

  const simpanPerubahan = async () => {
    setMenyimpan(true);
    setPesan('');

    // Laju susut selalu mengikuti metode simpan agar tidak pernah bertentangan.
    const bersih: UmkmProfile = {
      ...draft,
      daily_decay_rate: metadata?.storage_methods.find(s => s.id === draft.storage_method)?.daily_decay_rate ?? STORAGE_METHODS[draft.storage_method]?.decay ?? 0.015,
      commodities: draft.commodities.length > 0 ? draft.commodities : (metadata?.commodities.length ? [{ name: metadata.commodities[0].name, weekly_consumption_kg: 5 }] : []),
    };

    try {
      await auth.fetchAuth('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({
          business_name: bersih.business_name,
          fnb_category: bersih.fnb_category,
          reference_market: bersih.reference_market,
          commodities: bersih.commodities,
          storage_method: bersih.storage_method,
        }),
      });

      onChange(bersih);
      setEdit(false);
      setPesan('Perubahan tersimpan. Seluruh rekomendasi dihitung ulang.');
    } catch (err) {
      setPesan(`Gagal menyimpan: ${(err as Error).message}`);
    } finally {
      setMenyimpan(false);
    }
  };

  const toggleKomoditas = (k: string) => {
    setDraft((d) => ({
      ...d,
      commodities: d.commodities.some((x) => x.name === k)
        ? d.commodities.filter((x) => x.name !== k)
        : [...d.commodities, { name: k, weekly_consumption_kg: 5 }],
    }));
  };

  const ubahKonsumsi = (k: string, kg: number) => {
    setDraft((d) => ({
      ...d,
      commodities: d.commodities.map((x) => (x.name === k ? { ...x, weekly_consumption_kg: kg } : x)),
    }));
  };

  return (
    <div className="space-y-7">
      {/* ── Kepala profil ──────────────────────────────────────────────── */}
      <Reveal>
        <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#1B5E20] via-[#2E7D32] to-[#0D3311] p-7 text-white">
          <div className="hairline-grid pointer-events-none absolute inset-0 opacity-[0.12]" />
          <div className="pointer-events-none absolute -right-14 -top-14 h-56 w-56 rounded-full bg-[#66BB6A] opacity-25 blur-3xl anim-float" />

          <div className="relative flex flex-wrap items-start justify-between gap-5">
            <div className="flex items-start gap-4">
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-3xl bg-[#0D3311] text-[#D3BE6D]">
                <Store className="h-8 w-8" />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A5D6A7]">
                  Profil usaha terdaftar
                </p>
                <h2 className="mt-1.5 font-display text-3xl font-black leading-tight">
                  {profile.business_name}
                </h2>
                <p className="mt-1.5 text-sm text-[#C8E6C9]">
                  {profile.fnb_category} · belanja rutin di {profile.reference_market}
                </p>
              </div>
            </div>

            {!edit && (
              <button
                onClick={mulaiEdit}
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#D3BE6D] px-5 py-2.5 text-sm font-bold text-[#3A3113] transition-transform duration-300 hover:-translate-y-0.5"
              >
                <Pencil className="h-4 w-4" /> Edit data usaha
              </button>
            )}
          </div>

          <p className="relative mt-5 max-w-3xl rounded-2xl bg-white/10 p-4 text-sm leading-relaxed text-[#C8E6C9]">
            Tiga nilai utama di halaman ini — metode simpan, daftar komoditas beserta pemakaian mingguan, dan
            pasar acuan — adalah masukan yang dipakai seluruh dasbor. Setiap kali Anda
            mengubahnya, rekomendasi kilogram, anggaran bulanan, dan simulasi susut ikut dihitung ulang.
          </p>
        </section>
      </Reveal>

      {pesan && (
        <div
          className={`rounded-2xl border p-4 text-sm font-semibold ${
            pesan.startsWith('Gagal')
              ? 'border-[#E7B4A6] bg-[#FDECEA] text-[#7E2416]'
              : 'border-[#A5D6A7] bg-[#E8F5E9] text-[#1B5E20]'
          }`}
        >
          {pesan}
        </div>
      )}

      {edit ? (
        /* ── Mode edit ──────────────────────────────────────────────── */
        <Reveal>
          <section className="rounded-[32px] border border-[#A5D6A7]/70 bg-white p-6">
            <SectionHead
              eyebrow="Ubah data"
              title="Perbarui parameter usaha Anda"
              desc="Nilai laju susut tidak diisi manual — ia mengikuti metode simpan yang Anda pilih, persis seperti saat pendaftaran."
            />

            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Nama usaha">
                <input
                  value={draft.business_name}
                  onChange={(e) => setDraft({ ...draft, business_name: e.target.value })}
                  className="w-full rounded-2xl border border-[#A5D6A7] bg-[#F8FCF8] px-4 py-3 text-sm font-semibold text-[#0D3311] outline-none transition-colors focus:border-[#1B5E20] focus:ring-4 focus:ring-[#66BB6A]/20"
                />
              </Field>

              <Field label="Kategori F&B" bare>
                <Select
                  value={draft.fnb_category}
                  onChange={(v) => setDraft({ ...draft, fnb_category: v })}
                  ariaLabel="Kategori F&B"
                  icon={<UtensilsCrossed className="h-4 w-4" />}
                  placeholder="Pilih kategori"
                  options={(metadata?.categories ?? []).map((k) => ({
                    value: k.name,
                    label: k.name,
                  }))}
                />
              </Field>

              <Field label="Pasar acuan belanja" bare>
                <Select
                  value={draft.reference_market}
                  onChange={(v) => setDraft({ ...draft, reference_market: v })}
                  ariaLabel="Pasar acuan belanja"
                  icon={<MapPin className="h-4 w-4" />}
                  placeholder="Pilih pasar"
                  options={(metadata?.markets ?? []).map((m) => ({
                    value: m.name,
                    label: m.name,
                    hint: m.region,
                  }))}
                />
              </Field>


            </div>

            <div className="mt-6">
              <p className="text-sm font-bold text-[#0D3311]">Metode penyimpanan dapur</p>
              <p className="mt-1 text-xs text-[#6B7F69]">
                Pilihan ini menentukan laju susut dan batas umur simpan yang dipakai seluruh
                perhitungan.
              </p>
              <div className="mt-3 space-y-2.5">
                {metadata?.storage_methods.map((m) => {
                  const on = draft.storage_method === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setDraft({ ...draft, storage_method: m.id as StorageMethod, daily_decay_rate: m.daily_decay_rate })}
                      className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-all duration-300 ${
                        on
                          ? 'border-[#1B5E20] bg-[#E8F5E9]'
                          : 'border-[#A5D6A7]/70 bg-white hover:border-[#66BB6A]'
                      }`}
                    >
                      <span
                        className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition-colors ${
                          on ? 'border-[#1B5E20] bg-[#1B5E20]' : 'border-[#A5D6A7]'
                        }`}
                      >
                        {on && <Check className="h-3 w-3 text-white" />}
                      </span>
                      <span>
                        <span className="block text-sm font-bold text-[#0D3311]">
                          {m.icon} {m.label}
                        </span>
                        <span className="mt-0.5 block font-mono text-xs text-[#4B6149]">
                          Laju susut {formatPct(m.daily_decay_rate * 100, 1)}/hari · batas simpan {m.shelf_life_days}{' '}
                          hari
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm font-bold text-[#0D3311]">Komoditas rutin</p>
              <p className="mt-1 text-xs text-[#6B7F69]">
                Hanya komoditas terpilih yang muncul di pemilih komoditas pada bilah atas.
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                {metadata?.commodities.map((k) => {
                  const on = draft.commodities.some(x => x.name === k.name);
                  const cons = draft.commodities.find(x => x.name === k.name)?.weekly_consumption_kg || 5;
                  return (
                    <div key={k.id} className={`flex items-center gap-2 rounded-2xl border p-2 pl-3 transition-colors ${on ? 'border-[#1B5E20] bg-[#E8F5E9]' : 'border-[#A5D6A7] bg-white'}`}>
                      <label className="flex cursor-pointer items-center gap-2">
                        <input type="checkbox" checked={on} onChange={() => toggleKomoditas(k.name)} className="accent-[#1B5E20]" />
                        <span className={`text-xs font-bold ${on ? 'text-[#1B5E20]' : 'text-[#4B6149]'}`}>{k.name}</span>
                      </label>
                      {on && (
                        <div className="flex items-center gap-1 border-l border-[#A5D6A7] pl-3">
                          <input 
                            type="number" 
                            min={0.1} 
                            step={0.1}
                            value={cons} 
                            onChange={e => ubahKonsumsi(k.name, Number(e.target.value))}
                            className="w-16 rounded bg-white px-2 py-1 text-xs font-bold outline-none ring-1 ring-[#A5D6A7] focus:ring-[#1B5E20]" 
                          />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#1B5E20]">Kg</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {draft.commodities.length === 0 && (
                <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-[#A6301C]">
                  <TriangleAlert className="h-3.5 w-3.5" /> Pilih minimal satu komoditas.
                </p>
              )}
            </div>

            {/* Pratinjau dampak */}
            <div className="mt-6 rounded-2xl bg-[#FBF6E4] p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A7420]">
                Dampak perubahan
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-[#6B5A1E]">
                Dengan metode {STORAGE_METHODS[draft.storage_method].short.toLowerCase()}, setiap 
                kilogram bahan rata-rata perlu dibeli ekstra <strong className="font-mono">
                  {formatPct(
                    (1 / Math.pow(1 - STORAGE_METHODS[draft.storage_method].decay, 3.5)) * 100 - 100,
                    1
                  )}
                </strong>{' '}
                sebagai margin susut mingguan. Batas simpan maksimal adalah{' '}
                {STORAGE_METHODS[draft.storage_method].shelfLife} hari.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 border-t border-[#E8F5E9] pt-5">
              <button
                onClick={simpanPerubahan}
                disabled={menyimpan || draft.commodities.length === 0}
                className="inline-flex items-center gap-2 rounded-full bg-[#1B5E20] px-6 py-3 text-sm font-bold text-white transition-transform duration-300 hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-50"
              >
                {menyimpan ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Menyimpan…
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" /> Simpan perubahan
                  </>
                )}
              </button>
              <button
                onClick={batal}
                className="inline-flex items-center gap-2 rounded-full border border-[#A5D6A7] px-6 py-3 text-sm font-bold text-[#1B5E20] transition-colors hover:bg-[#E8F5E9]"
              >
                <X className="h-4 w-4" /> Batal
              </button>
            </div>
          </section>
        </Reveal>
      ) : (
        /* ── Mode tampilan ──────────────────────────────────────────── */
        <>
          <Reveal delay={60}>
            <section>
              <SectionHead
                eyebrow="Identitas usaha"
                title="Data yang Anda isi saat mendaftar"
                desc="Bagian ini menentukan konteks pasar dan jenis masakan yang dipakai sistem saat menyusun saran resep."
              />
              <div className="grid gap-3 md:grid-cols-3">
                <KartuData
                  ikon={<Store className="h-5 w-5" />}
                  label="Nama usaha"
                  nilai={profile.business_name}
                  penjelasan={{
                    guna: 'Dipakai sebagai identitas pada seluruh laporan dan saran yang ditampilkan.',
                    sumber: 'Langkah 2 formulir pendaftaran — Identitas Usaha UMKM.',
                  }}
                />
                <KartuData
                  ikon={<UtensilsCrossed className="h-5 w-5" />}
                  label="Kategori F&B"
                  nilai={profile.fnb_category}
                  penjelasan={{
                    guna: 'Menentukan gaya saran resep pada sinyal substitusi, misalnya olahan sambal untuk kedai geprek.',
                    sumber: 'Langkah 2 formulir pendaftaran.',
                  }}
                />
                <KartuData
                  ikon={<MapPin className="h-5 w-5" />}
                  label="Pasar acuan"
                  nilai={profile.reference_market}
                  penjelasan={{
                    guna: 'Menjadi acuan saat Anda membandingkan harga sistem dengan harga yang benar-benar Anda temui.',
                    sumber: 'Langkah 2 formulir pendaftaran.',
                    aksi: 'Bila harga di pasar Anda konsisten berbeda jauh, pertimbangkan mengganti pasar acuan.',
                  }}
                />
              </div>
            </section>
          </Reveal>

          <Reveal delay={90}>
            <section>
              <SectionHead
                eyebrow="Kalibrasi dapur"
                title="Angka yang menggerakkan seluruh perhitungan"
                desc="Empat nilai berikut masuk langsung ke rumus pengadaan. Perubahan sekecil apa pun di sini mengubah rekomendasi kilogram di menu pertama."
              />
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">

                <KartuData
                  ikon={<Snowflake className="h-5 w-5" />}
                  label="Metode simpan"
                  nilai={simpan.short}
                  penjelasan={{
                    guna: 'Menentukan laju susut dan batas umur simpan — dua parameter yang menentukan boleh atau tidaknya menimbun.',
                    sumber: 'Langkah 3 formulir pendaftaran — Metode Penyimpanan Dapur.',
                    aksi: 'Naik satu tingkat metode simpan biasanya memangkas kerugian susut lebih besar daripada tawar-menawar harga.',
                  }}
                />
                <KartuData
                  ikon={<Sprout className="h-5 w-5" />}
                  label="Laju susut (s)"
                  nilai={`${formatPct(profile.daily_decay_rate * 100, 1)} / hari`}
                  penjelasan={{
                    guna: 'Fraksi bobot yang hilang tiap hari. Dipakai untuk menghitung margin belanja dan kerugian susut.',
                    sumber: `Diturunkan otomatis dari metode simpan ${simpan.short.toLowerCase()} yang Anda pilih, bukan diisi manual.`,
                    rumus: `Sisa hari ke-n = bobot awal × (1 − ${profile.daily_decay_rate})^n`,
                  }}
                />
                <KartuData
                  ikon={<Snowflake className="h-5 w-5" />}
                  label="Batas umur simpan (L)"
                  nilai={`${simpan.shelfLife} hari`}
                  penjelasan={{
                    guna: 'Pagar keputusan: sistem tidak boleh menyarankan borong 2 minggu bila L kurang dari 14 hari.',
                    sumber: `Standar metode simpan ${simpan.short.toLowerCase()}.`,
                    rumus: 'Syarat: 7 × k ≤ L',
                    aksi:
                      simpan.shelfLife < 14
                        ? 'Dengan batas ini, borong 2 minggu selalu ditolak sistem demi keamanan mutu bahan.'
                        : 'Batas ini cukup untuk mempertimbangkan borong 2 minggu bila harga memang menguntungkan.',
                  }}
                />
              </div>
            </section>
          </Reveal>

          <Reveal delay={120}>
            <section>
              <SectionHead
                eyebrow="Komoditas rutin"
                title={`${profile.commodities.length} komoditas dipantau untuk usaha Anda`}
                desc="Hanya komoditas ini yang muncul di pemilih pada bilah atas dan ikut dihitung dalam rekomendasi harian."
              />
              <div className="flex flex-wrap gap-2.5">
                {profile.commodities.map((k) => (
                  <span
                    key={k.name}
                    className="inline-flex items-center gap-2 rounded-2xl border border-[#A5D6A7] bg-white px-4 py-3 text-sm font-bold text-[#0D3311]"
                  >
                    <span className="flex items-center justify-center h-5 w-5 rounded bg-[#E8F5E9] text-[#1B5E20]">
                      <Scale className="h-3 w-3" />
                    </span>
                    {k.name}
                    <span className="text-[#6B7F69] font-mono text-xs ml-1 border-l border-[#A5D6A7] pl-2">{k.weekly_consumption_kg} kg/mg</span>
                  </span>
                ))}
              </div>
            </section>
          </Reveal>

          <Reveal delay={150}>
            <button
              onClick={mulaiEdit}
              className="inline-flex items-center gap-2 rounded-full bg-[#1B5E20] px-6 py-3.5 text-sm font-bold text-white transition-transform duration-300 hover:-translate-y-0.5"
            >
              <Pencil className="h-4 w-4" /> Ubah data komoditas & kalibrasi dapur
            </button>
          </Reveal>
        </>
      )}
    </div>
  );
}

/* ─────────────────────────── Potongan UI ─────────────────────────── */

function Field({
  label,
  hint,
  children,
  /** Dropdown kustom memakai <button>, yang bukan kontrol berlabel — pembungkusnya
      harus <div> agar klik pada teks label tidak diteruskan ke tombol. */
  bare = false,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  bare?: boolean;
}) {
  const Bungkus = bare ? 'div' : 'label';
  return (
    <Bungkus className="block">
      <span className="block text-sm font-bold text-[#0D3311]">{label}</span>
      {hint && <span className="mt-0.5 block text-xs text-[#6B7F69]">{hint}</span>}
      <span className="mt-2 block">{children}</span>
    </Bungkus>
  );
}

function KartuData({
  ikon,
  label,
  nilai,
  penjelasan,
}: {
  ikon: React.ReactNode;
  label: string;
  nilai: string;
  penjelasan: Parameters<typeof InfoPop>[0]['isi'];
}) {
  return (
    <div className="rounded-3xl border border-[#A5D6A7]/70 bg-white p-5 transition-shadow duration-300 hover:shadow-[0_20px_40px_-30px_rgba(13,51,17,0.8)]">
      <div className="flex items-start justify-between gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-2xl bg-[#E8F5E9] text-[#1B5E20]">
          {ikon}
        </span>
        <InfoPop judul={label} isi={penjelasan} />
      </div>
      <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-[#7A8C78]">{label}</p>
      <p className="mt-1 font-display text-lg font-bold leading-tight text-[#0D3311]">{nilai}</p>
    </div>
  );
}

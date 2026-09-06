import { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarClock, ChevronLeft, ChevronRight } from 'lucide-react';
import Select from './Select';

const BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];
const HARI = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

/** `YYYY-MM-DD` → bagian tanggal, tanpa melewati zona waktu peramban. */
function urai(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return { y: y || 2026, m: (m || 1) - 1, d: d || 1 };
}

function rakit(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/** Perbandingan leksikografis aman karena format ISO selalu berpanjang tetap. */
function dalamRentang(iso: string, min?: string, max?: string) {
  if (min && iso < min) return false;
  if (max && iso > max) return false;
  return true;
}

function labelPanjang(iso: string) {
  const { y, m, d } = urai(iso);
  return `${d} ${BULAN[m]} ${y}`;
}

function labelPendek(iso: string) {
  const { y, m, d } = urai(iso);
  return `${d} ${BULAN[m].slice(0, 3)} ${y}`;
}

/**
 * Pemilih tanggal kustom.
 *
 * `<input type="date">` menampilkan kalender bawaan sistem operasi yang tidak
 * bisa diberi warna maupun sudut membulat, sehingga terlihat asing di antara
 * komponen lain. Versi ini memakai palet yang sama dengan dasbor dan landing,
 * lengkap dengan pemilih bulan dan tahun agar rentang data bertahun-tahun tetap
 * dapat dijangkau dengan cepat.
 */
export default function DateField({
  value,
  onChange,
  min,
  max,
  ariaLabel = 'Tanggal acuan',
  className = '',
  compact = false,
}: {
  value: string;
  onChange: (iso: string) => void;
  min?: string;
  max?: string;
  ariaLabel?: string;
  className?: string;
  /** Bentuk pil ringkas untuk bilah atas dasbor. */
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const awal = urai(value);
  const [lihat, setLihat] = useState({ y: awal.y, m: awal.m });
  const wrap = useRef<HTMLDivElement | null>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);

  /* Kalender selalu dibuka pada bulan tanggal yang sedang dipilih. */
  const buka = () => {
    const v = urai(value);
    setLihat({ y: v.y, m: v.m });
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const tahunOpsi = useMemo(() => {
    const dari = min ? urai(min).y : lihat.y - 6;
    const sampai = max ? urai(max).y : lihat.y + 6;
    const out = [];
    for (let y = sampai; y >= dari; y--) out.push({ value: String(y), label: String(y) });
    return out;
  }, [min, max, lihat.y]);

  const bulanOpsi = useMemo(
    () => BULAN.map((b, i) => ({ value: String(i), label: b })),
    []
  );

  /* Kisi 6×7: hari kosong di awal disesuaikan agar pekan dimulai Senin. */
  const sel = useMemo(() => {
    const pertama = new Date(lihat.y, lihat.m, 1);
    const geser = (pertama.getDay() + 6) % 7;
    const jumlah = new Date(lihat.y, lihat.m + 1, 0).getDate();
    const out: (number | null)[] = Array(geser).fill(null);
    for (let d = 1; d <= jumlah; d++) out.push(d);
    while (out.length % 7 !== 0) out.push(null);
    return out;
  }, [lihat]);

  const geserBulan = (arah: -1 | 1) => {
    setLihat((v) => {
      const m = v.m + arah;
      if (m < 0) return { y: v.y - 1, m: 11 };
      if (m > 11) return { y: v.y + 1, m: 0 };
      return { y: v.y, m };
    });
  };

  /* Panah bulan dimatikan begitu seluruh bulan berikutnya di luar rentang. */
  const bulanSebelumnyaAda = !min || rakit(lihat.y, lihat.m, 1) > min;
  const akhirBulan = new Date(lihat.y, lihat.m + 1, 0).getDate();
  const bulanBerikutnyaAda = !max || rakit(lihat.y, lihat.m, akhirBulan) < max;

  return (
    <div ref={wrap} className={`relative ${className}`}>
      <button
        ref={trigger}
        type="button"
        onClick={() => (open ? setOpen(false) : buka())}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`${ariaLabel}: ${labelPanjang(value)}`}
        className={`group flex items-center gap-2.5 border bg-white text-left outline-none transition-all duration-300 ${
          compact
            ? 'rounded-2xl px-3.5 py-2.5 text-sm font-bold text-[#0D3311]'
            : 'w-full rounded-2xl px-4 py-3.5 text-sm font-semibold text-[#0D3311]'
        } ${
          open
            ? 'border-[#1B5E20] ring-4 ring-[#66BB6A]/25'
            : 'border-[#A5D6A7] hover:border-[#66BB6A] focus-visible:border-[#1B5E20] focus-visible:ring-4 focus-visible:ring-[#66BB6A]/25'
        }`}
      >
        <CalendarClock
          className={`h-4 w-4 shrink-0 transition-colors duration-300 ${
            open ? 'text-[#1B5E20]' : 'text-[#7A8C78] group-hover:text-[#2E7D32]'
          }`}
        />
        <span className="flex-1 truncate">{compact ? labelPendek(value) : labelPanjang(value)}</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={ariaLabel}
          className="anim-pop-in pop-layer absolute right-0 top-[calc(100%+0.4rem)] w-[19.5rem] rounded-[26px] border border-[#A5D6A7] bg-white p-4 shadow-[0_32px_70px_-26px_rgba(13,51,17,0.6)]"
          style={{ transformOrigin: 'top right' }}
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => geserBulan(-1)}
              disabled={!bulanSebelumnyaAda}
              aria-label="Bulan sebelumnya"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#E8F5E9] text-[#1B5E20] transition-colors hover:bg-[#A5D6A7] disabled:opacity-35 disabled:hover:bg-[#E8F5E9]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <Select
              value={String(lihat.m)}
              onChange={(v) => setLihat((s) => ({ ...s, m: Number(v) }))}
              options={bulanOpsi}
              variant="chip"
              ariaLabel="Bulan"
              className="min-w-0 flex-1"
            />
            <Select
              value={String(lihat.y)}
              onChange={(v) => setLihat((s) => ({ ...s, y: Number(v) }))}
              options={tahunOpsi}
              variant="chip"
              ariaLabel="Tahun"
              align="end"
            />

            <button
              type="button"
              onClick={() => geserBulan(1)}
              disabled={!bulanBerikutnyaAda}
              aria-label="Bulan berikutnya"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#E8F5E9] text-[#1B5E20] transition-colors hover:bg-[#A5D6A7] disabled:opacity-35 disabled:hover:bg-[#E8F5E9]"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1 text-center">
            {HARI.map((h) => (
              <span key={h} className="text-[10px] font-bold uppercase tracking-wider text-[#9AAE98]">
                {h}
              </span>
            ))}
          </div>

          <div className="mt-1.5 grid grid-cols-7 gap-1">
            {sel.map((d, i) => {
              if (d === null) return <span key={`k-${i}`} />;
              const iso = rakit(lihat.y, lihat.m, d);
              const bisa = dalamRentang(iso, min, max);
              const aktif = iso === value;
              return (
                <button
                  key={iso}
                  type="button"
                  disabled={!bisa}
                  aria-current={aktif ? 'date' : undefined}
                  onClick={() => {
                    onChange(iso);
                    setOpen(false);
                    trigger.current?.focus();
                  }}
                  className={`grid h-9 place-items-center rounded-xl font-mono text-[13px] font-bold transition-all duration-200 ${
                    aktif
                      ? 'scale-105 bg-[#1B5E20] text-white shadow-[0_10px_22px_-12px_rgba(27,94,32,1)]'
                      : bisa
                        ? 'text-[#31462F] hover:bg-[#E8F5E9] hover:text-[#0D3311]'
                        : 'cursor-not-allowed text-[#C4D3C2]'
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>

          {max && (
            <button
              type="button"
              onClick={() => {
                onChange(max);
                setOpen(false);
                trigger.current?.focus();
              }}
              className="mt-3 w-full rounded-xl border border-[#A5D6A7] bg-[#F3FAF4] py-2.5 text-xs font-bold text-[#1B5E20] transition-colors hover:border-[#66BB6A] hover:bg-[#E8F5E9]"
            >
              Lompat ke data terbaru — {labelPendek(max)}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

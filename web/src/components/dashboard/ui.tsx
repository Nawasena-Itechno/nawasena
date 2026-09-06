import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Info, X, Target, Database, ArrowRight, Sigma } from 'lucide-react';
import { useLockBody } from '../motion/hooks';

/* ─────────────────────────── Penjelasan angka ─────────────────────────── */

export interface Penjelasan {
  /** Untuk apa angka ini dipakai pengguna. */
  guna: string;
  /** Dari mana angkanya berasal — data, input pendaftaran, atau rumus. */
  sumber: string;
  /** Rumus dengan angka nyata yang sedang tampil, bila ada. */
  rumus?: string;
  /** Tindakan konkret yang sebaiknya diambil pengguna. */
  aksi?: string;
}

export function InfoPop({ judul, isi }: { judul: string; isi: Penjelasan }) {
  const [open, setOpen] = useState(false);
  const [left, setLeft] = useState<number | null>(null);
  const wrap = useRef<HTMLSpanElement | null>(null);
  const pop = useRef<HTMLSpanElement | null>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open) return;
    const margin = 12;
    const reposition = () => {
      const btnRect = wrap.current?.getBoundingClientRect();
      const popWidth = pop.current?.offsetWidth;
      if (!btnRect || !popWidth) return;
      const center = btnRect.left + btnRect.width / 2;
      const maxLeft = window.innerWidth - margin - popWidth;
      const idealLeft = center - popWidth / 2;
      const clampedLeft = Math.min(Math.max(idealLeft, margin), Math.max(margin, maxLeft));
      setLeft(clampedLeft - btnRect.left);
    };
    reposition();
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);
    return () => {
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition, true);
    };
  }, [open]);

  return (
    <span ref={wrap} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={id}
        aria-label={`Penjelasan ${judul}`}
        className={`grid h-6 w-6 place-items-center rounded-full transition-colors ${
          open
            ? 'bg-[#1B5E20] text-white'
            : 'bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#A5D6A7] hover:text-[#0D3311]'
        }`}
      >
        <Info className="h-3.5 w-3.5" />
      </button>

      {open && (
        <span
          ref={pop}
          id={id}
          role="tooltip"
          style={{ left: left ?? '50%', visibility: left === null ? 'hidden' : 'visible' }}
          className="anim-rise absolute top-8 z-50 w-[min(19rem,80vw)] rounded-2xl border border-[#A5D6A7] bg-white p-4 text-left shadow-[0_24px_50px_-20px_rgba(13,51,17,0.55)]"
        >
          <span className="mb-2 flex items-start justify-between gap-2">
            <span className="font-display text-sm font-bold text-[#0D3311]">{judul}</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Tutup penjelasan"
              className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#E8F5E9] text-[#4B6149]"
            >
              <X className="h-3 w-3" />
            </button>
          </span>

          <Baris ikon={<Target className="h-3.5 w-3.5" />} label="Untuk apa" teks={isi.guna} />
          <Baris ikon={<Database className="h-3.5 w-3.5" />} label="Asal angka" teks={isi.sumber} />
          {isi.rumus && (
            <span className="mt-2 block rounded-xl bg-[#0D3311] px-3 py-2 font-mono text-[11px] leading-relaxed text-[#C8E6C9]">
              {isi.rumus}
            </span>
          )}
          {isi.aksi && (
            <Baris
              ikon={<ArrowRight className="h-3.5 w-3.5" />}
              label="Tindakan"
              teks={isi.aksi}
              nada="emas"
            />
          )}
        </span>
      )}
    </span>
  );
}

function Baris({
  ikon,
  label,
  teks,
  nada = 'hijau',
}: {
  ikon: ReactNode;
  label: string;
  teks: string;
  nada?: 'hijau' | 'emas';
}) {
  return (
    <span className="mt-2 block">
      <span
        className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${
          nada === 'emas' ? 'text-[#8A7420]' : 'text-[#2E7D32]'
        }`}
      >
        {ikon}
        {label}
      </span>
      <span className="mt-0.5 block text-[13px] leading-relaxed text-[#31462F]">{teks}</span>
    </span>
  );
}

/* ─────────────────────────── Kartu angka ─────────────────────────── */

export function PriceStat({
  label,
  value,
  unit,
  purpose,
  penjelasan,
  tone = 'netral',
  size = 'md',
}: {
  label: string;
  value: string;
  unit?: string;
  /** Satu baris singkat: angka ini dipakai untuk apa. */
  purpose: string;
  penjelasan: Penjelasan;
  tone?: 'netral' | 'baik' | 'waspada' | 'bahaya' | 'gelap';
  size?: 'md' | 'lg';
}) {
  const tones = {
    netral: 'border-[#A5D6A7]/70 bg-white text-[#0D3311]',
    baik: 'border-[#A5D6A7] bg-[#E8F5E9] text-[#1B5E20]',
    waspada: 'border-[#D3BE6D]/60 bg-[#FBF6E4] text-[#8A7420]',
    bahaya: 'border-[#E7B4A6] bg-[#FDECEA] text-[#A6301C]',
    gelap: 'border-[#1B5E20] bg-[#0D3311] text-white',
  } as const;
  const isDark = tone === 'gelap';

  return (
    <div className={`rounded-3xl border p-5 transition-shadow duration-300 hover:shadow-[0_20px_40px_-30px_rgba(13,51,17,0.8)] ${tones[tone]}`}>
      <div className="flex items-start justify-between gap-2">
        <p
          className={`text-[10px] font-bold uppercase leading-tight tracking-wider ${
            isDark ? 'text-[#8FBF8F]' : 'opacity-70'
          }`}
        >
          {label}
        </p>
        <InfoPop judul={label} isi={penjelasan} />
      </div>

      <p
        className={`mt-2 font-mono font-black tracking-tight ${
          size === 'lg' ? 'text-3xl' : 'text-2xl'
        }`}
      >
        {value}
        {unit && <span className="ml-1 text-sm font-bold opacity-70">{unit}</span>}
      </p>

      <p
        className={`mt-1.5 text-xs leading-relaxed ${
          isDark ? 'text-[#A5D6A7]' : 'text-[#4B6149]'
        }`}
      >
        {purpose}
      </p>
    </div>
  );
}

/* ─────────────────────────── Judul seksi ─────────────────────────── */

export function SectionHead({
  eyebrow,
  title,
  desc,
  right,
}: {
  eyebrow?: string;
  title: string;
  desc?: string;
  right?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#2E7D32]">
            {eyebrow}
          </p>
        )}
        <h2 className="mt-1 font-display text-2xl font-black leading-tight text-[#0D3311]">
          {title}
        </h2>
        {desc && <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#4B6149]">{desc}</p>}
      </div>
      {right}
    </div>
  );
}

/* ─────────────────────────── Kartu rumus ─────────────────────────── */

export function FormulaCard({
  title,
  steps,
}: {
  title: string;
  steps: { label: string; expr: string; result: string; note?: string }[];
}) {
  return (
    <div className="rounded-3xl border border-[#A5D6A7]/70 bg-white p-5">
      <h3 className="flex items-center gap-2 font-display text-base font-bold text-[#0D3311]">
        <Sigma className="h-4 w-4 text-[#2E7D32]" />
        {title}
      </h3>
      <ol className="mt-4 space-y-2.5">
        {steps.map((s, i) => (
          <li key={s.label} className="rounded-2xl bg-[#F3FAF4] p-4">
            <div className="flex items-center gap-2">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#1B5E20] font-mono text-[11px] font-bold text-white">
                {i + 1}
              </span>
              <p className="text-sm font-bold text-[#0D3311]">{s.label}</p>
            </div>
            <p className="mt-2 overflow-x-auto whitespace-nowrap rounded-xl bg-[#0D3311] px-3 py-2 font-mono text-[11px] text-[#C8E6C9]">
              {s.expr}
            </p>
            <p className="mt-2 font-mono text-sm font-bold text-[#1B5E20]">= {s.result}</p>
            {s.note && <p className="mt-1 text-xs leading-relaxed text-[#4B6149]">{s.note}</p>}
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ─────────────────────────── Modal ─────────────────────────── */

export function Modal({
  open,
  onClose,
  title,
  eyebrow,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  children: ReactNode;
}) {
  useLockBody(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6">
      <button
        aria-label="Tutup"
        onClick={onClose}
        className="anim-fade absolute inset-0 bg-[#0D3311]/60 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="anim-rise relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[32px] bg-[#F8FCF8] shadow-[0_40px_90px_-30px_rgba(13,51,17,0.8)] sm:rounded-[32px]"
      >
        <div className="shrink-0 border-b border-[#A5D6A7]/60 bg-white px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              {eyebrow && (
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#2E7D32]">
                  {eyebrow}
                </p>
              )}
              <h3 className="mt-1 font-display text-xl font-black leading-tight text-[#0D3311]">
                {title}
              </h3>
            </div>
            <button
              onClick={onClose}
              aria-label="Tutup"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#E8F5E9] text-[#1B5E20] transition-colors hover:bg-[#A5D6A7]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">{children}</div>
      </div>
    </div>
  );
}

/* ─────────────────────────── Bilah basis perhitungan ─────────────────────────── */

export function BasisChip({
  icon,
  label,
  value,
  hint,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="flex items-start gap-2.5 rounded-2xl bg-white/10 px-3.5 py-2.5">
      <span className="mt-0.5 text-[#A5D6A7]">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#8FBF8F]">{label}</p>
        <p className="truncate text-sm font-bold text-white">{value}</p>
        {hint && <p className="text-[11px] text-[#A5D6A7]">{hint}</p>}
      </div>
    </div>
  );
}

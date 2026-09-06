import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Check, ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  /** Baris kedua kecil di bawah label — mis. wilayah pasar atau umur simpan. */
  hint?: string;
  /** Lencana kecil di sisi kanan, mis. emoji metode simpan. */
  badge?: ReactNode;
}

type Variant = 'field' | 'chip' | 'pill';

/**
 * Dropdown kustom Nawasena.
 *
 * Menggantikan `<select>` bawaan yang tampil mengikuti tema sistem operasi
 * (abu-abu, sudut tajam) dan tidak bisa diselaraskan dengan palet hijau situs.
 * Perilaku papan tik mengikuti pola listbox: panah untuk berpindah, Enter atau
 * Spasi untuk memilih, Escape untuk menutup, dan ketik-cepat untuk melompat.
 */
export default function Select({
  value,
  onChange,
  options,
  placeholder = 'Pilih…',
  icon,
  variant = 'field',
  ariaLabel,
  disabled = false,
  className = '',
  align = 'start',
}: {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  icon?: ReactNode;
  variant?: Variant;
  ariaLabel?: string;
  disabled?: boolean;
  className?: string;
  align?: 'start' | 'end';
}) {
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(-1);
  /** Panel dibalik ke atas bila ruang di bawah pemicu tidak cukup. */
  const [drop, setDrop] = useState<'down' | 'up'>('down');

  const wrap = useRef<HTMLDivElement | null>(null);
  const list = useRef<HTMLUListElement | null>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const ketik = useRef({ buffer: '', at: 0 });
  const listId = useId();

  const terpilih = useMemo(() => options.find((o) => o.value === value), [options, value]);
  const indexTerpilih = useMemo(() => options.findIndex((o) => o.value === value), [options, value]);

  const tutup = useCallback(() => {
    setOpen(false);
    setCursor(-1);
  }, []);

  /* Tutup saat klik di luar pemicu maupun panel. */
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) tutup();
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open, tutup]);

  /* Arah buka ditentukan dari ruang kosong di viewport saat dibuka. */
  const buka = () => {
    if (disabled) return;
    const r = trigger.current?.getBoundingClientRect();
    if (r) {
      const perlu = Math.min(options.length * 46 + 16, 288);
      setDrop(window.innerHeight - r.bottom < perlu && r.top > perlu ? 'up' : 'down');
    }
    setCursor(indexTerpilih >= 0 ? indexTerpilih : 0);
    setOpen(true);
  };

  /* Opsi yang sedang disorot selalu ditarik ke dalam pandangan. */
  useEffect(() => {
    if (!open || cursor < 0) return;
    const el = list.current?.children[cursor] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [open, cursor]);

  const pilih = (v: string) => {
    onChange(v);
    tutup();
    trigger.current?.focus();
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (!open) {
      if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
        e.preventDefault();
        buka();
      }
      return;
    }
    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        tutup();
        trigger.current?.focus();
        break;
      case 'ArrowDown':
        e.preventDefault();
        setCursor((c) => (c + 1) % options.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setCursor((c) => (c - 1 + options.length) % options.length);
        break;
      case 'Home':
        e.preventDefault();
        setCursor(0);
        break;
      case 'End':
        e.preventDefault();
        setCursor(options.length - 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (cursor >= 0 && options[cursor]) pilih(options[cursor].value);
        break;
      case 'Tab':
        tutup();
        break;
      default: {
        // Ketik-cepat: huruf yang diketik berdekatan digabung menjadi awalan.
        if (e.key.length !== 1) return;
        const now = Date.now();
        ketik.current.buffer = now - ketik.current.at > 700 ? e.key : ketik.current.buffer + e.key;
        ketik.current.at = now;
        const awalan = ketik.current.buffer.toLowerCase();
        const i = options.findIndex((o) => o.label.toLowerCase().startsWith(awalan));
        if (i >= 0) setCursor(i);
      }
    }
  };

  const gaya: Record<Variant, string> = {
    field:
      'w-full rounded-2xl border bg-white px-4 py-3.5 text-sm font-semibold text-[#0D3311] shadow-[0_1px_0_rgba(13,51,17,0.04)]',
    chip: 'rounded-2xl border bg-white px-3.5 py-2.5 text-sm font-bold text-[#0D3311]',
    pill: 'rounded-full border bg-white py-3 pl-4 pr-3 text-sm font-semibold text-[#25422A]',
  };

  return (
    <div ref={wrap} className={`relative ${variant === 'field' ? 'w-full' : ''} ${className}`}>
      <button
        ref={trigger}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? listId : undefined}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => (open ? tutup() : buka())}
        onKeyDown={onKey}
        className={`group flex items-center gap-2.5 text-left outline-none transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-55 ${
          gaya[variant]
        } ${
          open
            ? 'border-[#1B5E20] ring-4 ring-[#66BB6A]/25'
            : 'border-[#A5D6A7] hover:border-[#66BB6A] focus-visible:border-[#1B5E20] focus-visible:ring-4 focus-visible:ring-[#66BB6A]/25'
        }`}
      >
        {icon && (
          <span
            className={`shrink-0 transition-colors duration-300 ${
              open ? 'text-[#1B5E20]' : 'text-[#7A8C78] group-hover:text-[#2E7D32]'
            }`}
          >
            {icon}
          </span>
        )}

        <span className="min-w-0 flex-1 truncate">
          {terpilih ? (
            terpilih.label
          ) : (
            <span className="font-medium text-[#9AAE98]">{placeholder}</span>
          )}
        </span>

        {terpilih?.badge && <span className="shrink-0 text-base leading-none">{terpilih.badge}</span>}

        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform duration-300 ${
            open ? 'rotate-180 text-[#1B5E20]' : 'text-[#7A8C78]'
          }`}
        />
      </button>

      {open && (
        <ul
          ref={list}
          id={listId}
          role="listbox"
          aria-label={ariaLabel}
          tabIndex={-1}
          onKeyDown={onKey}
          className={`pop-layer absolute max-h-72 overflow-y-auto rounded-2xl border border-[#A5D6A7] bg-white p-1.5 shadow-[0_28px_60px_-24px_rgba(13,51,17,0.55)] ${
            align === 'end' ? 'right-0' : 'left-0'
          } ${variant === 'chip' ? 'min-w-[13rem]' : 'w-full'} ${
            drop === 'down'
              ? 'anim-pop-in top-[calc(100%+0.4rem)]'
              : 'anim-pop-up bottom-[calc(100%+0.4rem)]'
          }`}
          style={{ transformOrigin: drop === 'down' ? 'top center' : 'bottom center' }}
        >
          {options.length === 0 && (
            <li className="px-3 py-3 text-center text-xs font-semibold text-[#9AAE98]">
              Belum ada pilihan.
            </li>
          )}

          {options.map((o, i) => {
            const aktif = o.value === value;
            const sorot = i === cursor;
            return (
              <li
                key={o.value}
                role="option"
                aria-selected={aktif}
                onMouseEnter={() => setCursor(i)}
                onClick={() => pilih(o.value)}
                style={{ animationDelay: `${Math.min(i, 8) * 22}ms` }}
                className={`anim-rise flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 transition-colors duration-150 ${
                  aktif
                    ? 'bg-[#1B5E20] text-white'
                    : sorot
                      ? 'bg-[#E8F5E9] text-[#0D3311]'
                      : 'text-[#31462F]'
                }`}
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold leading-tight">{o.label}</span>
                  {o.hint && (
                    <span
                      className={`mt-0.5 block truncate text-[11px] leading-tight ${
                        aktif ? 'text-[#A5D6A7]' : 'text-[#7A8C78]'
                      }`}
                    >
                      {o.hint}
                    </span>
                  )}
                </span>
                {o.badge && <span className="shrink-0 text-base leading-none">{o.badge}</span>}
                {aktif && <Check className="anim-check h-4 w-4 shrink-0" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

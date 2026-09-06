import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { useScrollProgress } from './motion/hooks';

import LogoMark from '../assets/nawasena-logo-logo.svg';

const NAV = [
  { to: '/', label: 'Beranda', end: true },
  { to: '/ensiklopedia', label: 'Ensiklopedia' },
  { to: '/simulator', label: 'Simulator' },
  { to: '/metodologi', label: 'Metodologi' },
];

/**
 * `auto`  — transparan di puncak halaman (untuk halaman berhero gelap), lalu
 *           berubah terang saat digulir.
 * `solid` — selalu terang; dipakai halaman yang latarnya sudah terang di puncak.
 */
export default function SiteHeader({ variant = 'auto' }: { variant?: 'auto' | 'solid' }) {
  const { progress, scrollY } = useScrollProgress();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Tutup menu seluler setiap kali pindah halaman.
  useEffect(() => setOpen(false), [location.pathname]);

  const solid = variant === 'solid' || scrollY > 24;
  const onDark = !solid;

  return (
    <>
      {/* Indikator progres baca — ikut menegaskan sensasi scroll */}
      <div
        className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-[#1B5E20] via-[#66BB6A] to-[#D3BE6D]"
        style={{ transform: `scaleX(${progress})`, transition: 'transform 120ms linear' }}
      />

      <header
        className={`sticky top-0 z-50 transition-all duration-500 ${
          solid
            ? 'border-b border-[#A5D6A7]/60 bg-[#F8FCF8]/85 shadow-[0_10px_30px_-22px_rgba(13,51,17,0.6)] backdrop-blur-xl'
            : 'border-b border-transparent bg-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3.5 lg:px-8">
          <Link to="/" className="group flex items-center gap-3">
            <span
              className="relative flex h-10 w-10 items-center justify-center transition-transform duration-500 group-hover:-rotate-6"
            >
              <img src={LogoMark} alt="Logo Nawasena" className="h-full w-full object-contain drop-shadow-md" />
              <span
                className={`absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[#D3BE6D] ring-2 ${
                  onDark ? 'ring-[#0D3311]' : 'ring-[#F8FCF8]'
                }`}
              />
            </span>
            <span className="leading-none">
              <span
                className={`block font-display text-[22px] font-black tracking-tight ${
                  onDark ? 'text-white' : 'text-[#0D3311]'
                }`}
              >
                Nawasena
              </span>
              <span
                className={`mt-1 block text-[10px] font-bold uppercase tracking-[0.22em] ${
                  onDark ? 'text-[#A5D6A7]' : 'text-[#2E7D32]'
                }`}
              >
                Navigate Prices, Eliminate Waste
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className="relative rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-300"
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`relative z-10 ${
                        isActive
                          ? onDark
                            ? 'text-white'
                            : 'text-[#0D3311]'
                          : onDark
                            ? 'text-[#C8E6C9] hover:text-white'
                            : 'text-[#4B6149] hover:text-[#1B5E20]'
                      }`}
                    >
                      {item.label}
                    </span>
                    <span
                      className={`absolute inset-0 rounded-full transition-all duration-300 ${
                        onDark ? 'bg-white/12' : 'bg-[#E8F5E9]'
                      } ${isActive ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}
                    />
                    <span
                      className={`absolute -bottom-0.5 left-1/2 h-[3px] -translate-x-1/2 rounded-full bg-[#D3BE6D] transition-all duration-300 ${
                        isActive ? 'w-6' : 'w-0'
                      }`}
                    />
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <Link
              to="/login"
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                onDark
                  ? 'text-[#C8E6C9] hover:bg-white/10 hover:text-white'
                  : 'text-[#1B5E20] hover:bg-[#E8F5E9]'
              }`}
            >
              Masuk
            </Link>
            <Link
              to="/login"
              className={`group relative overflow-hidden rounded-full px-5 py-2.5 text-sm font-bold transition-transform duration-300 hover:-translate-y-0.5 ${
                onDark
                  ? 'bg-[#D3BE6D] text-[#3A3113] shadow-[0_12px_28px_-14px_rgba(211,190,109,0.95)]'
                  : 'bg-[#1B5E20] text-white shadow-[0_12px_28px_-14px_rgba(27,94,32,0.95)]'
              }`}
            >
              <span className="relative z-10 flex items-center gap-1.5">
                Daftarkan Usaha
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </Link>
          </div>

          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={open}
            className={`grid h-11 w-11 place-items-center rounded-2xl border transition-colors lg:hidden ${
              onDark
                ? 'border-white/25 bg-white/10 text-white'
                : 'border-[#A5D6A7] bg-white/80 text-[#1B5E20]'
            }`}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Panel navigasi seluler */}
        <div
          className={`overflow-hidden border-t bg-[#F8FCF8]/97 backdrop-blur-xl transition-all duration-500 lg:hidden ${
            open ? 'max-h-[420px] border-[#A5D6A7]/50 opacity-100' : 'max-h-0 border-transparent opacity-0'
          }`}
        >
          <div className="space-y-1 px-5 py-4">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `block rounded-2xl px-4 py-3 text-base font-semibold transition-colors ${
                    isActive ? 'bg-[#1B5E20] text-white' : 'text-[#25422A] hover:bg-[#E8F5E9]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <Link
              to="/login"
              className="mt-2 block rounded-2xl bg-[#D3BE6D] px-4 py-3 text-center text-base font-bold text-[#3A3113]"
            >
              Daftarkan Usaha UMKM
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}

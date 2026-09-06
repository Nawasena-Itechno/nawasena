import { Link } from 'react-router-dom';
import { Sprout, ArrowUpRight } from 'lucide-react';
import { DATA_DISCLAIMER } from '../data/commodities';

export default function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-[#0D3311] text-[#C8E6C9]">
      {/* Siluet lanskap sawah */}
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className="absolute inset-x-0 top-0 h-16 w-full text-[#E8F5E9]"
        aria-hidden="true"
      >
        <path
          d="M0,64 C 180,110 300,10 480,44 C 660,78 780,18 960,42 C 1140,66 1280,110 1440,72 L1440,0 L0,0 Z"
          fill="currentColor"
        />
      </svg>

      <div className="absolute -right-24 top-24 h-72 w-72 rounded-full bg-[#1B5E20] opacity-60 blur-3xl" />
      <div className="absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-[#2E7D32] opacity-40 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 pb-10 pt-28 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#66BB6A]">
                <Sprout className="h-6 w-6 text-[#0D3311]" />
              </span>
              <span className="font-display text-2xl font-black text-white">Nawasena</span>
            </div>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-[#A5D6A7]">
              Sistem pendukung keputusan pengadaan bahan pangan segar berbasis risiko susut dan
              volatilitas pasar. Dibangun untuk UMKM F&amp;B yang harus memutuskan berapa kilogram
              yang dibeli hari ini — bukan minggu depan.
            </p>
            <p className="mt-5 max-w-md rounded-2xl border border-[#1B5E20] bg-[#0A2A0D]/60 p-4 text-xs leading-relaxed text-[#8FBF8F]">
              {DATA_DISCLAIMER}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#D3BE6D]">Jelajahi</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[
                { to: '/', label: 'Beranda' },
                { to: '/ensiklopedia', label: 'Ensiklopedia Komoditas' },
                { to: '/simulator', label: 'Simulator Susut' },
                { to: '/metodologi', label: 'Metodologi & Rapor Model' },
              ].map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="group inline-flex items-center gap-1.5 text-[#C8E6C9] transition-colors hover:text-white"
                  >
                    {l.label}
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#D3BE6D]">
              Sumber Data
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-[#C8E6C9]">
              <li>PIHPS — Bank Indonesia</li>
              <li>Rilis Inflasi — BPS</li>
              <li>Open-Meteo (cuaca sentra tani)</li>
              <li>Kalender Nasional &amp; Hijriyah</li>
              <li>Foto komoditas: Wikimedia Commons &amp; Unsplash</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-[#1B5E20] pt-6 text-xs text-[#7FA982] md:flex-row">
          <p>© 2026 Tim Nawasena. Hak cipta dilindungi undang-undang.</p>
          <p>Disusun untuk kompetisi ITechno Cup 2026.</p>
        </div>
      </div>
    </footer>
  );
}

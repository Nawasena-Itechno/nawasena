import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Clock, ArrowRight } from 'lucide-react';
import type { Commodity } from '../data/types';
import { STORAGE_META } from '../data/types';
import {
  formatIDR,
  formatNumber,
  getStorage,
  priceSeries,
  VOLATILITY_STYLE,
} from '../data/commodities';
import CommodityArt from './CommodityArt';
import Sparkline from './Sparkline';
import { usePointerTilt } from './motion/hooks';

/** Umur simpan terpanjang di seluruh basis data, untuk menormalkan health bar. */
const MAX_SHELF = 365;

export default function CommodityCard({
  c,
  onOpen,
}: {
  c: Commodity;
  onOpen: (c: Commodity) => void;
}) {
  const series = useMemo(() => priceSeries(c), [c]);
  const style = VOLATILITY_STYLE[c.volatility];
  const best = getStorage(c, c.storage.best);
  const room = getStorage(c, 'room');
  const up = c.yoy >= 0;
  const { ref, style: tilt, pointer } = usePointerTilt<HTMLButtonElement>(7);

  // Skala logaritmik agar beras (365 hari) tidak membuat sawi (2 hari) tak terlihat.
  const health = Math.max(4, (Math.log(room.shelfLifeDays + 1) / Math.log(MAX_SHELF + 1)) * 100);

  return (
    <button
      ref={ref}
      onClick={() => onOpen(c)}
      style={tilt}
      className="group relative flex w-full flex-col overflow-hidden rounded-[26px] border border-[#A5D6A7]/60 bg-white text-left shadow-[0_18px_40px_-32px_rgba(13,51,17,0.9)] transition-[box-shadow,border-color] duration-500 hover:border-[#66BB6A] hover:shadow-[0_30px_60px_-34px_rgba(13,51,17,0.85)]"
      aria-label={`Buka detail ${c.name}`}
    >
      {/* Sorot mengikuti kursor */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(340px circle at ${pointer.x * 100}% ${pointer.y * 100}%, rgba(211,190,109,0.16), transparent 62%)`,
        }}
      />

      <div className="relative h-40 overflow-hidden">
        <CommodityArt
          art={c.art}
          photo={c.photo}
          alt={c.name}
          className="h-full w-full transition-transform duration-700 group-hover:scale-[1.08]"
        />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent" />

        <span
          className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full ${style.bg} ${style.text} px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm`}
        >
          <span className={`relative h-1.5 w-1.5 rounded-full ${style.dot} ${c.volatility === 'BERGEJOLAK' ? 'pulse-ring' : ''}`} />
          {style.label}
        </span>

        <span className="absolute right-3 top-3 rounded-full bg-white/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#4B6149] backdrop-blur">
          {c.emoji} {c.unit}
        </span>
      </div>

      <div className="relative z-10 flex flex-1 flex-col p-5 pt-1">
        <h3 className="font-display text-lg font-bold leading-tight text-[#0D3311]">{c.name}</h3>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#6B7F69]">{c.tagline}</p>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="font-mono text-xl font-bold tracking-tight text-[#1B5E20]">
              {formatIDR(c.price)}
            </p>
            <p
              className={`mt-0.5 flex items-center gap-1 text-xs font-bold ${
                up ? 'text-[#A6301C]' : 'text-[#2E7D32]'
              }`}
            >
              {up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              {up ? '+' : ''}
              {formatNumber(c.yoy)}% YoY
            </p>
          </div>
          <Sparkline
            values={series}
            stroke={up ? '#A6301C' : '#1B5E20'}
            fill={up ? '#E05A3F' : '#66BB6A'}
            width={112}
            height={38}
            className="w-28 shrink-0"
          />
        </div>

        {/* Health bar masa simpan */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#7A8C78]">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> Masa simpan suhu ruang
            </span>
            <span className="font-mono">{room.shelfLifeDays} hari</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#E8F5E9]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#E05A3F] via-[#D3BE6D] to-[#66BB6A] transition-[width] duration-1000"
              style={{ width: `${health}%` }}
            />
          </div>
          <p className="mt-1.5 text-[11px] text-[#6B7F69]">
            Terbaik: {STORAGE_META[c.storage.best].icon} {STORAGE_META[c.storage.best].short} —{' '}
            <span className="font-semibold text-[#1B5E20]">{best.shelfLifeDays} hari</span>
          </p>
        </div>

        <div className="mt-4 flex items-center gap-1.5 text-sm font-bold text-[#1B5E20]">
          Lihat detail
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </div>
    </button>
  );
}

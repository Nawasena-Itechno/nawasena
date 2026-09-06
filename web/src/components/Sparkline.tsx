import { useId } from 'react';
import { sparkPath } from '../data/commodities';

/** Grafik garis mikro tren harga 30 hari. */
export default function Sparkline({
  values,
  stroke = '#1B5E20',
  fill = '#66BB6A',
  width = 160,
  height = 44,
  animate = true,
  className = '',
}: {
  values: number[];
  stroke?: string;
  fill?: string;
  width?: number;
  height?: number;
  animate?: boolean;
  className?: string;
}) {
  const id = useId().replace(/:/g, '');
  const d = sparkPath(values, width, height, 4);
  const area = `${d} L ${width - 4} ${height} L 4 ${height} Z`;
  const last = values[values.length - 1];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const lastY = height - 4 - ((last - min) / (max - min || 1)) * (height - 8);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`g-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fill} stopOpacity="0.42" />
          <stop offset="100%" stopColor={fill} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#g-${id})`} />
      <path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={animate ? 'anim-draw' : ''}
        style={animate ? ({ '--dash': 600 } as React.CSSProperties) : undefined}
      />
      <circle cx={width - 4} cy={lastY} r="3.2" fill={stroke} />
      <circle cx={width - 4} cy={lastY} r="3.2" fill={stroke} opacity="0.35">
        <animate attributeName="r" values="3.2;8;3.2" dur="2.4s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.35;0;0.35" dur="2.4s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

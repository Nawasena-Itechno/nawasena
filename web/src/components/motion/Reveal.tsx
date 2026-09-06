import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

type Dir = 'up' | 'left' | 'right' | 'scale';

/**
 * Membungkus konten agar muncul dengan animasi saat masuk viewport.
 * Memakai IntersectionObserver — tanpa dependensi animasi eksternal.
 */
export function Reveal({
  children,
  dir = 'up',
  delay = 0,
  className = '',
  once = true,
  amount = 0.18,
  as: Tag = 'div',
}: {
  children: ReactNode;
  dir?: Dir;
  delay?: number;
  className?: string;
  once?: boolean;
  amount?: number;
  as?: 'div' | 'section' | 'li' | 'span';
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Hormati preferensi pengguna yang mematikan animasi.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) io.unobserve(el);
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold: amount, rootMargin: '0px 0px -8% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once, amount]);

  return (
    <Tag
      ref={ref as never}
      data-dir={dir}
      className={`reveal ${visible ? 'is-visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

/** Angka yang berhitung naik saat elemen terlihat. */
export function CountUp({
  to,
  duration = 1600,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
}: {
  to: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [value, setValue] = useState(0);
  const raf = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(to);
      return;
    }

    let sudahMulai = false;
    const run = () => {
      if (sudahMulai) return;
      sudahMulai = true;
      // Peramban menangguhkan requestAnimationFrame pada tab yang tersembunyi.
      // Tanpa jalur pintas ini, angka akan tertinggal di nol sampai tab dibuka.
      if (document.hidden) {
        setValue(to);
        return;
      }
      const t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - t0) / duration);
        // easeOutExpo
        const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
        setValue(to * eased);
        if (p < 1) raf.current = requestAnimationFrame(tick);
      };
      raf.current = requestAnimationFrame(tick);
    };

    const terlihat = () => {
      const r = el.getBoundingClientRect();
      return r.bottom > 0 && r.top < (window.innerHeight || 0);
    };

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) run();
      },
      { threshold: 0.25 }
    );
    io.observe(el);

    const onScroll = () => {
      if (terlihat()) run();
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // Elemen sebaris tidak selalu memicu IntersectionObserver di sebagian mesin
    // render, jadi posisinya juga diperiksa langsung — setelah tata letak
    // selesai (rAF), lalu sekali lagi sebagai pengaman. Tanpa ini angka penting
    // bisa tertinggal di nol padahal sudah tampak di layar.
    // Dua pemeriksaan berbasis timer, bukan rAF: peramban menangguhkan rAF,
    // scroll, dan IntersectionObserver pada tab tersembunyi, sedangkan timer
    // tetap berjalan. Yang pertama menang; sisanya ditahan oleh `sudahMulai`.
    const cekAwal = window.setTimeout(() => {
      if (terlihat()) run();
    }, 0);
    const pengaman = window.setTimeout(() => {
      if (terlihat()) run();
    }, 1200);

    // Bila tab sempat tersembunyi lalu dibuka, animasi dijalankan saat itu juga.
    const onVisible = () => {
      if (!document.hidden && terlihat()) run();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisible);
      window.clearTimeout(cekAwal);
      cancelAnimationFrame(raf.current);
      window.clearTimeout(pengaman);
    };
  }, [to, duration]);

  return (
    <span ref={ref} className={`inline-block ${className}`}>
      {prefix}
      {value.toLocaleString('id-ID', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}

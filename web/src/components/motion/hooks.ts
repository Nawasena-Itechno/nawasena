import { useEffect, useRef, useState } from 'react';

/** Progres scroll halaman 0..1 — dipakai untuk progress bar & parallax global. */
export function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setScrollY(window.scrollY);
        setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
        raf = 0;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return { progress, scrollY };
}

/**
 * Posisi relatif elemen terhadap viewport (-1 di bawah layar, 0 di tengah, 1 di atas).
 * Dipakai untuk menggeser layer parallax per-section.
 */
export function useParallax<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf = 0;
    const update = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        const center = rect.top + rect.height / 2;
        setOffset(Math.max(-1, Math.min(1, (vh / 2 - center) / (vh / 2 + rect.height / 2))));
        raf = 0;
      });
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return { ref, offset };
}

/** Posisi kursor ternormalisasi di dalam elemen, untuk efek tilt / spotlight. */
export function usePointerTilt<T extends HTMLElement>(strength = 10) {
  const ref = useRef<T | null>(null);
  const [style, setStyle] = useState<{ transform: string }>({ transform: '' });
  const [pointer, setPointer] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      setPointer({ x, y });
      setStyle({
        transform: `perspective(900px) rotateX(${(0.5 - y) * strength}deg) rotateY(${(x - 0.5) * strength}deg)`,
      });
    };
    const onLeave = () => {
      setPointer({ x: 0.5, y: 0.5 });
      setStyle({ transform: '' });
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [strength]);

  return { ref, style, pointer };
}

/** Mengunci scroll body saat drawer/modal terbuka. */
export function useLockBody(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [locked]);
}

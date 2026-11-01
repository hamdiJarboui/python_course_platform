import { useEffect } from 'react';

const SPOT = '.card, .toc-module, .stat, .search-results li, .hero-panel';

/**
 * Drives two CSS variables: `--scroll` (0..1, for the header beam) on <html>, and `--mx`/`--my`
 * (pointer position inside an element, for the card spotlight). Does nothing under reduced motion.
 */
export function useAmbientMotion(): void {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const root = document.documentElement;
    let frame = 0;

    const onScroll = (): void => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const max = root.scrollHeight - window.innerHeight;
        root.style.setProperty(
          '--scroll',
          max > 0 ? String(Math.min(1, window.scrollY / max)) : '0',
        );
        root.toggleAttribute('data-scrolled', window.scrollY > 8);
      });
    };

    const onMove = (e: PointerEvent): void => {
      if (!(e.target instanceof Element)) return;
      const el = e.target.closest<HTMLElement>(SPOT);
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    document.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      document.removeEventListener('pointermove', onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
}

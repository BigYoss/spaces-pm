import { useEffect } from "react";

/**
 * Parallax runs in CSS (scroll-driven animations, compositor only) wherever
 * `animation-timeline` is supported. This hook is the fallback for browsers
 * without it: one rAF-batched, transform-only update for sections in view.
 * Skipped entirely under prefers-reduced-motion.
 */
export function useParallax() {
  useEffect(() => {
    if (typeof CSS !== "undefined" && CSS.supports("animation-timeline: view()")) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"));
    const layers = new Map(sections.map((s) => [s, Array.from(s.querySelectorAll<HTMLElement>("[data-depth]"))]));
    const active = new Set<HTMLElement>();
    let frame = 0;
    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      active.forEach((s) => {
        const r = s.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height))); // 0 entering, 1 leaving
        for (const l of layers.get(s) ?? []) {
          const depth = Number(l.dataset.depth ?? 0);
          l.style.transform = `translate3d(0, ${((0.5 - p) * 2 * depth * 120).toFixed(1)}px, 0)`;
        }
      });
    };
    const request = () => { if (!frame) frame = requestAnimationFrame(update); };
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => (e.isIntersecting ? active.add(e.target as HTMLElement) : active.delete(e.target as HTMLElement)));
      request();
    }, { rootMargin: "20% 0px" });
    sections.forEach((s) => io.observe(s));
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
}

import { useEffect, useRef } from "react";

/**
 * Autoplaying, muted, seamlessly looping hero film with a poster for first
 * paint. React does not serialise `muted` during SSR, so it is enforced on
 * mount before play(). Reduced-motion visitors keep the still poster.
 */
export function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    v.muted = true;
    v.defaultMuted = true;
    const apply = () => {
      if (mq.matches) {
        v.pause();
        v.removeAttribute("autoplay");
      } else {
        void v.play().catch(() => {});
      }
    };
    const onVisibility = () => (document.hidden ? v.pause() : apply());
    apply();
    mq.addEventListener("change", apply);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      mq.removeEventListener("change", apply);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <video
      ref={ref}
      className="hero-video"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      poster="/assets/hero-poster.webp"
      aria-hidden="true"
      tabIndex={-1}
      disablePictureInPicture
    >
      <source src="/assets/hero-720.mp4" type="video/mp4" media="(max-width: 900px)" />
      <source src="/assets/hero-1080.mp4" type="video/mp4" />
    </video>
  );
}

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "@phosphor-icons/react/dist/ssr";

/**
 * Autoplaying, muted, seamlessly looping hero film with a poster for first
 * paint. React does not serialise `muted` during SSR, so it is enforced on
 * mount before play(). Reduced-motion visitors keep the still poster.
 * A pause/play button satisfies WCAG 2.2.2 (moving content longer than 5s);
 * the visitor's choice overrides the reduced-motion default.
 */
export function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const choice = useRef<"play" | "pause" | null>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    v.muted = true;
    v.defaultMuted = true;
    const apply = () => {
      const want = choice.current ?? (mq.matches ? "pause" : "play");
      if (want === "pause") {
        v.pause();
        v.removeAttribute("autoplay");
      } else {
        void v.play().catch(() => {});
      }
    };
    const sync = () => setPaused(v.paused);
    const onVisibility = () => (document.hidden ? v.pause() : apply());
    v.addEventListener("play", sync);
    v.addEventListener("pause", sync);
    apply();
    sync();
    mq.addEventListener("change", apply);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      v.removeEventListener("play", sync);
      v.removeEventListener("pause", sync);
      mq.removeEventListener("change", apply);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  function toggle() {
    const v = ref.current;
    if (!v) return;
    if (v.paused) {
      choice.current = "play";
      void v.play().catch(() => {});
    } else {
      choice.current = "pause";
      v.pause();
    }
  }

  return (
    <>
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
      <button
        type="button"
        className="hero-pause"
        onClick={toggle}
        aria-label={paused ? "Play background video" : "Pause background video"}
      >
        {paused ? <Play size={18} weight="fill" aria-hidden /> : <Pause size={18} weight="fill" aria-hidden />}
      </button>
    </>
  );
}

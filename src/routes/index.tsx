import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { SECTIONS, STRUCTURE_INFO, scrollState, type StructureId } from "@/lib/brain-data";
import { useDeviceCaps, checkWebGLSupport } from "@/hooks/use-mobile";

const BrainScene = lazy(() => import("@/components/brain/BrainScene"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Inside the Human Brain — 3D Interactive Atlas" },
      { name: "description", content: "A cinematic, interactive 3D journey through the anatomy and neural structures of the human brain. Scroll to explore the cerebrum, thalamus, hippocampus, cerebellum, and brainstem." },
      
      /* Open Graph Protocol (WhatsApp, Telegram, Facebook, Discord, LinkedIn) */
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://human-brain-rouge.vercel.app/" },
      { property: "og:site_name", content: "Inside the Human Brain" },
      { property: "og:title", content: "Inside the Human Brain — 3D Interactive Atlas" },
      { property: "og:description", content: "A cinematic, interactive 3D journey through the anatomy and neural structures of the human brain. Scroll to explore the cerebrum, thalamus, hippocampus, cerebellum, and brainstem." },
      { property: "og:image", content: "https://human-brain-rouge.vercel.app/preview.jpg" },
      { property: "og:image:secure_url", content: "https://human-brain-rouge.vercel.app/preview.jpg" },
      { property: "og:image:type", content: "image/jpeg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Inside the Human Brain 3D Interactive Atlas Preview" },

      /* Twitter Card */
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:url", content: "https://human-brain-rouge.vercel.app/" },
      { name: "twitter:title", content: "Inside the Human Brain — 3D Interactive Atlas" },
      { name: "twitter:description", content: "A cinematic, interactive 3D journey through the anatomy and neural structures of the human brain. Scroll to explore the cerebrum, thalamus, hippocampus, cerebellum, and brainstem." },
      { name: "twitter:image", content: "https://human-brain-rouge.vercel.app/preview.jpg" },
      { name: "twitter:image:alt", content: "Inside the Human Brain 3D Interactive Atlas Preview" },
    ],
    links: [
      { rel: "canonical", href: "https://human-brain-rouge.vercel.app/" },
      { rel: "image_src", href: "https://human-brain-rouge.vercel.app/preview.jpg" },
    ],
  }),
  component: Index,
});

/* ─── Loading screen shown while the 3D brain lazy-loads ─── */
function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <p className="loading-subtitle">INSIDE THE HUMAN BRAIN</p>
        <div className="loading-spinner" />
        <p className="loading-text">Loading 3D Brain…</p>
      </div>
    </div>
  );
}

/* ─── WebGL error fallback ─── */
function WebGLError() {
  return (
    <div className="grid h-screen place-items-center bg-background px-6 text-center">
      <div className="max-w-md">
        <h1 className="font-display text-3xl text-foreground">3D Not Available</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Your device may not support this 3D experience. Please try using a modern browser
          (Chrome, Safari, Edge) or enable hardware acceleration in your browser settings.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="btn-glow mt-6 rounded-full px-6 py-3 font-mono text-xs tracking-[0.25em]"
        >
          TRY AGAIN
        </button>
      </div>
    </div>
  );
}

/* ─── Mobile navigation bar (bottom of screen) ─── */
function MobileNav({
  active,
  total,
  onGoTo,
}: {
  active: number;
  total: number;
  onGoTo: (i: number) => void;
}) {
  return (
    <nav className="mobile-nav">
      <button
        onClick={() => onGoTo(Math.max(0, active - 1))}
        disabled={active === 0}
        className="mobile-nav-btn"
        aria-label="Previous section"
      >
        ‹
      </button>
      <div className="mobile-nav-dots">
        {Array.from({ length: total }, (_, i) => (
          <button
            key={i}
            onClick={() => onGoTo(i)}
            className={`mobile-nav-dot ${i === active ? "active" : ""}`}
            aria-label={SECTIONS[i]!.title}
          />
        ))}
      </div>
      <button
        onClick={() => onGoTo(Math.min(total - 1, active + 1))}
        disabled={active === total - 1}
        className="mobile-nav-btn"
        aria-label="Next section"
      >
        ›
      </button>
    </nav>
  );
}

function Index() {
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [picked, setPicked] = useState<StructureId | null>(null);
  const [webglOk, setWebglOk] = useState(true);
  const device = useDeviceCaps();

  useEffect(() => {
    setMounted(true);
    if (!checkWebGLSupport()) {
      setWebglOk(false);
      return;
    }
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      scrollState.progress = p;
      setProgress(p);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const active = Math.round(progress * (SECTIONS.length - 1));
  const goTo = useCallback(
    (i: number) =>
      window.scrollTo({
        top: (i / (SECTIONS.length - 1)) * (document.documentElement.scrollHeight - window.innerHeight),
        behavior: "smooth",
      }),
    [],
  );
  const info = picked ? STRUCTURE_INFO[picked] : null;

  if (!webglOk) return <WebGLError />;

  return (
    <main className="relative bg-background text-foreground mobile-safe">
      {/* Fixed 3D canvas */}
      <div className="fixed inset-0 z-0">
        {mounted && (
          <Suspense fallback={<LoadingScreen />}>
            <BrainScene onPick={setPicked} />
          </Suspense>
        )}
        <div className="vignette pointer-events-none absolute inset-0" />
      </div>

      {/* Top bar: progress */}
      <header className="pointer-events-none fixed inset-x-0 top-0 z-20 flex items-center justify-between px-3 py-3 sm:px-5 sm:py-4 md:px-10">
        <span className="font-mono text-[9px] tracking-[0.3em] text-muted-foreground sm:text-[11px] sm:tracking-[0.35em]">
          NEURO / ATLAS
        </span>
        <span className="font-mono text-[9px] tracking-[0.2em] text-primary sm:text-[11px] sm:tracking-[0.3em]">
          {String(active + 1).padStart(2, "0")} / {SECTIONS.length} · {SECTIONS[active]!.title.toUpperCase()}
        </span>
      </header>

      {/* Progress bar */}
      <div className="fixed inset-x-0 top-0 z-20 h-px bg-border">
        <div className="progress-bar h-px" style={{ width: `${progress * 100}%` }} />
      </div>

      {/* Desktop section dots (hidden on mobile) */}
      <nav className="fixed right-4 top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-3 md:flex">
        {SECTIONS.map((s, i) => (
          <button key={s.key} onClick={() => goTo(i)} aria-label={s.title} className="group flex items-center justify-end gap-3">
            <span className={`font-mono text-[10px] tracking-widest transition-opacity ${i === active ? "text-primary opacity-100" : "text-muted-foreground opacity-0 group-hover:opacity-100"}`}>
              {s.title.toUpperCase()}
            </span>
            <span className={`block h-2 w-2 rounded-full border transition-all ${i === active ? "scale-125 border-primary bg-primary" : "border-muted-foreground"}`} />
          </button>
        ))}
      </nav>

      {/* Scroll sections */}
      <div className="pointer-events-none relative z-10">
        {SECTIONS.map((s, i) => (
          <section
            key={s.key}
            className={`flex h-screen items-end px-3 pb-24 sm:px-5 sm:pb-16 md:items-center md:px-16 md:pb-0 ${
              device.isMobile ? "mobile-section" : ""
            }`}
          >
            {i === 0 ? (
              <div className={`fade ${active === 0 ? "in" : ""} max-w-3xl`}>
                <p className="mb-3 font-mono text-[10px] tracking-[0.3em] text-primary sm:mb-4 sm:text-xs sm:tracking-[0.4em]">
                  AN INTERACTIVE 3D ATLAS
                </p>
                <h1 className="font-display text-3xl leading-[0.95] tracking-tight sm:text-5xl md:text-8xl">
                  Inside the<br />Human Brain
                </h1>
                <p className="mt-4 max-w-md text-sm text-muted-foreground sm:mt-6 sm:text-base">{s.text}</p>
                <p className="mt-6 animate-pulse font-mono text-[9px] tracking-[0.2em] text-muted-foreground sm:mt-10 sm:text-[11px] sm:tracking-[0.3em]">
                  {device.isTouch
                    ? "↓ SCROLL · SWIPE TO ROTATE · PINCH TO ZOOM"
                    : "↓ SCROLL · DRAG TO ROTATE · TAP A STRUCTURE"}
                </p>
              </div>
            ) : (
              <div
                className={`glass fade ${active === i ? "in" : ""} ${
                  device.isMobile
                    ? "mobile-info-card w-full"
                    : "w-full max-w-sm p-6 md:p-7"
                }`}
              >
                <p className="font-mono text-[10px] tracking-[0.3em] text-primary sm:text-[11px] sm:tracking-[0.35em]">
                  {String(i + 1).padStart(2, "0")} — STRUCTURE
                </p>
                <h2 className="mt-2 font-display text-2xl tracking-tight sm:mt-3 sm:text-3xl md:text-4xl">
                  {s.title}
                </h2>
                <div className="my-3 h-px w-12 bg-primary sm:my-4 sm:w-16" />
                <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm md:text-base">
                  {s.text}
                </p>
                {s.focus && (
                  <button
                    onClick={() => setPicked(s.focus)}
                    className="pointer-events-auto mt-4 min-h-[44px] font-mono text-[10px] tracking-[0.2em] text-accent hover:text-foreground sm:mt-5 sm:text-[11px] sm:tracking-[0.25em]"
                  >
                    MORE DETAILS →
                  </button>
                )}
                {i === SECTIONS.length - 1 && (
                  <button
                    onClick={() => goTo(0)}
                    className="btn-glow pointer-events-auto mt-5 min-h-[44px] rounded-full px-5 py-3 font-mono text-[10px] tracking-[0.2em] sm:mt-6 sm:px-6 sm:text-xs sm:tracking-[0.25em]"
                  >
                    EXPLORE AGAIN
                  </button>
                )}
              </div>
            )}
          </section>
        ))}
      </div>

      {/* Mobile bottom navigation */}
      {(device.isMobile || device.isTablet) && (
        <MobileNav active={active} total={SECTIONS.length} onGoTo={goTo} />
      )}

      {/* Clicked-structure info card */}
      {info && (
        <aside
          className={`glass fixed z-30 ${
            device.isMobile
              ? "mobile-detail-card inset-x-3 bottom-16"
              : "bottom-4 right-4 w-[calc(100%-2rem)] max-w-sm p-6 md:bottom-auto md:right-14 md:top-24"
          }`}
        >
          <div className="flex items-start justify-between">
            <h3 className="font-display text-xl sm:text-2xl">{info.name}</h3>
            <button
              onClick={() => setPicked(null)}
              aria-label="Close"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center font-mono text-lg text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>
          <dl className="mt-3 space-y-2 text-xs sm:mt-4 sm:space-y-3 sm:text-sm">
            {([[`Location`, info.location], [`Main function`, info.fn], [`Did you know`, info.fact]] as const).map(([k, v]) => (
              <div key={k}>
                <dt className="font-mono text-[9px] tracking-[0.25em] text-primary sm:text-[10px] sm:tracking-[0.3em]">
                  {k.toUpperCase()}
                </dt>
                <dd className="mt-0.5 text-muted-foreground sm:mt-1">{v}</dd>
              </div>
            ))}
          </dl>
        </aside>
      )}
    </main>
  );
}

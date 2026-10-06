import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { SECTIONS, STRUCTURE_INFO, scrollState, type StructureId } from "@/lib/brain-data";

const BrainScene = lazy(() => import("@/components/brain/BrainScene"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Inside the Human Brain — A 3D Scroll Journey" },
      { name: "description", content: "Scroll through a cinematic 3D brain and explore the cerebrum, thalamus, hippocampus, brainstem and more." },
      { property: "og:title", content: "Inside the Human Brain" },
      { property: "og:description", content: "A cinematic, scroll-driven 3D journey through the structures of the human brain." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [picked, setPicked] = useState<StructureId | null>(null);

  useEffect(() => {
    setMounted(true);
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
  const goTo = (i: number) =>
    window.scrollTo({ top: (i / (SECTIONS.length - 1)) * (document.documentElement.scrollHeight - window.innerHeight), behavior: "smooth" });
  const info = picked ? STRUCTURE_INFO[picked] : null;

  return (
    <main className="relative bg-background text-foreground">
      <div className="fixed inset-0 z-0">
        {mounted && (
          <Suspense fallback={<div className="grid h-full place-items-center font-mono text-xs tracking-[0.3em] text-muted-foreground">LOADING BRAIN…</div>}>
            <BrainScene onPick={setPicked} />
          </Suspense>
        )}
        <div className="vignette pointer-events-none absolute inset-0" />
      </div>

      {/* Top bar: progress */}
      <header className="pointer-events-none fixed inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-4 md:px-10">
        <span className="font-mono text-[11px] tracking-[0.35em] text-muted-foreground">NEURO / ATLAS</span>
        <span className="font-mono text-[11px] tracking-[0.3em] text-primary">
          {String(active + 1).padStart(2, "0")} / {SECTIONS.length} · {SECTIONS[active]!.title.toUpperCase()}
        </span>
      </header>
      <div className="fixed inset-x-0 top-0 z-20 h-px bg-border">
        <div className="progress-bar h-px" style={{ width: `${progress * 100}%` }} />
      </div>

      {/* Section dots */}
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
          <section key={s.key} className="flex h-screen items-end px-5 pb-16 md:items-center md:px-16 md:pb-0">
            {i === 0 ? (
              <div className={`fade ${active === 0 ? "in" : ""} max-w-3xl`}>
                <p className="mb-4 font-mono text-xs tracking-[0.4em] text-primary">AN INTERACTIVE 3D ATLAS</p>
                <h1 className="font-display text-5xl leading-[0.95] tracking-tight md:text-8xl">Inside the<br />Human Brain</h1>
                <p className="mt-6 max-w-md text-muted-foreground">{s.text}</p>
                <p className="mt-10 animate-pulse font-mono text-[11px] tracking-[0.3em] text-muted-foreground">↓ SCROLL · DRAG TO ROTATE · TAP A STRUCTURE</p>
              </div>
            ) : (
              <div className={`glass fade ${active === i ? "in" : ""} w-full max-w-sm p-6 md:p-7`}>
                <p className="font-mono text-[11px] tracking-[0.35em] text-primary">{String(i + 1).padStart(2, "0")} — STRUCTURE</p>
                <h2 className="mt-3 font-display text-3xl tracking-tight md:text-4xl">{s.title}</h2>
                <div className="my-4 h-px w-16 bg-primary" />
                <p className="text-sm leading-relaxed text-muted-foreground md:text-base">{s.text}</p>
                {s.focus && (
                  <button onClick={() => setPicked(s.focus)} className="pointer-events-auto mt-5 font-mono text-[11px] tracking-[0.25em] text-accent hover:text-foreground">
                    MORE DETAILS →
                  </button>
                )}
                {i === SECTIONS.length - 1 && (
                  <button onClick={() => goTo(0)} className="btn-glow pointer-events-auto mt-6 rounded-full px-6 py-3 font-mono text-xs tracking-[0.25em]">
                    EXPLORE AGAIN
                  </button>
                )}
              </div>
            )}
          </section>
        ))}
      </div>

      {/* Clicked-structure info card */}
      {info && (
        <aside className="glass fixed bottom-4 right-4 z-30 w-[calc(100%-2rem)] max-w-sm p-6 md:bottom-auto md:right-14 md:top-24">
          <div className="flex items-start justify-between">
            <h3 className="font-display text-2xl">{info.name}</h3>
            <button onClick={() => setPicked(null)} aria-label="Close" className="font-mono text-muted-foreground hover:text-foreground">✕</button>
          </div>
          <dl className="mt-4 space-y-3 text-sm">
            {([["Location", info.location], ["Main function", info.fn], ["Did you know", info.fact]] as const).map(([k, v]) => (
              <div key={k}>
                <dt className="font-mono text-[10px] tracking-[0.3em] text-primary">{k.toUpperCase()}</dt>
                <dd className="mt-1 text-muted-foreground">{v}</dd>
              </div>
            ))}
          </dl>
        </aside>
      )}
    </main>
  );
}

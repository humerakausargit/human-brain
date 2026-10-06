import * as React from "react";

/* ─── Breakpoints ─── */
const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;

/* ─── Basic mobile check (width < 768) ─── */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}

/* ─── Tablet check (768 <= width < 1024) ─── */
export function useIsTablet() {
  const [isTablet, setIsTablet] = React.useState(false);
  React.useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      setIsTablet(w >= MOBILE_BREAKPOINT && w < TABLET_BREAKPOINT);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isTablet;
}

/* ─── Orientation detection ─── */
export type Orientation = "portrait" | "landscape";

export function useOrientation(): Orientation {
  const [orientation, setOrientation] = React.useState<Orientation>("portrait");
  React.useEffect(() => {
    const check = () => {
      setOrientation(window.innerHeight > window.innerWidth ? "portrait" : "landscape");
    };
    check();
    window.addEventListener("resize", check);
    window.addEventListener("orientationchange", check);
    return () => {
      window.removeEventListener("resize", check);
      window.removeEventListener("orientationchange", check);
    };
  }, []);
  return orientation;
}

/* ─── Touch device detection (pointer: coarse) ─── */
export function useIsTouchDevice() {
  const [isTouch, setIsTouch] = React.useState(false);
  React.useEffect(() => {
    const mql = window.matchMedia("(pointer: coarse)");
    const onChange = () => setIsTouch(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return isTouch;
}

/* ─── Combined device capabilities hook ─── */
export interface DeviceCaps {
  /** Phone-sized viewport (< 768px) */
  isMobile: boolean;
  /** Tablet-sized viewport (768–1023px) */
  isTablet: boolean;
  /** Desktop-sized viewport (>= 1024px) */
  isDesktop: boolean;
  /** Touch-primary input (pointer: coarse) */
  isTouch: boolean;
  /** Current orientation */
  orientation: Orientation;
  /** Recommended pixel ratio for the renderer (capped for perf) */
  dpr: [number, number];
  /** Whether to use reduced quality (fewer lights, lower shadow res, etc.) */
  reduceQuality: boolean;
  /** Small phone (< 400px) */
  isSmallPhone: boolean;
}

export function useDeviceCaps(): DeviceCaps {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isTouch = useIsTouchDevice();
  const orientation = useOrientation();

  const isSmallPhone = React.useMemo(() => {
    if (typeof window === "undefined") return false;
    return Math.min(window.innerWidth, window.innerHeight) < 400;
  }, [isMobile]);

  const isDesktop = !isMobile && !isTablet;

  // Mobile: cap pixel ratio at 1.5 to save GPU, tablet at 1.75, desktop at 2
  const dpr: [number, number] = React.useMemo(() => {
    if (isMobile) return [1, 1.5];
    if (isTablet) return [1, 1.75];
    return [1, 2];
  }, [isMobile, isTablet]);

  const reduceQuality = isMobile || isTablet;

  return { isMobile, isTablet, isDesktop, isTouch, orientation, dpr, reduceQuality, isSmallPhone };
}

/* ─── WebGL support check ─── */
export function checkWebGLSupport(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    return !!gl;
  } catch {
    return false;
  }
}

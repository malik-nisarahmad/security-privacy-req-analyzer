"use client";

import React, { useEffect, useRef } from "react";
import Lenis from "lenis";
import { usePathname } from "next/navigation";

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Check if user prefers reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    // Do not run on /projects workspace since it has its own internal container scroll
    if (pathname?.startsWith("/projects")) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.0,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.0,
    });
    lenisRef.current = lenis;

    let rafId: number;

    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    // Call resize on mount and after delay to account for dynamic render
    lenis.resize();
    const timer = setTimeout(() => {
      lenis.resize();
    }, 200);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [pathname]);

  return <>{children}</>;
}

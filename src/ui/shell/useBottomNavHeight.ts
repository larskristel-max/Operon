import { useEffect } from "react";

export function useBottomNavHeight(): void {
  useEffect(() => {
    const root = document.documentElement;
    const nav = document.querySelector<HTMLElement>(".bottom-nav");
    if (!nav) return;

    const setBottomNavHeight = () => {
      const { height } = nav.getBoundingClientRect();
      if (height > 0) {
        root.style.setProperty("--bottom-nav-height", `${Math.ceil(height)}px`);
      }
    };

    const rafId = window.requestAnimationFrame(setBottomNavHeight);
    window.addEventListener("resize", setBottomNavHeight);

    let observer: ResizeObserver | null = null;
    if ("ResizeObserver" in window) {
      observer = new ResizeObserver(setBottomNavHeight);
      observer.observe(nav);
    }

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", setBottomNavHeight);
      observer?.disconnect();
      root.style.removeProperty("--bottom-nav-height");
    };
  }, []);
}

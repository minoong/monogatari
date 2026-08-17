"use client";

import { useLayoutEffect, useState } from "react";

const KEYBOARD_THRESHOLD_PX = 100;

export function useKeyboardInset(threshold = KEYBOARD_THRESHOLD_PX) {
  const [inset, setInset] = useState(0);

  useLayoutEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;

    const update = () => {
      const viewport = window.visualViewport;
      if (!viewport) return;

      const visibleBottom = viewport.height + viewport.offsetTop;
      const keyboardInset = Math.max(0, window.innerHeight - visibleBottom);
      setInset(keyboardInset > threshold ? keyboardInset : 0);
    };

    const viewport = window.visualViewport;
    const handlePageResume = () => {
      update();
      requestAnimationFrame(update);
    };

    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    window.addEventListener("pageshow", handlePageResume);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") handlePageResume();
    });
    update();

    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      window.removeEventListener("pageshow", handlePageResume);
    };
  }, [threshold]);

  return inset;
}

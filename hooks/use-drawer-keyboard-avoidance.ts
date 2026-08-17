"use client";

import { useLayoutEffect, useMemo, useState, type CSSProperties } from "react";

const KEYBOARD_THRESHOLD_PX = 80;

type DrawerKeyboardMetrics = {
  inset: number;
  offsetTop: number;
  height: number;
};

const EMPTY_METRICS: DrawerKeyboardMetrics = { inset: 0, offsetTop: 0, height: 0 };

export function useDrawerKeyboardAvoidance(active: boolean) {
  const [metrics, setMetrics] = useState<DrawerKeyboardMetrics>(EMPTY_METRICS);

  useLayoutEffect(() => {
    if (!active || typeof window === "undefined" || !window.visualViewport) {
      return undefined;
    }

    const update = () => {
      const viewport = window.visualViewport;
      if (!viewport) return;

      const visibleBottom = viewport.height + viewport.offsetTop;
      const inset = Math.max(0, window.innerHeight - visibleBottom);

      setMetrics({
        inset: inset > KEYBOARD_THRESHOLD_PX ? inset : 0,
        offsetTop: viewport.offsetTop,
        height: viewport.height,
      });
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
      setMetrics(EMPTY_METRICS);
    };
  }, [active]);

  const effective = active ? metrics : EMPTY_METRICS;

  const popupStyle = useMemo((): CSSProperties | undefined => {
    if (effective.inset <= 0) return undefined;

    return {
      marginBottom: effective.inset,
      maxHeight: Math.max(280, effective.height - 16),
    };
  }, [effective.height, effective.inset]);

  const panelStyle = useMemo((): CSSProperties | undefined => {
    if (effective.inset <= 0) return undefined;
    return { paddingBottom: 24 };
  }, [effective.inset]);

  return {
    keyboardInset: effective.inset,
    popupStyle,
    panelStyle,
  };
}

"use client";

import { useEffect, type RefObject } from "react";

type Options = {
  enabled?: boolean;
  cssVarName?: string;
  range?: number;
};

/** 스크롤 컨테이너에 0~1 진행도를 CSS 변수로 기록한다. rAF로 묶어 React 리렌더 없이 갱신한다. */
export function useScrollProgressVar(
  containerRef: RefObject<HTMLElement | null>,
  { enabled = true, cssVarName = "--summary-p", range = 140 }: Options = {},
) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    if (!enabled) {
      container.style.setProperty(cssVarName, "0");
      return () => container.style.removeProperty(cssVarName);
    }

    let frame = 0;
    let last = -1;

    const update = () => {
      frame = 0;
      const next = Math.min(1, Math.max(0, container.scrollTop / range));
      if (Math.abs(next - last) < 0.0015) return;
      last = next;
      container.style.setProperty(cssVarName, next.toFixed(4));
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    container.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      container.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
      container.style.removeProperty(cssVarName);
    };
  }, [containerRef, cssVarName, enabled, range]);
}

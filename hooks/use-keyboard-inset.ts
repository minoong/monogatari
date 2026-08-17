"use client";

import { useEffect, useLayoutEffect, useState } from "react";

const KEYBOARD_THRESHOLD_PX = 100;

function subscribeKeyboardInset(threshold: number, onChange: (inset: number) => void) {
  if (typeof window === "undefined" || !window.visualViewport) return () => {};

  const viewport = window.visualViewport;

  const update = () => {
    const visibleBottom = viewport.height + viewport.offsetTop;
    const keyboardInset = Math.max(0, window.innerHeight - visibleBottom);
    onChange(keyboardInset > threshold ? keyboardInset : 0);
  };

  const handlePageResume = () => {
    update();
    requestAnimationFrame(update);
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState === "visible") handlePageResume();
  };

  viewport.addEventListener("resize", update);
  viewport.addEventListener("scroll", update);
  window.addEventListener("resize", update);
  window.addEventListener("pageshow", handlePageResume);
  document.addEventListener("visibilitychange", handleVisibilityChange);
  update();

  return () => {
    viewport.removeEventListener("resize", update);
    viewport.removeEventListener("scroll", update);
    window.removeEventListener("resize", update);
    window.removeEventListener("pageshow", handlePageResume);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };
}

export function useKeyboardInset(threshold = KEYBOARD_THRESHOLD_PX) {
  const [inset, setInset] = useState(0);

  useLayoutEffect(() => subscribeKeyboardInset(threshold, setInset), [threshold]);

  return inset;
}

/**
 * 소프트 키보드 높이를 `--kb-inset`으로 노출한다. 드로어 뷰포트가 이 값만큼
 * 바닥 패딩을 확보해 패널 전체가 키보드 위로 올라오게 만든다.
 */
export function useKeyboardInsetVar(threshold = KEYBOARD_THRESHOLD_PX) {
  useEffect(() => {
    const root = document.documentElement;
    const unsubscribe = subscribeKeyboardInset(threshold, (inset) => {
      root.style.setProperty("--kb-inset", `${inset}px`);
    });

    return () => {
      unsubscribe();
      root.style.setProperty("--kb-inset", "0px");
    };
  }, [threshold]);
}

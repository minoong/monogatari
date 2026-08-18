"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { useSyncExternalStore } from "react";

/** iOS 홈 화면에 추가된 standalone PWA인지 판별한다. */
export function isIosStandalonePwa() {
  if (typeof window === "undefined") return false;
  const navigatorWithStandalone = window.navigator as Navigator & { standalone?: boolean };
  return (
    navigatorWithStandalone.standalone === true ||
    window.matchMedia("(display-mode: standalone)").matches
  );
}

/** 인트로 오버레이를 body에 붙여 루트 overflow-hidden 클리핑을 피한다. */
export function PwaIntroPortal({ children }: { children: React.ReactNode }) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!mounted) return null;
  return createPortal(children, document.body);
}

/** 노치·홈 인디케이터 영역까지 사진이 닿도록 미디어 레이어를 확장한다. */
export const pwaIntroMediaClassName =
  "absolute left-0 right-0 top-[calc(-1*env(safe-area-inset-top,0px))] bottom-[calc(-1*env(safe-area-inset-bottom,0px))] min-h-[calc(100%+env(safe-area-inset-top,0px)+env(safe-area-inset-bottom,0px))] overflow-hidden";

export const pwaIntroOverlayClassName =
  "fixed inset-0 z-[200] touch-none overflow-hidden text-white";

export function preloadIntroImages(sources: string[]) {
  if (typeof window === "undefined") return Promise.resolve();

  return Promise.allSettled(
    sources.map(
      (src) =>
        new Promise<void>((resolve) => {
          const img = new window.Image();
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = src;
        }),
    ),
  );
}

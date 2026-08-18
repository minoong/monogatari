"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { useSyncExternalStore } from "react";

const INTRO_CHROME_COLOR = "#0a0a0a";

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

/** 노치·상태바 뒤로 보이는 html/body 배경을 인트로 톤에 맞춘다. */
export function useIntroViewportChrome(active: boolean) {
  React.useEffect(() => {
    if (!active) return;

    const html = document.documentElement;
    const body = document.body;
    const previous = {
      htmlBackground: html.style.backgroundColor,
      bodyBackground: body.style.backgroundColor,
      themeColor: document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.content ?? null,
    };

    html.style.backgroundColor = INTRO_CHROME_COLOR;
    body.style.backgroundColor = INTRO_CHROME_COLOR;

    let themeMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (!themeMeta) {
      themeMeta = document.createElement("meta");
      themeMeta.name = "theme-color";
      document.head.appendChild(themeMeta);
    }
    themeMeta.content = INTRO_CHROME_COLOR;

    return () => {
      html.style.backgroundColor = previous.htmlBackground;
      body.style.backgroundColor = previous.bodyBackground;
      if (themeMeta) {
        themeMeta.content = previous.themeColor ?? "#f8fafc";
      }
    };
  }, [active]);
}

export const pwaIntroOverlayClassName =
  "fixed inset-0 z-[200] touch-none overflow-hidden bg-neutral-950 text-white";

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

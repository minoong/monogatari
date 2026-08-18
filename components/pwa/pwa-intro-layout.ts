import type { CSSProperties } from "react";

/** iOS PWA 노치·홈 인디케이터까지 배경/이미지가 닿도록 fixed 오버레이를 확장한다. */
export const pwaIntroBleedStyle: CSSProperties = {
  top: "calc(-1 * env(safe-area-inset-top, 0px))",
  right: 0,
  bottom: "calc(-1 * env(safe-area-inset-bottom, 0px))",
  left: 0,
  minHeight:
    "calc(100dvh + env(safe-area-inset-top, 0px) + env(safe-area-inset-bottom, 0px))",
};

export const pwaIntroBleedClassName = "fixed left-0 right-0 w-full overflow-hidden";

export function preloadIntroImages(sources: string[]) {
  if (typeof window === "undefined") return;

  for (const src of sources) {
    const img = new window.Image();
    img.decoding = "async";
    img.src = src;

    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = src;
    document.head.appendChild(link);
  }
}

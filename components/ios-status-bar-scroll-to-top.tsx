"use client";

import { useEffect } from "react";
import { scrollActiveScreenToTop } from "@/lib/scroll-to-top";

const isIos = () => {
  if (typeof navigator === "undefined") return false;
  return /iP(hone|od|ad)/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
};

const isAppBarSideControl = (target: Element, appBar: Element) => {
  const container = appBar.children[1];
  if (!(container instanceof HTMLElement)) return false;
  const left = container.children[0];
  const right = container.children[2];
  const inSide = (left instanceof Element && left.contains(target)) || (right instanceof Element && right.contains(target));
  return inSide && Boolean(target.closest("button, a, input, [role='button']"));
};

export function IosStatusBarScrollToTop() {
  useEffect(() => {
    const onAppBarTap = (event: Event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const appBar = target.closest("[data-part='appBar']");
      if (!appBar || isAppBarSideControl(target, appBar)) return;
      scrollActiveScreenToTop();
    };

    document.addEventListener("pointerup", onAppBarTap, true);

    if (!isIos()) {
      return () => document.removeEventListener("pointerup", onAppBarTap, true);
    }

    document.documentElement.classList.add("ios-sb-scroll");
    let armed = false;
    const arm = () => {
      window.scrollTo(0, 1);
      armed = true;
    };
    const armTimer = window.setTimeout(arm, 50);

    const onWindowScroll = () => {
      if (!armed) return;
      if (window.scrollY < 1) scrollActiveScreenToTop();
      if (window.scrollY !== 1) window.scrollTo(0, 1);
    };

    window.addEventListener("scroll", onWindowScroll, { passive: true });

    return () => {
      window.clearTimeout(armTimer);
      document.removeEventListener("pointerup", onAppBarTap, true);
      window.removeEventListener("scroll", onWindowScroll);
      document.documentElement.classList.remove("ios-sb-scroll");
    };
  }, []);

  return null;
}

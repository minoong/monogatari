"use client";

import { useEffect } from "react";

const OVERFLOW_Y = new Set(["auto", "scroll", "overlay"]);

const isIos = () => {
  if (typeof navigator === "undefined") return false;
  return /iP(hone|od|ad)/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
};

const isVisible = (element: HTMLElement) => {
  const style = getComputedStyle(element);
  if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0) return false;
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
};

const isScrollableY = (element: HTMLElement) => {
  if (!OVERFLOW_Y.has(getComputedStyle(element).overflowY)) return false;
  return element.scrollHeight - element.clientHeight > 1;
};

const collectScrollers = (root: ParentNode) => {
  const scrollers: HTMLElement[] = [];
  const stack: ParentNode[] = [root];
  while (stack.length) {
    const node = stack.pop();
    if (!node) continue;
    for (const child of node.children) {
      if (!(child instanceof HTMLElement) || !isVisible(child)) continue;
      if (isScrollableY(child)) scrollers.push(child);
      stack.push(child);
    }
  }
  return scrollers;
};

const frontmostRoot = () => {
  const dialogs = [...document.querySelectorAll<HTMLElement>('[role="dialog"][aria-modal="true"]')].filter(isVisible);
  if (dialogs.length) return dialogs[dialogs.length - 1];
  const drawers = [...document.querySelectorAll<HTMLElement>("[data-slot='drawer-popup']")].filter(isVisible);
  if (drawers.length) return drawers[drawers.length - 1];
  const screens = [...document.querySelectorAll<HTMLElement>("[data-stackflow-component-name='AppScreen']")].filter(isVisible);
  const screen = screens[screens.length - 1];
  return screen?.querySelector<HTMLElement>("[data-part='paper'] > div") ?? screen ?? document.body;
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const scrollBehavior = (): ScrollBehavior => (prefersReducedMotion() ? "auto" : "smooth");

const scrollToTop = (element: HTMLElement) => {
  element.scrollTo({ top: 0, behavior: scrollBehavior() });
};

const scrollFrontmostToTop = () => {
  const root = frontmostRoot();
  const scrollers = collectScrollers(root);
  if (root instanceof HTMLElement) scrollers.unshift(root);
  scrollers.forEach(scrollToTop);
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
      const paper = appBar.closest("[data-stackflow-component-name='AppScreen']")?.querySelector<HTMLElement>("[data-part='paper'] > div");
      const root = paper ?? frontmostRoot();
      const scrollers = collectScrollers(root);
      if (root instanceof HTMLElement) scrollers.unshift(root);
      scrollers.forEach(scrollToTop);
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
      if (window.scrollY < 1) scrollFrontmostToTop();
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

"use client";

import { useEffect } from "react";

const OVERFLOW_Y = new Set(["auto", "scroll", "overlay"]);

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

const paperContentOf = (appBar: Element) =>
  appBar.closest("[data-stackflow-component-name='AppScreen']")
    ?.querySelector<HTMLElement>("[data-part='paper'] > div") ?? null;

const frontmostRoot = () => {
  const dialogs = [...document.querySelectorAll<HTMLElement>('[role="dialog"][aria-modal="true"]')].filter(isVisible);
  if (dialogs.length) return dialogs[dialogs.length - 1];
  const drawers = [...document.querySelectorAll<HTMLElement>("[data-slot='drawer-popup']")].filter(isVisible);
  if (drawers.length) return drawers[drawers.length - 1];
  const screens = [...document.querySelectorAll<HTMLElement>("[data-stackflow-component-name='AppScreen']")].filter(isVisible);
  return screens[screens.length - 1] ?? document.body;
};

const scrollRootToTop = (root: ParentNode) => {
  const scrollers = collectScrollers(root);
  if (root instanceof HTMLElement && isScrollableY(root)) scrollers.unshift(root);
  window.scrollTo({ top: 0, behavior: "smooth" });
  scrollers.forEach((element) => {
    element.scrollTo({ top: 0, behavior: "smooth" });
  });
};

const isAppBarSideControl = (target: Element, appBar: Element) => {
  const container = appBar.children[1];
  if (!(container instanceof HTMLElement)) return false;
  const left = container.children[0];
  const right = container.children[2];
  const inSide = (left instanceof Element && left.contains(target)) || (right instanceof Element && right.contains(target));
  return inSide && Boolean(target.closest("button, a, input, [role='button']"));
};

const safeAreaHeight = () => {
  const value = getComputedStyle(document.documentElement).getPropertyValue("--sa-top").trim();
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export function IosStatusBarScrollToTop() {
  useEffect(() => {
    const onPointerUp = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      const target = event.target;
      if (!(target instanceof Element)) return;

      const appBar = target.closest("[data-part='appBar']");
      if (appBar) {
        if (isAppBarSideControl(target, appBar)) return;
        const paper = paperContentOf(appBar);
        scrollRootToTop(paper ?? frontmostRoot());
        return;
      }

      if (event.clientY > safeAreaHeight()) return;
      scrollRootToTop(frontmostRoot());
    };

    document.addEventListener("pointerup", onPointerUp, true);
    return () => document.removeEventListener("pointerup", onPointerUp, true);
  }, []);

  return null;
}

"use client";

const OVERFLOW_Y = new Set(["auto", "scroll", "overlay"]);

const isVisible = (element: HTMLElement) => {
  const style = getComputedStyle(element);
  if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0) return false;
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
};

const isScrollableY = (element: HTMLElement) => {
  const overflowY = getComputedStyle(element).overflowY;
  if (!OVERFLOW_Y.has(overflowY)) return false;
  return element.scrollHeight - element.clientHeight > 1;
};

const collectScrollers = (root: ParentNode) => {
  const scrollers: HTMLElement[] = [];
  const stack: ParentNode[] = [root];
  while (stack.length) {
    const node = stack.pop();
    if (!node) continue;
    for (const child of node.children) {
      if (!(child instanceof HTMLElement)) continue;
      if (!isVisible(child)) continue;
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
  return document.querySelector<HTMLElement>("[data-stackflow-component-name='AppScreen']") ?? document.body;
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
  document.documentElement.scrollTo({ top: 0, behavior: "smooth" });
  document.body.scrollTo({ top: 0, behavior: "smooth" });

  const root = frontmostRoot();
  const scrollers = collectScrollers(root);
  if (root instanceof HTMLElement && isScrollableY(root)) scrollers.unshift(root);

  scrollers.forEach((element) => {
    if (element.scrollTop > 0) element.scrollTo({ top: 0, behavior: "smooth" });
  });
};

export function IosStatusBarScrollToTop() {
  return (
    <button
      aria-hidden="true"
      className="pointer-events-auto fixed inset-x-0 top-0 z-[200] h-[env(safe-area-inset-top,0px)] w-full touch-manipulation bg-transparent"
      onClick={scrollToTop}
      tabIndex={-1}
      type="button"
    />
  );
}

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

const frontmostRoot = () => {
  const dialogs = [...document.querySelectorAll<HTMLElement>('[role="dialog"][aria-modal="true"]')].filter(isVisible);
  if (dialogs.length) return dialogs[dialogs.length - 1];

  const drawers = [...document.querySelectorAll<HTMLElement>("[data-slot='drawer-popup']")].filter(isVisible);
  if (drawers.length) return drawers[drawers.length - 1];

  const screens = [...document.querySelectorAll<HTMLElement>("[data-stackflow-component-name='AppScreen']")].filter(isVisible);
  const screen = screens[screens.length - 1];
  return screen?.querySelector<HTMLElement>("[data-part='paper'] > div") ?? screen ?? document.body;
};

const scrollElementToTop = (element: HTMLElement) => {
  if (element.scrollTop <= 0) return;
  element.scrollTo({ top: 0, behavior: "auto" });
};

export const scrollActiveScreenToTop = () => {
  if (typeof document === "undefined") return;

  const root = frontmostRoot();
  const scrollers = collectScrollers(root);
  if (root instanceof HTMLElement) scrollers.unshift(root);
  scrollers.forEach(scrollElementToTop);
};

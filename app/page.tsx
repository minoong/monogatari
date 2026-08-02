"use client";

import { Stack } from "../components/stackflow";

function scrollActiveScreenToTop() {
  const activeScreen = document.querySelector<HTMLElement>(
    '[data-part="paper"][data-stackflow-activity-is-active="true"] > div',
  );

  activeScreen?.scrollTo({ top: 0, behavior: "smooth" });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export default function Home() {
  return (
    <main className="w-full h-[100svh] overflow-hidden bg-white dark:bg-black">
      <Stack />
      <div
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-[70] h-[env(safe-area-inset-top,0px)] touch-manipulation"
        data-slot="safe-area-scroll-top"
        onClick={scrollActiveScreenToTop}
      />
    </main>
  );
}

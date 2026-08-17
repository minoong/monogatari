"use client";

import { Stack } from "../components/stackflow";
import { PwaIntroGate } from "../components/pwa/pwa-intro-gate";

export default function Home() {
  return (
    <PwaIntroGate>
      <main className="w-full h-[100svh] overflow-hidden bg-white dark:bg-black">
        <Stack />
      </main>
    </PwaIntroGate>
  );
}

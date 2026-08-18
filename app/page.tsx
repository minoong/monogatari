"use client";

import { Stack } from "../components/stackflow";
import { PwaIntroGate } from "../components/pwa/pwa-intro-gate";

export default function Home() {
  return (
    <PwaIntroGate>
      <main className="h-[100svh] w-full overflow-hidden bg-white">
        <Stack />
      </main>
    </PwaIntroGate>
  );
}

"use client";

import { Button } from "@heroui/react";
import { Stack } from "../components/stackflow";

export default function Home() {
  return (
    <main className="w-full h-[100dvh] overflow-hidden bg-white dark:bg-black">
      <Stack />
      <Button className="fixed right-4 top-4 z-50">HeroUI ready</Button>
    </main>
  );
}

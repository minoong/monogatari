"use client";

import { useCallback, useLayoutEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { PwaIntro } from "@/components/pwa/pwa-intro";
import { PwaIntroPortal } from "@/components/pwa/pwa-intro-layout";
import { PwaIntroShell } from "@/components/pwa/pwa-intro-shell";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

const STORAGE_KEY = "monogatari-pwa-intro-seen";

type GatePhase = "boot" | "intro" | "revealing" | "app";

function readIntroPhase(): GatePhase {
  if (typeof window === "undefined") return "boot";
  return sessionStorage.getItem(STORAGE_KEY) === "1" ? "app" : "intro";
}

function PwaIntroBootShell() {
  return (
    <PwaIntroPortal>
      <PwaIntroShell />
    </PwaIntroPortal>
  );
}

export function PwaIntroGate({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<GatePhase>("boot");

  useLayoutEffect(() => {
    // 첫 페인트는 boot 셸로 맞춘 뒤, 클라이언트에서만 인트로 여부를 확정한다.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sessionStorage는 클라이언트 전용이라 마운트 직후 1회 동기화가 필요하다.
    setPhase(readIntroPhase());
  }, []);

  const handleExitStart = useCallback(() => {
    setPhase("revealing");
  }, []);

  const dismissIntro = useCallback(() => {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setPhase("app");
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });
  }, []);

  if (phase === "boot") {
    return <PwaIntroBootShell />;
  }

  const showHome = phase === "revealing" || phase === "app";
  const showIntro = phase === "intro" || phase === "revealing";

  return (
    <>
      {showHome ? (
        <div
          className={cn(
            phase === "revealing" && "fixed inset-0 z-[110] overflow-hidden bg-white dark:bg-black",
          )}
        >
          {children}
        </div>
      ) : null}
      {showIntro ? <PwaIntro onComplete={dismissIntro} onExitStart={handleExitStart} /> : null}
    </>
  );
}

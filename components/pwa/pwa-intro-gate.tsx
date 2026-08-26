"use client";

import { useCallback, useLayoutEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { ProposalCinematic } from "@/components/cinematic/proposal-cinematic-lazy";
import { PwaIntro } from "@/components/pwa/pwa-intro";
import { PwaIntroPortal } from "@/components/pwa/pwa-intro-layout";
import { PwaIntroShell } from "@/components/pwa/pwa-intro-shell";

gsap.registerPlugin(ScrollTrigger);

const STORAGE_KEY = "monogatari-pwa-intro-seen";

type GatePhase = "boot" | "intro" | "story" | "app";

function readIntroSeen() {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function markIntroSeen() {
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // 사생활 모드 등에서 localStorage가 막혀 있으면 무시한다.
  }
}

function readIntroPhase(): GatePhase {
  if (typeof window === "undefined") return "boot";
  return readIntroSeen() ? "app" : "intro";
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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage는 클라이언트 전용이라 마운트 직후 1회 동기화가 필요하다.
    setPhase(readIntroPhase());
  }, []);

  const finishIntro = useCallback(() => {
    markIntroSeen();
    setPhase("app");
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });
  }, []);

  const handleIntroComplete = useCallback(() => {
    setPhase("story");
  }, []);

  const handleIntroSkip = useCallback(() => {
    finishIntro();
  }, [finishIntro]);

  const handleStoryComplete = useCallback(() => {
    finishIntro();
  }, [finishIntro]);

  if (phase === "boot") {
    return <PwaIntroBootShell />;
  }

  return (
    <>
      {phase === "app" ? children : null}
      {phase === "intro" ? (
        <PwaIntro
          onComplete={handleIntroComplete}
          onExitStart={() => undefined}
          onSkip={handleIntroSkip}
        />
      ) : null}
      {phase === "story" ? <ProposalCinematic onComplete={handleStoryComplete} /> : null}
    </>
  );
}

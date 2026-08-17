"use client";

import { useCallback, useSyncExternalStore } from "react";
import { AnimatePresence } from "motion/react";

import { PwaIntro } from "@/components/pwa/pwa-intro";

const STORAGE_KEY = "monogatari-pwa-intro-seen";

let introListeners: Array<() => void> = [];

function subscribeIntro(listener: () => void) {
  introListeners.push(listener);
  return () => {
    introListeners = introListeners.filter((item) => item !== listener);
  };
}

function getIntroSnapshot() {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(STORAGE_KEY) !== "1";
}

function getIntroServerSnapshot() {
  return false;
}

function markIntroSeen() {
  sessionStorage.setItem(STORAGE_KEY, "1");
  introListeners.forEach((listener) => listener());
}

export function PwaIntroGate({ children }: { children: React.ReactNode }) {
  const showIntro = useSyncExternalStore(subscribeIntro, getIntroSnapshot, getIntroServerSnapshot);
  const dismissIntro = useCallback(() => {
    markIntroSeen();
  }, []);

  return (
    <>
      {children}
      <AnimatePresence>
        {showIntro ? <PwaIntro key="pwa-intro" onComplete={dismissIntro} /> : null}
      </AnimatePresence>
    </>
  );
}

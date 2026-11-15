"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from "react";
import { getActiveTrip, getTripBySlug, TRIPS, type TripConfig, type TripSlug } from "@/lib/trips";

const STORAGE_KEY = "monogatari:trip";

type TripContextValue = {
  /** 지금 화면에 보여주는 여행. 사용자가 고른 여행이 없으면 진행 중이거나 다가오는 여행. */
  trip: TripConfig;
  trips: readonly TripConfig[];
  /** 보여줄 여행을 바꾸고 기기에 기억한다. */
  setTripSlug: (slug: TripSlug) => void;
};

const TripContext = createContext<TripContextValue | null>(null);

const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
};

const readSavedSlug = () => {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

const writeSavedSlug = (slug: string) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, slug);
  } catch {
    // 저장이 막힌 환경에서는 새로고침하면 기본 여행으로 돌아간다.
  }
  listeners.forEach((listener) => listener());
};

export function TripProvider({ children }: { children: React.ReactNode }) {
  // 서버와 첫 클라이언트 렌더는 null이라 같은 결과를 만든다. 저장된 선택은 하이드레이션 뒤에 반영된다.
  const savedSlug = useSyncExternalStore(subscribe, readSavedSlug, () => null);
  const trip = useMemo(() => (savedSlug ? getTripBySlug(savedSlug) : null) ?? getActiveTrip(), [savedSlug]);
  // 여행 테마를 문서에 반영한다. (외부 시스템인 DOM 동기화라 effect가 맞다.)
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.trip = trip.slug;
    root.dataset.tripTheme = trip.theme.id;
    root.style.setProperty("--trip-accent", trip.theme.accent);
    root.style.setProperty("--trip-tint", trip.theme.tint);
  }, [trip]);
  const setTripSlug = useCallback((slug: TripSlug) => writeSavedSlug(slug), []);
  const value = useMemo<TripContextValue>(() => ({ trip, trips: TRIPS, setTripSlug }), [trip, setTripSlug]);

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export function useLocalCurrency() {
  return useTrip().trip.currency.code;
}

export function useTrip() {
  const context = useContext(TripContext);
  if (!context) throw new Error("useTrip은 TripProvider 안에서만 사용할 수 있어요.");
  return context;
}

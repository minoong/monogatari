"use client";

import { createContext, useContext } from "react";
import type { RefObject } from "react";
import { getCutAt, type ActiveCut } from "@/components/cinematic/proposal-timeline";

/**
 * 컷 진행도를 ref로 흘려보내 React 리렌더 없이 매 프레임 읽게 한다.
 * Canvas 안쪽에서 Provider를 렌더해야 R3F 리컨사일러에서도 컨텍스트가 잡힌다.
 */
export const CinematicClockContext = createContext<RefObject<ActiveCut> | null>(null);

export function useCutClock(): RefObject<ActiveCut> {
  const ref = useContext(CinematicClockContext);
  if (!ref) {
    throw new Error("useCutClock은 CinematicClockContext 안에서만 사용할 수 있습니다.");
  }
  return ref;
}

export function createInitialCut(): ActiveCut {
  return getCutAt(0);
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@heroui/react";
import { useReducedMotion } from "motion/react";
import { ProposalCanvas } from "@/components/cinematic/proposal-canvas";
import {
  CINEMATIC_ASSETS,
  CINEMATIC_CUTS,
  CINEMATIC_TOTAL_DURATION,
  REDUCED_MOTION_TIME_SCALE,
  getCutAt,
  type ActiveCut,
  type CutId,
} from "@/components/cinematic/proposal-timeline";
import { PwaIntroPortal, pwaIntroOverlayClassName, preloadIntroImages } from "@/components/pwa/pwa-intro-layout";

interface ProposalCinematicProps {
  onComplete: () => void;
}

/** `?cut=<id>`, `?t=<초>`로 원하는 지점부터 재생해 연출을 확인한다. */
function readDebugOffset() {
  if (typeof window === "undefined") return 0;
  const params = new URLSearchParams(window.location.search);
  const target = params.get("cut");
  const seconds = Number(params.get("t") ?? 0);
  let cursor = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;

  if (target) {
    for (const cut of CINEMATIC_CUTS) {
      if (cut.id === target) return cursor;
      cursor += cut.duration;
    }
  }

  return cursor;
}

export function ProposalCinematic({ onComplete }: ProposalCinematicProps) {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const completedRef = useRef(false);
  const clockRef = useRef<ActiveCut>(getCutAt(0));
  const barRef = useRef<HTMLDivElement>(null);
  const lastCutRef = useRef<CutId>(CINEMATIC_CUTS[0].id);
  const [cutId, setCutId] = useState<CutId>(CINEMATIC_CUTS[0].id);

  const finish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    void preloadIntroImages([...CINEMATIC_ASSETS]);
  }, []);

  useEffect(() => {
    const offset = readDebugOffset();
    const startedAt = performance.now() - offset * 1000;
    const scale = prefersReducedMotion ? REDUCED_MOTION_TIME_SCALE : 1;
    let frame = 0;

    const tick = () => {
      const elapsed = ((performance.now() - startedAt) / 1000) * scale;
      if (elapsed >= CINEMATIC_TOTAL_DURATION) {
        finish();
        return;
      }

      const next = getCutAt(elapsed);
      clockRef.current = next;
      if (next.cut.id !== lastCutRef.current) {
        lastCutRef.current = next.cut.id;
        setCutId(next.cut.id);
      }
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${elapsed / CINEMATIC_TOTAL_DURATION})`;
      }
      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [finish, prefersReducedMotion]);

  const cut = CINEMATIC_CUTS.find((item) => item.id === cutId) ?? CINEMATIC_CUTS[0];

  return (
    <PwaIntroPortal>
      <div
        aria-label="프로포즈 시네마틱"
        className={pwaIntroOverlayClassName}
        style={{ zIndex: 200, height: "100dvh", bottom: "auto" }}
      >
        <div className="absolute inset-0 bg-[#05060c]">
          <ProposalCanvas clockRef={clockRef} cutId={cutId} />
        </div>

        {/* 만화 컷 테두리 */}
        <div className="pointer-events-none absolute inset-0 ring-[6px] ring-inset ring-black/70" />
        <div className="pointer-events-none absolute inset-0 [background:radial-gradient(120%_85%_at_50%_45%,transparent_45%,rgba(0,0,0,0.6)_100%)]" />

        {/* 날짜 태그 + 캡션. 인물이 서는 화면 중앙·하단을 피해 상단 좌측에 모아둔다. */}
        <div className="pointer-events-none absolute left-4 right-24 top-[calc(1rem+env(safe-area-inset-top,0px))] z-10 flex flex-col items-start gap-2">
          <div
            className="-rotate-2"
            key={`tag-${cutId}`}
            style={{ animation: "cinematicPop 380ms cubic-bezier(0.2,1.4,0.4,1) both" }}
          >
            <span className="inline-block border-[3px] border-black bg-[#ffe45e] px-2.5 py-1 text-[11px] font-black tracking-[0.08em] text-black shadow-[3px_3px_0_rgba(0,0,0,0.85)]">
              {cut.tag}
            </span>
          </div>

          {cut.caption ? (
            <p
              className="max-w-[17rem] border-[3px] border-black bg-white px-3 py-1.5 text-left text-[14px] font-black leading-snug text-black shadow-[4px_4px_0_rgba(0,0,0,0.85)] sm:max-w-[22rem] sm:text-[15px]"
              key={`caption-${cutId}`}
              style={{ animation: "cinematicSlide 420ms cubic-bezier(0.2,1.2,0.35,1) both" }}
            >
              {cut.caption}
            </p>
          ) : null}
        </div>

        {/* 진행바 */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[3px] bg-black/60">
          <div
            className="h-full origin-left bg-[#ffe45e]"
            ref={barRef}
            style={{ transform: "scaleX(0)" }}
          />
        </div>

        <Button
          className="absolute right-4 top-[calc(1rem+env(safe-area-inset-top,0px))] z-20 border-[3px] border-black bg-white px-3 py-1 text-[11px] font-black text-black shadow-[3px_3px_0_rgba(0,0,0,0.85)]"
          onPress={finish}
          size="sm"
          variant="secondary"
        >
          건너뛰기
        </Button>

        <style>{`
          @keyframes cinematicPop {
            from { opacity: 0; transform: rotate(-2deg) scale(0.7); }
            to { opacity: 1; transform: rotate(-2deg) scale(1); }
          }
          @keyframes cinematicSlide {
            from { opacity: 0; transform: translateX(-14px) scale(0.94); }
            to { opacity: 1; transform: translateX(0) scale(1); }
          }
        `}</style>
      </div>
    </PwaIntroPortal>
  );
}

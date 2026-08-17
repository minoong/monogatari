"use client";

import { useCallback, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { motion, useReducedMotion } from "motion/react";

import Aurora from "@/components/Aurora";
import { TravelDottedMap } from "@/components/pwa/travel-dotted-map";

const auroraColorStops = ["#3b82f6", "#38bdf8", "#f472b6"];

const floatingMemories = [
  { label: "일정", description: "방콕 여행 타임라인" },
  { label: "체크리스트", description: "준비물 전투" },
  { label: "가계부", description: "태국 바트 지출" },
  { label: "위시", description: "먹고 싶은 것들" },
];

const INTRO_DURATION_MS = 3200;
const REDUCED_MOTION_DURATION_MS = 900;

interface PwaIntroProps {
  onComplete: () => void;
}

export function PwaIntro({ onComplete }: PwaIntroProps) {
  const reduceMotion = useReducedMotion();
  const floatingRefs = useRef<(HTMLDivElement | null)[]>([]);
  const completedRef = useRef(false);

  const finish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    const duration = reduceMotion ? REDUCED_MOTION_DURATION_MS : INTRO_DURATION_MS;
    const timer = window.setTimeout(finish, duration);
    return () => window.clearTimeout(timer);
  }, [finish, reduceMotion]);

  useEffect(() => {
    if (reduceMotion) return;

    const ctx = gsap.context(() => {
      floatingRefs.current.forEach((node, index) => {
        if (!node) return;

        gsap.to(node, {
          y: index % 2 === 0 ? -14 : 12,
          x: index % 2 === 0 ? 8 : -10,
          rotate: index % 2 === 0 ? 2 : -2,
          duration: 3.2 + index * 0.3,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      });
    });

    return () => ctx.revert();
  }, [reduceMotion]);

  return (
    <motion.div
      animate={{ opacity: 1 }}
      aria-label="앱 인트로"
      className="fixed inset-0 z-[120] flex touch-none flex-col overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100"
      exit={{ opacity: 0 }}
      initial={{ opacity: 1 }}
      onClick={finish}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          finish();
        }
      }}
      role="button"
      tabIndex={0}
      transition={{ duration: 0.45, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,#dbeafe,transparent_34%),linear-gradient(135deg,#f8fafc,#e2e8f0,#f8fafc)] dark:bg-[radial-gradient(circle_at_top_left,#1e3a5f,transparent_34%),linear-gradient(135deg,#020617,#0f172a,#020617)]" />
      <div className="absolute inset-x-0 top-0 -z-10 h-72 opacity-80">
        <Aurora amplitude={0.9} blend={0.55} colorStops={auroraColorStops} speed={0.55} />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-slate-50 via-slate-50/80 to-transparent dark:from-slate-950 dark:via-slate-950/80" />

      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto overscroll-contain px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(3.5rem,env(safe-area-inset-top))]">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 18 }}
          transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
          <TravelDottedMap />
        </motion.div>

        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-3"
          initial={{ opacity: 0, y: 22 }}
          transition={{ delay: 0.08, duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
          <span className="inline-flex w-fit rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-600 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
            Bangkok travel mate
          </span>
          <h1 className="text-[1.75rem] font-bold tracking-tight text-balance sm:text-4xl">
            가현쨩과 미누쿤의
            <span className="mt-1 block text-slate-500 dark:text-slate-400">모노가타리 🇹🇭</span>
          </h1>
          <p className="max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
            일정, 체크리스트, 가계부, 위시까지 한곳에서 함께 준비하는 방콕 여행 메이트입니다.
          </p>
        </motion.div>

        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="relative min-h-52 flex-1"
          initial={{ opacity: 0, y: 24 }}
          transition={{ delay: 0.16, duration: 0.75, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
          {floatingMemories.map((item, index) => (
            <div
              className="absolute rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-lg backdrop-blur dark:border-white/10 dark:bg-slate-900/80"
              key={item.label}
              ref={(node) => {
                floatingRefs.current[index] = node;
              }}
              style={{
                left: `${6 + (index % 2) * 46}%`,
                top: `${8 + index * 18}%`,
                transform: `rotate(${index % 2 === 0 ? -3 : 4}deg)`,
                width: index % 2 === 0 ? "44%" : "40%",
              }}
            >
              <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-blue-100 via-slate-50 to-pink-100 dark:from-blue-950 dark:via-slate-900 dark:to-pink-950" />
              <p className="mt-2 text-sm font-semibold">{item.label}</p>
              <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{item.description}</p>
            </div>
          ))}
        </motion.div>

        <motion.p
          animate={{ opacity: 1 }}
          className="shrink-0 text-center text-xs font-medium text-slate-400"
          initial={{ opacity: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
        >
          탭하거나 잠시 후 시작됩니다
        </motion.p>
      </div>
    </motion.div>
  );
}

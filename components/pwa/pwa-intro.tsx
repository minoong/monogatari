"use client";

import * as React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { motion, useReducedMotion } from "motion/react";

import Noise from "@/components/Noise";
import { AnimatedNumber } from "@/components/core/animated-number";
import { TextEffect } from "@/components/core/text-effect";
import {
  PwaIntroPhotoFlash,
  PwaIntroPhotoZoomExit,
  type PwaIntroFlashImage,
} from "@/components/pwa/pwa-intro-photo-flash";

const introImages = [
  { alt: "방콕 여행 준비 장면 1", src: "/loading/fetch-01.jpg" },
  { alt: "방콕 여행 준비 장면 2", src: "/loading/fetch-02.jpg" },
  { alt: "방콕 여행 준비 장면 3", src: "/loading/fetch-03.jpg" },
  { alt: "방콕 여행 준비 장면 4", src: "/loading/fetch-04.jpg" },
  { alt: "방콕 여행 준비 장면 5", src: "/loading/fetch-05.jpg" },
  { alt: "함께 손을 맞댄 순간", src: "/intro/couple-hands.png" },
] satisfies PwaIntroFlashImage[];

const lastIntroImage = introImages[introImages.length - 1]!;
const datingStartDate = { day: 31, monthIndex: 7, year: 2025 };
const countUpDurationMs = 2000;
const reducedMotionCountUpDurationMs = 150;
const countCompletePauseMs = 650;
const lastImageHoldMs = 700;
const tripTitle = "내 멍멍이 같이 가";

const createTextEffectVariants = ({
  delayChildren,
  prefersReducedMotion,
}: {
  delayChildren: number;
  prefersReducedMotion: boolean;
}) => ({
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: prefersReducedMotion ? 0 : delayChildren,
        staggerChildren: prefersReducedMotion ? 0 : 0.16,
      },
    },
  },
  item: {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: prefersReducedMotion ? 0 : 0.42 },
    },
  },
});

interface PwaIntroProps {
  onComplete: () => void;
  onExitStart: () => void;
}

export function PwaIntro({ onComplete, onExitStart }: PwaIntroProps) {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const durationMs = prefersReducedMotion ? reducedMotionCountUpDurationMs : countUpDurationMs;
  const completedRef = React.useRef(false);
  const [stage, setStage] = React.useState<"play" | "exit">("play");

  const coupleTextEffectVariants = React.useMemo(
    () => createTextEffectVariants({ delayChildren: 0, prefersReducedMotion }),
    [prefersReducedMotion],
  );
  const sinceTextEffectVariants = React.useMemo(
    () => createTextEffectVariants({ delayChildren: 0.42, prefersReducedMotion }),
    [prefersReducedMotion],
  );
  const titleTextEffectVariants = React.useMemo(
    () => createTextEffectVariants({ delayChildren: 0.78, prefersReducedMotion }),
    [prefersReducedMotion],
  );

  const datingDayCount = React.useMemo(() => getDatingDayCount(), []);
  const [displayedDayCount, setDisplayedDayCount] = React.useState(0);

  const beginExit = React.useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    onExitStart();
    setStage("exit");
  }, [onExitStart]);

  React.useEffect(() => {
    const timer = window.setTimeout(() => setDisplayedDayCount(datingDayCount), 50);
    return () => window.clearTimeout(timer);
  }, [datingDayCount]);

  React.useEffect(() => {
    const flashCompleteMs = (introImages.length - 1) * 480;
    const countCompleteMs = durationMs + countCompletePauseMs;
    const exitDelayMs = Math.max(flashCompleteMs, countCompleteMs) + lastImageHoldMs;
    const timer = window.setTimeout(beginExit, exitDelayMs);
    return () => window.clearTimeout(timer);
  }, [beginExit, durationMs]);

  return (
    <motion.div
      animate={{ backgroundColor: stage === "exit" ? "rgba(2,6,23,0)" : "rgb(10 10 10)" }}
      aria-label="앱 인트로"
      className="fixed inset-0 z-[120] touch-none overflow-hidden text-white"
      transition={{ duration: stage === "exit" ? 0.35 : 0 }}
    >
      {stage === "play" ? (
        <PwaIntroPhotoFlash active images={introImages} reducedMotion={prefersReducedMotion} />
      ) : (
        <PwaIntroPhotoZoomExit
          image={lastIntroImage}
          onComplete={onComplete}
          reducedMotion={prefersReducedMotion}
        />
      )}

      {stage === "play" ? <Noise patternAlpha={18} patternRefreshInterval={3} /> : null}

      {stage === "play" ? (
        <div className="relative z-10 flex min-h-full flex-col items-center justify-center px-6 pb-16 pt-[max(3rem,env(safe-area-inset-top))] text-center">
          <div className="pointer-events-none mb-1 size-24 shrink-0 sm:size-28">
            <DotLottieReact autoplay loop src="/reservation-heart.lottie" />
          </div>

          <TextEffect
          as="p"
          className="text-sm font-black tracking-[0.14em] text-white/70"
          per="line"
          segmentTransition={{ duration: prefersReducedMotion ? 0 : 0.7, ease: [0.16, 1, 0.3, 1] }}
          segmentWrapperClassName="block overflow-hidden"
          trigger
          variants={coupleTextEffectVariants}
        >
          가현쨩 ❤️ 미누쿤
        </TextEffect>
        <p aria-label={`사귄 지 ${datingDayCount}일`} className="mt-5 flex items-end justify-center gap-2 font-black text-white">
          <AnimatedNumber
            className="text-7xl leading-none tracking-normal tabular-nums"
            springOptions={{ bounce: 0, duration: durationMs }}
            value={displayedDayCount}
          />
          <span className="pb-2 text-3xl leading-none tracking-normal">일</span>
        </p>
        <TextEffect
          as="p"
          className="mt-3 text-sm font-bold tracking-[0.16em] text-white/55 uppercase"
          per="line"
          segmentWrapperClassName="block overflow-hidden"
          trigger
          variants={sinceTextEffectVariants}
        >
          since 2025.08.31
        </TextEffect>
        <TextEffect
          as="p"
          className="mt-5 text-lg font-black tracking-[-0.04em] text-white/80"
          per="line"
          segmentTransition={{ duration: prefersReducedMotion ? 0 : 0.7, ease: [0.16, 1, 0.3, 1] }}
          segmentWrapperClassName="block overflow-hidden"
          trigger
          variants={titleTextEffectVariants}
        >
          {tripTitle}
        </TextEffect>
        </div>
      ) : null}

      {stage === "play" ? (
        <button
          aria-label="인트로 건너뛰기"
          className="absolute inset-0 z-20 cursor-default"
          onClick={beginExit}
          type="button"
        />
      ) : null}
    </motion.div>
  );
}

function getDatingDayCount() {
  const today = getSeoulDateUtcValue(new Date());
  const start = Date.UTC(datingStartDate.year, datingStartDate.monthIndex, datingStartDate.day);
  if (today < start) return 0;
  return Math.floor((today - start) / 86_400_000) + 1;
}

function getSeoulDateUtcValue(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Seoul",
    year: "numeric",
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts.filter((part) => part.type !== "literal").map((part) => [part.type, Number(part.value)]),
  );
  return Date.UTC(values.year, values.month - 1, values.day);
}

"use client";

import NumberFlow from "@number-flow/react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { josa } from "es-hangul";
import { Crown, RotateCcw, Trophy } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import type { ChecklistBattleStats, ChecklistPlayerStats, ChecklistUser } from "../../lib/checklist";

interface ChecklistBattleCardProps {
  stats: ChecklistBattleStats;
  isLoading: boolean;
  isError: boolean;
  onOpen: () => void;
  onRetry: () => void;
}

const PLAYER_META = {
  gahyun: {
    name: "가현쨩",
    avatar: "/avatars/gahyun.webp",
    accent: "#f472b6",
    glow: "rgba(244,114,182,0.42)",
    textClass: "text-rose-600",
    gradient: "from-rose-500 via-pink-500 to-fuchsia-500",
  },
  minu: {
    name: "미누쿤",
    avatar: "/avatars/minu.webp",
    accent: "#8b5cf6",
    glow: "rgba(139,92,246,0.4)",
    textClass: "text-violet-600",
    gradient: "from-violet-500 via-purple-500 to-sky-400",
  },
} as const;

const battleMessage = (stats: ChecklistBattleStats) => {
  if (stats.result === "empty") return "뭘 빼먹으려고? 준비물부터 등록해!";
  if (stats.result === "perfect") return "흥, 이 정도는 당연하잖아. 공동 퍼펙트!";
  if (stats.result === "tie") return "착각하지 마, 아직 승부는 안 끝났어!";

  const name = PLAYER_META[stats.result].name;
  return `${josa(name, "이/가")} ${stats.lead}%P 앞서네. 빨리 따라와!`;
};

const useDuelScoreReveal = (
  stats: ChecklistBattleStats,
  prefersReducedMotion: boolean,
) => {
  const targetGahyun = stats.gahyun.progress;
  const targetMinu = stats.minu.progress;
  const [displayScore, setDisplayScore] = useState(() => (
    prefersReducedMotion
      ? { gahyun: targetGahyun, minu: targetMinu }
      : { gahyun: 0, minu: 0 }
  ));
  const [isSettled, setIsSettled] = useState(prefersReducedMotion);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const midpoint = Math.max(12, Math.round((targetGahyun + targetMinu) / 2));

    const timers = [
      window.setTimeout(() => {
        setDisplayScore({ gahyun: 0, minu: 0 });
        setIsSettled(false);
      }, 0),
      window.setTimeout(() => setDisplayScore({
        gahyun: Math.min(100, midpoint + 7),
        minu: Math.max(0, midpoint - 4),
      }), 150),
      window.setTimeout(() => setDisplayScore({
        gahyun: Math.max(0, midpoint - 5),
        minu: Math.min(100, midpoint + 8),
      }), 470),
      window.setTimeout(() => setDisplayScore({
        gahyun: Math.min(100, targetGahyun + 5),
        minu: Math.min(100, targetMinu + 3),
      }), 790),
      window.setTimeout(() => {
        setDisplayScore({ gahyun: targetGahyun, minu: targetMinu });
        setIsSettled(true);
      }, 1_120),
    ];

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [prefersReducedMotion, targetGahyun, targetMinu]);

  return prefersReducedMotion
    ? { displayScore: { gahyun: targetGahyun, minu: targetMinu }, isSettled: true }
    : { displayScore, isSettled };
};

const BattleSide = ({
  user,
  score,
  displayProgress,
  isLeader,
  prefersReducedMotion,
}: {
  user: ChecklistUser;
  score: ChecklistPlayerStats;
  displayProgress: number;
  isLeader: boolean;
  prefersReducedMotion: boolean;
}) => {
  const meta = PLAYER_META[user];

  return (
    <div className="relative min-w-0 flex-1 text-center">
      <motion.div
        className="mx-auto flex w-fit items-center gap-2 rounded-full border border-white/80 bg-white/75 px-2.5 py-1.5 shadow-sm backdrop-blur"
        animate={isLeader && !prefersReducedMotion ? {
          boxShadow: [`0 0 0 ${meta.glow}`, `0 0 22px ${meta.glow}`, `0 0 0 ${meta.glow}`],
        } : undefined}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <Avatar className="size-8 border-2 border-white shadow-sm">
          <AvatarImage src={meta.avatar} alt="" />
          <AvatarFallback>{meta.name.slice(0, 1)}</AvatarFallback>
        </Avatar>
        <span className="truncate text-xs font-black text-slate-800 sm:text-sm">{meta.name}</span>
        {isLeader ? (
          <motion.span
            aria-label="현재 선두"
            animate={prefersReducedMotion ? undefined : { y: [0, -3, 0], rotate: [-5, 5, -5] }}
            transition={{ duration: 1.1, repeat: Infinity }}
          >
            <Crown className="size-4 text-amber-300" fill="currentColor" />
          </motion.span>
        ) : null}
      </motion.div>

      <div className={`mt-2 flex items-end justify-center leading-none ${meta.textClass}`}>
        <NumberFlow
          className="text-[2.7rem] font-black tracking-[-0.08em] tabular-nums sm:text-5xl"
          value={displayProgress}
        />
        <span className="mb-1 ml-1 text-sm font-black">%</span>
      </div>
      <p className="mt-1 text-[11px] font-bold text-slate-600">
        {score.completed}/{score.total} 완료 · {score.remaining}개 남음
      </p>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/80 shadow-inner" aria-hidden="true">
        <motion.div
          key={`${user}-${score.progress}`}
          className={`h-full rounded-full bg-gradient-to-r ${meta.gradient}`}
          initial={prefersReducedMotion ? { width: `${score.progress}%` } : { width: 0 }}
          animate={{
            width: prefersReducedMotion
              ? `${score.progress}%`
              : [
                "0%",
                `${Math.min(100, score.progress + (user === "gahyun" ? 9 : 4))}%`,
                `${Math.max(0, score.progress - (user === "gahyun" ? 3 : 7))}%`,
                `${score.progress}%`,
              ],
          }}
          transition={{ duration: prefersReducedMotion ? 0 : 1.2, times: [0, 0.5, 0.78, 1], ease: "easeInOut" }}
        />
      </div>
    </div>
  );
};

const DuelMeter = ({ stats, prefersReducedMotion }: {
  stats: ChecklistBattleStats;
  prefersReducedMotion: boolean;
}) => {
  const totalProgress = stats.gahyun.progress + stats.minu.progress;
  const finalShare = totalProgress === 0
    ? 50
    : Math.round((stats.gahyun.progress / totalProgress) * 100);
  const clamp = (value: number) => Math.min(88, Math.max(12, value));
  const leftKeyframes = [50, clamp(finalShare + 12), clamp(finalShare - 9), clamp(finalShare + 5), finalShare];
  const rightKeyframes = leftKeyframes.map((value) => 100 - value);

  return (
    <div className="relative mt-4" aria-label={`대결 게이지 가현쨩 ${finalShare}, 미누쿤 ${100 - finalShare}`}>
      <div className="mb-1.5 flex justify-between text-[9px] font-black tracking-wide text-slate-500" aria-hidden="true">
        <span>가현 PUSH</span>
        <span>MINU PUSH</span>
      </div>
      <div className="relative h-4">
        <div className="absolute inset-0 overflow-hidden rounded-full border-2 border-white bg-white shadow-inner">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-400"
            initial={false}
            animate={{ width: prefersReducedMotion ? `${finalShare}%` : leftKeyframes.map((value) => `${value}%`) }}
            transition={{ duration: prefersReducedMotion ? 0 : 1.38, times: [0, 0.25, 0.5, 0.75, 1], ease: "easeInOut" }}
          />
          <motion.div
            className="absolute inset-y-0 right-0 bg-gradient-to-l from-violet-500 via-purple-500 to-sky-400"
            initial={false}
            animate={{ width: prefersReducedMotion ? `${100 - finalShare}%` : rightKeyframes.map((value) => `${value}%`) }}
            transition={{ duration: prefersReducedMotion ? 0 : 1.38, times: [0, 0.25, 0.5, 0.75, 1], ease: "easeInOut" }}
          />
        </div>
        <motion.div
          className="pointer-events-none absolute top-1/2 z-10 size-9 -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_0_9px_rgba(244,63,94,0.55)]"
          initial={false}
          animate={{ left: prefersReducedMotion ? `${finalShare}%` : leftKeyframes.map((value) => `${value}%`) }}
          transition={{ duration: prefersReducedMotion ? 0 : 1.38, times: [0, 0.25, 0.5, 0.75, 1], ease: "easeInOut" }}
          aria-hidden="true"
        >
          <DotLottieReact
            src="/checklist-battle-love.lottie"
            autoplay={!prefersReducedMotion}
            loop={!prefersReducedMotion}
            className="size-full"
          />
        </motion.div>
      </div>
    </div>
  );
};

const BattleSkeleton = () => (
  <div
    className="relative min-h-[264px] overflow-hidden rounded-[28px] border border-pink-200 bg-gradient-to-br from-rose-50 via-pink-50 to-violet-100 p-5 shadow-lg"
    role="status"
    aria-label="준비물 대결 현황을 불러오는 중"
    aria-busy="true"
  >
    <div className="h-3 w-32 animate-pulse rounded-full bg-pink-300/50" />
    <div className="mt-4 h-5 w-52 animate-pulse rounded-full bg-violet-200/70" />
    <div className="mt-8 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
      <div className="h-28 animate-pulse rounded-2xl bg-white/70" />
      <div className="size-12 animate-pulse rounded-full bg-amber-200/80" />
      <div className="h-28 animate-pulse rounded-2xl bg-white/70" />
    </div>
    <div className="mt-7 h-9 animate-pulse rounded-xl bg-white/70" />
  </div>
);

export const ChecklistBattleCard = ({
  stats,
  isLoading,
  isError,
  onOpen,
  onRetry,
}: ChecklistBattleCardProps) => {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const { displayScore, isSettled } = useDuelScoreReveal(stats, prefersReducedMotion);

  if (isLoading) return <BattleSkeleton />;

  if (isError) {
    return (
      <section className="flex min-h-[264px] flex-col items-center justify-center rounded-[28px] border border-rose-200 bg-rose-50 px-6 text-center dark:border-rose-950 dark:bg-rose-950/20">
        <p className="font-black text-slate-900 dark:text-white">점수판 연결에 실패했어요</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">준비물 현황을 다시 집계해 볼게요.</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex h-10 items-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-bold text-white transition-transform active:scale-95 dark:bg-white dark:text-slate-950"
        >
          <RotateCcw className="size-4" /> 다시 시도
        </button>
      </section>
    );
  }

  const gahyunLeads = stats.result === "gahyun";
  const minuLeads = stats.result === "minu";

  return (
    <motion.button
      type="button"
      aria-label="가현쨩과 미누쿤 준비물 대결 보기"
      onClick={onOpen}
      className="group relative w-full overflow-hidden rounded-[28px] border border-pink-200 bg-gradient-to-br from-rose-50 via-pink-50 to-violet-100 p-5 text-left shadow-[0_18px_45px_-24px_rgba(236,72,153,0.42)] outline-none transition-transform active:scale-[0.985] focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.42, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: "linear-gradient(rgba(244,114,182,.16) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,.12) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute -left-16 top-12 size-40 rounded-full bg-rose-400/25 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-16 top-12 size-40 rounded-full bg-violet-400/25 blur-3xl" aria-hidden="true" />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] font-black tracking-[0.24em] text-pink-600">PACKING BATTLE</p>
          <p className="mt-1 text-sm font-black text-slate-900">
            {isSettled ? battleMessage(stats) : "흥, 승부는 지금부터라고!"}
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white bg-white/75 px-2.5 py-1 text-[10px] font-bold text-violet-700 shadow-sm">
          <Trophy className="size-3.5 text-amber-500" /> 준비 대결
        </span>
      </div>

      <div className="relative mt-6 grid grid-cols-[minmax(0,1fr)_44px_minmax(0,1fr)] items-center gap-3">
        <BattleSide user="gahyun" score={stats.gahyun} displayProgress={displayScore.gahyun} isLeader={gahyunLeads} prefersReducedMotion={prefersReducedMotion} />
        <motion.span
          className="flex size-11 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-amber-300 to-orange-400 text-sm font-black italic text-slate-900 shadow-[0_0_24px_rgba(251,146,60,0.38)]"
          animate={prefersReducedMotion ? undefined : { scale: [1, 1.09, 1] }}
          transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 0.7 }}
          aria-hidden="true"
        >
          VS
        </motion.span>
        <BattleSide user="minu" score={stats.minu} displayProgress={displayScore.minu} isLeader={minuLeads} prefersReducedMotion={prefersReducedMotion} />
      </div>

      <DuelMeter stats={stats} prefersReducedMotion={prefersReducedMotion} />

      <div className="relative mt-4 grid grid-cols-3 items-center rounded-2xl border border-white bg-white/70 px-3 py-3 text-[11px] font-bold text-slate-600 shadow-sm backdrop-blur sm:text-xs">
        <span>전체 <strong className="text-slate-950">{stats.uniqueTotal}개</strong></span>
        <span className="text-center">팀 평균 <strong className="text-pink-600"><NumberFlow value={stats.averageProgress} />%</strong></span>
        <span className="text-right font-black text-violet-600 transition-transform group-hover:translate-x-0.5">승부 보러 가기 →</span>
      </div>
    </motion.button>
  );
};

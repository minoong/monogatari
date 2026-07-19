"use client";

import * as React from "react";
import { MoreHorizontal } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

export interface MinimalCardExpandItem {
  id: string;
  title: string;
  value: string;
  icon?: React.ReactNode;
  colorClassName: string;
  imageUrl?: string;
  expandedActions?: {
    primary?: React.ReactNode;
    secondary?: React.ReactNode;
  };
}

interface MinimalCardExpandProps {
  items: readonly [
    MinimalCardExpandItem,
    MinimalCardExpandItem,
    MinimalCardExpandItem,
    MinimalCardExpandItem,
  ];
  className?: string;
  initialExpandedId?: string | null;
  onExpandedChange?: (id: string | null) => void;
  autoCycle?: boolean;
}

interface CardProps {
  item: MinimalCardExpandItem;
  expanded: boolean;
  condensed: boolean;
  activeCardRef: React.RefObject<HTMLElement | null>;
  onUserExpand: (id: string) => void;
  prefersReducedMotion: boolean | null;
}

const SkiperCard = ({
  item,
  expanded,
  condensed,
  activeCardRef,
  onUserExpand,
  prefersReducedMotion,
}: CardProps) => (
  <motion.article
    ref={expanded ? activeCardRef : undefined}
    layout
    transition={{
      layout: prefersReducedMotion
        ? { duration: 0 }
        : { type: "spring", stiffness: 280, damping: 28, mass: 0.75 },
    }}
    style={item.imageUrl ? {
      backgroundImage: `linear-gradient(180deg, rgba(8, 10, 18, 0.08) 0%, rgba(8, 10, 18, 0.72) 100%), url(${item.imageUrl})`,
      backgroundPosition: "center",
      backgroundSize: "cover",
    } : undefined}
    className={`relative flex min-w-0 flex-col items-start justify-between overflow-hidden rounded-[24px] p-3 text-white ${item.colorClassName} ${
      expanded
        ? "col-span-3 row-start-1 h-[180px] w-full"
        : condensed
          ? "col-span-1 row-start-2 h-[100px] w-full"
          : "col-span-1 h-[125px] w-full"
    }`}
  >
    <div className="flex w-full items-start justify-between gap-3">
      {item.icon ? <div className="flex size-8 shrink-0 items-center justify-center text-white">{item.icon}</div> : <span />}
      {expanded ? (
        <div className="flex items-center justify-end gap-2">{item.expandedActions?.primary}</div>
      ) : (
        <button
          type="button"
          data-minimal-card-expand-menu
          aria-label={`${item.title} 펼치기`}
          aria-expanded={false}
          onClick={() => onUserExpand(item.id)}
          className="flex size-6 items-center justify-center rounded-full bg-white/20 p-0.5 text-white transition-colors duration-150 ease-out hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
        >
          <MoreHorizontal size={16} aria-hidden="true" />
        </button>
      )}
    </div>

    <div className={expanded ? "flex w-full min-w-0 items-end justify-between gap-3" : "flex min-w-0 flex-col items-start justify-center"}>
      <div className="min-w-0">
        <motion.h3
          layout="position"
          className={`font-semibold leading-tight ${
            expanded
              ? "truncate text-[clamp(1.25rem,6vw,1.5rem)]"
              : "line-clamp-2 break-words text-[clamp(0.8125rem,3.8vw,1rem)]"
          }`}
        >
          {item.title}
        </motion.h3>
        <motion.p
          layout="position"
          className={`mt-1 max-w-full truncate font-semibold text-white/55 ${
            expanded ? "text-[clamp(1rem,5vw,1.25rem)]" : "text-[clamp(0.6875rem,3vw,0.875rem)]"
          }`}
        >
          {item.value}
        </motion.p>
      </div>
      {expanded && item.expandedActions?.secondary ? (
        <div className="shrink-0">{item.expandedActions.secondary}</div>
      ) : null}
    </div>
  </motion.article>
);

/**
 * A faithful, reusable implementation of Skiper UI's "Minimal Card Expand".
 * It intentionally takes four cards: the active card moves to the full-width
 * top row and the remaining three cards form the compact bottom row.
 */
export function MinimalCardExpand({
  items,
  className,
  initialExpandedId = null,
  onExpandedChange,
  autoCycle = false,
}: MinimalCardExpandProps) {
  const [expandedId, setExpandedId] = React.useState<string | null>(initialExpandedId);
  const [isInView, setIsInView] = React.useState(false);
  const [isAutoCyclePaused, setIsAutoCyclePaused] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const activeCardRef = React.useRef<HTMLElement | null>(null);
  const cycleIndexRef = React.useRef(0);
  const resumeTimerRef = React.useRef<number | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const setExpanded = React.useCallback((id: string | null) => {
    setExpandedId(id);
    onExpandedChange?.(id);
  }, [onExpandedChange]);

  const handleUserExpand = React.useCallback((id: string) => {
    setExpanded(id);
    if (!autoCycle) return;

    const selectedIndex = items.findIndex((item) => item.id === id);
    cycleIndexRef.current = selectedIndex >= 0 ? (selectedIndex + 1) % items.length : 0;
    setIsAutoCyclePaused(true);

    if (resumeTimerRef.current) window.clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = window.setTimeout(() => {
      setIsAutoCyclePaused(false);
      resumeTimerRef.current = null;
    }, 5_000);
  }, [autoCycle, items, setExpanded]);

  React.useEffect(() => {
    if (!autoCycle || !containerRef.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
    }, { threshold: 0.45 });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [autoCycle]);

  React.useEffect(() => {
    if (!autoCycle || !isInView || isAutoCyclePaused || prefersReducedMotion) return;

    let timer: number | null = null;
    let isCancelled = false;
    const schedule = (callback: () => void, delay: number) => {
      timer = window.setTimeout(() => {
        if (!isCancelled) callback();
      }, delay);
    };

    const playNext = () => {
      const nextIndex = cycleIndexRef.current;
      const isLastItem = nextIndex === items.length - 1;
      setExpanded(items[nextIndex].id);
      cycleIndexRef.current = (nextIndex + 1) % items.length;

      schedule(() => {
        if (isLastItem) {
          setExpanded(null);
          schedule(playNext, 2_400);
          return;
        }
        playNext();
      }, 2_200);
    };

    schedule(playNext, 900);
    return () => {
      isCancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [autoCycle, isAutoCyclePaused, isInView, items, prefersReducedMotion, setExpanded]);

  React.useEffect(() => () => {
    if (resumeTimerRef.current) window.clearTimeout(resumeTimerRef.current);
  }, []);

  React.useEffect(() => {
    if (!expandedId) return;

    const handleOutsidePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest("[data-minimal-card-expand-menu]")) {
        return;
      }
      if (activeCardRef.current && !activeCardRef.current.contains(event.target as Node)) {
        setExpanded(null);
      }
    };

    document.addEventListener("pointerdown", handleOutsidePointerDown);
    return () => document.removeEventListener("pointerdown", handleOutsidePointerDown);
  }, [expandedId, setExpanded]);

  return (
    <div
      ref={containerRef}
      className={`grid h-[300px] w-full min-w-0 max-w-none gap-4 ${
        expandedId
          ? "grid-cols-3 grid-rows-[180px_100px]"
          : "grid-cols-2 grid-rows-[125px_125px]"
      } ${className ?? ""}`}
      aria-label="확장 카드 데모"
    >
      {items.map((item) => {
        const expanded = expandedId === item.id;
        return (
          <SkiperCard
            key={item.id}
            item={item}
            expanded={expanded}
            condensed={expandedId !== null && !expanded}
            activeCardRef={activeCardRef}
            onUserExpand={handleUserExpand}
            prefersReducedMotion={prefersReducedMotion}
          />
        );
      })}
    </div>
  );
}

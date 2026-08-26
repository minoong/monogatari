"use client";

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { ScheduleSegmentProgress } from "@/lib/schedule";
import "./schedule-timeline.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const TIME_COL = "2.75rem";
const DOT_COL = "0.625rem";
const RAIL_LEFT = `calc(${TIME_COL} + 0.375rem + (${DOT_COL} / 2))`;

export type ScheduleTimelineEntry = {
  id: string;
  time: string;
  current?: boolean;
  content: React.ReactNode;
};

interface ScheduleTimelineProps {
  entries: ScheduleTimelineEntry[];
  railContent?: React.ReactNode;
  liveProgress?: ScheduleSegmentProgress | null;
}

function ScheduleTimeLabel({ time, current, past, waiting }: { time: string; current?: boolean; past?: boolean; waiting?: boolean }) {
  return (
    <time
      dateTime={time}
      className={
        current
          ? "block self-start pt-[1.125rem] text-right text-[11px] font-extrabold leading-none tracking-tight text-blue-600 tabular-nums dark:text-blue-400"
          : waiting
            ? "block self-start pt-[1.125rem] text-right text-[11px] font-extrabold leading-none tracking-tight text-sky-500 tabular-nums dark:text-sky-400"
            : past
              ? "block self-start pt-[1.125rem] text-right text-[11px] font-extrabold leading-none tracking-tight text-blue-400/75 tabular-nums dark:text-blue-400/60"
              : "block self-start pt-[1.125rem] text-right text-[11px] font-extrabold leading-none tracking-tight text-slate-500 tabular-nums dark:text-slate-400"
      }
    >
      {time}
    </time>
  );
}

function getDotCenterY(dot: HTMLElement, contentTop: number) {
  const rect = dot.getBoundingClientRect();
  return rect.top + rect.height / 2 - contentTop;
}

export function ScheduleTimeline({ entries, railContent, liveProgress }: ScheduleTimelineProps) {
  const rootRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [railHeight, setRailHeight] = useState(0);
  const [fillHeight, setFillHeight] = useState(0);

  const anchorItemId = liveProgress?.activeItemId ?? liveProgress?.waitingAtItemId ?? null;
  const anchorIndex = anchorItemId ? entries.findIndex((entry) => entry.id === anchorItemId) : -1;

  const updateFillHeight = useCallback(() => {
    const content = contentRef.current;
    if (!content || !liveProgress) {
      setFillHeight(0);
      return;
    }

    const dayComplete = !liveProgress.activeItemId && !liveProgress.waitingAtItemId && liveProgress.pastItemIds.length > 0;
    if (dayComplete) {
      setFillHeight(railHeight || content.getBoundingClientRect().height);
      return;
    }

    if (!anchorItemId || anchorIndex < 0) {
      setFillHeight(0);
      return;
    }

    const anchorDot = dotRefs.current[anchorIndex];
    if (!anchorDot) {
      setFillHeight(0);
      return;
    }

    const contentTop = content.getBoundingClientRect().top;
    const anchorY = getDotCenterY(anchorDot, contentTop);

    if (liveProgress.waitingAtItemId && !liveProgress.activeItemId) {
      setFillHeight(Math.max(0, anchorY));
      return;
    }

    const nextDot = dotRefs.current[anchorIndex + 1];
    const segmentEndY = nextDot
      ? getDotCenterY(nextDot, contentTop)
      : railHeight || content.getBoundingClientRect().height;
    const endY = anchorY + (segmentEndY - anchorY) * liveProgress.segmentProgress;

    setFillHeight(Math.max(0, Math.min(railHeight || segmentEndY, endY)));
  }, [anchorIndex, anchorItemId, liveProgress, railHeight]);

  useEffect(() => {
    if (!contentRef.current) return;
    const observer = new ResizeObserver(([entry]) => setRailHeight(entry.contentRect.height));
    observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    updateFillHeight();
  }, [updateFillHeight, entries.length, railHeight]);

  useEffect(() => {
    if (!contentRef.current) return;
    const observer = new ResizeObserver(() => updateFillHeight());
    observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, [updateFillHeight]);

  useGSAP(() => {
    const root = rootRef.current;
    const content = contentRef.current;
    if (!root || !content) return;

    const media = gsap.matchMedia();

    media.add("(prefers-reduced-motion: no-preference)", () => {
      const rail = root.querySelector<HTMLElement>(".schedule-timeline-rail");
      const cards = gsap.utils.toArray<HTMLElement>("[data-schedule-entry]", root);

      if (rail) gsap.from(rail, { scaleY: 0, duration: 0.65, ease: "power3.out" });

      gsap.from(cards, {
        y: 28,
        autoAlpha: 0,
        duration: 0.5,
        stagger: 0.09,
        ease: "power3.out",
        clearProps: "opacity,visibility,transform",
      });

      const triggers: ScrollTrigger[] = [];

      ScrollTrigger.refresh();

      return () => {
        triggers.forEach((trigger) => trigger.kill());
      };
    });

    return () => media.revert();
  }, { scope: rootRef, dependencies: [entries.length, railHeight], revertOnUpdate: true });

  return (
    <section
      ref={rootRef}
      className="schedule-timeline relative w-full min-w-0 font-sans"
      aria-label="일정 타임라인"
    >
      <div ref={contentRef} className="relative min-w-0 pb-8">
        <span
          aria-hidden="true"
          className="schedule-timeline-rail pointer-events-none absolute top-0 w-0.5 -translate-x-1/2 rounded-full bg-slate-200/90 dark:bg-slate-700/90"
          style={{ left: RAIL_LEFT, height: railHeight }}
        />
        {liveProgress && fillHeight > 0 && (
          <span
            aria-hidden="true"
            className="schedule-timeline-progress pointer-events-none absolute top-0 w-0.5 -translate-x-1/2 rounded-full bg-gradient-to-b from-blue-500 to-sky-400"
            style={{ left: RAIL_LEFT, height: fillHeight }}
          />
        )}
        {railContent && fillHeight > 0 && (
          <div
            aria-hidden="true"
            className="schedule-timeline-avatars pointer-events-none absolute z-20 flex items-center -space-x-2"
            style={{
              top: fillHeight,
              left: RAIL_LEFT,
              transform: "translate(-50%, -50%)",
            }}
          >
            {railContent}
          </div>
        )}

        {entries.map((entry, index) => {
          const isCurrent = entry.id === liveProgress?.activeItemId;
          const isWaiting = entry.id === liveProgress?.waitingAtItemId;
          const isPast = liveProgress?.pastItemIds.includes(entry.id) ?? false;

          return (
            <div
              key={entry.id}
              data-schedule-entry
              className="grid min-w-0 items-start gap-x-1.5 pb-4"
              style={{ gridTemplateColumns: `${TIME_COL} ${DOT_COL} minmax(0, 1fr)` }}
            >
              <ScheduleTimeLabel current={isCurrent} past={isPast} waiting={isWaiting} time={entry.time} />
              <div className="flex justify-center self-start pt-[1.2rem]">
                <span
                  ref={(node) => {
                    dotRefs.current[index] = node;
                  }}
                  aria-hidden="true"
                  data-current={isCurrent ? "true" : "false"}
                  data-waiting={isWaiting ? "true" : "false"}
                  data-past={isPast ? "true" : "false"}
                  className="schedule-timeline-dot relative z-10 grid size-3 place-items-center rounded-full border-[3px] border-slate-50 bg-white dark:border-slate-950 dark:bg-slate-900"
                >
                  <span className="schedule-timeline-dot-core size-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                </span>
              </div>
              <div className="min-w-0">{entry.content}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

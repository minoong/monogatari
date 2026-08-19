"use client";

import React, { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { findScrollContainer } from "@/lib/scroll-container";
import "./schedule-timeline.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const TIME_COL = "2.75rem";
const DOT_COL = "0.625rem";
const AVATAR_GUTTER = "2.125rem";
const RAIL_LEFT = `calc(${TIME_COL} + 0.375rem + (${DOT_COL} / 2))`;

/** 진행 게이지 끝점·노드 하이라이트가 같이 따라가는 읽기선 (뷰포트 비율) */
const READING_LINE_RATIO = 0.3;

export type ScheduleTimelineEntry = {
  id: string;
  time: string;
  current?: boolean;
  content: React.ReactNode;
};

interface ScheduleTimelineProps {
  entries: ScheduleTimelineEntry[];
  railContent?: React.ReactNode;
}

function getReadingLineY(scroller: Element | undefined) {
  if (!scroller) return window.innerHeight * READING_LINE_RATIO;

  const rect = scroller.getBoundingClientRect();
  return rect.top + scroller.clientHeight * READING_LINE_RATIO;
}

function syncTimelineProgress(
  progress: HTMLElement,
  dots: HTMLElement[],
  scroller: Element | undefined,
  railHeight: number,
) {
  if (!railHeight) return;

  const readingY = getReadingLineY(scroller);
  let activeIndex = -1;

  dots.forEach((dot, index) => {
    const rect = dot.getBoundingClientRect();
    const dotY = rect.top + rect.height / 2;
    if (dotY <= readingY + 2) activeIndex = index;
  });

  const progressRect = progress.getBoundingClientRect();
  let fillScale = 0;

  if (activeIndex >= 0) {
    const activeDot = dots[activeIndex];
    const dotY = activeDot.getBoundingClientRect().top + activeDot.getBoundingClientRect().height / 2;
    fillScale = Math.max(0, Math.min(1, (dotY - progressRect.top) / railHeight));
  }

  gsap.set(progress, { scaleY: fillScale });

  dots.forEach((dot, index) => {
    const isCurrent = dot.dataset.current === "true";
    const isReading = index === activeIndex;

    dot.dataset.active = isReading || isCurrent ? "true" : "false";
    gsap.to(dot, {
      scale: isReading ? 1.35 : 1,
      duration: 0.25,
      ease: isReading ? "back.out(2.4)" : "power2.out",
      overwrite: "auto",
    });
  });
}

function ScheduleTimeLabel({ time }: { time: string }) {
  return (
    <time
      dateTime={time}
      className="block self-start pt-[1.125rem] text-right text-[11px] font-extrabold leading-none tracking-tight text-slate-500 tabular-nums dark:text-slate-400"
    >
      {time}
    </time>
  );
}

export function ScheduleTimeline({ entries, railContent }: ScheduleTimelineProps) {
  const rootRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const [railHeight, setRailHeight] = useState(0);

  useEffect(() => {
    if (!contentRef.current) return;
    const observer = new ResizeObserver(([entry]) => setRailHeight(entry.contentRect.height));
    observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, []);

  useGSAP(() => {
    const root = rootRef.current;
    const content = contentRef.current;
    if (!root || !content) return;

    const media = gsap.matchMedia();
    const scroller = findScrollContainer(root);

    media.add("(prefers-reduced-motion: no-preference)", () => {
      const rail = root.querySelector<HTMLElement>(".schedule-timeline-rail");
      const progress = root.querySelector<HTMLElement>(".schedule-timeline-progress");
      const cards = gsap.utils.toArray<HTMLElement>("[data-schedule-entry]", root);
      const dots = gsap.utils.toArray<HTMLElement>(".schedule-timeline-dot", root);

      if (rail) gsap.from(rail, { scaleY: 0, duration: 0.65, ease: "power3.out" });

      gsap.from(cards, {
        y: 28,
        autoAlpha: 0,
        duration: 0.5,
        stagger: 0.09,
        ease: "power3.out",
        clearProps: "opacity,visibility,transform",
      });

      gsap.set(dots, { scale: 1, transformOrigin: "center center" });

      const triggers: ScrollTrigger[] = [];
      let removeScrollListener: (() => void) | undefined;

      if (progress && scroller && railHeight > 0) {
        const handleScroll = () => syncTimelineProgress(progress, dots, scroller, railHeight);
        scroller.addEventListener("scroll", handleScroll, { passive: true });
        requestAnimationFrame(handleScroll);
        removeScrollListener = () => scroller.removeEventListener("scroll", handleScroll);
      }

      const avatars = avatarRef.current;
      if (avatars) {
        triggers.push(
          ScrollTrigger.create({
            trigger: content,
            scroller,
            start: "top top",
            end: "bottom top",
            onUpdate: (self) => gsap.set(avatars, { y: self.progress * 14 }),
          }),
        );
      }

      ScrollTrigger.refresh();

      return () => {
        removeScrollListener?.();
        triggers.forEach((trigger) => trigger.kill());
      };
    });

    return () => media.revert();
  }, { scope: rootRef, dependencies: [entries.length, railHeight], revertOnUpdate: true });

  return (
    <section
      ref={rootRef}
      className="schedule-timeline relative w-full min-w-0 font-sans"
      style={{ paddingLeft: AVATAR_GUTTER }}
      aria-label="일정 타임라인"
    >
      {railContent && (
        <aside
          aria-label="가현짱과 미누쿤의 여행 타임라인"
          className="pointer-events-none absolute inset-y-0 left-0 z-20"
          style={{ width: AVATAR_GUTTER }}
        >
          <div ref={avatarRef} className="sticky top-24 flex flex-col items-end gap-1 pt-1.5 pr-0.5">
            {railContent}
          </div>
        </aside>
      )}

      <div ref={contentRef} className="relative min-w-0 pb-8">
        <span
          aria-hidden="true"
          className="schedule-timeline-rail pointer-events-none absolute top-0 w-0.5 -translate-x-1/2 rounded-full bg-slate-200/90 dark:bg-slate-700/90"
          style={{ left: RAIL_LEFT, height: railHeight }}
        />
        <span
          aria-hidden="true"
          className="schedule-timeline-progress pointer-events-none absolute top-0 w-0.5 -translate-x-1/2 rounded-full bg-gradient-to-b from-blue-500 to-sky-400"
          style={{ left: RAIL_LEFT, height: railHeight }}
        />

        {entries.map((entry) => (
          <div
            key={entry.id}
            data-schedule-entry
            className="grid min-w-0 items-start gap-x-1.5 pb-4"
            style={{ gridTemplateColumns: `${TIME_COL} ${DOT_COL} minmax(0, 1fr)` }}
          >
            <ScheduleTimeLabel time={entry.time} />
            <div className="flex justify-center self-start pt-[1.2rem]">
              <span
                aria-hidden="true"
                data-active="false"
                data-current={entry.current ? "true" : "false"}
                className="schedule-timeline-dot relative z-10 grid size-3 place-items-center rounded-full border-[3px] border-slate-50 bg-white dark:border-slate-950 dark:bg-slate-900"
              >
                <span className="schedule-timeline-dot-core size-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
              </span>
            </div>
            <div className="min-w-0">{entry.content}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

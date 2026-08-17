"use client";

import React, { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { findScrollContainer } from "@/lib/scroll-container";
import "./schedule-timeline.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

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
    <section ref={rootRef} className="relative w-full min-w-0 font-sans" aria-label="일정 타임라인">
      {railContent && (
        <aside className="pointer-events-none absolute inset-y-0 left-0 z-20 w-12 pt-9" aria-label="가현짱과 미누쿤의 여행 타임라인">
          <div ref={avatarRef} className="sticky top-24 flex -space-x-2">{railContent}</div>
        </aside>
      )}
      <div ref={contentRef} className="relative min-w-0 pb-8">
        <span aria-hidden="true" className="schedule-timeline-rail pointer-events-none absolute left-[3.62rem] top-0 w-[2px] rounded-full bg-slate-200/90 dark:bg-slate-700/90" style={{ height: railHeight }} />
        <span aria-hidden="true" className="schedule-timeline-progress pointer-events-none absolute left-[3.62rem] top-0 w-[2px] rounded-full bg-gradient-to-b from-blue-500 to-sky-400" style={{ height: railHeight }} />
        {entries.map((entry) => (
          <div key={entry.id} data-schedule-entry className="relative grid min-w-0 grid-cols-[3rem_minmax(0,1fr)] gap-5 pb-4 pt-1">
            <div className="min-w-0 pt-3 text-right text-xs font-extrabold tabular-nums text-slate-500 dark:text-slate-400">{entry.time}</div>
            <span
              aria-hidden="true"
              data-current={entry.current ? "true" : "false"}
              data-active="false"
              className="schedule-timeline-dot absolute left-[3.3rem] top-4 z-10 grid size-3 place-items-center rounded-full border-[3px] border-slate-50 bg-white dark:border-slate-950 dark:bg-slate-900"
            >
              <span className="schedule-timeline-dot-core size-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            </span>
            <div className="min-w-0">{entry.content}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

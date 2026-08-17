"use client";

import React, { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { findScrollContainer } from "@/lib/scroll-container";
import "./schedule-timeline.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

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

      if (progress) {
        gsap.fromTo(
          progress,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            // 파란 끝점이 화면 30% 지점(읽고 있는 위치)의 레일 좌표를 그대로 가리키게 한다.
            scrollTrigger: { trigger: content, scroller, start: "top 30%", end: "bottom 30%", scrub: true },
          },
        );
      }

      dots.forEach((dot, index) => {
        const card = cards[index];
        if (!card) return;

        // 현재 일정 노드는 스크롤 하이라이트 대신 상시 펄스로 존재감을 유지한다.
        if (dot.dataset.current === "true") {
          dot.dataset.active = "true";
          gsap.to(dot, { scale: 1.35, duration: 1.15, repeat: -1, yoyo: true, ease: "sine.inOut" });
          return;
        }

        const setActive = (active: boolean) => {
          dot.dataset.active = active ? "true" : "false";
          gsap.to(dot, {
            scale: active ? 1.35 : 1,
            duration: 0.3,
            ease: active ? "back.out(2.4)" : "power2.out",
            overwrite: "auto",
          });
        };

        ScrollTrigger.create({
          trigger: card,
          scroller,
          start: "top 62%",
          end: "bottom 38%",
          onEnter: () => setActive(true),
          onEnterBack: () => setActive(true),
          onLeave: () => setActive(false),
          onLeaveBack: () => setActive(false),
        });
      });

      const avatars = avatarRef.current;
      if (avatars) {
        ScrollTrigger.create({
          trigger: content,
          scroller,
          start: "top top",
          end: "bottom top",
          onUpdate: (self) => gsap.set(avatars, { y: self.progress * 14 }),
        });
      }

      ScrollTrigger.refresh();
    });

    return () => media.revert();
  }, { scope: rootRef, dependencies: [entries.length], revertOnUpdate: true });

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
              data-active={entry.current ? "true" : "false"}
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

"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform } from "motion/react";
import { cn } from "@/lib/utils";

export type TimelineEntry = {
  id: string;
  title: string;
  content: React.ReactNode;
  current?: boolean;
};

export function Timeline({
  data,
  railContent,
}: {
  data: TimelineEntry[];
  railContent?: React.ReactNode;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (!contentRef.current) return;
    const observer = new ResizeObserver(([entry]) => setHeight(entry.contentRect.height));
    observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, []);

  const scrollProgress = useMotionValue(0);

  useEffect(() => {
    const timeline = containerRef.current;
    if (!timeline) return;

    let ancestor = timeline.parentElement;
    while (ancestor) {
      const overflowY = window.getComputedStyle(ancestor).overflowY;
      if (/(auto|scroll)/.test(overflowY) && ancestor.scrollHeight > ancestor.clientHeight) break;
      ancestor = ancestor.parentElement;
    }
    const scrollContainer: HTMLElement | Window = ancestor ?? window;
    let frame = 0;
    const update = () => {
      frame = 0;
      const timelineRect = timeline.getBoundingClientRect();
      const isWindow = scrollContainer === window;
      const scrollTop = isWindow ? window.scrollY : (scrollContainer as HTMLElement).scrollTop;
      const viewportTop = isWindow ? 0 : (scrollContainer as HTMLElement).getBoundingClientRect().top;
      const viewportHeight = isWindow ? window.innerHeight : (scrollContainer as HTMLElement).clientHeight;
      const timelineTop = timelineRect.top - viewportTop + scrollTop;
      const focusLine = scrollTop + viewportHeight * 0.48;
      scrollProgress.set(Math.max(0, Math.min(1, (focusLine - timelineTop) / timelineRect.height)));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    scrollContainer.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      scrollContainer.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [scrollProgress]);

  const heightTransform = useTransform(scrollProgress, [0, 1], [0, height]);
  const headYTransform = useTransform(scrollProgress, [0, 1], [0, Math.max(height - 8, 0)]);
  const opacityTransform = useTransform(scrollProgress, [0, 0.04], [0, 1]);

  return (
    <section ref={containerRef} className="relative w-full min-w-0 overflow-x-clip font-sans" aria-label="일정 타임라인">
      {railContent && <aside className="pointer-events-none absolute inset-y-0 left-0 z-20 w-12" aria-label="가현짱과 미누쿤의 여행 타임라인"><div className="sticky top-24 flex -space-x-2 transform-gpu [will-change:transform]">{railContent}</div></aside>}
      <div ref={contentRef} className="relative min-w-0 pb-8">
        {data.map((item) => (
          <div key={item.id} className="relative grid min-w-0 grid-cols-[3rem_minmax(0,1fr)] gap-5 pb-4 pt-1">
            <div className="min-w-0 pt-3 text-right text-xs font-extrabold tabular-nums text-slate-500 dark:text-slate-400">{item.title}</div>
            <span className="absolute left-[3.3rem] top-4 z-10 grid size-3 place-items-center rounded-full border-[3px] border-slate-50 bg-white dark:border-slate-950 dark:bg-slate-900" aria-hidden="true">
              <span className={cn("size-1.5 rounded-full", item.current ? "bg-blue-500 motion-safe:animate-pulse" : "bg-slate-300 dark:bg-slate-700")} />
            </span>
            <div className="min-w-0">{item.content}</div>
          </div>
        ))}
        <div style={{ height }} className="pointer-events-none absolute left-[3.62rem] top-0 w-[2px] overflow-visible rounded-full bg-slate-200/90 dark:bg-slate-700/90">
          <motion.div style={{ height: heightTransform, opacity: opacityTransform }} className="absolute inset-x-0 top-0 rounded-full bg-gradient-to-b from-sky-300 via-blue-500 to-indigo-500 shadow-[0_0_10px_2px_rgba(59,130,246,0.45)]" />
          <motion.span style={{ y: headYTransform, opacity: opacityTransform }} className="absolute -left-[5px] top-0 size-3 transform-gpu rounded-full bg-blue-400/80 blur-[2px] [will-change:transform]" />
          <motion.span style={{ y: headYTransform, opacity: opacityTransform }} className="absolute -left-[2px] top-[3px] size-[6px] transform-gpu rounded-full bg-white shadow-[0_0_8px_3px_rgba(96,165,250,0.95)] [will-change:transform]" />
        </div>
      </div>
    </section>
  );
}

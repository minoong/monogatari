"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
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

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 20%", "end 55%"],
  });
  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.08], [0, 1]);

  return (
    <section ref={containerRef} className="relative w-full min-w-0 overflow-x-clip font-sans" aria-label="일정 타임라인">
      {railContent && <aside className="pointer-events-none absolute inset-y-0 left-0 z-20 w-12" aria-label="가현짱과 미누쿤의 여행 타임라인"><div className="sticky top-24 flex -space-x-2">{railContent}</div></aside>}
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
        <div style={{ height }} className="pointer-events-none absolute left-[3.62rem] top-0 w-px overflow-hidden bg-gradient-to-b from-transparent via-slate-200 to-transparent [mask-image:linear-gradient(to_bottom,transparent_0%,black_4%,black_96%,transparent_100%)] dark:via-slate-700">
          <motion.div style={{ height: heightTransform, opacity: opacityTransform }} className="absolute inset-x-0 top-0 bg-gradient-to-b from-pink-400 via-blue-500 to-transparent" />
        </div>
      </div>
    </section>
  );
}

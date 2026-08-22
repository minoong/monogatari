"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import {
  formatLongTripDate,
  getTripDayLabel,
  groupScheduleByDate,
  type ScheduleItem,
} from "@/lib/schedule";
import "./post-trip-schedule-timeline.css";

const READING_LINE_RATIO = 0.34;
const TIME_COL = "3.25rem";
const DOT_COL = "0.75rem";
const RAIL_LEFT = `calc(${TIME_COL} + 0.5rem + (${DOT_COL} / 2))`;

type PostTripScheduleTimelineProps = {
  items: ScheduleItem[];
  scrollContainerRef: RefObject<HTMLElement | null>;
  onLayoutChange?: () => void;
};

function PostTripScheduleCard({ item, active }: { item: ScheduleItem; active: boolean }) {
  return (
    <article className="post-trip-schedule-card" data-active={active ? "true" : "false"}>
      <div className="post-trip-schedule-card__copy">
        <h3 className="post-trip-schedule-card__title">{item.title}</h3>
        {item.subtitle ? <p className="post-trip-schedule-card__subtitle">{item.subtitle}</p> : null}
      </div>
      {item.images[0] ? (
        <div className="post-trip-schedule-card__thumb" aria-hidden={!item.images[0].url}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.images[0].url} alt="" loading="lazy" decoding="async" draggable={false} />
        </div>
      ) : null}
    </article>
  );
}

export function PostTripScheduleTimeline({
  items,
  scrollContainerRef,
  onLayoutChange,
}: PostTripScheduleTimelineProps) {
  const rootRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const [railHeight, setRailHeight] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);

  const groups = useMemo(() => groupScheduleByDate(items), [items]);

  useEffect(() => {
    if (!contentRef.current) return;
    const observer = new ResizeObserver(([entry]) => {
      setRailHeight(entry.contentRect.height);
      onLayoutChange?.();
    });
    observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, [groups.length, onLayoutChange]);

  const syncTimeline = useCallback(() => {
    const scroller = scrollContainerRef.current;
    const root = rootRef.current;
    const progress = progressRef.current;
    if (!scroller || !root) return;

    const readingY = scroller.getBoundingClientRect().top + scroller.clientHeight * READING_LINE_RATIO;
    const entries = Array.from(root.querySelectorAll<HTMLElement>("[data-post-trip-schedule-entry]"));
    const dots = Array.from(root.querySelectorAll<HTMLElement>(".post-trip-schedule-dot"));

    if (!entries.length) {
      setActiveId(null);
      return;
    }

    let nextActive = entries[0].dataset.entryId ?? null;
    let activeIndex = 0;

    entries.forEach((entry, index) => {
      const rect = entry.getBoundingClientRect();
      const markerY = rect.top + rect.height * 0.42;
      if (markerY <= readingY + 2) {
        nextActive = entry.dataset.entryId ?? nextActive;
        activeIndex = index;
      }
    });

    setActiveId((prev) => (prev === nextActive ? prev : nextActive));

    if (progress && railHeight > 0 && dots[activeIndex]) {
      const progressRect = progress.getBoundingClientRect();
      const dotRect = dots[activeIndex].getBoundingClientRect();
      const dotY = dotRect.top + dotRect.height / 2;
      const fillScale = Math.max(0, Math.min(1, (dotY - progressRect.top) / railHeight));
      progress.style.transform = `scaleY(${fillScale})`;
    }

    dots.forEach((dot, index) => {
      const entryId = entries[index]?.dataset.entryId;
      dot.dataset.active = entryId && entryId === nextActive ? "true" : "false";
    });
  }, [railHeight, scrollContainerRef]);

  useEffect(() => {
    const scroller = scrollContainerRef.current;
    if (!scroller) return;

    const handleScroll = () => requestAnimationFrame(syncTimeline);
    scroller.addEventListener("scroll", handleScroll, { passive: true });
    requestAnimationFrame(syncTimeline);

    return () => scroller.removeEventListener("scroll", handleScroll);
  }, [scrollContainerRef, syncTimeline, groups.length]);

  if (!groups.length) {
    return (
      <p className="post-trip-schedule-empty">
        아직 등록된 일정이 없어요. 여행 앱에서 일정을 추가하면 이곳에 타임라인으로 보여요.
      </p>
    );
  }

  return (
    <section ref={rootRef} className="post-trip-schedule-timeline" aria-label="여행 일정 타임라인">
      <div ref={contentRef} className="post-trip-schedule-timeline__content">
        <span
          aria-hidden="true"
          className="post-trip-schedule-rail"
          style={{ left: RAIL_LEFT, height: railHeight }}
        />
        <span
          ref={progressRef}
          aria-hidden="true"
          className="post-trip-schedule-progress"
          style={{ left: RAIL_LEFT, height: railHeight }}
        />

        {groups.map((group) => (
          <div key={group.date} className="post-trip-schedule-date-group">
            <header className="post-trip-schedule-date-group__header">
              <span className="post-trip-schedule-date-group__day">{getTripDayLabel(group.date)}</span>
              <span className="post-trip-schedule-date-group__date">{formatLongTripDate(group.date)}</span>
            </header>

            <div className="post-trip-schedule-date-group__entries">
              {group.items.map((item) => {
                const active = activeId === item.id;

                return (
                  <div
                    key={item.id}
                    data-post-trip-schedule-entry
                    data-entry-id={item.id}
                    data-active={active ? "true" : "false"}
                    className="post-trip-schedule-entry"
                    style={{ gridTemplateColumns: `${TIME_COL} ${DOT_COL} minmax(0, 1fr)` }}
                  >
                    <time
                      dateTime={item.start_time}
                      className={`post-trip-schedule-time${active ? " post-trip-schedule-time--active" : ""}`}
                    >
                      {item.start_time}
                    </time>
                    <div className="post-trip-schedule-entry__dot-wrap">
                      <span aria-hidden="true" className="post-trip-schedule-dot" data-active={active ? "true" : "false"}>
                        <span className="post-trip-schedule-dot__core" />
                      </span>
                    </div>
                    <PostTripScheduleCard item={item} active={active} />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

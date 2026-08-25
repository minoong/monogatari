"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  flattenTripMemoGroups,
  getScheduleTripMemoGroups,
  getTripMemoSectionLabel,
} from "@/lib/schedule-trip-memos";
import type { ScheduleItem } from "@/lib/schedule";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import "./post-trip-letter-timeline.css";

const HEADER_ANCHOR_GAP = 4;

type PostTripLetterTimelineProps = {
  scheduleItems: ScheduleItem[];
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  label: string;
  title: string;
};

export function PostTripLetterTimeline({
  scheduleItems,
  scrollContainerRef,
}: PostTripLetterTimelineProps) {
  const prefersReducedMotion = useReducedMotion();
  const headerRef = useRef<HTMLElement>(null);
  const entryRefs = useRef<(HTMLElement | null)[]>([]);
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  const groups = useMemo(() => getScheduleTripMemoGroups(scheduleItems), [scheduleItems]);
  const entries = useMemo(() => flattenTripMemoGroups(groups), [groups]);
  const entryIndexById = useMemo(
    () => new Map(entries.map((entry, index) => [entry.id, index])),
    [entries],
  );
  const activeEntry = useMemo(() => {
    if (!entries.length) return null;
    const matched = activeEntryId ? entries.find((entry) => entry.id === activeEntryId) : null;
    return matched ?? entries[0];
  }, [activeEntryId, entries]);

  useEffect(() => {
    entryRefs.current = entryRefs.current.slice(0, entries.length);
  }, [entries.length]);

  useEffect(() => {
    const scroller = scrollContainerRef.current;
    if (!scroller || entries.length === 0) return;

    const syncActiveEntry = () => {
      const sections = entryRefs.current.filter((section): section is HTMLElement => section !== null);
      if (!sections.length) return;

      const anchorLine =
        (headerRef.current?.getBoundingClientRect().bottom ?? scroller.getBoundingClientRect().top + 70) +
        HEADER_ANCHOR_GAP;

      let nextIndex = 0;
      for (let index = 0; index < sections.length; index += 1) {
        if (sections[index].getBoundingClientRect().top <= anchorLine) {
          nextIndex = index;
        }
      }

      const nextId = entries[nextIndex]?.id;
      if (!nextId) return;

      setActiveEntryId((current) => (current === nextId ? current : nextId));
    };

    syncActiveEntry();
    scroller.addEventListener("scroll", syncActiveEntry, { passive: true });
    window.addEventListener("resize", syncActiveEntry);

    return () => {
      scroller.removeEventListener("scroll", syncActiveEntry);
      window.removeEventListener("resize", syncActiveEntry);
    };
  }, [entries, scrollContainerRef]);

  return (
    <div className="post-trip-letter-timeline">
      <div className="post-trip-letter-timeline__chrome">
        <div className="post-trip-letter-timeline__intro">
          <div className="post-trip-letter-timeline__cast" aria-label="가현쨩, 미누쿤">
            <div className="post-trip-letter-timeline__cast-member">
              <Avatar className="post-trip-letter-timeline__avatar">
                <AvatarImage alt="가현쨩" src="/avatars/gahyun.webp" />
                <AvatarFallback>가</AvatarFallback>
              </Avatar>
              <span className="post-trip-letter-timeline__cast-name">가현쨩</span>
            </div>
            <div className="post-trip-letter-timeline__cast-member">
              <Avatar className="post-trip-letter-timeline__avatar">
                <AvatarImage alt="미누쿤" src="/avatars/minu.webp" />
                <AvatarFallback>미</AvatarFallback>
              </Avatar>
              <span className="post-trip-letter-timeline__cast-name">미누쿤</span>
            </div>
          </div>
          <h2 className="post-trip-letter-timeline__title">의 소감이다!!!</h2>
        </div>

        {entries.length > 0 && activeEntry ? (
          <header ref={headerRef} className="post-trip-letter-timeline__header" aria-live="polite">
            <motion.span
              key={activeEntry.id}
              className="post-trip-letter-timeline__header-title"
              initial={prefersReducedMotion ? false : { x: -5, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
            >
              {activeEntry.title}
            </motion.span>
            <span className="post-trip-letter-timeline__header-suffix">/ {activeEntry.start_time}</span>
          </header>
        ) : null}
      </div>

      <div className="post-trip-letter-timeline__body">
        {entries.length === 0 ? (
          <p className="post-trip-letter-timeline__empty">
            일정 카드의 사진 올리기에서 남긴 소감이, 여기 타임라인으로 모여요.
          </p>
        ) : (
          groups.map((group) => {
            const sectionLabel = getTripMemoSectionLabel(group);
            const dayNumber = sectionLabel.split("/")[0]?.trim() ?? sectionLabel;
            const weekday = group.weekday;

            return (
              <section key={group.date} className="post-trip-letter-timeline__day">
                <header className="post-trip-letter-timeline__day-label">
                  <span className="post-trip-letter-timeline__day-number">{dayNumber}</span>
                  {weekday ? `/ ${weekday}` : null}
                </header>
                <ul className="post-trip-letter-timeline__entries">
                  {group.entries.map((entry, groupEntryIndex) => {
                    const currentIndex = entryIndexById.get(entry.id) ?? 0;

                    return (
                      <motion.li
                        key={entry.id}
                        ref={(element) => {
                          entryRefs.current[currentIndex] = element;
                        }}
                        className="post-trip-letter-timeline__entry"
                        initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{
                          once: true,
                          amount: 0.65,
                          margin: "0px 0px -8% 0px",
                          root: scrollContainerRef,
                        }}
                        transition={{
                          duration: prefersReducedMotion ? 0 : 0.42,
                          ease: [0.22, 1, 0.36, 1],
                          delay: prefersReducedMotion ? 0 : Math.min(groupEntryIndex, 4) * 0.05,
                        }}
                      >
                        <span className="post-trip-letter-timeline__entry-dot" aria-hidden />
                        <p className="post-trip-letter-timeline__entry-text">{entry.trip_memo}</p>
                      </motion.li>
                    );
                  })}
                </ul>
              </section>
            );
          })
        )}
        <p className="post-trip-letter-timeline__footer">— 태국을 점령하라!, 2026.09</p>
        <div className="post-trip-letter-timeline__spacer" aria-hidden />
      </div>
    </div>
  );
}

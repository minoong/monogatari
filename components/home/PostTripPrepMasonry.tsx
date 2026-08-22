"use client";

import { useEffect, useMemo, useState, type RefObject } from "react";
import Masonry from "@/components/Masonry";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  getMergedPrepItems,
  shufflePrepItems,
  type PreparationItem,
  type PrepMasonryItem,
} from "@/lib/checklist";
import "./post-trip-prep-masonry.css";

const PLAYER_META = {
  gahyun: {
    name: "가현쨩",
    avatar: "/avatars/gahyun.webp",
    gradient: "prep-masonry-zone--gahyun",
    ring: "prep-masonry-avatar--gahyun",
  },
  minu: {
    name: "미누쿤",
    avatar: "/avatars/minu.webp",
    gradient: "prep-masonry-zone--minu",
    ring: "prep-masonry-avatar--minu",
  },
} as const;

const REVEAL_RATIO = 0.22;

type PostTripPrepMasonryProps = {
  items: PreparationItem[];
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  revealTargetRef: RefObject<HTMLElement | null>;
  onLayoutChange?: (height: number) => void;
};

function PrepMasonryCard({ item }: { item: PrepMasonryItem }) {
  const bothDone = item.gahyunDone && item.minuDone;
  const noneDone = !item.gahyunDone && !item.minuDone;

  return (
    <article
      className={`prep-masonry-card${noneDone ? " prep-masonry-card--pending" : ""}${bothDone ? " prep-masonry-card--done" : ""}`}
    >
      <div className="prep-masonry-card-zones" aria-hidden="true">
        <div
          className={`prep-masonry-zone prep-masonry-zone--left ${item.gahyunDone ? PLAYER_META.gahyun.gradient : "prep-masonry-zone--idle"}`}
        />
        <div
          className={`prep-masonry-zone prep-masonry-zone--right ${item.minuDone ? PLAYER_META.minu.gradient : "prep-masonry-zone--idle"}`}
        />
      </div>

      <div className="prep-masonry-card-body">
        <div className="prep-masonry-card-avatars">
          <Avatar
            className={`prep-masonry-avatar ${item.gahyunDone ? PLAYER_META.gahyun.ring : "prep-masonry-avatar--idle"}`}
          >
            <AvatarImage alt={PLAYER_META.gahyun.name} src={PLAYER_META.gahyun.avatar} />
            <AvatarFallback>가</AvatarFallback>
          </Avatar>
          <Avatar
            className={`prep-masonry-avatar ${item.minuDone ? PLAYER_META.minu.ring : "prep-masonry-avatar--idle"}`}
          >
            <AvatarImage alt={PLAYER_META.minu.name} src={PLAYER_META.minu.avatar} />
            <AvatarFallback>미</AvatarFallback>
          </Avatar>
        </div>
        <p className="prep-masonry-card-title">{item.title}</p>
        {bothDone ? <span className="prep-masonry-card-badge">완료</span> : null}
      </div>
    </article>
  );
}

export function PostTripPrepMasonry({
  items,
  scrollContainerRef,
  revealTargetRef,
  onLayoutChange,
}: PostTripPrepMasonryProps) {
  const [isVisible, setIsVisible] = useState(false);
  const mergedItems = useMemo(() => getMergedPrepItems(items), [items]);
  const idsKey = useMemo(
    () => mergedItems.map((item) => item.id).sort().join("|"),
    [mergedItems],
  );
  const order = useMemo(
    () => shufflePrepItems(mergedItems).map((item) => item.id),
    // idsKey만 바뀔 때 순서를 다시 섞고, 완료 상태만 바뀌면 순서는 유지한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [idsKey],
  );
  const masonryItems = useMemo(() => {
    const byId = new Map(mergedItems.map((item) => [item.id, item]));
    return order
      .map((id) => byId.get(id))
      .filter((item): item is PrepMasonryItem => item !== undefined);
  }, [mergedItems, order]);

  useEffect(() => {
    const target = revealTargetRef.current;
    const scroller = scrollContainerRef.current;
    if (!target || !scroller) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= REVEAL_RATIO) {
          setIsVisible(true);
        }
      },
      {
        root: scroller,
        threshold: [0, REVEAL_RATIO, 0.45],
      },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [revealTargetRef, scrollContainerRef]);

  if (masonryItems.length === 0) {
    return (
      <p className="post-trip-panel-note prep-masonry-empty">
        아직 준비물이 없어요. 여행 전에 챙긴 목록이 여기에 모여요.
      </p>
    );
  }

  return (
    <div className="prep-masonry">
      <Masonry
        active={isVisible}
        animateFrom="center"
        blurToFocus
        columns={3}
        gap={8}
        items={masonryItems}
        onLayoutChange={onLayoutChange}
        renderItem={(item) => <PrepMasonryCard item={item} />}
        stagger={0.03}
      />
    </div>
  );
}

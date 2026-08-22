"use client";

import { useRef, type CSSProperties } from "react";
import { PostTripScrollExperience } from "@/components/home/PostTripScrollExperience";

const SCROLL_HEIGHT = "calc(100dvh - 10rem)";

export function PostTripSection() {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={scrollRef}
      className="post-trip-scroll relative w-full overflow-y-auto overscroll-y-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      style={{ height: SCROLL_HEIGHT, minHeight: 420 } as CSSProperties}
    >
      <PostTripScrollExperience scrollContainerRef={scrollRef} />
    </div>
  );
}

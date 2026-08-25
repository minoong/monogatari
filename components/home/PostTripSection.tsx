"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import { PostTripScrollExperience } from "@/components/home/PostTripScrollExperience";
import { isBeforeReturnBoarding } from "@/lib/trip-phase";

const SCROLL_HEIGHT = "calc(100svh - 10rem)";
const WAITING_MEDIA_SRC = "/home/213121.gif";
/** 여행 후 화면 개발용. 끝나면 true로 되돌린다. */
const SHOW_RETURN_WAITING = false;

function PostTripWaitingMedia() {
  return (
    <div
      className="relative w-full overflow-hidden bg-black"
      style={{ height: SCROLL_HEIGHT, minHeight: 420 } as CSSProperties}
    >
      <Image
        alt="오는 편 탑승 전까지 대기 중"
        className="object-cover object-center"
        fill
        sizes="100vw"
        src={WAITING_MEDIA_SRC}
        unoptimized
      />
    </div>
  );
}

export function PostTripSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isWaiting, setIsWaiting] = useState(
    () => SHOW_RETURN_WAITING && isBeforeReturnBoarding(),
  );

  useEffect(() => {
    if (!SHOW_RETURN_WAITING || !isWaiting) return;

    const sync = () => {
      if (!isBeforeReturnBoarding()) setIsWaiting(false);
    };

    sync();
    const timer = window.setInterval(sync, 1_000);
    return () => window.clearInterval(timer);
  }, [isWaiting]);

  if (isWaiting) {
    return <PostTripWaitingMedia />;
  }

  return (
    <div
      ref={scrollRef}
      className="post-trip-scroll relative w-full overflow-y-auto overscroll-y-contain [overflow-anchor:none] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      style={{ height: SCROLL_HEIGHT, minHeight: 420 } as CSSProperties}
    >
      <PostTripScrollExperience scrollContainerRef={scrollRef} />
    </div>
  );
}

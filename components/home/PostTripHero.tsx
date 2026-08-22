"use client";

import type { RefObject } from "react";
import ScrollExpand from "@/components/ScrollExpand";
import { TRIP_RETURN_FLIGHT } from "@/lib/trip-phase";
import "./post-trip-scroll-expand.css";

const POST_TRIP_IMAGE = "/images/post-trip-scroll.jpg";

type PostTripHeroProps = {
  scrollContainerRef: RefObject<HTMLDivElement | null>;
};

export function PostTripHero({ scrollContainerRef }: PostTripHeroProps) {
  const returnFlight = TRIP_RETURN_FLIGHT;

  return (
    <div className="post-trip-scroll-expand w-full">
      <ScrollExpand
        alt="여행을 마치고 약속하는 손"
        endRadius={0}
        holdDistance={0.35}
        mediaZoom={1.35}
        overlayScrim={0.45}
        scrollContainerRef={scrollContainerRef}
        scrollDistance={1.2}
        scrollHint="아래로 스크롤"
        smoothing={0.14}
        src={POST_TRIP_IMAGE}
        startHeight={58}
        startRadius={24}
        startWidth={42}
        title="여행 끝"
      >
        <h2 className="max-w-xs text-2xl font-extrabold leading-tight tracking-[-0.03em] text-white">
          추억은
          <br />
          남겼나요?
        </h2>
        <p className="mt-3 max-w-xs text-sm leading-6 text-white/85">
          {returnFlight
            ? `${returnFlight.flightNumber} · ${returnFlight.date} ${returnFlight.departure.time} BKK 출발. `
            : ""}
          3박 4일 방콕, 위시 목표를 얼마나 채웠는지 같이 돌아봐요.
        </p>
      </ScrollExpand>
    </div>
  );
}

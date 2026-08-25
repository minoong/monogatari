"use client";

import { useEffect, useMemo } from "react";
import DriftWall from "@/components/DriftWall";
import { getScheduleDriftItems } from "@/lib/schedule-drift";
import type { ScheduleItem } from "@/lib/schedule";

type PostTripScheduleDriftWallProps = {
  scheduleItems: ScheduleItem[];
};

const preloadDriftImages = (urls: string[]) => {
  urls.forEach((url) => {
    const image = new Image();
    image.decoding = "async";
    image.src = url;
  });
};

export function PostTripScheduleDriftWall({ scheduleItems }: PostTripScheduleDriftWallProps) {
  const items = useMemo(() => getScheduleDriftItems(scheduleItems), [scheduleItems]);

  useEffect(() => {
    preloadDriftImages(items.map((item) => item.image));
  }, [items]);

  if (items.length === 0) {
    return <div className="post-trip-schedule-drift" aria-hidden />;
  }

  return (
    <div className="post-trip-schedule-drift" aria-hidden>
      <DriftWall
        items={items}
        decorative
        tileBackground="#bae6fd"
        columns={5}
        tileWidth={200}
        tileHeight={132}
        gap={18}
        tilt={16}
        turn={-14}
        perspective={1200}
        depth={120}
        speed={42}
        direction="up"
        variance={0.45}
        parallax={0}
        lift={0}
        fade={0.55}
        dim={0.92}
        overlayColor="#082f49"
        radius={14}
        pauseOnHover={false}
        grayscale={false}
        className="post-trip-schedule-drift__wall"
      />
    </div>
  );
}

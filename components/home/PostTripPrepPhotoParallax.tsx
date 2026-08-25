"use client";

import { useMemo } from "react";
import {
  distributePhotosToColumns,
  getScheduleTripPhotos,
  PREP_PARALLAX_COLUMN_COUNT,
  type TripPhotoItem,
} from "@/lib/schedule-trip-photos";
import type { ScheduleItem } from "@/lib/schedule";
import "./post-trip-prep-parallax.css";

type PostTripPrepPhotoParallaxProps = {
  scheduleItems: ScheduleItem[];
};

function ParallaxColumn({ photos }: { photos: TripPhotoItem[] }) {
  return (
    <div className="post-trip-prep-parallax__column">
      {photos.map((photo) => (
        <div key={photo.id} className="post-trip-prep-parallax__tile">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="" draggable={false} src={photo.url} />
          <p className="post-trip-prep-parallax__caption">{photo.title}</p>
        </div>
      ))}
    </div>
  );
}

export function PostTripPrepPhotoParallax({ scheduleItems }: PostTripPrepPhotoParallaxProps) {
  const photos = useMemo(() => getScheduleTripPhotos(scheduleItems), [scheduleItems]);
  const columns = useMemo(() => distributePhotosToColumns(photos, PREP_PARALLAX_COLUMN_COUNT), [photos]);

  if (photos.length === 0) {
    return (
      <p className="post-trip-panel-note post-trip-prep-parallax__empty">
        일정 카드에서 올린 여행 사진이 여기에 모여요.
      </p>
    );
  }

  return (
    <div className="post-trip-prep-parallax" aria-hidden>
      {columns.map((columnPhotos, index) => (
        <ParallaxColumn key={index} photos={columnPhotos} />
      ))}
    </div>
  );
}

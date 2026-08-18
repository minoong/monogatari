"use client";

import * as React from "react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

export interface PwaIntroFlashImage {
  alt: string;
  src: string;
}

const FLASH_INTERVAL_MS = 480;
const DESKTOP_ZOOM_MS = 1100;
const MOBILE_ZOOM_MS = 1300;
const REDUCED_MOTION_ZOOM_MS = 220;

const photoGradients = (
  <>
    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.22),rgba(2,6,23,0.72))]" />
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_36%,transparent,rgba(2,6,23,0.36))]" />
  </>
);

function useIntroZoomPreset() {
  return React.useMemo(() => {
    if (typeof window === "undefined") {
      return { blurPx: 22, durationMs: MOBILE_ZOOM_MS, scale: 6 };
    }

    const isCoarsePointer = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
    return {
      blurPx: isCoarsePointer ? 26 : 20,
      durationMs: isCoarsePointer ? MOBILE_ZOOM_MS : DESKTOP_ZOOM_MS,
      scale: isCoarsePointer ? 6.5 : 5,
    };
  }, []);
}

export function getIntroZoomDurationMs(reducedMotion: boolean) {
  if (reducedMotion) return REDUCED_MOTION_ZOOM_MS;
  if (typeof window === "undefined") return MOBILE_ZOOM_MS;
  return window.matchMedia("(hover: none) and (pointer: coarse)").matches
    ? MOBILE_ZOOM_MS
    : DESKTOP_ZOOM_MS;
}

function IntroPhotoLayer({
  alt,
  className,
  src,
  visible,
}: {
  alt: string;
  className?: string;
  src: string;
  visible: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- 인트로는 모바일에서 즉시 디코딩·표시가 우선이다.
    <img
      alt={alt}
      className={cn(
        "absolute left-1/2 top-1/2 h-[118%] w-[118%] max-w-none -translate-x-1/2 -translate-y-1/2 object-cover transition-opacity duration-200 ease-out",
        visible ? "opacity-100" : "opacity-0",
        className,
      )}
      decoding="sync"
      draggable={false}
      src={src}
    />
  );
}

function IntroZoomExitLayer({
  image,
  reducedMotion,
}: {
  image: PwaIntroFlashImage;
  reducedMotion: boolean;
}) {
  const zoom = useIntroZoomPreset();

  if (reducedMotion) {
    return (
      <motion.div
        animate={{ opacity: 0 }}
        className="absolute inset-0"
        initial={{ opacity: 1 }}
        transition={{ duration: REDUCED_MOTION_ZOOM_MS / 1000, ease: "easeOut" }}
      >
        <IntroPhotoLayer alt={image.alt} src={image.src} visible />
      </motion.div>
    );
  }

  return (
    <motion.div
      animate={{
        filter: [`blur(0px)`, `blur(${zoom.blurPx}px)`],
        opacity: [1, 1, 0],
        scale: [1, zoom.scale],
      }}
      className="absolute inset-0 origin-center"
      initial={false}
      style={{
        backfaceVisibility: "hidden",
        transformOrigin: "center center",
        willChange: "transform, filter, opacity",
      }}
      transition={{
        duration: zoom.durationMs / 1000,
        ease: [0.22, 1, 0.36, 1],
        opacity: { duration: zoom.durationMs / 1000, ease: "easeOut", times: [0, 0.8, 1] },
      }}
    >
      <IntroPhotoLayer alt={image.alt} src={image.src} visible />
    </motion.div>
  );
}

export function PwaIntroBackdrop({
  images,
  onLastImageReady,
  reducedMotion,
  stage,
}: {
  images: PwaIntroFlashImage[];
  onLastImageReady?: (ready: boolean) => void;
  reducedMotion: boolean;
  stage: "play" | "exit";
}) {
  const lastIndex = images.length - 1;
  const lastImage = images[lastIndex];
  const [index, setIndex] = React.useState(0);
  const [decodedSources, setDecodedSources] = React.useState<Set<string>>(() => new Set());

  React.useEffect(() => {
    let cancelled = false;

    void (async () => {
      for (const image of images) {
        await new Promise<void>((resolve) => {
          const loader = new window.Image();
          loader.onload = () => resolve();
          loader.onerror = () => resolve();
          loader.src = image.src;
        });

        if (cancelled) return;
        setDecodedSources((current) => {
          const next = new Set(current);
          next.add(image.src);
          return next;
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [images]);

  const lastImageReady = Boolean(lastImage && decodedSources.has(lastImage.src));

  React.useEffect(() => {
    onLastImageReady?.(lastImageReady);
  }, [lastImageReady, onLastImageReady]);

  React.useEffect(() => {
    if (!lastImageReady || reducedMotion || stage !== "play" || images.length <= 1) return;

    let current = 0;
    const timer = window.setInterval(() => {
      current = Math.min(current + 1, lastIndex);
      setIndex(current);
      if (current >= lastIndex) window.clearInterval(timer);
    }, FLASH_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [images.length, lastImageReady, lastIndex, reducedMotion, stage]);

  const displayIndex = reducedMotion ? lastIndex : index;

  if (stage === "exit" && lastImage) {
    return (
      <div className="absolute inset-0 overflow-hidden">
        <IntroZoomExitLayer image={lastImage} reducedMotion={reducedMotion} />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      {images.map((image, imageIndex) => {
        const visible = imageIndex === displayIndex && decodedSources.has(image.src);

        return (
          <IntroPhotoLayer
            alt={image.alt}
            key={image.src}
            src={image.src}
            visible={visible}
          />
        );
      })}
      {photoGradients}
    </div>
  );
}

export function usePwaIntroZoomComplete({
  onComplete,
  reducedMotion,
  stage,
}: {
  onComplete: () => void;
  reducedMotion: boolean;
  stage: "play" | "exit";
}) {
  React.useEffect(() => {
    if (stage !== "exit") return;
    const durationMs = getIntroZoomDurationMs(reducedMotion);
    const timer = window.setTimeout(onComplete, durationMs);
    return () => window.clearTimeout(timer);
  }, [onComplete, reducedMotion, stage]);
}

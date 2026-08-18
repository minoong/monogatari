"use client";

import * as React from "react";
import { gsap } from "gsap";

import {
  isIosStandalonePwa,
  pwaIntroMediaClassName,
} from "@/components/pwa/pwa-intro-layout";
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
    const iosStandalone = isIosStandalonePwa();
    const isCoarsePointer =
      typeof window !== "undefined" &&
      window.matchMedia("(hover: none) and (pointer: coarse)").matches;

    if (iosStandalone || isCoarsePointer) {
      return { blurPx: 22, durationMs: MOBILE_ZOOM_MS, scale: 6 };
    }

    return { blurPx: 18, durationMs: DESKTOP_ZOOM_MS, scale: 5 };
  }, []);
}

export function getIntroZoomDurationMs(reducedMotion: boolean) {
  if (reducedMotion) return REDUCED_MOTION_ZOOM_MS;
  if (typeof window === "undefined") return MOBILE_ZOOM_MS;
  if (isIosStandalonePwa()) return MOBILE_ZOOM_MS;
  return window.matchMedia("(hover: none) and (pointer: coarse)").matches
    ? MOBILE_ZOOM_MS
    : DESKTOP_ZOOM_MS;
}

function IntroPhotoLayer({
  alt,
  className,
  imgRef,
  src,
  visible,
}: {
  alt: string;
  className?: string;
  imgRef?: React.Ref<HTMLImageElement>;
  src: string;
  visible: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- 인트로는 모바일에서 즉시 디코딩·표시가 우선이다.
    <img
      alt={alt}
      className={cn(
        "absolute left-1/2 top-1/2 h-[125%] w-[125%] max-w-none -translate-x-1/2 -translate-y-1/2 object-cover transition-opacity duration-200 ease-out",
        visible ? "opacity-100" : "opacity-0",
        className,
      )}
      decoding="async"
      draggable={false}
      ref={imgRef}
      src={src}
    />
  );
}

function IntroZoomExitLayer({
  image,
  onZoomComplete,
  reducedMotion,
}: {
  image: PwaIntroFlashImage;
  onZoomComplete: () => void;
  reducedMotion: boolean;
}) {
  const zoom = useIntroZoomPreset();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const imageRef = React.useRef<HTMLImageElement>(null);
  const completedRef = React.useRef(false);

  React.useEffect(() => {
    if (completedRef.current) return;

    const container = containerRef.current;
    const photo = imageRef.current;
    if (!container || !photo) return;

    if (reducedMotion) {
      const timer = window.setTimeout(() => {
        completedRef.current = true;
        onZoomComplete();
      }, REDUCED_MOTION_ZOOM_MS);
      return () => window.clearTimeout(timer);
    }

    const durationSec = zoom.durationMs / 1000;
    const finish = () => {
      if (completedRef.current) return;
      completedRef.current = true;
      onZoomComplete();
    };

    const ctx = gsap.context(() => {
      gsap.set(container, { opacity: 1, scale: 1, transformOrigin: "center center" });
      gsap.set(photo, { filter: "blur(0px)" });

      gsap
        .timeline({ onComplete: finish })
        .to(
          container,
          {
            duration: durationSec,
            ease: "power2.in",
            scale: zoom.scale,
          },
          0,
        )
        .to(
          photo,
          {
            duration: durationSec,
            ease: "power2.in",
            filter: `blur(${zoom.blurPx}px)`,
          },
          0,
        )
        .to(
          container,
          {
            duration: 0.28,
            ease: "power2.out",
            opacity: 0,
          },
          Math.max(0, durationSec - 0.28),
        );
    }, container);

    return () => ctx.revert();
  }, [image.src, onZoomComplete, reducedMotion, zoom.blurPx, zoom.durationMs, zoom.scale]);

  return (
    <div className={cn(pwaIntroMediaClassName, "origin-center")} ref={containerRef}>
      <IntroPhotoLayer alt={image.alt} imgRef={imageRef} src={image.src} visible />
    </div>
  );
}

export function PwaIntroBackdrop({
  images,
  onFirstImageReady,
  onLastImageReady,
  onZoomComplete,
  reducedMotion,
  stage,
}: {
  images: PwaIntroFlashImage[];
  onFirstImageReady?: () => void;
  onLastImageReady?: (ready: boolean) => void;
  onZoomComplete?: () => void;
  reducedMotion: boolean;
  stage: "play" | "exit";
}) {
  const lastIndex = images.length - 1;
  const lastImage = images[lastIndex];
  const [index, setIndex] = React.useState(0);
  const [decodedSources, setDecodedSources] = React.useState<Set<string>>(() => new Set());

  React.useEffect(() => {
    let cancelled = false;

    for (const image of images) {
      const loader = new window.Image();
      const markReady = () => {
        if (cancelled) return;
        setDecodedSources((current) => {
          const next = new Set(current);
          next.add(image.src);
          return next;
        });
      };
      loader.onload = markReady;
      loader.onerror = markReady;
      loader.src = image.src;
    }

    return () => {
      cancelled = true;
    };
  }, [images]);

  const lastImageReady = Boolean(lastImage && decodedSources.has(lastImage.src));
  const firstImageReady = Boolean(images[0] && decodedSources.has(images[0].src));

  React.useEffect(() => {
    if (firstImageReady) onFirstImageReady?.();
  }, [firstImageReady, onFirstImageReady]);

  React.useEffect(() => {
    onLastImageReady?.(lastImageReady);
  }, [lastImageReady, onLastImageReady]);

  React.useEffect(() => {
    if (!firstImageReady || reducedMotion || stage !== "play" || images.length <= 1) return;

    let current = 0;
    const timer = window.setInterval(() => {
      const next = Math.min(current + 1, lastIndex);
      if (next === lastIndex && !lastImageReady) return;
      current = next;
      setIndex(current);
      if (current >= lastIndex) window.clearInterval(timer);
    }, FLASH_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [firstImageReady, images.length, lastImageReady, lastIndex, reducedMotion, stage]);

  const displayIndex = reducedMotion ? lastIndex : index;

  if (stage === "exit" && lastImage && onZoomComplete) {
    return <IntroZoomExitLayer image={lastImage} onZoomComplete={onZoomComplete} reducedMotion={reducedMotion} />;
  }

  return (
    <div className={pwaIntroMediaClassName}>
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

"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";

import { pwaIntroBleedStyle } from "@/components/pwa/pwa-intro-layout";

export interface PwaIntroFlashImage {
  alt: string;
  src: string;
}

const ZOOM_EXIT_MS = 880;

function IntroPhoto({
  alt,
  priority,
  src,
}: {
  alt: string;
  priority?: boolean;
  src: string;
}) {
  return (
    <Image
      alt={alt}
      className="scale-105 object-cover"
      fill
      priority={priority}
      sizes="100vw"
      src={src}
    />
  );
}

export function PwaIntroPhotoFlash({
  active,
  images,
  reducedMotion,
}: {
  active: boolean;
  images: PwaIntroFlashImage[];
  reducedMotion: boolean;
}) {
  const [index, setIndex] = React.useState(0);
  const lastIndex = images.length - 1;

  React.useEffect(() => {
    if (!active || reducedMotion || images.length <= 1) return;

    const resetFrame = window.requestAnimationFrame(() => setIndex(0));
    const timer = window.setInterval(() => {
      setIndex((current) => Math.min(current + 1, lastIndex));
    }, 480);

    const stop = window.setTimeout(() => window.clearInterval(timer), 480 * lastIndex);

    return () => {
      window.cancelAnimationFrame(resetFrame);
      window.clearInterval(timer);
      window.clearTimeout(stop);
    };
  }, [active, images.length, lastIndex, reducedMotion]);

  const image = images[reducedMotion ? lastIndex : index] ?? images[0];
  if (!image) return null;

  const isLastImage = image.src === images[lastIndex]?.src;

  return (
    <div className="absolute overflow-hidden" style={pwaIntroBleedStyle}>
      <AnimatePresence initial={false} mode="sync">
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0"
          exit={{ opacity: 0, scale: 1.04 }}
          initial={isLastImage ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.08 }}
          key={image.src}
          transition={{ duration: reducedMotion || isLastImage ? 0 : 0.22, ease: "easeOut" }}
        >
          <IntroPhoto alt={image.alt} priority={index === 0 || isLastImage} src={image.src} />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.22),rgba(2,6,23,0.72))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_36%,transparent,rgba(2,6,23,0.36))]" />
    </div>
  );
}

export function PwaIntroPhotoZoomExit({
  image,
  onComplete,
  reducedMotion,
}: {
  image: PwaIntroFlashImage;
  onComplete: () => void;
  reducedMotion: boolean;
}) {
  const durationMs = reducedMotion ? 200 : ZOOM_EXIT_MS;

  React.useEffect(() => {
    const timer = window.setTimeout(onComplete, durationMs);
    return () => window.clearTimeout(timer);
  }, [durationMs, onComplete]);

  return (
    <motion.div
      animate={reducedMotion ? { opacity: 0 } : { scale: 3.4, opacity: 0 }}
      className="absolute origin-center overflow-hidden will-change-transform"
      initial={{ scale: 1, opacity: 1 }}
      style={pwaIntroBleedStyle}
      transition={{
        duration: durationMs / 1000,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <div className="absolute inset-0">
        <IntroPhoto alt={image.alt} priority src={image.src} />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.22),rgba(2,6,23,0.72))] opacity-60" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_36%,transparent,rgba(2,6,23,0.36))] opacity-70" />
    </motion.div>
  );
}

"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";

export interface PwaIntroFlashImage {
  alt: string;
  src: string;
}

const ZOOM_EXIT_MS = 880;

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

  React.useEffect(() => {
    if (!active || reducedMotion || images.length <= 1) return;

    const resetFrame = window.requestAnimationFrame(() => setIndex(0));
    const timer = window.setInterval(() => {
      setIndex((current) => Math.min(current + 1, images.length - 1));
    }, 480);

    const stop = window.setTimeout(() => window.clearInterval(timer), 480 * (images.length - 1));

    return () => {
      window.cancelAnimationFrame(resetFrame);
      window.clearInterval(timer);
      window.clearTimeout(stop);
    };
  }, [active, images.length, reducedMotion]);

  const image = images[reducedMotion ? images.length - 1 : index] ?? images[0];
  if (!image) return null;

  return (
    <div className="absolute inset-0 overflow-hidden">
      <AnimatePresence mode="popLayout">
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0"
          exit={{ opacity: 0, scale: 1.08 }}
          initial={{ opacity: 0, scale: 1.08 }}
          key={image.src}
          transition={{ duration: reducedMotion ? 0 : 0.22, ease: "easeOut" }}
        >
          <Image
            alt={image.alt}
            className="scale-105 object-cover"
            fill
            priority={index === 0}
            sizes="100vw"
            src={image.src}
          />
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
      className="absolute inset-0 origin-center overflow-hidden will-change-transform"
      initial={{ scale: 1, opacity: 1 }}
      transition={{
        duration: durationMs / 1000,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <Image alt={image.alt} className="scale-105 object-cover" fill priority sizes="100vw" src={image.src} />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.22),rgba(2,6,23,0.72))] opacity-60" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_36%,transparent,rgba(2,6,23,0.36))] opacity-70" />
    </motion.div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

const SCRAMBLE_CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789◇◆+*";

type ScrambleTextProps = {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
};

/** 첫 진입에서만 랜덤 문자 사이로 원문이 드러나는 짧은 텍스트 리빌 효과 */
export function ScrambleText({
  text,
  className,
  delay = 0,
  duration = 620,
}: ScrambleTextProps) {
  const prefersReducedMotion = useReducedMotion();
  const [displayText, setDisplayText] = useState(text);

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    const characters = Array.from(text);
    let animationFrame = 0;
    let timeout = 0;
    let startedAt: number | null = null;

    const render = (now: number) => {
      if (startedAt === null) startedAt = now;
      const progress = Math.min(1, (now - startedAt) / duration);
      const revealed = Math.floor(progress * characters.length);

      setDisplayText(characters.map((character, index) => {
        if (character === " " || index < revealed) return character;
        return SCRAMBLE_CHARACTERS[Math.floor(Math.random() * SCRAMBLE_CHARACTERS.length)];
      }).join(""));

      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(render);
      }
    };

    timeout = window.setTimeout(() => {
      animationFrame = window.requestAnimationFrame(render);
    }, delay);

    return () => {
      window.clearTimeout(timeout);
      window.cancelAnimationFrame(animationFrame);
    };
  }, [delay, duration, prefersReducedMotion, text]);

  return (
    <span aria-label={text} className={className}>
      <span aria-hidden="true">{prefersReducedMotion ? text : displayText}</span>
    </span>
  );
}

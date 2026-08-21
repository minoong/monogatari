"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion, type MotionProps } from "motion/react"

import { cn } from "@/lib/utils"

interface WordRotateProps {
  words: string[]
  duration?: number
  activeIndex?: number
  containerClassName?: string
  motionProps?: MotionProps
  className?: string
}

export function WordRotate({
  words,
  duration = 2500,
  activeIndex,
  containerClassName,
  motionProps = {
    initial: { opacity: 0, y: -50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 },
    transition: { duration: 0.25, ease: "easeOut" },
  },
  className,
}: WordRotateProps) {
  const [internalIndex, setInternalIndex] = useState(0)
  const index = activeIndex ?? internalIndex

  useEffect(() => {
    if (activeIndex !== undefined) return

    const interval = setInterval(() => {
      setInternalIndex((prevIndex) => (prevIndex + 1) % words.length)
    }, duration)

    return () => clearInterval(interval)
  }, [activeIndex, duration, words])

  return (
    <div className={cn("overflow-hidden py-2", containerClassName)}>
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          className={cn("block", className)}
          {...motionProps}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}

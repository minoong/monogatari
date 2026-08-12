"use client";

import Image from "next/image";
import { useEffect, useRef, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { ActivityIcon, type ActivityIconHandle } from "@/components/ui/activity";
import { cn } from "@/lib/utils";

export function DrawerIntro({ open, image, alt, title, description }: { open: boolean; image: string; alt: string; title: string; description: string }) {
  const iconRef = useRef<ActivityIconHandle>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (open && !reduceMotion) iconRef.current?.startAnimation();
  }, [open, reduceMotion]);

  return <div className="flex flex-col items-center justify-center">
    <div className="relative my-1 h-32 w-full max-w-[280px] overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
      <Image src={image} alt={alt} fill className="object-cover" sizes="280px" />
    </div>
    <p className="mt-2 flex items-center gap-1.5 text-center text-sm font-medium text-slate-800"><ActivityIcon ref={iconRef} aria-hidden="true" className="text-blue-500" size={16} />{title}</p>
    <p className="mt-0.5 text-center text-xs text-slate-500">{description}</p>
  </div>;
}

export function DrawerFieldLabel({ icon: Icon, children, className }: { icon: LucideIcon; children: ReactNode; className?: string }) {
  const reduceMotion = useReducedMotion();
  return <span className={cn("inline-flex items-center gap-2 text-sm font-bold text-slate-900", className)}>
    <motion.span initial={reduceMotion ? false : { opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.22, ease: "easeOut" }} className="text-blue-500"><Icon className="size-4" /></motion.span>
    {children}
  </span>;
}

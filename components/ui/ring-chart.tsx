import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export interface RingData {
  progress: number; // 0 to 100
  color: string; // CSS color hex or var
  trackColor?: string;
}

interface RingChartProps {
  rings: RingData[];
  size?: number;
  strokeWidth?: number;
  gap?: number;
  className?: string;
}

export const RingChart: React.FC<RingChartProps> = ({
  rings,
  size = 140,
  strokeWidth = 12,
  gap = 4,
  className,
}) => {
  const center = size / 2;

  return (
    <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90 transform">
        {rings.map((ring, index) => {
          const radius = (size / 2) - strokeWidth / 2 - (index * (strokeWidth + gap));
          if (radius <= 0) return null;
          
          const circumference = 2 * Math.PI * radius;
          const clampedProgress = Math.max(0, Math.min(100, ring.progress || 0));
          
          return (
            <g key={index}>
              {/* Background Track */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={ring.trackColor ?? ring.color}
                strokeOpacity={ring.trackColor ? 1 : 0.12}
                strokeWidth={strokeWidth}
                className={ring.trackColor ? undefined : "text-current"}
              />
              {/* Progress Ring */}
              <motion.circle
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={ring.color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                style={{ filter: `drop-shadow(0 0 4px ${ring.color}66)` }}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: circumference - (clampedProgress / 100) * circumference }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

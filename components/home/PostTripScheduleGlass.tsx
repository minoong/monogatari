"use client";

import GlassSurface from "@/components/GlassSurface";
import "./post-trip-schedule-glass.css";

export function PostTripScheduleGlass() {
  return (
    <GlassSurface
      width="100%"
      height={100}
      borderRadius={50}
      borderWidth={0.07}
      backgroundOpacity={0.1}
      saturation={1}
      brightness={50}
      opacity={0.93}
      blur={11}
      displace={0.5}
      distortionScale={-180}
      redOffset={0}
      greenOffset={10}
      blueOffset={20}
      className="post-trip-schedule-glass"
    />
  );
}

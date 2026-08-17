"use client";

import * as React from "react";

import { DottedMap, type Marker } from "@/components/ui/dotted-map";

const MAP_WIDTH = 150;
const MAP_HEIGHT = 75;
const MAP_EDGE_PADDING = 2.2;
const COUNTRY_ICON_SIZE = 2.25;
const COMPACT_COUNTRY_ICON_SIZE = 2.12;

type CountryMarker = Marker & {
  overlay: {
    badgeSide?: "left" | "right";
    cities: string[];
    countryCode: "kr" | "th";
    countryName: string;
  };
};

const countryMarkers = [
  {
    lat: 36.4,
    lng: 127.9,
    overlay: {
      badgeSide: "left",
      cities: ["일산", "서울", "인천"],
      countryCode: "kr",
      countryName: "대한민국",
    },
    size: COUNTRY_ICON_SIZE,
  },
  {
    lat: 12.9236,
    lng: 100.8825,
    overlay: {
      badgeSide: "right",
      cities: ["방콕", "파타야"],
      countryCode: "th",
      countryName: "태국",
    },
    size: COUNTRY_ICON_SIZE,
  },
] satisfies CountryMarker[];

type RenderedCountryMarker = Omit<CountryMarker, "lat" | "lng"> & {
  r: number;
  x: number;
  y: number;
};

interface Rect {
  height: number;
  width: number;
  x: number;
  y: number;
}

interface BadgeMetrics {
  cityFontSize: number;
  cityLabel: string;
  gap: number;
  height: number;
  iconRadius: number;
  paddingX: number;
  titleFontSize: number;
  width: number;
}

type BadgeLayout = BadgeMetrics & {
  pillX: number;
  pillY: number;
  textX: number;
};

const countryOrder: Record<CountryMarker["overlay"]["countryCode"], number> = {
  kr: 0,
  th: 1,
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function useElementWidth<T extends HTMLElement>() {
  const ref = React.useRef<T>(null);
  const [width, setWidth] = React.useState(0);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const updateWidth = () => setWidth(element.getBoundingClientRect().width);
    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return [ref, width] as const;
}

function getResponsiveScale(width: number) {
  if (width === 0) return 1;
  if (width < 360) return 0.78;
  if (width < 480) return 0.86;
  if (width < 640) return 0.94;
  return 1;
}

function getVisibleCityLimit(width: number) {
  return width > 0 && width < 480 ? 2 : 3;
}

function formatCityLabel(cities: string[], visibleLimit: number) {
  if (cities.length <= visibleLimit) return cities.join(" · ");
  const visibleCities = cities.slice(0, visibleLimit).join(" · ");
  return `${visibleCities} 외 ${cities.length - visibleLimit}곳`;
}

function estimateTextWidth(text: string, fontSize: number) {
  return Array.from(text).reduce((width, char) => {
    if (/\s/.test(char)) return width + fontSize * 0.35;
    if (char === "·") return width + fontSize * 0.42;
    if (/[\u3131-\uD79D]/.test(char)) return width + fontSize * 0.92;
    return width + fontSize * 0.58;
  }, 0);
}

function getBadgeMetrics(marker: RenderedCountryMarker, scale: number, visibleCityLimit: number) {
  const cityLabel = formatCityLabel(marker.overlay.cities, visibleCityLimit);
  const titleFontSize = marker.r * 0.62 * scale;
  const cityFontSize = marker.r * 0.5 * scale;
  const paddingX = marker.r * 0.78 * scale;
  const width =
    Math.max(
      estimateTextWidth(marker.overlay.countryName, titleFontSize),
      estimateTextWidth(cityLabel, cityFontSize),
    ) + paddingX * 2;
  const height = (titleFontSize + cityFontSize) * 1.58;

  return {
    cityFontSize,
    cityLabel,
    gap: Math.max(0.12, marker.r * 0.06 * scale),
    height: height * 1.08,
    iconRadius: marker.r * 0.76,
    paddingX,
    titleFontSize,
    width,
  } satisfies BadgeMetrics;
}

function getBadgeX(marker: RenderedCountryMarker, metrics: BadgeMetrics, side: "left" | "right") {
  const maxX = MAP_WIDTH - metrics.width - MAP_EDGE_PADDING;
  const attachedX =
    side === "left"
      ? marker.x - metrics.iconRadius - metrics.gap - metrics.width
      : marker.x + metrics.iconRadius + metrics.gap;

  return {
    attachedX,
    x: clamp(attachedX, MAP_EDGE_PADDING, maxX),
  };
}

function getBadgeY(marker: RenderedCountryMarker, metrics: BadgeMetrics, offsetY: number) {
  return clamp(
    marker.y - metrics.height / 2 + offsetY,
    MAP_EDGE_PADDING,
    MAP_HEIGHT - metrics.height - MAP_EDGE_PADDING,
  );
}

function getOverlapArea(a: Rect, b: Rect) {
  const x = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x));
  const y = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
  return x * y;
}

function getIconRect(marker: RenderedCountryMarker, iconRadius: number) {
  return {
    height: iconRadius * 2,
    width: iconRadius * 2,
    x: marker.x - iconRadius,
    y: marker.y - iconRadius,
  } satisfies Rect;
}

function getBadgeLayouts(markers: RenderedCountryMarker[], scale: number, visibleCityLimit: number) {
  const layouts = new Map<string, BadgeLayout>();
  const occupiedBadges: Rect[] = [];
  const sortedMarkers = [...markers].sort(
    (a, b) => countryOrder[a.overlay.countryCode] - countryOrder[b.overlay.countryCode],
  );
  const iconRects = sortedMarkers.map((marker) =>
    getIconRect(marker, getBadgeMetrics(marker, scale, visibleCityLimit).iconRadius + 0.35),
  );

  for (const marker of sortedMarkers) {
    const metrics = getBadgeMetrics(marker, scale, visibleCityLimit);
    const preferredSide = marker.overlay.badgeSide ?? (marker.x > MAP_WIDTH * 0.66 ? "left" : "right");
    const sides = preferredSide === "left" ? (["left", "right"] as const) : (["right", "left"] as const);
    const baseOffsetY = 0;
    const stackStep = metrics.height + Math.max(0.35, metrics.height * 0.12);
    const offsetCandidates = [baseOffsetY, baseOffsetY - stackStep, baseOffsetY + stackStep];
    let best: (BadgeLayout & { score: number }) | undefined;

    for (const [sideIndex, side] of sides.entries()) {
      for (const offsetY of offsetCandidates) {
        const { attachedX, x } = getBadgeX(marker, metrics, side);
        const y = getBadgeY(marker, metrics, offsetY);
        const rect = { height: metrics.height, width: metrics.width, x, y };
        const badgeOverlap = occupiedBadges.reduce((score, badge) => score + getOverlapArea(rect, badge) * 120, 0);
        const iconOverlap = iconRects.reduce((score, icon) => score + getOverlapArea(rect, icon) * 220, 0);
        const score =
          badgeOverlap +
          iconOverlap +
          Math.abs(x - attachedX) * 10 +
          Math.abs(offsetY - baseOffsetY) * 1.6 +
          sideIndex * 5;

        if (!best || score < best.score) {
          best = { ...metrics, pillX: x, pillY: y, score, textX: x + metrics.paddingX };
        }
      }
    }

    if (!best) continue;

    occupiedBadges.push({ height: best.height, width: best.width, x: best.pillX, y: best.pillY });
    layouts.set(marker.overlay.countryCode, best);
  }

  return layouts;
}

export function TravelDottedMap() {
  const id = React.useId();
  const [mapRef, mapWidth] = useElementWidth<HTMLDivElement>();
  const responsiveScale = getResponsiveScale(mapWidth);
  const visibleCityLimit = getVisibleCityLimit(mapWidth);
  const markers = React.useMemo(
    () =>
      countryMarkers.map((marker) => ({
        ...marker,
        size: mapWidth > 0 && mapWidth < 480 ? COMPACT_COUNTRY_ICON_SIZE : COUNTRY_ICON_SIZE,
      })),
    [mapWidth],
  );

  return (
    <section
      aria-labelledby="travel-map-title"
      className="relative overflow-hidden rounded-[1.75rem] border border-slate-200/70 bg-white/55 p-3 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-white/5"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,var(--color-background),transparent_70%)]" />
      <div className="relative flex flex-col gap-2">
        <div>
          <p className="text-[10px] font-medium tracking-[0.24em] text-slate-400 uppercase">Travel map</p>
          <h2 id="travel-map-title" className="text-base font-semibold text-slate-900 dark:text-slate-100">
            서울에서 방콕까지
          </h2>
        </div>

        <div
          ref={mapRef}
          className="relative h-40 w-full overflow-hidden rounded-[1.25rem] border border-slate-200/80 bg-slate-50/80 dark:border-white/10 dark:bg-slate-900/40"
        >
          <DottedMap<CountryMarker>
            aria-hidden
            className="absolute inset-0"
            dotColor="var(--color-slate-400)"
            dotRadius={0.14}
            markerColor="transparent"
            markers={markers}
            renderMarkerOverlay={({ marker, markers, x, y, r, index }) => {
              const { countryCode, countryName } = marker.overlay;
              const clipId = `${id}-flag-clip-${index}`.replaceAll(":", "-");
              const flagHref = `https://flagcdn.com/w80/${countryCode}.webp`;
              const badgeLayout = getBadgeLayouts(markers, responsiveScale, visibleCityLimit).get(countryCode);
              const imageRadius = badgeLayout?.iconRadius ?? r * 0.76;

              if (!badgeLayout) return null;

              return (
                <g pointerEvents="none">
                  <clipPath id={clipId}>
                    <circle cx={x} cy={y} r={imageRadius} />
                  </clipPath>

                  <image
                    clipPath={`url(#${clipId})`}
                    height={imageRadius * 2}
                    href={flagHref}
                    preserveAspectRatio="xMidYMid slice"
                    width={imageRadius * 2}
                    x={x - imageRadius}
                    y={y - imageRadius}
                  />

                  <rect
                    fill="rgba(15, 23, 42, 0.72)"
                    height={badgeLayout.height}
                    rx={badgeLayout.height / 2}
                    width={badgeLayout.width}
                    x={badgeLayout.pillX}
                    y={badgeLayout.pillY}
                  />

                  <text
                    dominantBaseline="middle"
                    fill="white"
                    fontSize={badgeLayout.titleFontSize}
                    fontWeight={700}
                    x={badgeLayout.textX}
                    y={badgeLayout.pillY + badgeLayout.height * 0.36}
                  >
                    {countryName}
                  </text>
                  <text
                    dominantBaseline="middle"
                    fill="rgba(255,255,255,0.78)"
                    fontSize={badgeLayout.cityFontSize}
                    fontWeight={500}
                    x={badgeLayout.textX}
                    y={badgeLayout.pillY + badgeLayout.height * 0.68}
                  >
                    {badgeLayout.cityLabel}
                  </text>
                </g>
              );
            }}
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-50/90 to-transparent dark:from-slate-900/90" />
        </div>
      </div>
    </section>
  );
}

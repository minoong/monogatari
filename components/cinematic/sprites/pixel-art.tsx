"use client";

import * as THREE from "three";
import { getPixelTexture, rect, type CanvasPainter } from "@/components/cinematic/canvas-texture";

interface PixelArtProps {
  /** 텍스처 캐시 키. 그림이 달라지면 키도 달라야 한다. */
  cacheKey: string;
  width: number;
  height: number;
  paint: CanvasPainter;
  size: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  opacity?: number;
  scale?: number;
  renderOrder?: number;
}

/** 캔버스로 그린 도트 오브젝트를 평면에 붙인다. */
export function PixelArt({
  cacheKey,
  width,
  height,
  paint,
  size,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  opacity = 1,
  scale = 1,
  renderOrder = 0,
}: PixelArtProps) {
  const texture = getPixelTexture(cacheKey, width, height, paint);

  return (
    <mesh position={position} renderOrder={renderOrder} rotation={rotation} scale={scale}>
      <planeGeometry args={[(size * width) / height, size]} />
      <meshBasicMaterial
        alphaTest={0.4}
        depthWrite={false}
        map={texture}
        opacity={opacity}
        side={THREE.DoubleSide}
        toneMapped={false}
        transparent
      />
    </mesh>
  );
}

export function paintCloud(ctx: CanvasRenderingContext2D) {
  const c = "#ffffff";
  const s = "#dbe6f7";
  rect(ctx, 8, 10, 20, 8, c);
  rect(ctx, 4, 14, 32, 8, c);
  rect(ctx, 14, 6, 12, 6, c);
  rect(ctx, 0, 18, 40, 5, c);
  rect(ctx, 2, 21, 36, 3, s);
}

export function paintAirplane(ctx: CanvasRenderingContext2D) {
  const body = "#f4f7fd";
  const shade = "#c3cede";
  const accent = "#ff6f9c";
  const glass = "#5fd0ff";

  rect(ctx, 6, 18, 52, 12, body);
  rect(ctx, 6, 26, 52, 4, shade);
  rect(ctx, 54, 16, 8, 10, body);
  rect(ctx, 2, 20, 6, 8, body);
  rect(ctx, 58, 20, 5, 7, shade);
  for (let i = 0; i < 7; i += 1) {
    rect(ctx, 14 + i * 6, 21, 3, 3, glass);
  }
  rect(ctx, 20, 28, 22, 5, shade);
  rect(ctx, 26, 30, 24, 4, body);
  rect(ctx, 4, 8, 10, 12, accent);
  rect(ctx, 4, 8, 10, 4, "#ffa8c5");
  rect(ctx, 0, 26, 12, 4, shade);
}

export function paintCake(ctx: CanvasRenderingContext2D) {
  rect(ctx, 6, 26, 36, 16, "#fff0f5");
  rect(ctx, 6, 34, 36, 8, "#ffc9dd");
  rect(ctx, 6, 22, 36, 5, "#ff6f9c");
  rect(ctx, 10, 18, 4, 5, "#ffe9a8");
  rect(ctx, 22, 18, 4, 5, "#ffe9a8");
  rect(ctx, 34, 18, 4, 5, "#ffe9a8");
  rect(ctx, 11, 12, 2, 6, "#ffb347");
  rect(ctx, 23, 12, 2, 6, "#ffb347");
  rect(ctx, 35, 12, 2, 6, "#ffb347");
  rect(ctx, 10, 8, 4, 5, "#ffe45e");
  rect(ctx, 22, 8, 4, 5, "#ffe45e");
  rect(ctx, 34, 8, 4, 5, "#ffe45e");
  rect(ctx, 4, 40, 40, 4, "#e2b1c6");
}

export function paintRing(ctx: CanvasRenderingContext2D) {
  rect(ctx, 8, 14, 16, 3, "#ffd75e");
  rect(ctx, 6, 17, 4, 8, "#ffd75e");
  rect(ctx, 22, 17, 4, 8, "#ffd75e");
  rect(ctx, 8, 25, 16, 3, "#e0ac2b");
  rect(ctx, 13, 4, 6, 6, "#bff3ff");
  rect(ctx, 14, 2, 4, 3, "#ffffff");
  rect(ctx, 11, 9, 10, 3, "#8fdcff");
}

export function paintIsland(ctx: CanvasRenderingContext2D) {
  rect(ctx, 0, 34, 96, 14, "#2a3350");
  rect(ctx, 8, 26, 30, 10, "#323d5f");
  rect(ctx, 30, 18, 34, 20, "#3a476e");
  rect(ctx, 58, 28, 30, 10, "#323d5f");
  rect(ctx, 40, 12, 14, 8, "#44527d");
  rect(ctx, 20, 18, 3, 12, "#1d2438");
  rect(ctx, 14, 14, 15, 3, "#25708f");
  rect(ctx, 70, 22, 3, 10, "#1d2438");
  rect(ctx, 64, 18, 15, 3, "#25708f");
}

export function paintWoodTable(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const planks = ["#5b3b26", "#67432b", "#523320", "#6f4a30"];
  const plankHeight = 10;
  for (let y = 0; y < h; y += plankHeight) {
    rect(ctx, 0, y, w, plankHeight, planks[(y / plankHeight) % planks.length]);
    rect(ctx, 0, y + plankHeight - 1, w, 1, "#3d2417");
    for (let x = 0; x < w; x += 7) {
      if ((x + y) % 23 === 0) rect(ctx, x, y + 3, 5, 1, "#7b553a");
      if ((x + y) % 31 === 0) rect(ctx, x, y + 6, 3, 1, "#452a1a");
    }
  }
}

export function paintCoffee(ctx: CanvasRenderingContext2D) {
  const cup = "#f7f3ec";
  const shade = "#d7d0c4";
  // 김
  rect(ctx, 12, 2, 2, 6, "#e8e2d8");
  rect(ctx, 21, 0, 2, 8, "#e8e2d8");
  rect(ctx, 29, 3, 2, 5, "#e8e2d8");
  // 잔
  rect(ctx, 7, 12, 26, 22, cup);
  rect(ctx, 7, 28, 26, 6, shade);
  rect(ctx, 5, 11, 30, 3, cup);
  rect(ctx, 8, 13, 24, 4, "#4a2a17");
  rect(ctx, 11, 14, 8, 2, "#7c4a2c");
  // 손잡이
  rect(ctx, 33, 16, 6, 3, cup);
  rect(ctx, 36, 18, 3, 6, cup);
  rect(ctx, 33, 23, 6, 3, cup);
  // 받침
  rect(ctx, 2, 34, 36, 5, "#e4ded2");
  rect(ctx, 4, 38, 32, 3, "#c2bab0");
}

export function paintBadge(ctx: CanvasRenderingContext2D) {
  rect(ctx, 8, 4, 16, 24, "#f2e7d4");
  rect(ctx, 4, 8, 24, 16, "#f2e7d4");
  rect(ctx, 6, 6, 20, 20, "#ffd9e6");
  rect(ctx, 10, 10, 12, 8, "#3a2a33");
  rect(ctx, 11, 16, 4, 4, "#ffe9d6");
  rect(ctx, 17, 16, 4, 4, "#ffe9d6");
  rect(ctx, 12, 17, 2, 2, "#241a1f");
  rect(ctx, 18, 17, 2, 2, "#241a1f");
  rect(ctx, 14, 21, 4, 2, "#ff7aa0");
  rect(ctx, 4, 8, 2, 16, "#d9c9b3");
}

export function paintAcrylicStand(ctx: CanvasRenderingContext2D) {
  rect(ctx, 6, 30, 20, 4, "#9fd8ef");
  rect(ctx, 8, 32, 16, 2, "#7cc2e0");
  rect(ctx, 10, 6, 12, 24, "#ffffff");
  rect(ctx, 11, 7, 10, 22, "#2f3a56");
  rect(ctx, 12, 9, 8, 7, "#f6d9b8");
  rect(ctx, 12, 8, 8, 3, "#3a2a33");
  rect(ctx, 13, 12, 2, 2, "#241a1f");
  rect(ctx, 17, 12, 2, 2, "#241a1f");
  rect(ctx, 12, 17, 8, 9, "#ff8fb4");
  rect(ctx, 13, 26, 2, 3, "#5b6b8f");
  rect(ctx, 17, 26, 2, 3, "#5b6b8f");
}

export function paintSuitcase(ctx: CanvasRenderingContext2D) {
  rect(ctx, 6, 14, 28, 22, "#ff8fb4");
  rect(ctx, 6, 22, 28, 4, "#e0668f");
  rect(ctx, 16, 8, 8, 6, "#5b6b8f");
  rect(ctx, 18, 8, 4, 4, "#0b0f19");
  rect(ctx, 8, 34, 6, 4, "#39405c");
  rect(ctx, 26, 34, 6, 4, "#39405c");
}

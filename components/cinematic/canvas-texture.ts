"use client";

import * as THREE from "three";

export type CanvasPainter = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) => void;

export interface PixelSurface {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D | null;
  texture: THREE.CanvasTexture;
}

/** 매 프레임 다시 그릴 수 있는 픽셀 캔버스 + 텍스처 묶음. */
export function createPixelSurface(width: number, height: number): PixelSurface {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (ctx) ctx.imageSmoothingEnabled = false;

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;

  return { canvas, ctx, texture };
}

const staticTextures = new Map<string, THREE.CanvasTexture>();

/**
 * 키 기준으로 한 번만 그려서 재사용하는 정적 도트 텍스처.
 * 훅이 아니라 순수 조회라 렌더 중 호출해도 안전하다.
 */
export function getPixelTexture(
  key: string,
  width: number,
  height: number,
  paint: CanvasPainter,
  repeat?: number,
): THREE.CanvasTexture {
  const cacheKey = repeat ? `${key}@${repeat}` : key;
  const cached = staticTextures.get(cacheKey);
  if (cached) return cached;

  const surface = createPixelSurface(width, height);
  if (surface.ctx) paint(surface.ctx, width, height);
  if (repeat) {
    surface.texture.wrapS = THREE.RepeatWrapping;
    surface.texture.wrapT = THREE.RepeatWrapping;
    surface.texture.repeat.set(repeat, repeat);
  }
  surface.texture.needsUpdate = true;
  staticTextures.set(cacheKey, surface.texture);
  return surface.texture;
}

export function clearPixelTextureCache() {
  staticTextures.forEach((texture) => texture.dispose());
  staticTextures.clear();
}

export function rect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

/** 픽셀 아트에서 각도를 가진 팔다리를 계단식 사각형으로 찍는다. */
export function limb(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  length: number,
  thickness: number,
  color: string,
) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  for (let step = 0; step < length; step += 1) {
    rect(ctx, x + cos * step, y + sin * step, thickness, thickness, color);
  }
  return { x: x + cos * length, y: y + sin * length };
}

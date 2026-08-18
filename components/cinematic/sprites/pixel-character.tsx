"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createPixelSurface, limb, rect, type PixelSurface } from "@/components/cinematic/canvas-texture";

export type CharacterKind = "minu" | "gahyun";

export interface CharacterPose {
  /** 0 = 아래로 내림, PI = 머리 위로. 화면 왼쪽 팔. */
  armLeft: number;
  /** 화면 오른쪽 팔. */
  armRight: number;
  legLeft: number;
  legRight: number;
  /** 상체 위아래 반동(px). */
  bob: number;
  /** 전체 점프 높이(px). */
  jump: number;
  /** 기울기(-1 ~ 1). */
  lean: number;
  /** 입 벌림 0~1. */
  mouth: number;
  blink: boolean;
  penlight: boolean;
  /** 무릎 꿇기(프로포즈). */
  kneel: number;
  /** 눈 하트. */
  hearts: boolean;
}

export const CANVAS_W = 80;
export const CANVAS_H = 112;

export function basePose(): CharacterPose {
  return {
    armLeft: 0.12,
    armRight: 0.12,
    legLeft: 0.04,
    legRight: 0.04,
    bob: 0,
    jump: 0,
    lean: 0,
    mouth: 0,
    blink: false,
    penlight: false,
    kneel: 0,
    hearts: false,
  };
}

const PALETTE = {
  minu: {
    hair: "#171c2b",
    hairLight: "#2c3550",
    skin: "#f6cda6",
    skinShade: "#d8a97f",
    top: "#f3f6fb",
    topShade: "#cdd6e6",
    jacket: "#28407a",
    jacketShade: "#1a2c58",
    pants: "#1d2436",
    shoes: "#e7edf7",
    accent: "#6ef2a5",
    outline: "#080b12",
  },
  gahyun: {
    hair: "#20161c",
    hairLight: "#3a2831",
    skin: "#fbdcbd",
    skinShade: "#e0b28d",
    top: "#fffaf2",
    topShade: "#e7dccd",
    jacket: "#ff8fb4",
    jacketShade: "#e0668f",
    pants: "#ff6f9c",
    shoes: "#ffe1ec",
    accent: "#ff5fa2",
    outline: "#120a0f",
  },
} as const;

const SHOULDER_Y = 50;
const HIP_Y = 74;
const FOOT_Y = 105;
const CX = 40;

function drawCharacter(
  ctx: CanvasRenderingContext2D,
  kind: CharacterKind,
  pose: CharacterPose,
) {
  const p = PALETTE[kind];
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

  const lift = -pose.jump;
  const kneelDrop = pose.kneel * 14;
  const bodyY = lift + pose.bob + kneelDrop;
  const tilt = pose.lean * 4;

  const shoulderY = SHOULDER_Y + bodyY;
  const hipY = HIP_Y + bodyY;
  const headY = 16 + bodyY + pose.bob * 0.4;

  // ---- 다리 ----
  if (pose.kneel > 0.5) {
    rect(ctx, CX - 12, hipY, 9, 18, p.pants);
    rect(ctx, CX - 14, hipY + 16, 16, 6, p.pants);
    rect(ctx, CX - 15, hipY + 21, 17, 4, p.shoes);
    rect(ctx, CX + 2, hipY, 9, 20, p.pants);
    rect(ctx, CX + 1, hipY + 19, 13, 5, p.shoes);
  } else {
    const legLen = 28;
    const lLeg = limb(ctx, CX - 7, hipY, Math.PI / 2 + pose.legLeft, legLen, 5, p.pants);
    const rLeg = limb(ctx, CX + 4, hipY, Math.PI / 2 - pose.legRight, legLen, 5, p.pants);
    rect(ctx, lLeg.x - 2, Math.min(lLeg.y, FOOT_Y + lift), 9, 5, p.shoes);
    rect(ctx, rLeg.x - 2, Math.min(rLeg.y, FOOT_Y + lift), 9, 5, p.shoes);
  }

  // ---- 몸통 ----
  rect(ctx, CX - 13 + tilt, shoulderY - 4, 26, hipY - shoulderY + 6, p.jacket);
  rect(ctx, CX - 5 + tilt, shoulderY - 4, 10, hipY - shoulderY + 6, p.top);
  rect(ctx, CX - 13 + tilt, hipY - 4, 26, 4, p.jacketShade);

  if (kind === "gahyun") {
    // 플레어 스커트
    rect(ctx, CX - 16 + tilt, hipY - 2, 32, 5, p.pants);
    rect(ctx, CX - 13 + tilt, hipY + 3, 26, 3, p.jacketShade);
  }

  // ---- 팔 ----
  const armLen = 21;
  const shoulderL = { x: CX - 14 + tilt, y: shoulderY };
  const shoulderR = { x: CX + 11 + tilt, y: shoulderY };
  const handL = limb(ctx, shoulderL.x, shoulderL.y, Math.PI / 2 + pose.armLeft, armLen, 5, p.jacket);
  const handR = limb(ctx, shoulderR.x, shoulderR.y, Math.PI / 2 - pose.armRight, armLen, 5, p.jacket);
  rect(ctx, handL.x, handL.y, 5, 5, p.skin);
  rect(ctx, handR.x, handR.y, 5, 5, p.skin);

  if (pose.penlight) {
    drawPenlight(ctx, handL.x + 2, handL.y + 2, Math.PI / 2 + pose.armLeft, p.accent);
    drawPenlight(ctx, handR.x + 2, handR.y + 2, Math.PI / 2 - pose.armRight, p.accent);
  }

  // ---- 목 / 머리 ----
  rect(ctx, CX - 4 + tilt, shoulderY - 8, 8, 6, p.skinShade);

  const hx = CX - 12 + tilt * 1.4;
  // 뒷머리
  rect(ctx, hx - 2, headY - 3, 28, 30, p.hair);
  // 얼굴
  rect(ctx, hx + 1, headY + 3, 22, 24, p.skin);
  rect(ctx, hx + 1, headY + 23, 22, 4, p.skinShade);
  // 앞머리
  rect(ctx, hx - 1, headY - 1, 26, 9, p.hair);
  rect(ctx, hx + 2, headY, 8, 4, p.hairLight);

  if (kind === "minu") {
    // 검은 뿔테
    rect(ctx, hx, headY + 11, 24, 2, p.outline);
    rect(ctx, hx + 2, headY + 11, 8, 8, "#e8f0ff");
    rect(ctx, hx + 14, headY + 11, 8, 8, "#e8f0ff");
    rect(ctx, hx + 2, headY + 11, 8, 1, p.outline);
    rect(ctx, hx + 2, headY + 18, 8, 1, p.outline);
    rect(ctx, hx + 14, headY + 11, 8, 1, p.outline);
    rect(ctx, hx + 14, headY + 18, 8, 1, p.outline);
    rect(ctx, hx + 1, headY + 11, 1, 8, p.outline);
    rect(ctx, hx + 22, headY + 11, 1, 8, p.outline);
    rect(ctx, hx + 10, headY + 13, 4, 1, p.outline);
    if (!pose.blink) {
      rect(ctx, hx + 5, headY + 14, 2, 3, p.outline);
      rect(ctx, hx + 17, headY + 14, 2, 3, p.outline);
    } else {
      rect(ctx, hx + 4, headY + 15, 4, 1, p.outline);
      rect(ctx, hx + 16, headY + 15, 4, 1, p.outline);
    }
  } else {
    // 양갈래
    const swing = Math.sin(pose.bob * 0.9 + pose.armLeft) * 2;
    rect(ctx, hx - 8, headY + 4 + swing, 7, 20, p.hair);
    rect(ctx, hx - 9, headY + 20 + swing, 8, 7, p.hairLight);
    rect(ctx, hx + 25, headY + 4 - swing, 7, 20, p.hair);
    rect(ctx, hx + 25, headY + 20 - swing, 8, 7, p.hairLight);
    // 리본
    rect(ctx, hx - 7, headY + 1 + swing, 6, 4, "#ff5fa2");
    rect(ctx, hx + 25, headY + 1 - swing, 6, 4, "#ff5fa2");

    if (pose.hearts) {
      drawHeartEye(ctx, hx + 4, headY + 12);
      drawHeartEye(ctx, hx + 15, headY + 12);
    } else if (!pose.blink) {
      rect(ctx, hx + 5, headY + 12, 3, 5, p.outline);
      rect(ctx, hx + 16, headY + 12, 3, 5, p.outline);
      rect(ctx, hx + 5, headY + 12, 3, 2, "#ffffff");
      rect(ctx, hx + 16, headY + 12, 3, 2, "#ffffff");
    } else {
      rect(ctx, hx + 4, headY + 14, 5, 1, p.outline);
      rect(ctx, hx + 15, headY + 14, 5, 1, p.outline);
    }
    // 볼터치
    rect(ctx, hx + 2, headY + 18, 3, 2, "#ff9db8");
    rect(ctx, hx + 19, headY + 18, 3, 2, "#ff9db8");
  }

  // 입
  const mouthW = 3 + Math.round(pose.mouth * 6);
  const mouthH = 1 + Math.round(pose.mouth * 5);
  rect(ctx, CX - Math.floor(mouthW / 2) + tilt * 1.4, headY + 21, mouthW, mouthH, "#7a2233");
  if (pose.mouth > 0.4) {
    rect(ctx, CX - Math.floor(mouthW / 2) + 1 + tilt * 1.4, headY + 21, mouthW - 2, 1, "#ffffff");
  }

  // 가현이 핸드백은 춤출 때는 생략
  if (kind === "gahyun" && !pose.penlight) {
    rect(ctx, CX + 12 + tilt, hipY - 6, 9, 8, "#ffc4d8");
    rect(ctx, CX + 12 + tilt, hipY - 6, 9, 2, "#ff5fa2");
  }
}

function drawPenlight(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  color: string,
) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  for (let i = 0; i < 12; i += 1) {
    rect(ctx, x + cos * i, y + sin * i, 3, 3, i < 3 ? "#1a1a1a" : color);
  }
  // 잔광
  ctx.globalAlpha = 0.35;
  for (let i = 3; i < 18; i += 1) {
    rect(ctx, x + cos * i, y + sin * i, 4, 4, color);
  }
  ctx.globalAlpha = 1;
}

function drawHeartEye(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const c = "#ff2f6d";
  rect(ctx, x, y, 2, 2, c);
  rect(ctx, x + 3, y, 2, 2, c);
  rect(ctx, x, y + 2, 5, 2, c);
  rect(ctx, x + 1, y + 4, 3, 1, c);
  rect(ctx, x + 2, y + 5, 1, 1, c);
}

interface PixelCharacterProps {
  kind: CharacterKind;
  /** 매 프레임 포즈를 계산해 돌려준다. */
  pose: (elapsed: number) => CharacterPose;
  height?: number;
  position?: [number, number, number];
  /** 프레임 애니 느낌을 위한 스텝 수(초당). */
  fps?: number;
  flip?: boolean;
  scale?: number;
}

export function PixelCharacter({
  kind,
  pose,
  height = 2.4,
  position = [0, 0, 0],
  fps = 14,
  flip = false,
  scale = 1,
}: PixelCharacterProps) {
  const surfaceRef = useRef<PixelSurface | null>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  const elapsed = useRef(0);
  const lastFrame = useRef(-1);

  useEffect(() => {
    const surface = createPixelSurface(CANVAS_W, CANVAS_H);
    surfaceRef.current = surface;
    if (materialRef.current) {
      materialRef.current.map = surface.texture;
      materialRef.current.needsUpdate = true;
    }
    return () => {
      surface.texture.dispose();
      surfaceRef.current = null;
    };
  }, []);

  useFrame((_, delta) => {
    const surface = surfaceRef.current;
    if (!surface?.ctx) return;
    elapsed.current += Math.min(delta, 0.05);
    const frameIndex = Math.floor(elapsed.current * fps);
    if (frameIndex === lastFrame.current) return;
    lastFrame.current = frameIndex;
    drawCharacter(surface.ctx, kind, pose(frameIndex / fps));
    surface.texture.needsUpdate = true;
  });

  const width = (height * CANVAS_W) / CANVAS_H;

  return (
    <mesh position={position} scale={[flip ? -scale : scale, scale, scale]}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial
        alphaTest={0.5}
        depthWrite={false}
        ref={materialRef}
        side={THREE.DoubleSide}
        toneMapped={false}
        transparent
      />
    </mesh>
  );
}

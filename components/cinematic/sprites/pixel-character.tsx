"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createPixelSurface, limb, rect, type PixelSurface } from "@/components/cinematic/canvas-texture";

export type CharacterKind =
  | "minu"
  | "gahyun"
  | "minu-bday"
  | "minu-bday-2026"
  | "minu-dating"
  | "gahyun-dating"
  | "minu-first-date"
  | "gahyun-first-date"
  | "minu-wotagei"
  | "gahyun-wotagei"
  | "gahyun-bday"
  | "minu-fukuoka"
  | "minu-fukuoka-outdoor"
  | "gahyun-fukuoka-airport"
  | "gahyun-fukuoka-mandarake"
  | "gahyun-fukuoka-outdoor"
  | "gahyun-fukuoka-night";

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
  /** 벤치 등에 앉기 0~1. */
  sit: number;
  /** 눈 하트. */
  hearts: boolean;
  /** 손하트 포즈. */
  heartHands: boolean;
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
    sit: 0,
    hearts: false,
    heartHands: false,
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
  "minu-bday": {
    hair: "#12151c",
    hairLight: "#2a3140",
    skin: "#f0c696",
    skinShade: "#d4a574",
    top: "#f4f6fa",
    topShade: "#dce2ec",
    jacket: "#c5ccd8",
    jacketShade: "#8f98a8",
    pants: "#2a3344",
    shoes: "#eef1f6",
    accent: "#1f8a7a",
    outline: "#0a0c10",
  },
  "minu-bday-2026": {
    hair: "#12151c",
    hairLight: "#2a3140",
    skin: "#f0c696",
    skinShade: "#d4a574",
    top: "#f8f4ee",
    topShade: "#e8dfd4",
    jacket: "#f8f4ee",
    jacketShade: "#d4ccc2",
    pants: "#2a3344",
    shoes: "#1a1a1a",
    accent: "#f4b8c8",
    outline: "#0a0c10",
  },
  "minu-dating": {
    hair: "#12151c",
    hairLight: "#2a3140",
    skin: "#f0c696",
    skinShade: "#d4a574",
    top: "#f8fafc",
    topShade: "#e2e8f0",
    jacket: "#f8fafc",
    jacketShade: "#cbd5e1",
    pants: "#2a3344",
    shoes: "#1a1f28",
    accent: "#39c5bb",
    outline: "#0a0c10",
  },
  "minu-first-date": {
    hair: "#12151c",
    hairLight: "#2a3140",
    skin: "#f0c696",
    skinShade: "#d4a574",
    top: "#141414",
    topShade: "#0a0a0a",
    jacket: "#141414",
    jacketShade: "#0a0a0a",
    pants: "#1d2436",
    shoes: "#2a2a2a",
    accent: "#e85d04",
    outline: "#0a0c10",
  },
  "gahyun-dating": {
    hair: "#1a1418",
    hairLight: "#34282e",
    skin: "#fbdcbd",
    skinShade: "#e0b28d",
    top: "#ffffff",
    topShade: "#eef2f6",
    jacket: "#a8e6cf",
    jacketShade: "#7fd4b8",
    pants: "#f5f7fa",
    shoes: "#1a1a1a",
    accent: "#5fd0ff",
    outline: "#120a0f",
  },
  "gahyun-first-date": {
    hair: "#1a1418",
    hairLight: "#34282e",
    skin: "#fbdcbd",
    skinShade: "#e0b28d",
    top: "#f8fafc",
    topShade: "#e8edf2",
    jacket: "#f8fafc",
    jacketShade: "#dce3ea",
    pants: "#4a6fa5",
    shoes: "#c9a87c",
    accent: "#ff5fa2",
    outline: "#120a0f",
  },
  "minu-wotagei": {
    hair: "#12151c",
    hairLight: "#2a3140",
    skin: "#f0c696",
    skinShade: "#d4a574",
    top: "#f3f4f6",
    topShade: "#d1d5db",
    jacket: "#f3f4f6",
    jacketShade: "#9ca3af",
    pants: "#141414",
    shoes: "#1a1a1a",
    accent: "#39c5bb",
    outline: "#0a0c10",
  },
  "gahyun-wotagei": {
    hair: "#1a1418",
    hairLight: "#34282e",
    skin: "#fbdcbd",
    skinShade: "#e0b28d",
    top: "#ffffff",
    topShade: "#eef2f6",
    jacket: "#1a1418",
    jacketShade: "#0f0d10",
    pants: "#1a1418",
    shoes: "#1a1a1a",
    accent: "#ff5fa2",
    outline: "#120a0f",
  },
  "gahyun-bday": {
    hair: "#1a1418",
    hairLight: "#34282e",
    skin: "#fbdcbd",
    skinShade: "#e0b28d",
    top: "#1a1418",
    topShade: "#0f0d10",
    jacket: "#1a1418",
    jacketShade: "#0a080c",
    pants: "#1a1418",
    shoes: "#1a1a1a",
    accent: "#c9a87c",
    outline: "#120a0f",
  },
  "minu-fukuoka": {
    hair: "#12151c",
    hairLight: "#2a3140",
    skin: "#f0c696",
    skinShade: "#d4a574",
    top: "#141414",
    topShade: "#0a0a0a",
    jacket: "#141414",
    jacketShade: "#0a0a0a",
    pants: "#1d2436",
    shoes: "#1a1a1a",
    accent: "#ff5fa2",
    outline: "#0a0c10",
  },
  "minu-fukuoka-outdoor": {
    hair: "#12151c",
    hairLight: "#2a3140",
    skin: "#f0c696",
    skinShade: "#d4a574",
    top: "#f8fafc",
    topShade: "#e2e8f0",
    jacket: "#f8fafc",
    jacketShade: "#cbd5e1",
    pants: "#2a3344",
    shoes: "#1a1a1a",
    accent: "#ff5fa2",
    outline: "#0a0c10",
  },
  "gahyun-fukuoka-airport": {
    hair: "#1a1418",
    hairLight: "#34282e",
    skin: "#fbdcbd",
    skinShade: "#e0b28d",
    top: "#ffffff",
    topShade: "#eef2f6",
    jacket: "#ffffff",
    jacketShade: "#e5e7eb",
    pants: "#2a3344",
    shoes: "#1a1a1a",
    accent: "#ff5fa2",
    outline: "#120a0f",
  },
  "gahyun-fukuoka-mandarake": {
    hair: "#1a1418",
    hairLight: "#34282e",
    skin: "#fbdcbd",
    skinShade: "#e0b28d",
    top: "#ffffff",
    topShade: "#eef2f6",
    jacket: "#1a1418",
    jacketShade: "#0f0d10",
    pants: "#1a1418",
    shoes: "#1a1a1a",
    accent: "#5b8cff",
    outline: "#120a0f",
  },
  "gahyun-fukuoka-outdoor": {
    hair: "#1a1418",
    hairLight: "#34282e",
    skin: "#fbdcbd",
    skinShade: "#e0b28d",
    top: "#1a1418",
    topShade: "#0f0d10",
    jacket: "#1a1418",
    jacketShade: "#0f0d10",
    pants: "#2a3344",
    shoes: "#1a1a1a",
    accent: "#ff5fa2",
    outline: "#120a0f",
  },
  "gahyun-fukuoka-night": {
    hair: "#1a1418",
    hairLight: "#34282e",
    skin: "#fbdcbd",
    skinShade: "#e0b28d",
    top: "#ffffff",
    topShade: "#eef2f6",
    jacket: "#1a1418",
    jacketShade: "#0f0d10",
    pants: "#1a1418",
    shoes: "#1a1a1a",
    accent: "#e85d04",
    outline: "#120a0f",
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

function plaidFill(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  light: string,
  dark: string,
) {
  rect(ctx, x, y, w, h, light);
  for (let py = y; py < y + h; py += 4) {
    for (let px = x; px < x + w; px += 4) {
      if (((px - x) / 4 + (py - y) / 4) % 2 === 0) {
        rect(ctx, px, py, 4, 4, dark);
      }
    }
  }
}

function drawMikuBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  accent: string,
  outline: string,
) {
  rect(ctx, x, y, 24, 17, accent);
  rect(ctx, x, y, 24, 2, outline);
  rect(ctx, x, y + 15, 24, 2, outline);
  rect(ctx, x, y, 2, 17, outline);
  rect(ctx, x + 22, y, 2, 17, outline);
  rect(ctx, x + 4, y + 4, 3, 3, "#e8f7ff");
  rect(ctx, x + 10, y + 6, 2, 2, "#e8f7ff");
  rect(ctx, x + 16, y + 4, 3, 3, "#e8f7ff");
  rect(ctx, x + 7, y + 10, 10, 2, "#ffffff");
  rect(ctx, x + 9, y + 9, 6, 4, "#ffffff");
}

function drawMikuPlush(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  accent: string,
  outline: string,
) {
  rect(ctx, x, y, 22, 20, accent);
  rect(ctx, x + 2, y + 2, 18, 8, "#7ee8dc");
  rect(ctx, x + 6, y + 10, 10, 6, accent);
  rect(ctx, x - 6, y + 4, 6, 16, accent);
  rect(ctx, x + 22, y + 4, 6, 16, accent);
  rect(ctx, x - 7, y + 18, 7, 4, "#7ee8dc");
  rect(ctx, x + 23, y + 18, 7, 4, "#7ee8dc");
  rect(ctx, x + 7, y + 4, 3, 3, outline);
  rect(ctx, x + 13, y + 4, 3, 3, outline);
  rect(ctx, x + 9, y + 7, 4, 1, outline);
}

function drawHandsHeart(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const c = "#ff2f6d";
  rect(ctx, x, y, 3, 3, c);
  rect(ctx, x + 4, y, 3, 3, c);
  rect(ctx, x, y + 3, 7, 3, c);
  rect(ctx, x + 1, y + 6, 5, 2, c);
  rect(ctx, x + 2, y + 8, 3, 2, c);
}

function drawFigureBox(ctx: CanvasRenderingContext2D, x: number, y: number, accent: string, outline: string) {
  rect(ctx, x, y, 22, 18, accent);
  rect(ctx, x + 3, y + 3, 16, 10, "#e8f0ff");
  rect(ctx, x + 6, y + 5, 10, 6, "#b8d4ff");
  rect(ctx, x, y, 22, 2, outline);
  rect(ctx, x, y + 16, 22, 2, outline);
}

function drawShoppingBag(ctx: CanvasRenderingContext2D, x: number, y: number, accent: string, outline: string) {
  rect(ctx, x, y, 10, 12, "#d4a574");
  rect(ctx, x + 1, y, 8, 2, outline);
  rect(ctx, x + 3, y - 3, 4, 3, outline);
  rect(ctx, x + 2, y + 4, 6, 3, accent);
}

function drawKnife(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  blade: string,
  outline: string,
) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const perpX = -sin;
  const perpY = cos;

  for (let i = 0; i < 4; i += 1) {
    const gripX = x - cos * i;
    const gripY = y - sin * i;
    rect(ctx, gripX - 1, gripY - 1, 3, 3, "#5c3d1e");
    rect(ctx, gripX - 1, gripY + 1, 3, 1, outline);
  }

  rect(ctx, x + perpX * 2 - 1, y + perpY * 2 - 1, 3, 3, "#8b6914");
  rect(ctx, x - perpX * 2 - 1, y - perpY * 2 - 1, 3, 3, "#8b6914");

  for (let i = 1; i <= 13; i += 1) {
    const size = i < 10 ? 4 : 3;
    const bladeX = x + cos * (i + 2);
    const bladeY = y + sin * (i + 2);
    rect(ctx, bladeX - Math.floor(size / 2), bladeY - Math.floor(size / 2), size, size, i < 11 ? blade : "#eef6ff");
    if (i === 4 || i === 8) {
      rect(ctx, bladeX + perpX - 1, bladeY + perpY - 1, 1, 2, "#ffffff");
    }
  }

  rect(ctx, x + cos * 16, y + sin * 16, 2, 2, outline);
}

function drawHeartEye(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const c = "#ff2f6d";
  rect(ctx, x, y, 2, 2, c);
  rect(ctx, x + 3, y, 2, 2, c);
  rect(ctx, x, y + 2, 5, 2, c);
  rect(ctx, x + 1, y + 4, 3, 1, c);
  rect(ctx, x + 2, y + 5, 1, 1, c);
}

function isGahyunKind(kind: CharacterKind) {
  return kind === "gahyun" || kind.startsWith("gahyun-");
}

function drawGahyunEyes(
  ctx: CanvasRenderingContext2D,
  hx: number,
  headY: number,
  pose: CharacterPose,
  outline: string,
) {
  if (pose.hearts) {
    drawHeartEye(ctx, hx + 5, headY + 12);
    drawHeartEye(ctx, hx + 15, headY + 12);
    return;
  }
  if (pose.blink) {
    rect(ctx, hx + 5, headY + 14, 5, 1, outline);
    rect(ctx, hx + 15, headY + 14, 5, 1, outline);
    return;
  }
  rect(ctx, hx + 4, headY + 11, 5, 6, outline);
  rect(ctx, hx + 5, headY + 12, 4, 4, "#ffffff");
  rect(ctx, hx + 6, headY + 14, 2, 3, outline);
  rect(ctx, hx + 6, headY + 12, 1, 1, "#ffffff");
  rect(ctx, hx + 15, headY + 11, 5, 6, outline);
  rect(ctx, hx + 16, headY + 12, 4, 4, "#ffffff");
  rect(ctx, hx + 17, headY + 14, 2, 3, outline);
  rect(ctx, hx + 18, headY + 12, 1, 1, "#ffffff");
  rect(ctx, hx + 4, headY + 11, 2, 1, outline);
  rect(ctx, hx + 18, headY + 11, 2, 1, outline);
}

function drawGahyunBlush(ctx: CanvasRenderingContext2D, hx: number, headY: number) {
  rect(ctx, hx + 1, headY + 17, 4, 2, "#ffb0c8");
  rect(ctx, hx + 19, headY + 17, 4, 2, "#ffb0c8");
}

function drawGahyunMouth(
  ctx: CanvasRenderingContext2D,
  cx: number,
  headY: number,
  mouth: number,
) {
  const mouthW = 2 + Math.round(mouth * 4);
  const mouthH = 1 + Math.round(mouth * 2);
  rect(ctx, cx - Math.floor(mouthW / 2), headY + 20, mouthW, mouthH, "#c45c6a");
  if (mouth > 0.2) {
    rect(ctx, cx - Math.floor(mouthW / 2), headY + 20, mouthW, 1, "#ffffff");
  }
}

function drawCharacter(
  ctx: CanvasRenderingContext2D,
  kind: CharacterKind,
  pose: CharacterPose,
) {
  const p = PALETTE[kind];
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

  const lift = -pose.jump;
  const kneelDrop = pose.kneel * 14;
  const sitDrop = pose.sit * 11;
  const bodyY = lift + pose.bob + kneelDrop + sitDrop;
  const tilt = pose.lean * 4;

  const shoulderY = SHOULDER_Y + bodyY;
  const hipY = HIP_Y + bodyY;
  const headY = 16 + bodyY + pose.bob * 0.4;

  // ---- 다리 ----
  if (pose.sit > 0.15) {
    const seatY = hipY + 1;
    const spread = pose.sit * 2;
    rect(ctx, CX - 14 - spread, seatY, 12, 5, p.pants);
    rect(ctx, CX - 14 - spread, seatY + 4, 5, 11, p.pants);
    rect(ctx, CX - 15 - spread, seatY + 14, 9, 4, p.shoes);
    rect(ctx, CX + 2 + spread, seatY, 12, 5, p.pants);
    rect(ctx, CX + 8 + spread, seatY + 4, 5, 11, p.pants);
    rect(ctx, CX + 6 + spread, seatY + 14, 9, 4, p.shoes);
  } else if (pose.kneel > 0.5) {
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
    if (kind === "minu-wotagei") {
      rect(ctx, lLeg.x - 3, lLeg.y + 4, 2, 14, "#ffd24a");
      rect(ctx, rLeg.x + 8, rLeg.y + 4, 2, 14, "#ffd24a");
    }
  }

  // ---- 몸통 ----
  if (kind === "minu-bday") {
    rect(ctx, CX - 13 + tilt, shoulderY - 4, 26, hipY - shoulderY + 6, p.top);
    plaidFill(ctx, CX - 15 + tilt, shoulderY - 6, 30, hipY - shoulderY + 10, p.jacket, p.jacketShade);
    rect(ctx, CX - 4 + tilt, shoulderY - 2, 8, hipY - shoulderY + 4, p.top);
    rect(ctx, CX - 13 + tilt, hipY - 4, 26, 4, p.jacketShade);
    rect(ctx, CX - 1 + tilt, shoulderY - 1, 2, 10, "#8b93a0");
    rect(ctx, CX - 2 + tilt, shoulderY + 8, 4, 3, "#6b7280");
  } else if (kind === "minu-bday-2026") {
    rect(ctx, CX - 13 + tilt, shoulderY - 4, 26, hipY - shoulderY + 6, p.top);
    rect(ctx, CX - 3 + tilt, shoulderY - 2, 6, 3, p.accent);
    rect(ctx, CX - 1 + tilt, shoulderY + 2, 2, 2, "#c9a87c");
    rect(ctx, CX - 15 + tilt, shoulderY - 5, 3, 14, p.pants);
    rect(ctx, CX + 12 + tilt, shoulderY - 5, 3, 14, p.pants);
    rect(ctx, CX - 13 + tilt, hipY - 4, 26, 4, p.topShade);
  } else if (kind === "minu-dating") {
    rect(ctx, CX - 13 + tilt, shoulderY - 4, 26, hipY - shoulderY + 6, p.top);
    rect(ctx, CX - 13 + tilt, hipY - 4, 26, 4, p.topShade);
  } else if (kind === "minu-first-date") {
    rect(ctx, CX - 13 + tilt, shoulderY - 4, 26, hipY - shoulderY + 6, p.jacket);
    rect(ctx, CX - 15 + tilt, shoulderY - 6, 4, 9, "#f5f5f5");
    rect(ctx, CX + 11 + tilt, shoulderY - 6, 4, 9, "#f5f5f5");
    rect(ctx, CX - 7 + tilt, shoulderY + 1, 16, 9, p.accent);
    rect(ctx, CX - 5 + tilt, shoulderY + 4, 10, 3, "#ffffff");
    rect(ctx, CX - 13 + tilt, hipY - 4, 26, 4, p.jacketShade);
    rect(ctx, CX - 9 + tilt, shoulderY, 2, 22, "#6b7280");
    rect(ctx, CX - 11 + tilt, shoulderY + 20, 7, 5, "#1f2937");
  } else if (kind === "minu-wotagei") {
    rect(ctx, CX - 13 + tilt, shoulderY - 4, 26, hipY - shoulderY + 6, p.top);
    rect(ctx, CX - 11 + tilt, shoulderY, 8, 6, "#ff6b9d");
    rect(ctx, CX + 1 + tilt, shoulderY + 2, 10, 8, "#5b8cff");
    rect(ctx, CX - 8 + tilt, shoulderY + 8, 7, 5, "#ffd24a");
    rect(ctx, CX - 11 + tilt, shoulderY - 2, 3, 24, "#1f2937");
    rect(ctx, CX - 13 + tilt, hipY - 4, 26, 4, p.topShade);
  } else if (kind === "minu-fukuoka" || kind === "minu-fukuoka-outdoor") {
    rect(ctx, CX - 13 + tilt, shoulderY - 4, 26, hipY - shoulderY + 6, p.top);
    rect(ctx, CX - 13 + tilt, hipY - 4, 26, 4, p.topShade);
  } else if (kind === "gahyun-dating") {
    rect(ctx, CX - 13 + tilt, shoulderY - 4, 26, hipY - shoulderY + 6, p.top);
    rect(ctx, CX - 15 + tilt, shoulderY - 6, 30, hipY - shoulderY + 10, p.jacket);
    rect(ctx, CX - 4 + tilt, shoulderY - 2, 8, hipY - shoulderY + 6, p.top);
    rect(ctx, CX - 13 + tilt, hipY - 4, 26, 4, p.jacketShade);
  } else if (kind === "gahyun-first-date") {
    rect(ctx, CX - 13 + tilt, shoulderY - 4, 26, hipY - shoulderY + 6, p.top);
    rect(ctx, CX - 13 + tilt, hipY - 4, 26, 4, p.topShade);
  } else if (kind === "gahyun-wotagei") {
    rect(ctx, CX - 13 + tilt, shoulderY - 4, 26, hipY - shoulderY + 6, p.jacket);
    rect(ctx, CX - 15 + tilt, shoulderY - 5, 30, hipY - shoulderY + 12, p.top);
    rect(ctx, CX - 3 + tilt, shoulderY + 2, 2, 10, p.outline);
    rect(ctx, CX + 1 + tilt, shoulderY + 4, 2, 8, p.outline);
    rect(ctx, CX - 13 + tilt, hipY - 4, 26, 4, p.jacketShade);
  } else if (kind === "gahyun-bday") {
    rect(ctx, CX - 14 + tilt, shoulderY - 5, 28, hipY - shoulderY + 14, p.jacket);
    rect(ctx, CX - 8 + tilt, shoulderY - 3, 6, hipY - shoulderY + 8, p.topShade);
    rect(ctx, CX + 2 + tilt, shoulderY - 3, 6, hipY - shoulderY + 8, p.topShade);
    for (let by = shoulderY + 2; by < hipY - 4; by += 5) {
      rect(ctx, CX - 3 + tilt, by, 2, 2, p.accent);
      rect(ctx, CX + 1 + tilt, by, 2, 2, p.accent);
    }
    rect(ctx, CX - 4 + tilt, hipY - 6, 8, 3, p.accent);
    rect(ctx, CX - 13 + tilt, hipY - 4, 26, 4, p.jacketShade);
  } else if (kind === "gahyun-fukuoka-airport") {
    rect(ctx, CX - 13 + tilt, shoulderY - 4, 26, hipY - shoulderY + 6, p.top);
    rect(ctx, CX - 13 + tilt, hipY - 4, 26, 4, p.topShade);
  } else if (kind === "gahyun-fukuoka-mandarake" || kind === "gahyun-fukuoka-night") {
    rect(ctx, CX - 13 + tilt, shoulderY - 4, 26, hipY - shoulderY + 6, p.jacket);
    rect(ctx, CX - 15 + tilt, shoulderY - 5, 30, 8, p.top);
    rect(ctx, CX - 3 + tilt, shoulderY - 3, 8, 4, p.top);
    rect(ctx, CX - 13 + tilt, hipY - 4, 26, 4, p.jacketShade);
  } else if (kind === "gahyun-fukuoka-outdoor") {
    rect(ctx, CX - 13 + tilt, shoulderY - 4, 26, hipY - shoulderY + 6, p.jacket);
    for (let py = shoulderY - 2; py < hipY; py += 5) {
      for (let px = CX - 11; px < CX + 12; px += 5) {
        if ((px + py) % 10 < 5) rect(ctx, px + tilt, py, 2, 2, "#ffffff");
      }
    }
    rect(ctx, CX - 2 + tilt, shoulderY - 2, 6, 3, "#ffffff");
    rect(ctx, CX - 13 + tilt, hipY - 4, 26, 4, p.jacketShade);
  } else {
    rect(ctx, CX - 13 + tilt, shoulderY - 4, 26, hipY - shoulderY + 6, p.jacket);
    rect(ctx, CX - 5 + tilt, shoulderY - 4, 10, hipY - shoulderY + 6, p.top);
    rect(ctx, CX - 13 + tilt, hipY - 4, 26, 4, p.jacketShade);
  }

  if (kind === "gahyun") {
    // 플레어 스커트
    rect(ctx, CX - 16 + tilt, hipY - 2, 32, 5, p.pants);
    rect(ctx, CX - 13 + tilt, hipY + 3, 26, 3, p.jacketShade);
  } else if (kind === "gahyun-dating") {
    rect(ctx, CX - 12 + tilt, hipY - 2, 24, 7, p.pants);
    rect(ctx, CX - 14 + tilt, hipY + 5, 10, 4, p.shoes);
    rect(ctx, CX + 4 + tilt, hipY + 5, 10, 4, p.shoes);
  } else if (kind === "gahyun-first-date") {
    rect(ctx, CX - 12 + tilt, hipY - 2, 24, 9, p.pants);
    rect(ctx, CX - 14 + tilt, hipY + 7, 10, 3, p.shoes);
    rect(ctx, CX + 4 + tilt, hipY + 7, 10, 3, p.shoes);
  } else if (kind === "gahyun-wotagei") {
    rect(ctx, CX - 16 + tilt, hipY - 2, 32, 9, p.jacket);
    rect(ctx, CX - 14 + tilt, hipY + 5, 28, 4, p.top);
    rect(ctx, CX - 14 + tilt, hipY + 8, 10, 4, p.shoes);
    rect(ctx, CX + 4 + tilt, hipY + 8, 10, 4, p.shoes);
  } else if (kind === "gahyun-bday") {
    rect(ctx, CX - 14 + tilt, hipY - 2, 28, 8, p.pants);
    rect(ctx, CX - 14 + tilt, hipY + 6, 10, 4, p.shoes);
    rect(ctx, CX + 4 + tilt, hipY + 6, 10, 4, p.shoes);
  } else if (kind === "gahyun-fukuoka-airport" || kind === "gahyun-fukuoka-outdoor") {
    rect(ctx, CX - 12 + tilt, hipY - 2, 24, 8, p.pants);
    rect(ctx, CX - 14 + tilt, hipY + 6, 10, 4, p.shoes);
    rect(ctx, CX + 4 + tilt, hipY + 6, 10, 4, p.shoes);
  } else if (kind === "gahyun-fukuoka-mandarake" || kind === "gahyun-fukuoka-night") {
    rect(ctx, CX - 16 + tilt, hipY - 2, 32, 10, p.jacket);
    rect(ctx, CX - 14 + tilt, hipY + 8, 10, 4, p.shoes);
    rect(ctx, CX + 4 + tilt, hipY + 8, 10, 4, p.shoes);
  }

  // ---- 팔 ----
  const armLen = 21;
  const shoulderL = { x: CX - 14 + tilt, y: shoulderY };
  const shoulderR = { x: CX + 11 + tilt, y: shoulderY };
  const handL = limb(ctx, shoulderL.x, shoulderL.y, Math.PI / 2 + pose.armLeft, armLen, 5, p.jacket);
  const handR = limb(ctx, shoulderR.x, shoulderR.y, Math.PI / 2 - pose.armRight, armLen, 5, p.jacket);

  if (kind === "minu-bday") {
    drawMikuBox(ctx, CX - 12 + tilt, shoulderY + 8, p.accent, p.outline);
  } else if (kind === "minu-dating") {
    drawMikuPlush(ctx, CX - 11 + tilt, shoulderY + 4, p.accent, p.outline);
  }

  if (kind === "gahyun-fukuoka-mandarake") {
    drawFigureBox(ctx, CX - 11 + tilt, shoulderY + 5, p.accent, p.outline);
  }

  rect(ctx, handL.x, handL.y, 5, 5, p.skin);
  rect(ctx, handR.x, handR.y, 5, 5, p.skin);

  if (kind === "gahyun-fukuoka-night") {
    drawShoppingBag(ctx, handL.x - 5, handL.y + 1, p.accent, p.outline);
    drawShoppingBag(ctx, handR.x - 5, handR.y + 1, "#e85d04", p.outline);
  }

  if (kind === "gahyun-dating") {
    const armAngle = Math.PI / 2 - pose.armRight;
    drawKnife(ctx, handR.x + 2, handR.y + 2, armAngle, "#c8d4e0", p.outline);
  }

  if (pose.penlight || kind === "minu-dating") {
    drawPenlight(ctx, handR.x + 2, handR.y + 2, Math.PI / 2 - pose.armRight, p.accent);
  }
  if (pose.penlight && kind !== "minu-dating") {
    drawPenlight(ctx, handL.x + 2, handL.y + 2, Math.PI / 2 + pose.armLeft, p.accent);
  }

  if (pose.heartHands || (pose.hearts && (kind === "minu-fukuoka" || kind === "minu-fukuoka-outdoor"))) {
    if (
      kind === "minu-wotagei" ||
      kind === "minu-first-date" ||
      kind === "minu-dating" ||
      kind === "minu-bday" ||
      kind === "minu-bday-2026" ||
      kind === "minu" ||
      kind === "minu-fukuoka" ||
      kind === "minu-fukuoka-outdoor"
    ) {
      drawHandsHeart(ctx, handR.x - 3, handR.y - 8);
    } else if (kind === "gahyun-wotagei") {
      drawHandsHeart(ctx, handL.x - 3, handL.y - 8);
    }
  }

  // ---- 목 / 머리 ----
  rect(ctx, CX - 4 + tilt, shoulderY - 8, 8, 6, p.skinShade);

  const hx = CX - 12 + tilt * 1.4;
  const faceCx = CX + Math.round(tilt * 1.4);

  if (!isGahyunKind(kind)) {
    rect(ctx, hx - 2, headY - 3, 28, 30, p.hair);
    rect(ctx, hx + 1, headY + 3, 22, 24, p.skin);
    rect(ctx, hx + 1, headY + 23, 22, 4, p.skinShade);
    rect(ctx, hx - 1, headY - 1, 26, 9, p.hair);
    rect(ctx, hx + 2, headY, 8, 4, p.hairLight);

    if (
      kind === "minu" ||
      kind === "minu-bday" ||
      kind === "minu-bday-2026" ||
      kind === "minu-dating" ||
      kind === "minu-first-date" ||
      kind === "minu-wotagei" ||
      kind === "minu-fukuoka" ||
      kind === "minu-fukuoka-outdoor"
    ) {
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
      if (pose.hearts) {
        drawHeartEye(ctx, hx + 4, headY + 12);
        drawHeartEye(ctx, hx + 16, headY + 12);
      } else if (!pose.blink) {
        if (kind === "minu-bday" || kind === "minu-bday-2026" || kind === "minu-dating") {
          rect(ctx, hx + 4, headY + 14, 5, 1, p.outline);
          rect(ctx, hx + 16, headY + 14, 5, 1, p.outline);
          rect(ctx, hx + 5, headY + 15, 3, 1, p.outline);
          rect(ctx, hx + 17, headY + 15, 3, 1, p.outline);
        } else {
          rect(ctx, hx + 5, headY + 14, 2, 3, p.outline);
          rect(ctx, hx + 17, headY + 14, 2, 3, p.outline);
        }
      } else {
        rect(ctx, hx + 4, headY + 15, 4, 1, p.outline);
        rect(ctx, hx + 16, headY + 15, 4, 1, p.outline);
      }
    }
  } else {
    if (kind === "gahyun-wotagei") {
      rect(ctx, hx - 1, headY + 1, 28, 20, p.hair);
    } else if (kind === "gahyun-dating" || kind === "gahyun-first-date" || kind === "gahyun-bday") {
      rect(ctx, hx - 2, headY - 2, 30, 32, p.hair);
      rect(ctx, hx + 22, headY + 3, 9, 18, p.hair);
      rect(ctx, hx + 23, headY + 19, 7, 5, p.hairLight);
    } else {
      rect(ctx, hx - 2, headY - 3, 28, 30, p.hair);
    }

    rect(ctx, hx + 2, headY + 4, 20, 21, p.skin);
    rect(ctx, hx + 3, headY + 21, 18, 3, p.skinShade);
    rect(ctx, hx + 5, headY + 24, 14, 2, p.skinShade);

    if (kind === "gahyun-wotagei") {
      rect(ctx, hx + 3, headY + 2, 18, 5, p.hair);
      rect(ctx, hx + 5, headY + 5, 5, 2, p.hairLight);
      rect(ctx, hx + 13, headY + 5, 5, 2, p.hairLight);
      rect(ctx, hx + 4, headY - 2, 16, 3, "#ffffff");
      rect(ctx, hx + 5, headY - 1, 14, 1, "#f8f0ff");
    } else if (kind === "gahyun-fukuoka-airport" || kind === "gahyun-fukuoka-outdoor") {
      rect(ctx, hx + 2, headY + 1, 20, 5, p.hair);
      rect(ctx, hx + 22, headY + 3, 9, 18, p.hair);
      rect(ctx, hx + 23, headY + 19, 7, 5, p.hairLight);
      rect(ctx, hx + 3, headY + 2, 7, 3, p.hairLight);
      rect(ctx, hx + 14, headY + 2, 7, 3, p.hairLight);
    } else if (kind === "gahyun-fukuoka-mandarake" || kind === "gahyun-fukuoka-night") {
      rect(ctx, hx + 3, headY + 2, 18, 5, p.hair);
      rect(ctx, hx - 5, headY + 7, 6, 14, p.hair);
      rect(ctx, hx + 23, headY + 7, 6, 14, p.hair);
      rect(ctx, hx - 6, headY + 19, 7, 4, p.hairLight);
      rect(ctx, hx + 24, headY + 19, 7, 4, p.hairLight);
    } else if (kind === "gahyun-dating" || kind === "gahyun-first-date" || kind === "gahyun-bday") {
      rect(ctx, hx + 2, headY + 1, 20, 5, p.hair);
      rect(ctx, hx + 3, headY + 2, 7, 3, p.hairLight);
      rect(ctx, hx + 14, headY + 2, 7, 3, p.hairLight);
      if (kind === "gahyun-bday") {
        rect(ctx, hx + 22, headY + 3, 9, 18, p.hair);
        rect(ctx, hx + 23, headY + 19, 7, 5, p.hairLight);
        rect(ctx, hx + 4, headY - 8, 5, 8, "#ffffff");
        rect(ctx, hx + 15, headY - 8, 5, 8, "#ffffff");
        rect(ctx, hx + 5, headY - 9, 3, 3, "#f0e8f0");
        rect(ctx, hx + 16, headY - 9, 3, 3, "#f0e8f0");
        rect(ctx, hx + 3, headY - 2, 18, 3, "#ffffff");
      } else {
        rect(ctx, hx + 22, headY + 3, 9, 18, p.hair);
        rect(ctx, hx + 23, headY + 19, 7, 5, p.hairLight);
      }
    } else {
      const swing = Math.sin(pose.bob * 0.9 + pose.armLeft) * 2;
      rect(ctx, hx - 1, headY - 1, 24, 8, p.hair);
      rect(ctx, hx + 2, headY, 8, 4, p.hairLight);
      rect(ctx, hx - 8, headY + 4 + swing, 7, 20, p.hair);
      rect(ctx, hx - 9, headY + 20 + swing, 8, 7, p.hairLight);
      rect(ctx, hx + 25, headY + 4 - swing, 7, 20, p.hair);
      rect(ctx, hx + 25, headY + 20 - swing, 8, 7, p.hairLight);
      rect(ctx, hx - 7, headY + 1 + swing, 6, 4, "#ff5fa2");
      rect(ctx, hx + 25, headY + 1 - swing, 6, 4, "#ff5fa2");
    }

    drawGahyunEyes(ctx, hx, headY, pose, p.outline);
    drawGahyunBlush(ctx, hx, headY);
  }

  // 입
  if (isGahyunKind(kind)) {
    drawGahyunMouth(ctx, faceCx, headY, pose.mouth);
  } else {
    const bigSmile = kind === "minu-bday" || kind === "minu-bday-2026" || kind === "minu-dating";
    const mouthW = bigSmile ? 5 + Math.round(pose.mouth * 7) : 3 + Math.round(pose.mouth * 6);
    const mouthH = bigSmile ? 2 + Math.round(pose.mouth * 6) : 1 + Math.round(pose.mouth * 5);
    const mouthY = bigSmile ? headY + 20 : headY + 21;
    rect(ctx, CX - Math.floor(mouthW / 2) + tilt * 1.4, mouthY, mouthW, mouthH, "#7a2233");
    if (pose.mouth > 0.35) {
      rect(ctx, CX - Math.floor(mouthW / 2) + 1 + tilt * 1.4, mouthY, mouthW - 2, Math.max(1, mouthH - 1), "#ffffff");
    }
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

"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getPixelTexture, rect } from "@/components/cinematic/canvas-texture";

/** 만화 집중선. 중앙이 비고 바깥으로 갈수록 굵어지는 방사선. */
export function SpeedLines({
  color = "#ffffff",
  count = 56,
  size = 16,
  opacity = 0.5,
  spin = 0.25,
  z = -1,
  inner = 0.18,
}: {
  color?: string;
  count?: number;
  size?: number;
  opacity?: number;
  spin?: number;
  z?: number;
  inner?: number;
}) {
  const texture = getPixelTexture(`speedlines:${color}:${count}:${inner}`, 256, 256, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2;
    const cy = h / 2;
    ctx.fillStyle = color;
    for (let i = 0; i < count; i += 1) {
      const angle = (i / count) * Math.PI * 2 + (i % 2) * 0.02;
      const spread = 0.006 + (i % 3) * 0.005;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * cx * inner, cy + Math.sin(angle) * cy * inner);
      ctx.lineTo(cx + Math.cos(angle - spread) * cx * 1.5, cy + Math.sin(angle - spread) * cy * 1.5);
      ctx.lineTo(cx + Math.cos(angle + spread) * cx * 1.5, cy + Math.sin(angle + spread) * cy * 1.5);
      ctx.closePath();
      ctx.fill();
    }
  });

  const ref = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.z += delta * spin;
    ref.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 6) * 0.04);
  });

  return (
    <mesh position={[0, 0, z]} ref={ref}>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial depthWrite={false} map={texture} opacity={opacity} toneMapped={false} transparent />
    </mesh>
  );
}

/** 하프톤 도트 배경. */
export function Halftone({
  color = "#ffffff",
  opacity = 0.16,
  size = 42,
  z = -1.4,
  repeat,
}: {
  color?: string;
  opacity?: number;
  size?: number;
  z?: number;
  repeat?: number;
}) {
  // 판이 커져도 화면상 도트 밀도가 유지되도록 반복 수를 크기에 비례시킨다.
  const tiles = repeat ?? Math.round(size * 1.5);
  const texture = getPixelTexture(
    `halftone:${color}`,
    8,
    8,
    (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      rect(ctx, 1, 1, 3, 3, color);
    },
    tiles,
  );

  return (
    <mesh position={[0, 0, z]}>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial depthWrite={false} map={texture} opacity={opacity} toneMapped={false} transparent />
    </mesh>
  );
}

/** 세로 그라데이션 배경. 밴딩을 넣어 도트 하늘처럼 보이게 한다. */
export function SkyBackdrop({
  from,
  to,
  size = 20,
  z = -3,
  bands = 22,
}: {
  from: string;
  to: string;
  size?: number;
  z?: number;
  bands?: number;
}) {
  const texture = getPixelTexture(`sky:${from}:${to}:${bands}`, 8, 64, (ctx, w, h) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, from);
    gradient.addColorStop(1, to);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    const step = Math.max(1, Math.floor(h / bands));
    const image = ctx.getImageData(0, 0, w, h);
    for (let y = 0; y < h; y += 1) {
      const snapped = Math.floor(y / step) * step;
      for (let x = 0; x < w; x += 1) {
        const src = (snapped * w + x) * 4;
        const dst = (y * w + x) * 4;
        image.data[dst] = image.data[src];
        image.data[dst + 1] = image.data[src + 1];
        image.data[dst + 2] = image.data[src + 2];
        image.data[dst + 3] = 255;
      }
    }
    ctx.putImageData(image, 0, 0);
  });

  return (
    <mesh position={[0, 0, z]}>
      <planeGeometry args={[size * 1.6, size]} />
      <meshBasicMaterial depthWrite={false} map={texture} toneMapped={false} />
    </mesh>
  );
}

/** 만화 효과음 스타일 텍스트. */
export function PixelShout({
  text,
  color = "#ffe45e",
  outline = "#12121b",
  position = [0, 0, 0],
  height = 0.9,
  rotation = 0,
  opacity = 1,
  wobble = 0,
}: {
  text: string;
  color?: string;
  outline?: string;
  position?: [number, number, number];
  height?: number;
  rotation?: number;
  opacity?: number;
  wobble?: number;
}) {
  const width = Math.max(96, text.length * 30);
  const texture = getPixelTexture(`shout:${text}:${color}:${outline}`, width, 56, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.font = "900 38px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineJoin = "round";
    ctx.lineWidth = 10;
    ctx.strokeStyle = outline;
    ctx.strokeText(text, w / 2, h / 2);
    ctx.fillStyle = color;
    ctx.fillText(text, w / 2, h / 2);
  });

  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current || wobble === 0) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.z = rotation + Math.sin(t * 9) * wobble;
    ref.current.scale.setScalar(1 + Math.sin(t * 12) * wobble * 0.4);
  });

  return (
    <mesh position={position} ref={ref} rotation={[0, 0, rotation]}>
      <planeGeometry args={[(height * width) / 56, height]} />
      <meshBasicMaterial
        depthWrite={false}
        map={texture}
        opacity={opacity}
        toneMapped={false}
        transparent
      />
    </mesh>
  );
}

/** 떠다니는 도트 파티클(하트/별/음표/반짝이). */
export function PixelParticles({
  count = 26,
  color = "#ffd6e7",
  shape = "heart",
  area = [7, 9] as [number, number],
  speed = 0.8,
  size = 0.24,
  z = 0.6,
  direction = 1,
}: {
  count?: number;
  color?: string;
  shape?: "heart" | "star" | "note" | "dot";
  area?: [number, number];
  speed?: number;
  size?: number;
  z?: number;
  direction?: 1 | -1;
}) {
  const texture = getPixelTexture(`particle:${shape}:${color}`, 16, 16, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    if (shape === "heart") {
      rect(ctx, 3, 4, 3, 3, color);
      rect(ctx, 9, 4, 3, 3, color);
      rect(ctx, 2, 6, 11, 3, color);
      rect(ctx, 4, 9, 7, 2, color);
      rect(ctx, 6, 11, 3, 2, color);
    } else if (shape === "star") {
      rect(ctx, 7, 2, 2, 12, color);
      rect(ctx, 2, 7, 12, 2, color);
      rect(ctx, 5, 5, 6, 6, color);
    } else if (shape === "note") {
      rect(ctx, 9, 2, 2, 9, color);
      rect(ctx, 9, 2, 5, 2, color);
      rect(ctx, 5, 9, 6, 4, color);
    } else {
      rect(ctx, 5, 5, 6, 6, color);
    }
  });

  const group = useRef<THREE.Group>(null);
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: Math.abs((Math.sin(i * 12.9898) * 43758.5453) % 1),
        y: Math.abs((Math.sin(i * 78.233) * 12345.6789) % 1),
        s: 0.6 + ((Math.sin(i * 3.71) + 1) / 2) * 0.8,
        r: Math.sin(i * 5.1) * 0.8,
      })),
    [count],
  );

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.children.forEach((child, i) => {
      const seed = seeds[i];
      const life = (t * speed * seed.s + seed.y) % 1;
      const travel = direction > 0 ? life : 1 - life;
      child.position.x = (seed.x - 0.5) * area[0] + Math.sin(t * 2 + i) * 0.25;
      child.position.y = -area[1] / 2 + travel * area[1];
      child.rotation.z = seed.r + Math.sin(t * 3 + i) * 0.3;
      const mesh = child as THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
      mesh.material.opacity = Math.sin(life * Math.PI) * 0.95;
    });
  });

  return (
    <group position={[0, 0, z]} ref={group}>
      {seeds.map((seed, i) => (
        <mesh key={i} scale={size * seed.s}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial depthWrite={false} map={texture} toneMapped={false} transparent />
        </mesh>
      ))}
    </group>
  );
}

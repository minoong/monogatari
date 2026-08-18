"use client";

import type { ReactNode } from "react";
import { useThree } from "@react-three/fiber";

/**
 * 디자인 기준 박스를 현재 뷰포트에 contain 방식으로 맞춘다.
 * 세로로 긴 모바일에서도 장면이 잘리지 않게 하는 유일한 진입점.
 */
export function StageFit({
  width,
  height,
  children,
  extra = 1,
}: {
  width: number;
  height: number;
  children: ReactNode;
  extra?: number;
}) {
  const viewport = useThree((state) => state.viewport);
  const scale = Math.min(viewport.width / width, viewport.height / height) * extra;

  return <group scale={scale}>{children}</group>;
}

/**
 * 배경처럼 화면을 가득 채워야 하는 요소용. cover 방식이라 잘려도 무방한 레이어에만 쓴다.
 * `z`만큼 뒤로 물러난 깊이에서도 화면을 덮도록 원근 보정을 넣는다.
 */
export function StageCover({
  width,
  height,
  z = 0,
  children,
}: {
  width: number;
  height: number;
  z?: number;
  children: ReactNode;
}) {
  const viewport = useThree((state) => state.viewport);
  const camera = useThree((state) => state.camera);
  const depth = Math.max(0.1, camera.position.z - z);
  const spread = depth / Math.max(0.1, camera.position.z);
  const scale = Math.max((viewport.width * spread) / width, (viewport.height * spread) / height);

  return (
    <group position={[0, 0, z]} scale={scale}>
      {children}
    </group>
  );
}

export function useStageViewport() {
  return useThree((state) => state.viewport);
}

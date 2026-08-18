"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useCutClock } from "@/components/cinematic/cinematic-clock";
import { PixelBillboard } from "@/components/cinematic/pixel-billboard";
import { StageFit } from "@/components/cinematic/stage-fit";
import { PixelCharacter } from "@/components/cinematic/sprites/pixel-character";
import { leanInPose } from "@/components/cinematic/sprites/poses";
import {
  Halftone,
  PixelParticles,
  PixelShout,
  SkyBackdrop,
  SpeedLines,
} from "@/components/cinematic/effects/comic";
import { STAGE_HEIGHT, STAGE_WIDTH, easeOutBack, seg, smooth } from "@/components/cinematic/scene-utils";

export function ToBeContinuedScene() {
  const clock = useCutClock();
  const arrow = useRef<THREE.Group>(null);
  const freeze = useRef<THREE.Group>(null);
  const sepia = useRef<THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>>(null);
  const caption = useRef<THREE.Group>(null);
  const rays = useRef<THREE.Group>(null);

  useFrame((state) => {
    const p = clock.current.progress;
    const t = state.clock.elapsedTime;

    // 정지화면처럼 살짝만 흔들린다
    const hold = smooth(seg(p, 0, 0.2));
    if (freeze.current) {
      freeze.current.scale.setScalar(1.06 - hold * 0.06);
      freeze.current.position.x = Math.sin(t * 0.7) * 0.05;
    }
    if (sepia.current) {
      sepia.current.material.opacity = 0.18 + hold * 0.2;
    }

    const slide = easeOutBack(seg(p, 0.24, 0.52));
    if (arrow.current) {
      arrow.current.visible = slide > 0.01;
      arrow.current.position.x = -8 + slide * 8;
      arrow.current.position.y = -2.4 + Math.sin(t * 1.4) * 0.06;
    }

    const cap = seg(p, 0.56, 0.78);
    if (caption.current) {
      caption.current.visible = cap > 0.02;
      caption.current.scale.setScalar(0.6 + easeOutBack(cap) * 0.5);
      caption.current.rotation.z = Math.sin(t * 3) * 0.02;
    }
    if (rays.current) {
      rays.current.visible = cap > 0.05;
    }
  });

  const pose = (elapsed: number) => leanInPose(elapsed, 0.85, 1);
  const posePartner = (elapsed: number) => leanInPose(elapsed, 0.85, -1);

  return (
    <StageFit height={STAGE_HEIGHT} width={STAGE_WIDTH}>
      <SkyBackdrop from="#3a2450" size={40} to="#d78b4a" z={-6} />
      <Halftone color="#ffe0b0" opacity={0.14} size={42} z={-5.6} />

      <group ref={rays} visible={false}>
        <SpeedLines color="#ffe45e" count={62} inner={0.2} opacity={0.24} size={34} spin={0.28} z={-5} />
      </group>

      <group position={[0, 0.4, 0]} ref={freeze}>
        <group position={[-0.95, -0.6, 1]}>
          <PixelCharacter fps={10} height={3.4} kind="minu" pose={pose} />
        </group>
        <group position={[0.95, -0.64, 1]}>
          <PixelCharacter flip fps={10} height={3.34} kind="gahyun" pose={posePartner} />
        </group>
      </group>

      <mesh position={[0, 0, 1.6]} ref={sepia}>
        <planeGeometry args={[26, 22]} />
        <meshBasicMaterial color="#c98a3d" depthWrite={false} opacity={0.2} toneMapped={false} transparent />
      </mesh>

      <group position={[0, -2.4, 2]} ref={arrow} visible={false}>
        <PixelBillboard dither={0.04} height={2.2} levels={8} resolution={132} saturation={1.1} url="/cinematic/to-be-continued.png" />
      </group>

      <group position={[0, 3, 2.2]} ref={caption} visible={false}>
        <PixelShout color="#ffd6e7" height={0.95} text="내 멍멍이 ❣ 내 가현짱" wobble={0.02} />
      </group>

      <PixelParticles
        area={[9, 12]}
        color="#ffd6e7"
        count={24}
        shape="heart"
        size={0.26}
        speed={0.6}
        z={2.4}
      />
    </StageFit>
  );
}

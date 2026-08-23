"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useCutClock } from "@/components/cinematic/cinematic-clock";
import { PhotoSlot, PixelBillboard } from "@/components/cinematic/pixel-billboard";
import { StageCover, StageFit } from "@/components/cinematic/stage-fit";
import { PixelCharacter } from "@/components/cinematic/sprites/pixel-character";
import { idlePose, leanInPose, walkPose } from "@/components/cinematic/sprites/poses";
import {
  Halftone,
  PixelParticles,
  PixelShout,
  SpeedLines,
} from "@/components/cinematic/effects/comic";
import { STAGE_HEIGHT, STAGE_WIDTH, easeOutBack, seg, smooth } from "@/components/cinematic/scene-utils";

const MIKU_W = 6.82;
const MIKU_H = 10.24;

const DATING_PHOTOS = {
  minu: "/cinematic/dating/minu.jpg",
  gahyun: "/cinematic/dating/gahyun.jpg",
} as const;

export function DatingStartScene() {
  const clock = useCutClock();
  const minu = useRef<THREE.Group>(null);
  const gahyun = useRef<THREE.Group>(null);
  const heart = useRef<THREE.Group>(null);
  const shout = useRef<THREE.Group>(null);
  const rays = useRef<THREE.Group>(null);
  const backdrop = useRef<THREE.Group>(null);
  const photoMinu = useRef<THREE.Group>(null);
  const photoGahyun = useRef<THREE.Group>(null);

  useFrame((state) => {
    const p = clock.current.progress;
    const t = state.clock.elapsedTime;

    if (backdrop.current) {
      backdrop.current.position.y = -0.25 + p * 0.5;
      backdrop.current.scale.setScalar(1.06 - p * 0.06);
    }

    const close = smooth(seg(p, 0.05, 0.55));
    if (minu.current) minu.current.position.x = -2.9 + 2.0 * close;
    if (gahyun.current) gahyun.current.position.x = 2.9 - 2.0 * close;

    const photoIn = smooth(seg(p, 0.42, 0.72));
    if (photoMinu.current) {
      photoMinu.current.position.y = 3.75 + (1 - photoIn) * 0.6;
      photoMinu.current.rotation.z = (1 - photoIn) * -0.2 + Math.sin(t * 1.4) * 0.02;
      photoMinu.current.visible = photoIn > 0.01;
    }
    if (photoGahyun.current) {
      photoGahyun.current.position.y = 3.75 + (1 - photoIn) * 0.6;
      photoGahyun.current.rotation.z = (1 - photoIn) * 0.2 + Math.sin(t * 1.4 + 0.5) * 0.02;
      photoGahyun.current.visible = photoIn > 0.01;
    }

    const bloom = seg(p, 0.55, 0.85);
    if (heart.current) {
      heart.current.visible = bloom > 0.01;
      heart.current.scale.setScalar(easeOutBack(bloom) * (1 + Math.sin(t * 5) * 0.05));
    }
    if (shout.current) {
      shout.current.visible = bloom > 0.2;
      shout.current.scale.setScalar(0.6 + easeOutBack(seg(p, 0.62, 0.8)) * 0.5);
      shout.current.rotation.z = Math.sin(t * 4) * 0.04;
    }
    if (rays.current) {
      rays.current.visible = bloom > 0.05;
    }
  });

  const pose = (offset: number) => (elapsed: number) => {
    const p = clock.current.progress;
    if (p < 0.5) return walkPose(elapsed, offset);
    if (p < 0.62) return idlePose(elapsed, offset);
    const lean = leanInPose(elapsed, smooth(seg(p, 0.62, 0.85)), offset > 0 ? -1 : 1);
    lean.hearts = true;
    return lean;
  };

  return (
    <>
      <StageCover height={MIKU_H} width={MIKU_W} z={-6}>
        <group ref={backdrop}>
          <PixelBillboard
            dither={0.08}
            gain={1.15}
            height={MIKU_H}
            levels={7}
            resolution={132}
            saturation={1.28}
            url="/cinematic/miku.png"
          />
          <mesh position={[0, 0, 0.3]}>
            <planeGeometry args={[MIKU_W * 1.6, MIKU_H * 1.6]} />
            <meshBasicMaterial color="#1a0f28" depthWrite={false} opacity={0.12} toneMapped={false} transparent />
          </mesh>
        </group>
      </StageCover>

      <StageFit height={STAGE_HEIGHT} width={STAGE_WIDTH}>
        <Halftone color="#ff9ec4" opacity={0.06} size={42} z={-5.2} />

        <mesh position={[0, -1.4, -2]}>
          <circleGeometry args={[5, 28]} />
          <meshBasicMaterial color="#170c20" depthWrite={false} opacity={0.28} toneMapped={false} transparent />
        </mesh>

        <group ref={rays} visible={false}>
          <SpeedLines color="#ffffff" count={52} inner={0.24} opacity={0.2} size={34} spin={0.32} z={-3.2} />
        </group>

        <group position={[0, -0.2, -1.2]} ref={heart} visible={false}>
          <PixelParticles
            area={[3.4, 3]}
            color="#ff5fa2"
            count={16}
            shape="heart"
            size={0.5}
            speed={0.9}
            z={0}
          />
        </group>

        <group position={[-2.9, -1.2, 1]} ref={minu}>
          <PixelCharacter fps={13} height={3.1} kind="minu-dating" pose={pose(0)} />
        </group>
        <group position={[2.9, -1.24, 1]} ref={gahyun}>
          <PixelCharacter flip fps={13} height={3.04} kind="gahyun-dating" pose={pose(0.5)} />
        </group>

        <group position={[-2.35, 3.75, 1.2]} ref={photoMinu} visible={false}>
          <PhotoSlot height={1.85} label="2025.08.31" resolution={118} url={DATING_PHOTOS.minu} />
        </group>
        <group position={[2.35, 3.75, 1.2]} ref={photoGahyun} visible={false}>
          <PhotoSlot height={1.85} label="2025.08.31" resolution={118} url={DATING_PHOTOS.gahyun} />
        </group>

        <group position={[0, 4.2, 1.6]} ref={shout} visible={false}>
          <PixelShout color="#ff5fa2" height={1.05} text="우리 1일!" wobble={0.02} />
        </group>

        <PixelParticles
          area={[8, 12]}
          color="#ffd6e7"
          count={26}
          shape="heart"
          size={0.26}
          speed={0.75}
          z={1.6}
        />
      </StageFit>
    </>
  );
}

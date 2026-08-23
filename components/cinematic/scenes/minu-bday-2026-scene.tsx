"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useCutClock } from "@/components/cinematic/cinematic-clock";
import { PhotoSlot, PixelBillboard } from "@/components/cinematic/pixel-billboard";
import { StageCover, StageFit } from "@/components/cinematic/stage-fit";
import { PixelArt, paintCake } from "@/components/cinematic/sprites/pixel-art";
import { PixelCharacter } from "@/components/cinematic/sprites/pixel-character";
import { cheerPose, doublePeacePose } from "@/components/cinematic/sprites/poses";
import {
  Halftone,
  PixelParticles,
  PixelShout,
} from "@/components/cinematic/effects/comic";
import { STAGE_HEIGHT, STAGE_WIDTH, easeOutBack, seg, smooth } from "@/components/cinematic/scene-utils";

const PHOTOS = {
  cakeBg: "/cinematic/birthday/minu-2026/01-cake.jpg",
  minu: "/cinematic/birthday/minu-2026/02-minu.jpg",
} as const;

const SHOUT_TEXT = "가현짱과 소중한 생일 추억 쌓기";

export function MinuBday2026Scene() {
  const clock = useCutClock();
  const stage = useRef<THREE.Group>(null);
  const cake = useRef<THREE.Group>(null);
  const photo = useRef<THREE.Group>(null);
  const shout = useRef<THREE.Group>(null);
  const glow = useRef<THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>>(null);

  useFrame((state) => {
    const p = clock.current.progress;
    const t = state.clock.elapsedTime;

    const enter = easeOutBack(seg(p, 0, 0.14));
    if (cake.current) {
      cake.current.position.y = -1.1 + Math.sin(t * 2.4) * 0.06;
      cake.current.scale.setScalar(0.6 + 0.4 * enter);
    }

    if (stage.current) {
      stage.current.position.y = Math.sin(t * 3.2) * 0.04;
    }

    const photoIn = smooth(seg(p, 0.22, 0.36));
    if (photo.current) {
      photo.current.visible = photoIn > 0.01;
      photo.current.position.x = 2.2 - 1.4 * photoIn;
      photo.current.position.y = 3.75 + Math.sin(t * 1.3) * 0.04;
      photo.current.rotation.z = (1 - photoIn) * 0.12 + Math.sin(t * 1.1) * 0.015;
      photo.current.scale.setScalar(0.78 + photoIn * 0.22);
    }

    const shoutIn = smooth(seg(p, 0.48, 0.64));
    if (shout.current) {
      shout.current.visible = shoutIn > 0.02;
      shout.current.scale.setScalar(0.55 + easeOutBack(shoutIn) * 0.45);
      shout.current.position.y = 4.15 + Math.sin(t * 5) * 0.08;
    }

    if (glow.current) {
      glow.current.material.opacity = 0.14 + Math.sin(t * 5) * 0.05 + shoutIn * 0.15;
    }
  });

  return (
    <>
      <StageCover height={6.2} width={8.8} z={-6}>
        <group position={[0.2, -0.12, 0]} scale={0.88}>
          <PixelBillboard dither={0.05} gain={1.04} height={5.2} levels={8} resolution={130} url={PHOTOS.cakeBg} />
        </group>
      </StageCover>

      <StageFit height={STAGE_HEIGHT} width={STAGE_WIDTH}>
        <Halftone color="#ffd6e7" opacity={0.08} size={42} z={-4} />

        {Array.from({ length: 9 }).map((_, i) => (
          <mesh key={i} position={[-3.6 + i * 0.9, 4.5 - Math.abs(i - 4) * 0.16, -3]} rotation={[0, 0, 0.5]}>
            <planeGeometry args={[0.34, 0.5]} />
            <meshBasicMaterial
              color={["#ff6f9c", "#ffd75e", "#f4b8c8", "#5fd0ff"][i % 4]}
              toneMapped={false}
            />
          </mesh>
        ))}

        <mesh position={[0, -1.2, -2.4]} ref={glow}>
          <circleGeometry args={[3.4, 24]} />
          <meshBasicMaterial
            blending={THREE.AdditiveBlending}
            color="#ffb347"
            depthWrite={false}
            opacity={0.2}
            toneMapped={false}
            transparent
          />
        </mesh>

        <mesh position={[0, -2.5, -1]}>
          <planeGeometry args={[9, 1.6]} />
          <meshBasicMaterial color="#3a2740" depthWrite={false} opacity={0.35} toneMapped={false} transparent />
        </mesh>

        <group position={[0, -1.1, 1.25]} ref={cake}>
          <PixelArt height={48} cacheKey="cake" paint={paintCake} size={1.35} width={48} />
        </group>

        <group position={[2.2, 3.75, 1.35]} ref={photo} visible={false}>
          <PhotoSlot height={1.55} label="2026.05.27" resolution={110} url={PHOTOS.minu} />
        </group>

        <group ref={stage}>
          <group position={[-0.2, -1.0, 1.05]}>
            <PixelCharacter fps={16} height={3.1} kind="minu-bday-2026" pose={(e) => doublePeacePose(e)} />
          </group>
          <group position={[1.35, -1.02, 1]}>
            <PixelCharacter flip fps={12} height={2.9} kind="gahyun-dating" pose={(e) => cheerPose(e, 0.6)} />
          </group>
        </group>

        <group position={[0, 4.15, 1.6]} ref={shout} visible={false}>
          <PixelShout color="#f4b8c8" height={0.88} text={SHOUT_TEXT} wobble={0.02} />
        </group>

        <PixelParticles area={[8, 12]} color="#ffd6e7" count={20} shape="heart" size={0.24} speed={0.9} z={1.6} />
        <PixelParticles area={[8, 12]} color="#ffe45e" count={16} direction={-1} shape="star" size={0.2} speed={0.7} z={1.7} />
      </StageFit>
    </>
  );
}

"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useCutClock } from "@/components/cinematic/cinematic-clock";
import { PhotoSlot } from "@/components/cinematic/pixel-billboard";
import { StageFit } from "@/components/cinematic/stage-fit";
import { PixelArt, paintCloud, paintSuitcase } from "@/components/cinematic/sprites/pixel-art";
import { PixelCharacter } from "@/components/cinematic/sprites/pixel-character";
import { walkPose } from "@/components/cinematic/sprites/poses";
import {
  Halftone,
  PixelParticles,
  PixelShout,
  SkyBackdrop,
} from "@/components/cinematic/effects/comic";
import { STAGE_HEIGHT, STAGE_WIDTH, easeOutBack, seg, smooth } from "@/components/cinematic/scene-utils";

const PHOTO_COUNT = 28;
const GRID_COLS = 7;

const MONTAGE_PHOTOS = Array.from({ length: PHOTO_COUNT }, (_, i) => {
  const col = i % GRID_COLS;
  const row = Math.floor(i / GRID_COLS);
  const num = String(i + 1).padStart(2, "0");
  return {
    url: `/cinematic/adventure/${num}.jpg`,
    label: `모험 ${num}`,
    x: -3.12 + col * 1.04,
    y: 3.9 - row * 1.02,
    tilt: ((i % 3) - 1) * 0.06,
    appear: 0.03 + i * 0.018,
  };
});

export function AdventureScene() {
  const clock = useCutClock();
  const cards = useRef<Array<THREE.Group | null>>([]);
  const runners = useRef<THREE.Group>(null);
  const ground = useRef<THREE.Group>(null);
  const clouds = useRef<THREE.Group>(null);
  const shout = useRef<THREE.Group>(null);

  useFrame((state) => {
    const p = clock.current.progress;
    const t = state.clock.elapsedTime;

    cards.current.forEach((card, i) => {
      if (!card) return;
      const slot = MONTAGE_PHOTOS[i];
      const enter = smooth(seg(p, slot.appear, slot.appear + 0.07));
      card.visible = enter > 0.01;
      const dir = i % 2 === 0 ? -1 : 1;
      card.position.x = slot.x + dir * 3.2 * (1 - enter);
      card.position.y = slot.y + Math.sin(t * 1.3 + i) * 0.04;
      card.rotation.z = slot.tilt * enter + Math.sin(t * 1.1 + i) * 0.012;
      card.scale.setScalar(0.76 + enter * 0.24);
    });

    if (runners.current) {
      runners.current.position.x = Math.sin(t * 0.8) * 0.5;
      runners.current.position.y = -4.2 + Math.abs(Math.sin(t * 6)) * 0.12;
    }

    if (ground.current) {
      ground.current.children.forEach((tile, i) => {
        tile.position.x = (((t * 2.4 + i * 2.2) % 13) - 6.5) * -1;
      });
    }

    if (clouds.current) {
      clouds.current.children.forEach((cloud, i) => {
        cloud.position.x = ((t * (0.5 + i * 0.25) + i * 4) % 14) - 7;
      });
    }

    const shoutIn = smooth(seg(p, 0.72, 0.86));
    if (shout.current) {
      shout.current.visible = shoutIn > 0.02;
      shout.current.scale.setScalar(0.58 + easeOutBack(shoutIn) * 0.42);
      shout.current.rotation.z = Math.sin(t * 5) * 0.05;
    }
  });

  return (
    <StageFit height={STAGE_HEIGHT} width={STAGE_WIDTH}>
      <SkyBackdrop from="#2f6df0" to="#9fe3ff" size={40} z={-6} />
      <Halftone color="#ffffff" opacity={0.08} size={42} z={-5.6} />

      <group position={[0, 3.4, -5]} ref={clouds}>
        <PixelArt height={24} opacity={0.9} cacheKey="cloud" paint={paintCloud} position={[0, 0.6, 0]} size={1.1} width={40} />
        <PixelArt height={24} opacity={0.7} cacheKey="cloud" paint={paintCloud} position={[0, 2, 0]} size={0.8} width={40} />
        <PixelArt height={24} opacity={0.55} cacheKey="cloud" paint={paintCloud} position={[0, -0.9, 0]} size={1.4} width={40} />
      </group>

      {MONTAGE_PHOTOS.map((slot, i) => (
        <group
          key={slot.url}
          position={[slot.x, slot.y, 1.3]}
          ref={(node) => {
            cards.current[i] = node;
          }}
          visible={false}
        >
          <PhotoSlot height={0.92} label={slot.label} resolution={92} url={slot.url} />
        </group>
      ))}

      <mesh position={[0, -5.2, -2]}>
        <planeGeometry args={[20, 3.6]} />
        <meshBasicMaterial color="#2b7a4b" toneMapped={false} />
      </mesh>
      <group position={[0, -3.5, -1.8]} ref={ground}>
        {Array.from({ length: 7 }).map((_, i) => (
          <mesh key={i} position={[i * 2 - 6, 0, 0]}>
            <planeGeometry args={[1.1, 0.16]} />
            <meshBasicMaterial color="#e8f7ee" toneMapped={false} />
          </mesh>
        ))}
      </group>

      <group ref={runners}>
        <group position={[-1, 0, 0]}>
          <PixelCharacter fps={16} height={2.6} kind="minu" pose={(e) => walkPose(e * 1.6, 0, true)} />
        </group>
        <group position={[0.95, -0.02, 0.1]}>
          <PixelCharacter fps={16} height={2.55} kind="gahyun" pose={(e) => walkPose(e * 1.6, 0.3, true)} />
        </group>
        <PixelArt height={40} cacheKey="suitcase" paint={paintSuitcase} position={[1.9, -0.6, 0.2]} size={0.9} width={40} />
      </group>

      <group position={[0, -1.9, 1.6]} ref={shout} visible={false}>
        <PixelShout color="#ffe45e" height={0.9} text="계속 모험 중!" wobble={0.02} />
      </group>

      <PixelParticles area={[8, 12]} color="#ffffff" count={18} shape="star" size={0.2} speed={1.2} z={1.6} />
    </StageFit>
  );
}

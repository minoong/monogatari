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
import { STAGE_HEIGHT, STAGE_WIDTH, seg, smooth } from "@/components/cinematic/scene-utils";

const SLOTS = [
  { url: "/cinematic/adventure/01.jpg", label: "모험 01", x: -2.05, y: 2.4, tilt: 0.14 },
  { url: "/cinematic/adventure/02.jpg", label: "모험 02", x: 2.05, y: 1.1, tilt: -0.12 },
  { url: "/cinematic/adventure/03.jpg", label: "모험 03", x: -1.5, y: -0.6, tilt: -0.08 },
];

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
      const from = 0.08 + i * 0.16;
      const enter = smooth(seg(p, from, from + 0.22));
      card.visible = enter > 0.01;
      const dir = i % 2 === 0 ? -1 : 1;
      card.position.x = SLOTS[i].x + dir * 6 * (1 - enter);
      card.position.y = SLOTS[i].y + Math.sin(t * 1.4 + i) * 0.09;
      card.rotation.z = SLOTS[i].tilt * enter + Math.sin(t * 1.1 + i) * 0.02;
      card.scale.setScalar(0.8 + enter * 0.2);
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

    if (shout.current) {
      const show = seg(p, 0.68, 0.86);
      shout.current.visible = show > 0.02;
      shout.current.scale.setScalar(0.7 + show * 0.4);
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

      {SLOTS.map((slot, i) => (
        <group
          key={slot.url}
          ref={(node) => {
            cards.current[i] = node;
          }}
          visible={false}
        >
          <PhotoSlot height={3} label={slot.label} resolution={132} url={slot.url} />
        </group>
      ))}

      {/* 달리는 길 */}
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

      <PixelParticles
        area={[8, 12]}
        color="#ffffff"
        count={18}
        shape="star"
        size={0.2}
        speed={1.2}
        z={1.6}
      />
    </StageFit>
  );
}

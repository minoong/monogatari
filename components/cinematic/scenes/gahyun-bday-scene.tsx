"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useCutClock } from "@/components/cinematic/cinematic-clock";
import { PhotoSlot, PixelBillboard } from "@/components/cinematic/pixel-billboard";
import { StageCover, StageFit } from "@/components/cinematic/stage-fit";
import { PixelArt, paintCake } from "@/components/cinematic/sprites/pixel-art";
import { PixelCharacter } from "@/components/cinematic/sprites/pixel-character";
import { happyDancePose } from "@/components/cinematic/sprites/poses";
import {
  Halftone,
  PixelParticles,
  PixelShout,
} from "@/components/cinematic/effects/comic";
import { STAGE_HEIGHT, STAGE_WIDTH, easeOutBack, seg, smooth } from "@/components/cinematic/scene-utils";

const PHOTOS = {
  hotelBg: "/cinematic/birthday/gahyun-2025/01-hotel-bg.jpg",
  reservation: "/cinematic/birthday/gahyun-2025/02-reservation.jpg",
  cake: "/cinematic/birthday/gahyun-2025/03-cake.jpg",
  lamb: "/cinematic/birthday/gahyun-2025/04-lamb.jpg",
  tteokbokki: "/cinematic/birthday/gahyun-2025/05-tteokbokki.jpg",
} as const;

const MONTAGE_PHOTOS = [
  { url: PHOTOS.reservation, label: "양인환대", x: 2.45, y: 3.85, tilt: -0.08, appear: 0.05 },
  { url: PHOTOS.cake, label: "생일 케이크", x: 0.35, y: 3.75, tilt: -0.06, appear: 0.12 },
  { url: PHOTOS.lamb, label: "양고기", x: -1.85, y: 2.5, tilt: 0.08, appear: 0.19 },
  { url: PHOTOS.tteokbokki, label: "치즈 닭강정", x: 1.85, y: 2.5, tilt: -0.05, appear: 0.26 },
] as const;

export function GahyunBdayScene() {
  const clock = useCutClock();
  const stage = useRef<THREE.Group>(null);
  const cake = useRef<THREE.Group>(null);
  const montagePhotos = useRef<Array<THREE.Group | null>>([]);
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

    montagePhotos.current.forEach((card, i) => {
      if (!card) return;
      const slot = MONTAGE_PHOTOS[i];
      const appear = smooth(seg(p, slot.appear, slot.appear + 0.09));
      card.visible = appear > 0.01;
      const dir = i % 2 === 0 ? -1 : 1;
      card.position.x = slot.x + dir * 3.5 * (1 - appear);
      card.position.y = slot.y + Math.sin(t * 1.3 + i) * 0.05;
      card.rotation.z = slot.tilt * appear + Math.sin(t * 1.1 + i) * 0.015;
      card.scale.setScalar(0.78 + appear * 0.22);
    });

    const shoutIn = smooth(seg(p, 0.52, 0.68));
    if (shout.current) {
      shout.current.visible = shoutIn > 0.02;
      shout.current.scale.setScalar(0.55 + easeOutBack(shoutIn) * 0.45);
      shout.current.position.y = 4.2 + Math.sin(t * 5) * 0.08;
    }

    if (glow.current) {
      glow.current.material.opacity = 0.14 + Math.sin(t * 5) * 0.05 + shoutIn * 0.15;
    }
  });

  return (
    <>
      <StageCover height={6.2} width={8.8} z={-6}>
        <group position={[0.35, -0.18, 0]} scale={0.86}>
          <PixelBillboard dither={0.05} gain={1.04} height={5.2} levels={8} resolution={130} url={PHOTOS.hotelBg} />
        </group>
      </StageCover>

      <StageFit height={STAGE_HEIGHT} width={STAGE_WIDTH}>
        <Halftone color="#ffd6e7" opacity={0.08} size={42} z={-4} />

        {Array.from({ length: 9 }).map((_, i) => (
          <mesh key={i} position={[-3.6 + i * 0.9, 4.5 - Math.abs(i - 4) * 0.16, -3]} rotation={[0, 0, 0.5]}>
            <planeGeometry args={[0.34, 0.5]} />
            <meshBasicMaterial
              color={["#ff6f9c", "#ffd75e", "#8affc1", "#5fd0ff"][i % 4]}
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

        {MONTAGE_PHOTOS.map((slot, i) => (
          <group
            key={slot.url}
            position={[slot.x, slot.y, 1.35]}
            ref={(node) => {
              montagePhotos.current[i] = node;
            }}
            visible={false}
          >
            <PhotoSlot height={1.35} label={slot.label} resolution={104} url={slot.url} />
          </group>
        ))}

        <group ref={stage}>
          <group position={[-1.35, -1.0, 1.05]}>
            <PixelCharacter fps={16} height={3.05} kind="gahyun-bday" pose={(e) => happyDancePose(e)} />
          </group>
          <group position={[1.35, -1.0, 1.05]}>
            <PixelCharacter flip fps={16} height={3} kind="minu-bday" pose={(e) => happyDancePose(e, 0.5)} />
          </group>
        </group>

        <group position={[0, 4.2, 1.6]} ref={shout} visible={false}>
          <PixelShout color="#ffe45e" height={0.95} text="생일 축하해!" wobble={0.03} />
        </group>

        <PixelParticles area={[8, 12]} color="#ffd6e7" count={20} shape="heart" size={0.24} speed={0.9} z={1.6} />
        <PixelParticles area={[8, 12]} color="#ffe45e" count={16} direction={-1} shape="star" size={0.2} speed={0.7} z={1.7} />
      </StageFit>
    </>
  );
}

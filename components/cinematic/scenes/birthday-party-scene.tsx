"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useCutClock } from "@/components/cinematic/cinematic-clock";
import { PhotoSlot } from "@/components/cinematic/pixel-billboard";
import { StageFit } from "@/components/cinematic/stage-fit";
import { PixelArt, paintCake } from "@/components/cinematic/sprites/pixel-art";
import { PixelCharacter, type CharacterKind } from "@/components/cinematic/sprites/pixel-character";
import { cheerPose } from "@/components/cinematic/sprites/poses";
import {
  Halftone,
  PixelParticles,
  PixelShout,
  SkyBackdrop,
  SpeedLines,
} from "@/components/cinematic/effects/comic";
import { STAGE_HEIGHT, STAGE_WIDTH, easeOutBack, seg, smooth } from "@/components/cinematic/scene-utils";

export function BirthdayPartyScene({
  honoree,
  photoUrl,
  label,
}: {
  honoree: CharacterKind;
  photoUrl: string;
  label: string;
}) {
  const clock = useCutClock();
  const stage = useRef<THREE.Group>(null);
  const cake = useRef<THREE.Group>(null);
  const photo = useRef<THREE.Group>(null);
  const shout = useRef<THREE.Group>(null);
  const glow = useRef<THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>>(null);

  useFrame((state) => {
    const p = clock.current.progress;
    const t = state.clock.elapsedTime;

    const enter = easeOutBack(seg(p, 0, 0.18));
    if (cake.current) {
      cake.current.position.y = -1.4 + Math.sin(t * 2.4) * 0.08;
      cake.current.scale.setScalar(0.6 + 0.4 * enter);
    }

    const photoIn = smooth(seg(p, 0.2, 0.45));
    if (photo.current) {
      photo.current.position.x = 5 - 2.6 * photoIn;
      photo.current.rotation.z = (1 - photoIn) * 0.45 + Math.sin(t * 1.6) * 0.03;
      photo.current.visible = photoIn > 0.01;
    }

    const blow = seg(p, 0.55, 0.72);
    if (shout.current) {
      shout.current.visible = blow > 0.02;
      shout.current.scale.setScalar(0.5 + easeOutBack(blow) * 0.6);
      shout.current.position.y = 3.1 + Math.sin(t * 6) * 0.1;
    }

    if (glow.current) {
      glow.current.material.opacity = 0.16 + Math.sin(t * 5) * 0.05 + blow * 0.2;
    }

    if (stage.current) {
      stage.current.position.y = Math.sin(t * 3.2) * 0.05;
    }
  });

  const partner: CharacterKind = honoree === "minu" ? "gahyun" : "minu";

  return (
    <StageFit height={STAGE_HEIGHT} width={STAGE_WIDTH}>
      <SkyBackdrop from="#2a1836" to="#6d3355" size={40} z={-6} />
      <Halftone color="#ffd6e7" opacity={0.1} size={42} z={-5.6} />
      <SpeedLines color="#ffd75e" count={40} inner={0.3} opacity={0.14} size={34} spin={0.14} z={-5.2} />

      <group ref={stage}>
        {/* 가랜드 */}
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

        {/* 테이블 */}
        <mesh position={[0, -2.5, -1]}>
          <planeGeometry args={[9, 1.6]} />
          <meshBasicMaterial color="#3a2740" toneMapped={false} />
        </mesh>

        <group position={[0, -1.4, 0]} ref={cake}>
          <PixelArt height={48} cacheKey="cake" paint={paintCake} size={1.5} width={48} />
        </group>

        <group position={[-2.1, 0.5, 0.6]}>
          <PixelCharacter fps={16} height={3.1} kind={honoree} pose={(e) => cheerPose(e)} />
        </group>
        <group position={[2.1, 0.42, 0.5]}>
          <PixelCharacter flip fps={12} height={3} kind={partner} pose={(e) => cheerPose(e, 0.6)} />
        </group>

        {/* 사진과 효과음은 인물 머리 위 영역에만 둔다 */}
        <group position={[2.4, 4.7, 1]} ref={photo} visible={false}>
          <PhotoSlot height={2.3} label={label} resolution={128} url={photoUrl} />
        </group>

        <group position={[-1.2, 3.1, 1.4]} ref={shout} visible={false}>
          <PixelShout color="#ffe45e" height={1} text="생일 축하해!" wobble={0.03} />
        </group>

        <PixelParticles
          area={[8, 12]}
          color="#ffd6e7"
          count={20}
          shape="heart"
          size={0.24}
          speed={0.9}
          z={1.6}
        />
        <PixelParticles
          area={[8, 12]}
          color="#ffe45e"
          count={16}
          direction={-1}
          shape="star"
          size={0.2}
          speed={0.7}
          z={1.7}
        />
      </group>
    </StageFit>
  );
}

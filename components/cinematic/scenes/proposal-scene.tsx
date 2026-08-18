"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useCutClock } from "@/components/cinematic/cinematic-clock";
import { StageFit } from "@/components/cinematic/stage-fit";
import { PixelArt, paintIsland, paintRing } from "@/components/cinematic/sprites/pixel-art";
import { PixelCharacter } from "@/components/cinematic/sprites/pixel-character";
import {
  idlePose,
  kneelPose,
  leanInPose,
  surprisedPose,
} from "@/components/cinematic/sprites/poses";
import {
  Halftone,
  PixelParticles,
  SkyBackdrop,
  SpeedLines,
} from "@/components/cinematic/effects/comic";
import { STAGE_HEIGHT, STAGE_WIDTH, easeOutBack, seg, smooth } from "@/components/cinematic/scene-utils";

const SEA_Y = -3.4;

export function ProposalScene() {
  const clock = useCutClock();
  const stage = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Group>(null);
  const burst = useRef<THREE.Group>(null);
  const rays = useRef<THREE.Group>(null);
  const waves = useRef<THREE.Group>(null);
  const minu = useRef<THREE.Group>(null);
  const gahyun = useRef<THREE.Group>(null);
  const sun = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const p = clock.current.progress;
    const t = state.clock.elapsedTime;

    const zoom = smooth(seg(p, 0, 0.3));
    if (stage.current) {
      stage.current.scale.setScalar(0.92 + zoom * 0.16);
      stage.current.position.y = -0.5 * zoom;
    }

    const ringIn = seg(p, 0.32, 0.5);
    if (ring.current) {
      ring.current.visible = ringIn > 0.01;
      ring.current.position.y = -0.4 + easeOutBack(ringIn) * 1.1;
      ring.current.rotation.z = Math.sin(t * 3) * 0.16;
      ring.current.scale.setScalar(0.4 + easeOutBack(ringIn) * 0.8 + Math.sin(t * 6) * 0.03);
    }

    const say = seg(p, 0.6, 0.76);
    if (rays.current) {
      rays.current.visible = say > 0.05;
    }

    const kiss = smooth(seg(p, 0.78, 0.94));
    if (minu.current) {
      minu.current.position.x = -1.5 + 0.62 * kiss;
    }
    if (gahyun.current) {
      gahyun.current.position.x = 1.5 - 0.62 * kiss;
    }
    if (burst.current) {
      burst.current.visible = kiss > 0.4;
      burst.current.scale.setScalar(0.5 + kiss * 0.8);
    }

    if (waves.current) {
      waves.current.children.forEach((wave, i) => {
        wave.position.x = Math.sin(t * (0.6 + i * 0.18) + i) * 0.7;
        wave.position.y = SEA_Y - 0.4 - i * 0.62 + Math.sin(t * 1.6 + i) * 0.05;
      });
    }

    if (sun.current) {
      sun.current.position.y = SEA_Y + 1.5 + Math.sin(t * 0.6) * 0.06;
    }
  });

  const minuPose = (elapsed: number) => {
    const p = clock.current.progress;
    if (p < 0.15) return idlePose(elapsed);
    if (p < 0.78) return kneelPose(elapsed, smooth(seg(p, 0.15, 0.3)));
    return leanInPose(elapsed, smooth(seg(p, 0.78, 0.94)), 1);
  };

  const gahyunPose = (elapsed: number) => {
    const p = clock.current.progress;
    if (p < 0.34) return idlePose(elapsed, 0.7);
    if (p < 0.78) return surprisedPose(elapsed);
    return leanInPose(elapsed, smooth(seg(p, 0.78, 0.94)), -1);
  };

  return (
    <StageFit height={STAGE_HEIGHT} width={STAGE_WIDTH}>
      <SkyBackdrop from="#2b1b5e" size={40} to="#ffb36b" z={-6} />
      <Halftone color="#ffd6a8" opacity={0.09} size={42} z={-5.6} />

      <group ref={stage}>
        <mesh position={[0, SEA_Y + 1.5, -5.2]} ref={sun}>
          <circleGeometry args={[1.5, 22]} />
          <meshBasicMaterial color="#fff0c2" toneMapped={false} />
        </mesh>

        <PixelArt height={48} cacheKey="island" paint={paintIsland} position={[-2.4, SEA_Y + 0.9, -4.6]} size={2} width={96} />
        <PixelArt height={48} opacity={0.8} cacheKey="island" paint={paintIsland} position={[3, SEA_Y + 0.7, -4.8]} size={1.5} width={96} />

        {/* 바다 */}
        <mesh position={[0, SEA_Y - 3, -4]}>
          <planeGeometry args={[22, 6]} />
          <meshBasicMaterial color="#1d3b6e" toneMapped={false} />
        </mesh>
        <group ref={waves}>
          {Array.from({ length: 5 }).map((_, i) => (
            <mesh key={i} position={[0, SEA_Y - 0.4 - i * 0.62, -3.8]}>
              <planeGeometry args={[16 - i * 1.4, 0.12]} />
              <meshBasicMaterial color={i % 2 === 0 ? "#ffc98a" : "#5f8fd0"} toneMapped={false} />
            </mesh>
          ))}
        </group>

        {/* 해변 */}
        <mesh position={[0, -6.4, -2]}>
          <planeGeometry args={[22, 3.6]} />
          <meshBasicMaterial color="#5d4a54" toneMapped={false} />
        </mesh>
        <mesh position={[0, -4.64, -1.9]}>
          <planeGeometry args={[22, 0.18]} />
          <meshBasicMaterial color="#9c7f7f" toneMapped={false} />
        </mesh>

        <group ref={rays} visible={false}>
          <SpeedLines color="#ffe9b0" count={58} inner={0.2} opacity={0.28} size={34} spin={0.4} z={-3} />
        </group>

        <group position={[-1.5, -2.9, 1]} ref={minu}>
          <PixelCharacter fps={14} height={3.2} kind="minu" pose={minuPose} />
        </group>
        <group position={[1.5, -2.86, 1]} ref={gahyun}>
          <PixelCharacter flip fps={14} height={3.14} kind="gahyun" pose={gahyunPose} />
        </group>

        <group position={[0, -0.4, 1.4]} ref={ring} visible={false}>
          <PixelArt height={32} cacheKey="ring" paint={paintRing} size={1.1} width={32} />
          <PixelParticles
            area={[1.6, 1.6]}
            color="#fff6c9"
            count={8}
            shape="star"
            size={0.2}
            speed={1.6}
            z={0.2}
          />
        </group>

        {/* 하트는 인물 뒤로 보내 얼굴을 가리지 않게 한다 */}
        <group position={[0, -2.6, -1.2]} ref={burst} visible={false}>
          <PixelParticles
            area={[4.4, 4.2]}
            color="#ff5fa2"
            count={18}
            shape="heart"
            size={0.42}
            speed={1.4}
            z={0}
          />
        </group>

        <PixelParticles
          area={[9, 12]}
          color="#ffd6e7"
          count={20}
          shape="heart"
          size={0.22}
          speed={0.62}
          z={2}
        />
      </group>
    </StageFit>
  );
}

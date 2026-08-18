"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useCutClock } from "@/components/cinematic/cinematic-clock";
import { StageFit } from "@/components/cinematic/stage-fit";
import { PixelCharacter } from "@/components/cinematic/sprites/pixel-character";
import { BEAT, cheerPose, wotageiPose } from "@/components/cinematic/sprites/poses";
import {
  Halftone,
  PixelParticles,
  PixelShout,
  SpeedLines,
} from "@/components/cinematic/effects/comic";
import { STAGE_HEIGHT, STAGE_WIDTH, easeOutBack, seg, smooth } from "@/components/cinematic/scene-utils";

const CALLS = ["타-이-가-!", "화이야!", "사이바-!", "화이바-!", "쟝쟝!", "히-야-!"];
const STROBE = ["#ff2f6d", "#5b8cff", "#ffd24a", "#2fe0a8", "#c46bff", "#ff7a3d"];
const BEAM_COLORS = ["#ff5fa2", "#5fd0ff", "#ffe45e", "#8affc1"];

export function WotageiScene() {
  const clock = useCutClock();
  const stage = useRef<THREE.Group>(null);
  const backdrop = useRef<THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>>(null);
  const beams = useRef<THREE.Group>(null);
  const shouts = useRef<Array<THREE.Group | null>>([]);
  const duo = useRef<THREE.Group>(null);
  const flash = useRef<THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>>(null);
  const lines = useRef<THREE.Group>(null);

  useFrame((state) => {
    const p = clock.current.progress;
    const local = clock.current.localTime;
    const t = state.clock.elapsedTime;
    const beat = local / BEAT;
    const beatPhase = beat % 1;
    const hit = Math.max(0, 1 - beatPhase * 3);

    // 등장: 아래에서 튀어오르며 프레임 인
    const enter = easeOutBack(seg(p, 0, 0.12));
    const exit = smooth(seg(p, 0.94, 1));
    if (duo.current) {
      duo.current.position.y = -3.4 + 3.4 * enter;
      duo.current.scale.setScalar(0.9 + 0.1 * enter);
    }

    // 비트마다 카메라가 튄다
    if (stage.current) {
      stage.current.position.y = hit * 0.16;
      stage.current.rotation.z = Math.sin(beat * Math.PI) * 0.012;
      stage.current.scale.setScalar((1 + hit * 0.035) * (1 - exit * 0.12));
    }

    // 스트로브 배경
    if (backdrop.current) {
      const index = Math.floor(beat / 2) % STROBE.length;
      backdrop.current.material.color.set(STROBE[index]);
      backdrop.current.material.opacity = 0.18 + hit * 0.22;
    }

    if (beams.current) {
      beams.current.children.forEach((beam, i) => {
        beam.rotation.z = Math.sin(t * 1.3 + i * 1.7) * 0.5 + (i - 1.5) * 0.25;
        const mesh = beam as THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
        mesh.material.opacity = 0.12 + Math.abs(Math.sin(t * 2.2 + i)) * 0.2 + hit * 0.12;
      });
    }

    if (lines.current) {
      lines.current.scale.setScalar(1 + hit * 0.12);
      lines.current.visible = p > 0.14;
    }

    const callIndex = Math.floor(beat / 4) % CALLS.length;
    shouts.current.forEach((group, i) => {
      if (!group) return;
      group.visible = p > 0.14 && p < 0.95 && i === callIndex;
      if (group.visible) {
        group.position.x = i % 2 === 0 ? -1.5 : 1.5;
        group.position.y = 3.1 + Math.sin(beat * Math.PI * 2) * 0.18;
        group.scale.setScalar(0.86 + hit * 0.3);
        group.rotation.z = (i % 2 === 0 ? 1 : -1) * 0.14;
      }
    });

    if (flash.current) {
      flash.current.material.opacity = Math.max(0, hit - 0.72) * 0.9;
    }
  });

  const minuPose = (elapsed: number) => (elapsed < 0.2 ? cheerPose(elapsed) : wotageiPose(elapsed));
  const gahyunPose = (elapsed: number) => (elapsed < 0.2 ? cheerPose(elapsed) : wotageiPose(elapsed));

  return (
    <StageFit height={STAGE_HEIGHT} width={STAGE_WIDTH}>
      <group ref={stage}>
        {/* 어두운 라이브 하우스 */}
        <mesh position={[0, 0, -6]}>
          <planeGeometry args={[64, 42]} />
          <meshBasicMaterial color="#0a0713" toneMapped={false} />
        </mesh>
        <mesh position={[0, 0, -5.8]} ref={backdrop}>
          <planeGeometry args={[64, 42]} />
          <meshBasicMaterial color="#ff2f6d" depthWrite={false} opacity={0.2} toneMapped={false} transparent />
        </mesh>

        {/* 스포트라이트 빔 */}
        <group position={[0, 5.4, -5]} ref={beams}>
          {BEAM_COLORS.map((color, i) => (
            <mesh key={color} position={[(i - 1.5) * 1.7, -4, 0]}>
              <planeGeometry args={[1.5, 12]} />
              <meshBasicMaterial
                blending={THREE.AdditiveBlending}
                color={color}
                depthWrite={false}
                opacity={0.2}
                toneMapped={false}
                transparent
              />
            </mesh>
          ))}
        </group>

        <Halftone color="#ffffff" opacity={0.1} size={42} z={-4.6} />

        <group ref={lines}>
          <SpeedLines color="#ffffff" count={64} inner={0.24} opacity={0.24} size={34} spin={0.6} z={-3.4} />
        </group>

        {/* 무대 바닥 */}
        <mesh position={[0, -8.6, -1]}>
          <planeGeometry args={[44, 12]} />
          <meshBasicMaterial color="#141024" toneMapped={false} />
        </mesh>
        <mesh position={[0, -2.66, -0.9]}>
          <planeGeometry args={[20, 0.14]} />
          <meshBasicMaterial color="#4b3f74" toneMapped={false} />
        </mesh>

        <group position={[0, -0.6, 0.5]} ref={duo}>
          <group position={[-1.15, 0, 0]}>
            <PixelCharacter fps={18} height={3.5} kind="minu" pose={minuPose} />
          </group>
          <group position={[1.15, 0, 0]}>
            <PixelCharacter flip fps={18} height={3.42} kind="gahyun" pose={gahyunPose} />
          </group>
          {/* 발밑 반사광 */}
          <mesh position={[0, -1.82, -0.2]}>
            <planeGeometry args={[4.4, 0.5]} />
            <meshBasicMaterial
              blending={THREE.AdditiveBlending}
              color="#ff5fa2"
              depthWrite={false}
              opacity={0.35}
              toneMapped={false}
              transparent
            />
          </mesh>
        </group>

        <PixelParticles
          area={[8, 12]}
          color="#ffe45e"
          count={22}
          shape="star"
          size={0.26}
          speed={1.1}
          z={1.4}
        />
        <PixelParticles
          area={[8, 12]}
          color="#8affc1"
          count={14}
          shape="note"
          size={0.24}
          speed={0.8}
          z={1.5}
        />

        {CALLS.map((call, i) => (
          <group
            key={call}
            ref={(node) => {
              shouts.current[i] = node;
            }}
            visible={false}
          >
            <PixelShout color={STROBE[i % STROBE.length]} height={1} text={call} />
          </group>
        ))}

        <mesh position={[0, 0, 3]} ref={flash}>
          <planeGeometry args={[30, 30]} />
          <meshBasicMaterial color="#ffffff" depthWrite={false} opacity={0} toneMapped={false} transparent />
        </mesh>
      </group>
    </StageFit>
  );
}

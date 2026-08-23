"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useCutClock } from "@/components/cinematic/cinematic-clock";
import { PhotoSlot } from "@/components/cinematic/pixel-billboard";
import { StageFit } from "@/components/cinematic/stage-fit";
import { PixelCharacter } from "@/components/cinematic/sprites/pixel-character";
import { BEAT, heartHandsPose, walkPose, wotageiPose } from "@/components/cinematic/sprites/poses";
import {
  Halftone,
  PixelParticles,
  PixelShout,
  SpeedLines,
} from "@/components/cinematic/effects/comic";
import { STAGE_HEIGHT, STAGE_WIDTH, easeOutBack, seg, smooth } from "@/components/cinematic/scene-utils";

const PHOTO_URL = "/cinematic/wotagei/photo.jpg";
const CALLS = ["타-이-가-!", "화이야!", "사이바-!", "화이바-!", "쟝쟝!", "히-야-!"];
const STROBE = ["#ff2f6d", "#5b8cff", "#ffd24a", "#2fe0a8", "#c46bff", "#ff7a3d"];
const BEAM_COLORS = ["#ff5fa2", "#5fd0ff", "#ffe45e", "#8affc1"];

const WALK_END = 0.16;
const PHOTO_END = 0.42;
const DANCE_START = 0.44;

function phaseAlpha(progress: number, start: number, end: number, fade = 0.04) {
  const inStart = smooth(seg(progress, start, start + fade));
  const outEnd = 1 - smooth(seg(progress, end - fade, end));
  return inStart * outEnd;
}

export function WotageiScene() {
  const clock = useCutClock();
  const stage = useRef<THREE.Group>(null);
  const backdrop = useRef<THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>>(null);
  const beams = useRef<THREE.Group>(null);
  const shouts = useRef<Array<THREE.Group | null>>([]);
  const minu = useRef<THREE.Group>(null);
  const gahyun = useRef<THREE.Group>(null);
  const flash = useRef<THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>>(null);
  const lines = useRef<THREE.Group>(null);
  const hallway = useRef<THREE.Group>(null);
  const liveHouse = useRef<THREE.Group>(null);
  const photo = useRef<THREE.Group>(null);
  const shoutPhoto = useRef<THREE.Group>(null);

  useFrame((state) => {
    const p = clock.current.progress;
    const local = clock.current.localTime;
    const t = state.clock.elapsedTime;
    const photoPhase = phaseAlpha(p, WALK_END, PHOTO_END);
    const dance = phaseAlpha(p, DANCE_START, 1);
    const danceElapsed = Math.max(0, local - DANCE_START * clock.current.cut.duration);
    const beat = danceElapsed / BEAT;
    const beatPhase = beat % 1;
    const hit = dance > 0.02 ? Math.max(0, 1 - beatPhase * 3) : 0;

    if (hallway.current) hallway.current.visible = p < PHOTO_END + 0.04;
    if (liveHouse.current) liveHouse.current.visible = dance > 0.01;
    if (lines.current) lines.current.visible = dance > 0.08;

    // ---- 캐릭터 위치 ----
    if (minu.current && gahyun.current) {
      const meetClose = smooth(seg(p, 0.03, WALK_END));
      const photoIn = smooth(seg(p, WALK_END, WALK_END + 0.06));
      const danceIn = smooth(seg(p, DANCE_START, DANCE_START + 0.08));

      let mx = -2.8 + 1.65 * meetClose;
      let gx = 2.8 - 1.65 * meetClose;
      let my = -1.15;
      let gy = -1.18;

      if (photoPhase > 0.01) {
        mx = -0.72 * photoIn + mx * (1 - photoIn);
        gx = 0.72 * photoIn + gx * (1 - photoIn);
        my = -1.05;
        gy = -1.08;
      }

      if (dance > 0.01) {
        mx = -1.15 * danceIn + mx * (1 - danceIn);
        gx = 1.15 * danceIn + gx * (1 - danceIn);
        my = -0.55 * danceIn + my * (1 - danceIn);
        gy = -0.58 * danceIn + gy * (1 - danceIn);
      }

      minu.current.position.set(mx, my, 1.1);
      gahyun.current.position.set(gx, gy, 1.1);
      minu.current.rotation.z = 0;
      gahyun.current.rotation.z = 0;
    }

    const snap = seg(p, 0.28, 0.32);
    if (flash.current) {
      flash.current.visible = snap > 0.02;
      flash.current.material.opacity = Math.sin(snap * Math.PI) * 0.5;
    }

    const photoReveal = smooth(seg(p, 0.3, 0.4));
    if (photo.current) {
      photo.current.visible = photoReveal > 0.01 && photoPhase > 0.01;
      photo.current.position.y = 3.6 + (1 - photoReveal) * 0.7;
      photo.current.rotation.z = Math.sin(t * 1.2) * 0.02;
    }

    if (shoutPhoto.current) {
      shoutPhoto.current.visible = photoPhase > 0.35 && p < PHOTO_END - 0.02;
      shoutPhoto.current.scale.setScalar(0.6 + easeOutBack(photoPhase) * 0.4);
    }

    const exit = smooth(seg(p, 0.94, 1));
    if (stage.current) {
      stage.current.position.y = hit * 0.16;
      stage.current.rotation.z = Math.sin(beat * Math.PI) * 0.012 * dance;
      stage.current.scale.setScalar((1 + hit * 0.035) * (1 - exit * 0.12));
    }

    if (backdrop.current) {
      const index = Math.floor(beat / 2) % STROBE.length;
      backdrop.current.material.color.set(STROBE[index]);
      backdrop.current.material.opacity = dance > 0.1 ? 0.18 + hit * 0.22 : 0;
    }

    if (beams.current) {
      beams.current.visible = dance > 0.1;
      beams.current.children.forEach((beam, i) => {
        beam.rotation.z = Math.sin(t * 1.3 + i * 1.7) * 0.5 + (i - 1.5) * 0.25;
        const mesh = beam as THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
        mesh.material.opacity = 0.12 + Math.abs(Math.sin(t * 2.2 + i)) * 0.2 + hit * 0.12;
      });
    }

    if (lines.current) {
      lines.current.scale.setScalar(1 + hit * 0.12);
    }

    const callIndex = Math.floor(beat / 4) % CALLS.length;
    shouts.current.forEach((group, i) => {
      if (!group) return;
      group.visible = dance > 0.2 && p < 0.95 && i === callIndex;
      if (group.visible) {
        group.position.x = i % 2 === 0 ? -1.5 : 1.5;
        group.position.y = 3.1 + Math.sin(beat * Math.PI * 2) * 0.18;
        group.scale.setScalar(0.86 + hit * 0.3);
        group.rotation.z = (i % 2 === 0 ? 1 : -1) * 0.14;
      }
    });
  });

  const minuPose = (elapsed: number) => {
    const p = clock.current.progress;
    if (p < WALK_END) return walkPose(elapsed, 0, p > WALK_END * 0.6);
    if (p < PHOTO_END) return heartHandsPose(elapsed, "left");
    return wotageiPose(elapsed, 0);
  };

  const gahyunPose = (elapsed: number) => {
    const p = clock.current.progress;
    if (p < WALK_END) return walkPose(elapsed, 0.5, p > WALK_END * 0.6);
    if (p < PHOTO_END) return heartHandsPose(elapsed, "right");
    return wotageiPose(elapsed, 0.5);
  };

  return (
    <StageFit height={STAGE_HEIGHT} width={STAGE_WIDTH}>
      <group ref={stage}>
        {/* 복도 — 만남 & 사진 */}
        <group ref={hallway}>
          <mesh position={[0, 0, -5.5]}>
            <planeGeometry args={[14, 16]} />
            <meshBasicMaterial color="#c5c9d1" toneMapped={false} />
          </mesh>
          <mesh position={[-2.8, -0.2, -5.2]}>
            <planeGeometry args={[1.4, 2]} />
            <meshBasicMaterial color="#9ca3af" toneMapped={false} />
          </mesh>
          <mesh position={[-2.8, 0.6, -5.1]}>
            <planeGeometry args={[0.5, 0.5]} />
            <meshBasicMaterial color="#ef4444" toneMapped={false} />
          </mesh>
          <mesh position={[3.2, 0, -5.3]}>
            <planeGeometry args={[2.5, 14]} />
            <meshBasicMaterial color="#a67c52" toneMapped={false} />
          </mesh>
          <mesh position={[0, -2.2, -4]}>
            <planeGeometry args={[12, 3]} />
            <meshBasicMaterial color="#d4d4d8" toneMapped={false} />
          </mesh>
        </group>

        {/* 라이브 하우스 — 오타게 */}
        <group ref={liveHouse} visible={false}>
          <mesh position={[0, 0, -6]}>
            <planeGeometry args={[64, 42]} />
            <meshBasicMaterial color="#0a0713" toneMapped={false} />
          </mesh>
          <mesh position={[0, 0, -5.8]} ref={backdrop}>
            <planeGeometry args={[64, 42]} />
            <meshBasicMaterial color="#ff2f6d" depthWrite={false} opacity={0} toneMapped={false} transparent />
          </mesh>
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
          <group ref={lines} visible={false}>
            <SpeedLines color="#ffffff" count={64} inner={0.24} opacity={0.24} size={34} spin={0.6} z={-3.4} />
          </group>
          <mesh position={[0, -8.6, -1]}>
            <planeGeometry args={[44, 12]} />
            <meshBasicMaterial color="#141024" toneMapped={false} />
          </mesh>
          <mesh position={[0, -2.66, -0.9]}>
            <planeGeometry args={[20, 0.14]} />
            <meshBasicMaterial color="#4b3f74" toneMapped={false} />
          </mesh>
        </group>

        <group position={[-2.8, -1.15, 1.1]} ref={minu}>
          <PixelCharacter fps={16} height={3.2} kind="minu-wotagei" pose={minuPose} />
        </group>
        <group position={[2.8, -1.18, 1.1]} ref={gahyun}>
          <PixelCharacter flip fps={16} height={3.14} kind="gahyun-wotagei" pose={gahyunPose} />
        </group>

        <mesh position={[0, -1.75, 0.8]}>
          <planeGeometry args={[4.2, 0.4]} />
          <meshBasicMaterial
            blending={THREE.AdditiveBlending}
            color="#ff5fa2"
            depthWrite={false}
            opacity={0.2}
            toneMapped={false}
            transparent
          />
        </mesh>

        <group position={[0, 3.6, 1.4]} ref={photo} visible={false}>
          <PhotoSlot height={2} label="2025.09.13" resolution={118} url={PHOTO_URL} />
        </group>

        <group position={[0, 4.1, 1.6]} ref={shoutPhoto} visible={false}>
          <PixelShout color="#ff5fa2" height={0.95} text="손하트 찰칵!" wobble={0.02} />
        </group>

        <PixelParticles area={[8, 12]} color="#ffe45e" count={22} shape="star" size={0.26} speed={1.1} z={1.4} />
        <PixelParticles area={[8, 12]} color="#8affc1" count={14} shape="note" size={0.24} speed={0.8} z={1.5} />

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

        <mesh position={[0, 0, 3]} ref={flash} visible={false}>
          <planeGeometry args={[30, 30]} />
          <meshBasicMaterial color="#ffffff" depthWrite={false} opacity={0} toneMapped={false} transparent />
        </mesh>
      </group>
    </StageFit>
  );
}

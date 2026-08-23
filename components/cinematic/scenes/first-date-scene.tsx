"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useCutClock } from "@/components/cinematic/cinematic-clock";
import { PhotoSlot, PixelBillboard } from "@/components/cinematic/pixel-billboard";
import { StageCover, StageFit } from "@/components/cinematic/stage-fit";
import { PixelCharacter } from "@/components/cinematic/sprites/pixel-character";
import {
  benchKissPose,
  cafeHangoutPose,
  jojoGahyunPose,
  jojoMinuPose,
  walkPose,
} from "@/components/cinematic/sprites/poses";
import {
  Halftone,
  PixelParticles,
  PixelShout,
  SkyBackdrop,
} from "@/components/cinematic/effects/comic";
import { STAGE_HEIGHT, STAGE_WIDTH, easeOutBack, seg, smooth } from "@/components/cinematic/scene-utils";

const PHOTOS = {
  minu: "/cinematic/first-date/minu.jpg",
  gahyun: "/cinematic/first-date/gahyun.jpg",
  background: "/cinematic/first-date/background.jpg",
} as const;

const BG_W = 7.6;
const BG_H = 5.7;

/** progress 구간 */
const MEET_END = 0.2;
const CAFE_END = 0.44;
const PHOTO_END = 0.72;

function phaseAlpha(progress: number, start: number, end: number, fade = 0.04) {
  const inStart = smooth(seg(progress, start, start + fade));
  const outEnd = 1 - smooth(seg(progress, end - fade, end));
  return inStart * outEnd;
}

export function FirstDateScene() {
  const clock = useCutClock();
  const minu = useRef<THREE.Group>(null);
  const gahyun = useRef<THREE.Group>(null);
  const cafeLayer = useRef<THREE.Group>(null);
  const photoLayer = useRef<THREE.Group>(null);
  const riverLayer = useRef<THREE.Group>(null);
  const daySky = useRef<THREE.Group>(null);
  const flash = useRef<THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>>(null);
  const shoutCafe = useRef<THREE.Group>(null);
  const shoutSnap = useRef<THREE.Group>(null);
  const shoutKiss = useRef<THREE.Group>(null);
  const photoMinu = useRef<THREE.Group>(null);
  const photoGahyun = useRef<THREE.Group>(null);
  const kissHearts = useRef<THREE.Group>(null);

  useFrame(() => {
    const p = clock.current.progress;

    const cafe = phaseAlpha(p, MEET_END, CAFE_END);
    const photo = phaseAlpha(p, CAFE_END, PHOTO_END);
    const river = phaseAlpha(p, PHOTO_END, 1);

    // ---- 캐릭터 위치 ----
    if (minu.current && gahyun.current) {
      const meetClose = smooth(seg(p, 0.04, MEET_END));
      const cafeIn = smooth(seg(p, MEET_END, MEET_END + 0.06));
      const photoIn = smooth(seg(p, CAFE_END, CAFE_END + 0.06));
      const riverIn = smooth(seg(p, PHOTO_END, PHOTO_END + 0.06));

      let mx = -2.9 + 2.0 * meetClose;
      let gx = 2.9 - 2.0 * meetClose;
      let my = -1.2;
      let gy = -1.24;
      let mz = 1;
      let gz = 1;

      if (cafe > 0.01) {
        mx = -1.15 * cafeIn + mx * (1 - cafeIn);
        gx = 1.15 * cafeIn + gx * (1 - cafeIn);
        my = -0.85;
        gy = -0.88;
      }
      if (photo > 0.01) {
        mx = -1.05 * photoIn + mx * (1 - photoIn);
        gx = 1.05 * photoIn + gx * (1 - photoIn);
        my = -1.05;
        gy = -1.08;
        mz = 1.2;
        gz = 1.2;
      }
      if (river > 0.01) {
        const riverP = seg(p, PHOTO_END + 0.04, 0.98);
        const leanRot = smooth(seg(riverP, 0.32, 0.82));
        const kissNear = smooth(seg(riverP, 0.55, 0.92));

        mx = -0.38 * riverIn + mx * (1 - riverIn);
        gx = 0.38 * riverIn + gx * (1 - riverIn);
        mx += kissNear * 0.14;
        gx -= kissNear * 0.14;
        my = -1.02;
        gy = -1.05;
        mz = 1.3;
        gz = 1.3;

        minu.current.rotation.z = -leanRot * 0.05;
        gahyun.current.rotation.z = leanRot * 0.05;
      } else {
        minu.current.rotation.z = 0;
        gahyun.current.rotation.z = 0;
      }

      minu.current.position.set(mx, my, mz);
      gahyun.current.position.set(gx, gy, gz);
    }

    if (cafeLayer.current) cafeLayer.current.visible = cafe > 0.01;
    if (photoLayer.current) photoLayer.current.visible = photo > 0.01;
    if (riverLayer.current) riverLayer.current.visible = river > 0.01;
    if (daySky.current) daySky.current.visible = p < CAFE_END + 0.02;

    const snap = seg(p, 0.54, 0.58);
    if (flash.current) {
      flash.current.visible = snap > 0.02 && snap < 0.98;
      flash.current.material.opacity = Math.sin(snap * Math.PI) * 0.55;
    }

    const photoReveal = smooth(seg(p, 0.56, 0.66));
    if (photoMinu.current) {
      photoMinu.current.visible = photoReveal > 0.01 && photo > 0.01;
      photoMinu.current.position.y = 3.5 + (1 - photoReveal) * 0.8;
      photoMinu.current.rotation.z = (1 - photoReveal) * -0.15;
    }
    if (photoGahyun.current) {
      photoGahyun.current.visible = photoReveal > 0.01 && photo > 0.01;
      photoGahyun.current.position.y = 3.5 + (1 - photoReveal) * 0.8;
      photoGahyun.current.rotation.z = (1 - photoReveal) * 0.15;
    }

    if (shoutCafe.current) {
      shoutCafe.current.visible = cafe > 0.45 && p < CAFE_END - 0.02;
      shoutCafe.current.scale.setScalar(0.55 + easeOutBack(cafe) * 0.45);
    }
    if (shoutSnap.current) {
      shoutSnap.current.visible = snap > 0.25;
      shoutSnap.current.scale.setScalar(0.6 + easeOutBack(snap) * 0.5);
    }
    if (shoutKiss.current) {
      shoutKiss.current.visible = river > 0.38;
      shoutKiss.current.scale.setScalar(0.55 + easeOutBack(river) * 0.5);
    }

    const kissAmt = smooth(seg(p, PHOTO_END + 0.55, 0.92));
    if (kissHearts.current) {
      kissHearts.current.visible = kissAmt > 0.2;
      kissHearts.current.scale.setScalar(0.6 + kissAmt * 0.5);
    }
  });

  const pose = (offset: number) => (elapsed: number) => {
    const p = clock.current.progress;
    if (p < MEET_END) return walkPose(elapsed, offset, p > MEET_END * 0.7);
    if (p < CAFE_END) return cafeHangoutPose(elapsed, offset);
    if (p < PHOTO_END) return offset === 0 ? jojoMinuPose(elapsed) : jojoGahyunPose(elapsed);
    const riverP = seg(p, PHOTO_END + 0.04, 0.98);
    return benchKissPose(elapsed, offset > 0 ? -1 : 1, riverP);
  };

  return (
    <>
      {/* 조조 피규어 매장 배경 — 사진 타임 */}
      <StageCover height={BG_H} width={BG_W} z={-6}>
        <group visible={false} ref={photoLayer}>
          <PixelBillboard
            dither={0.07}
            gain={1.1}
            height={BG_H}
            levels={8}
            resolution={140}
            saturation={1.15}
            url={PHOTOS.background}
          />
          <mesh position={[0, 0, 0.2]}>
            <planeGeometry args={[BG_W * 1.4, BG_H * 1.4]} />
            <meshBasicMaterial color="#0a0812" depthWrite={false} opacity={0.18} toneMapped={false} transparent />
          </mesh>
        </group>
      </StageCover>

      <StageFit height={STAGE_HEIGHT} width={STAGE_WIDTH}>
        <group ref={daySky}>
          <SkyBackdrop from="#87ceeb" to="#ffe8c8" size={40} z={-5.8} />
        </group>

        {/* 카페 */}
        <group ref={cafeLayer} visible={false}>
          <mesh position={[0, 0, -4.5]}>
            <planeGeometry args={[12, 14]} />
            <meshBasicMaterial color="#3d2b1f" toneMapped={false} />
          </mesh>
          <Halftone color="#ffd6a5" opacity={0.12} size={42} z={-4.2} />
          <mesh position={[0, -1.6, 0.2]}>
            <planeGeometry args={[5.5, 0.9]} />
            <meshBasicMaterial color="#8b5e3c" toneMapped={false} />
          </mesh>
          <mesh position={[-0.5, -1.15, 0.5]}>
            <planeGeometry args={[0.5, 0.55]} />
            <meshBasicMaterial color="#f5f0e8" toneMapped={false} />
          </mesh>
          <mesh position={[0.5, -1.15, 0.5]}>
            <planeGeometry args={[0.5, 0.55]} />
            <meshBasicMaterial color="#f5f0e8" toneMapped={false} />
          </mesh>
        </group>

        {/* 한강 밤 */}
        <group ref={riverLayer} visible={false}>
          <mesh position={[0, 1, -5]}>
            <planeGeometry args={[14, 16]} />
            <meshBasicMaterial color="#0a1628" toneMapped={false} />
          </mesh>
          <mesh position={[0, -2.8, -3]}>
            <planeGeometry args={[14, 4]} />
            <meshBasicMaterial color="#1a4a7a" depthWrite={false} opacity={0.55} toneMapped={false} transparent />
          </mesh>
          <mesh position={[0, -1.02, 0.1]}>
            <planeGeometry args={[4.2, 0.35]} />
            <meshBasicMaterial color="#4a3728" toneMapped={false} />
          </mesh>
          {Array.from({ length: 12 }).map((_, i) => (
            <mesh key={i} position={[-5.5 + i * 1.0, 2.8 + (i % 3) * 0.3, -4]}>
              <planeGeometry args={[0.15, 0.15]} />
              <meshBasicMaterial
                blending={THREE.AdditiveBlending}
                color="#ffe9a8"
                depthWrite={false}
                opacity={0.35 + (i % 4) * 0.08}
                toneMapped={false}
                transparent
              />
            </mesh>
          ))}
          <Halftone color="#5fd0ff" opacity={0.06} size={42} z={-4} />
        </group>

        <mesh position={[0, 0, 2]} ref={flash} visible={false}>
          <planeGeometry args={[14, 18]} />
          <meshBasicMaterial color="#ffffff" depthWrite={false} opacity={0} toneMapped={false} transparent />
        </mesh>

        <group position={[0, -0.1, -0.8]} ref={kissHearts} visible={false}>
          <PixelParticles area={[2.8, 2.2]} color="#ff5fa2" count={14} shape="heart" size={0.42} speed={0.7} z={0} />
        </group>

        <group position={[-2.9, -1.2, 1]} ref={minu}>
          <PixelCharacter fps={13} height={3.05} kind="minu-first-date" pose={pose(0)} />
        </group>
        <group position={[2.9, -1.24, 1]} ref={gahyun}>
          <PixelCharacter flip fps={13} height={3} kind="gahyun-first-date" pose={pose(0.5)} />
        </group>

        <group position={[-1.8, 3.5, 1.3]} ref={photoMinu} visible={false}>
          <PhotoSlot height={1.7} label="조조 포즈" resolution={110} url={PHOTOS.minu} />
        </group>
        <group position={[1.8, 3.5, 1.3]} ref={photoGahyun} visible={false}>
          <PhotoSlot height={1.7} label="조조 포즈" resolution={110} url={PHOTOS.gahyun} />
        </group>

        <group position={[0, 4.1, 1.6]} ref={shoutCafe} visible={false}>
          <PixelShout color="#c4a882" height={0.9} text="카페에서 수다 ☕" wobble={0.02} />
        </group>
        <group position={[0, 4.2, 1.6]} ref={shoutSnap} visible={false}>
          <PixelShout color="#ffe45e" height={1} text="촤악—!" wobble={0.04} />
        </group>
        <group position={[0, 4.2, 1.6]} ref={shoutKiss} visible={false}>
          <PixelShout color="#ff5fa2" height={1.05} text="첫 뽀뽀 💋" wobble={0.02} />
        </group>

        <PixelParticles area={[8, 12]} color="#ffd6e7" count={18} shape="heart" size={0.22} speed={0.65} z={1.5} />
      </StageFit>
    </>
  );
}

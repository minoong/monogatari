"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useCutClock } from "@/components/cinematic/cinematic-clock";
import { PixelBillboard } from "@/components/cinematic/pixel-billboard";
import { StageCover, StageFit } from "@/components/cinematic/stage-fit";
import {
  PixelArt,
  paintAcrylicStand,
  paintBadge,
  paintCloud,
  paintCoffee,
  paintWoodTable,
} from "@/components/cinematic/sprites/pixel-art";
import { PixelCharacter } from "@/components/cinematic/sprites/pixel-character";
import { idlePose, walkPose } from "@/components/cinematic/sprites/poses";
import {
  Halftone,
  PixelParticles,
  PixelShout,
  SpeedLines,
} from "@/components/cinematic/effects/comic";
import {
  STAGE_HEIGHT,
  STAGE_WIDTH,
  easeOutBack,
  pulse,
  seg,
  smooth,
} from "@/components/cinematic/scene-utils";

const GROUND_Y = -5.4;
/** G타워 사진 비율(460x640). */
const TOWER_W = 4.6;
const TOWER_H = 6.4;
/** 타워 컷에서 카페 테이블 컷으로 넘어가는 지점. */
const CUTOVER = 0.52;

export function GTowerScene() {
  const clock = useCutClock();
  const tower = useRef<THREE.Group>(null);
  const towerWorld = useRef<THREE.Group>(null);
  const clouds = useRef<THREE.Group>(null);
  const minu = useRef<THREE.Group>(null);
  const gahyun = useRef<THREE.Group>(null);
  const meet = useRef<THREE.Group>(null);

  const cafe = useRef<THREE.Group>(null);
  const photo = useRef<THREE.Group>(null);
  const goods = useRef<THREE.Group>(null);
  const flash = useRef<THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>>(null);

  useFrame((state) => {
    const p = clock.current.progress;
    const t = state.clock.elapsedTime;

    if (tower.current) tower.current.visible = p < CUTOVER + 0.02;
    if (cafe.current) cafe.current.visible = p >= CUTOVER - 0.06;
    if (flash.current) {
      flash.current.material.opacity = pulse(seg(p, CUTOVER - 0.06, CUTOVER + 0.06));
    }

    // --- 1부: 타워 꼭대기에서 광장까지 내려오는 크레인 샷 ---
    const crane = smooth(seg(p, 0, 0.3));
    if (towerWorld.current) {
      towerWorld.current.scale.setScalar(1.55 - 0.55 * crane);
      towerWorld.current.position.y = -1.75 * (1 - crane);
      towerWorld.current.position.x = Math.sin(t * 0.5) * 0.1 * (1 - crane);
    }

    if (clouds.current) {
      clouds.current.children.forEach((cloud, i) => {
        const speed = 0.18 + i * 0.07;
        cloud.position.x = (((t * speed + i * 3.1) % 11) - 5.5) * (i % 2 === 0 ? 1 : -1);
      });
    }

    const approach = smooth(seg(p, 0.24, 0.42));
    if (minu.current) {
      minu.current.position.x = -3.4 + 2.55 * approach;
      minu.current.position.y = GROUND_Y + 1.35;
    }
    if (gahyun.current) {
      gahyun.current.position.x = 3.4 - 2.55 * approach;
      gahyun.current.position.y = GROUND_Y + 1.32;
    }

    const spark = seg(p, 0.4, 0.5);
    if (meet.current) {
      meet.current.visible = spark > 0.01;
      meet.current.scale.setScalar(0.6 + spark * 0.5 + Math.sin(t * 10) * 0.03);
    }

    // --- 2부: 카페 테이블 위에 놓인 그날의 사진 ---
    const drop = easeOutBack(seg(p, CUTOVER, CUTOVER + 0.16));
    const settle = smooth(seg(p, CUTOVER + 0.1, 1));
    if (photo.current) {
      photo.current.position.y = 2.6 - 3.1 * drop;
      photo.current.rotation.z = -0.34 + 0.27 * drop + Math.sin(t * 0.9) * 0.006;
      photo.current.scale.setScalar(1.24 - 0.2 * drop + settle * 0.06);
    }
    if (goods.current) {
      goods.current.children.forEach((item, i) => {
        const from = CUTOVER + 0.14 + i * 0.06;
        const pop = easeOutBack(seg(p, from, from + 0.14));
        item.scale.setScalar(pop);
        item.rotation.z = (i % 2 === 0 ? 1 : -1) * (0.12 - pop * 0.06) + Math.sin(t * 1.1 + i) * 0.01;
      });
    }
    if (cafe.current) {
      // 테이블을 아주 천천히 들여다보는 느낌
      cafe.current.position.x = Math.sin(t * 0.35) * 0.09;
      cafe.current.position.y = Math.cos(t * 0.28) * 0.07;
      cafe.current.scale.setScalar(1 + settle * 0.05);
    }
  });

  const walking = (offset: number) => (elapsed: number) => {
    const p = clock.current.progress;
    return p < 0.42 ? walkPose(elapsed, offset) : idlePose(elapsed, offset);
  };

  return (
    <>
      <group ref={tower}>
        {/* 도트로 갈아낸 G타워 사진이 화면을 꽉 채운다 */}
        <StageCover height={TOWER_H} width={TOWER_W} z={-2}>
          <group ref={towerWorld}>
            <PixelBillboard
              dither={0.07}
              height={TOWER_H}
              levels={6}
              resolution={190}
              saturation={1.24}
              url="/cinematic/g-tower.png"
            />
          </group>
        </StageCover>

        <StageFit height={STAGE_HEIGHT} width={STAGE_WIDTH}>
          <Halftone color="#ffffff" opacity={0.06} size={42} z={-1.6} />

          {/* 인물이 서는 아래쪽만 살짝 눌러 실루엣을 살린다 */}
          <mesh position={[0, GROUND_Y - 1.4, -1.2]}>
            <planeGeometry args={[40, 8]} />
            <meshBasicMaterial color="#101b33" depthWrite={false} opacity={0.55} toneMapped={false} transparent />
          </mesh>

          <group position={[0, 3.6, -1.4]} ref={clouds}>
            <PixelArt cacheKey="cloud" height={24} opacity={0.85} paint={paintCloud} position={[-3, 1.6, 0]} size={0.9} width={40} />
            <PixelArt cacheKey="cloud" height={24} opacity={0.7} paint={paintCloud} position={[2.6, 0.4, 0]} size={1.3} width={40} />
          </group>

          <PixelParticles
            area={[8.4, 12]}
            color="#eaf4ff"
            count={28}
            direction={-1}
            shape="dot"
            size={0.16}
            speed={0.42}
            z={1.2}
          />

          <group position={[0, 0, 1]} ref={minu}>
            <PixelCharacter fps={12} height={2.5} kind="minu" pose={walking(0)} />
          </group>
          <group position={[0, 0, 1]} ref={gahyun}>
            <PixelCharacter flip fps={12} height={2.45} kind="gahyun" pose={walking(0.4)} />
          </group>

          <group position={[0, GROUND_Y + 4.5, 1.6]} ref={meet} visible={false}>
            <SpeedLines color="#fff3c4" count={44} opacity={0.4} size={9} spin={0.5} z={-0.4} />
            <PixelShout color="#ffe45e" height={0.86} text="첫 만남!" wobble={0.05} />
            <PixelParticles
              area={[3.6, 3.2]}
              color="#ffd6e7"
              count={12}
              shape="heart"
              size={0.3}
              speed={1.3}
              z={0.4}
            />
          </group>
        </StageFit>
      </group>

      <group ref={cafe} visible={false}>
        {/* 원목 테이블 상판이 화면을 가득 채운다 */}
        <StageCover height={13} width={13} z={-6}>
          <PixelArt cacheKey="wood-table" height={128} paint={paintWoodTable} size={13} width={128} />
        </StageCover>

        <StageFit height={STAGE_HEIGHT} width={STAGE_WIDTH}>
          {/* 카페 조명 느낌의 비네트 */}
          <mesh position={[0, 0, -5.2]}>
            <planeGeometry args={[64, 42]} />
            <meshBasicMaterial color="#2a170c" depthWrite={false} opacity={0.34} toneMapped={false} transparent />
          </mesh>
          <Halftone color="#ffcf9a" opacity={0.07} size={42} z={-5} />

          {/* 테이블 위에 툭 올려둔 그날의 사진 */}
          <group position={[0, -0.5, 1]} ref={photo}>
            <mesh position={[0.14, -0.16, -0.06]}>
              <planeGeometry args={[4.9, 6.5]} />
              <meshBasicMaterial color="#1a0d05" depthWrite={false} opacity={0.45} toneMapped={false} transparent />
            </mesh>
            <mesh position={[0, -0.18, -0.02]}>
              <planeGeometry args={[4.84, 6.6]} />
              <meshBasicMaterial color="#fdfaf3" toneMapped={false} />
            </mesh>
            <PixelBillboard
              dither={0.08}
              height={5.9}
              levels={6}
              position={[0, 0.06, 0]}
              resolution={172}
              saturation={1.22}
              url="/cinematic/cafe-table.png"
            />
          </group>

          {/* 사진 주변에 널린 굿즈. 사진과 겹치지 않게 위아래로 벌려둔다. */}
          <group ref={goods}>
            <PixelArt cacheKey="coffee" height={44} paint={paintCoffee} position={[-2.35, 5.2, 1.4]} size={2} width={44} />
            <PixelArt cacheKey="acrylic" height={36} paint={paintAcrylicStand} position={[2.4, 5.3, 1.4]} size={1.9} width={32} />
            <PixelArt cacheKey="badge" height={32} paint={paintBadge} position={[2.5, -5.3, 1.4]} size={1.4} width={32} />
            <PixelArt cacheKey="badge" height={32} paint={paintBadge} position={[-2.4, -5.6, 1.4]} size={1.15} width={32} />
          </group>

          <PixelParticles
            area={[8.4, 12]}
            color="#ffd9a8"
            count={14}
            shape="dot"
            size={0.2}
            speed={0.35}
            z={2.2}
          />
        </StageFit>
      </group>

      <mesh position={[0, 0, 5]} ref={flash}>
        <planeGeometry args={[60, 60]} />
        <meshBasicMaterial color="#ffffff" depthWrite={false} opacity={0} toneMapped={false} transparent />
      </mesh>
    </>
  );
}

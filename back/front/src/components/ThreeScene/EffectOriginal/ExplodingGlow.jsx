import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sparkles, Shadow, Billboard, useTexture } from '@react-three/drei';
import { LayerMaterial, Depth } from 'lamina';
import { useSpring, animated } from '@react-spring/three';
import { useFrame } from '@react-three/fiber';

export function ExplodingGlow({
  finalScale,
  isAnswered,
  isDoneAnimationOfBackground,
  isReadyToShowDurumagi,
  setReadyToShowDurumagi,
  visibleForExplosion,
  ...props
}) {
  const [invisible, setInvisible] = useState(false);
  // console.log('check invisible : ', invisible)
  return (
    <>
      <group
        position={[0.005, 1.25, 0.85]}
        visible={visibleForExplosion && !invisible}
      >
        <mesh>
          <Glow
            finalScale={finalScale}
            isAnswered={isAnswered}
            isDoneAnimationOfBackground={isDoneAnimationOfBackground}
            isReadyToShowDurumagi={isReadyToShowDurumagi}
            setReadyToShowDurumagi={setReadyToShowDurumagi}
            visibleForExplosion={visibleForExplosion}
            setInvisible={setInvisible}
          />
        </mesh>
      </group>
    </>
  );
}
const Glow = ({
  color = 'white',
  initialLayerScale = 0.3,
  initialScale = 0.3,
  finalScale = 34,
  animationDuration = 2000,
  animationStartTime = 0,
  near = -2, // Depth 컴포넌트에서 깊이 기반 색상 그라데이션의 범위를 정의(그라데이션이 시작되는 가까운 지점을 정의. 이 거리보다 가까운 부분은 colorA로 지정된 색상으로 렌더링)
  far = 1.4, // Depth 컴포넌트에서 깊이 기반 색상 그라데이션의 범위를 정의(그라데이션이 끝나는 먼 지점을 정의. 이 거리보다 먼 부분은 colorB로 지정된 색상으로 렌더링)
  setReadyToShowDurumagi,
  isAnswered,
  isDoneAnimationOfBackground,
  isReadyToShowDurumagi,
  visibleForExplosion,
  setInvisible,
}) => {
  const [animatedScale, setAnimatedScale] = useSpring(() => ({
    scale: initialScale, // 초기 scale 값
    config: {
      mass: 1, // 애니메이션 대상의 '무게 (값이 클수록 애니메이션이 더 느리고 '무겁게' 움직암)
      tension: 300, // 스프링의 '팽팽함' (값이 클수록 애니메이션이 더 빠르고 강하게 목표 상태로 이동)
      friction: 60, // 애니메이션의 '감쇠' 정도 (값이 클수록 애니메이션이 빨리 안정화되고 덜 튀깁니다)
      duration: 10000, // 초기 애니메이션 시간값
    },
  }));
  const [layerScale, setLayerScale] = useSpring(() => ({
    scale: initialLayerScale, // 초기 scale 값
  }));

  // useEffect 훅을 사용하여 컴포넌트가 마운트된 직후 애니메이션을 시작
  useEffect(() => {
    // animationDuration/1000 초 후에 애니메이션 시작
    const timer = setTimeout(() => {
      setAnimatedScale({
        scale: finalScale,
        config: { duration: animationDuration },
      });
    }, animationStartTime);

    // 컴포넌트가 언마운트될 때 타이머 정리
    return () => {
      clearTimeout(timer);
    };
  }, [finalScale]);

  let timerForDurumagi;
  useEffect(() => {
    if (isDoneAnimationOfBackground) {
      timerForDurumagi = setTimeout(() => {
        setReadyToShowDurumagi(true);
      }, animationDuration + 2500);
    }

    // 컴포넌트가 언마운트될 때 타이머 정리
    return () => {
      clearTimeout(timerForDurumagi);
    };
  }, [isDoneAnimationOfBackground]);

  
  useEffect(() => {
    // ExplodingGlow 사라지게 하기 위함.
    if (isReadyToShowDurumagi) {
      setInvisible(prev => {
        return true;
      });
    }
    // ExplodingGlow 원위치.
    if (!isAnswered && !isReadyToShowDurumagi) {
      setInvisible(prev => {
        return false;
      });
    }
    return () => {};
  }, [isReadyToShowDurumagi, isAnswered]);
  return (
    <Billboard>
      <animated.mesh scale={animatedScale.scale}>
        <circleGeometry args={[0.2, 100]} />
        <LayerMaterial
          transparent
          depthWrite={false}
          blending={THREE.CustomBlending}
          blendEquation={THREE.AddEquation}
          blendSrc={THREE.SrcAlphaFactor}
          blendDst={THREE.DstAlphaFactor}
        >
          <Depth
            colorA={color}
            colorB="black"
            alpha={1}
            mode="normal"
            near={near * layerScale}
            far={far * layerScale}
            origin={[0, 0, 0]}
          />

          <Depth
            colorA={color}
            colorB="black"
            alpha={1}
            mode="add"
            near={-15 * layerScale}
            far={far * 0.7 * layerScale}
            origin={[0, 0, 0]}
          />
          <Depth
            colorA={color}
            colorB="black"
            alpha={1}
            mode="add"
            near={-10 * layerScale}
            far={far * 0.68 * layerScale}
            origin={[0, 0, 0]}
          />
        </LayerMaterial>
      </animated.mesh>
    </Billboard>
  );
};

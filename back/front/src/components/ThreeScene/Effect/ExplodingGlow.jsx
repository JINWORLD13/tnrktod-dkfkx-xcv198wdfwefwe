import React, { useEffect, useState } from 'react';
import { Billboard } from '@react-three/drei';
import { LayerMaterial, Depth } from 'lamina';
import { useSpring, animated } from '@react-spring/three';
import {
  AddEquation,
  CustomBlending,
  DstAlphaFactor,
  SrcAlphaFactor,
} from 'three';

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
  finalScale = 20,
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
  // 변경: useSpring 훅의 사용 방식을 수정
  const [{ scale }, api] = useSpring(() => ({
    from: { scale: initialScale },
    to: { scale: finalScale }, // 처음엔 같은 값
    config: {
      mass: 1,
      tension: 300,
      friction: 60,
    },
  }));

  // layerScale은 여전히 필요할 수 있으므로 유지
  const [layerScale, setLayerScale] = useSpring(() => ({
    scale: initialLayerScale,
  }));

  // useEffect 훅을 사용하여 컴포넌트가 마운트된 직후 애니메이션을 시작
  useEffect(() => {
    // animationDuration/1000 초 후에 애니메이션 시작
    const timer = setTimeout(() => {
      api.start({
        scale: finalScale,
        config: { duration: animationDuration },
      });
    }, animationStartTime);

    // 컴포넌트가 언마운트될 때 타이머 정리
    return () => {
      clearTimeout(timer);
    };
  }, [finalScale, animationDuration, animationStartTime, api]);

  let timerForDurumagi;
  useEffect(() => {
    if (isDoneAnimationOfBackground) {
      timerForDurumagi = setTimeout(() => {
        setReadyToShowDurumagi(true);
      }, animationDuration + 500);
    }

    // 컴포넌트가 언마운트될 때 타이머 정리
    return () => {
      clearTimeout(timerForDurumagi);
    };
  }, [isDoneAnimationOfBackground, animationDuration, setReadyToShowDurumagi]);

  useEffect(() => {
    // ExplodingGlow 사라지게 하기 위함.
    if (isReadyToShowDurumagi) {
      setInvisible(true);
    }
    // ExplodingGlow 원위치.
    if (!isAnswered && !isReadyToShowDurumagi) {
      setInvisible(false);
    }
    return () => {};
  }, [isReadyToShowDurumagi, isAnswered, setInvisible]);
  return (
    <Billboard>
      <animated.mesh scale={scale}>
        <circleGeometry args={[0.2, 100]} />
        <LayerMaterial
          transparent
          depthWrite={false}
          blending={CustomBlending}
          blendEquation={AddEquation}
          blendSrc={SrcAlphaFactor}
          blendDst={DstAlphaFactor}
        >
          <Depth
            colorA={color}
            colorB="black"
            alpha={1}
            mode="normal"
            near={near * layerScale.scale}
            far={far * layerScale.scale}
            origin={[0, 0, 0]}
          />
          <Depth
            colorA={color}
            colorB="black"
            alpha={1}
            mode="add"
            near={-15 * layerScale.scale}
            far={far * 0.7 * layerScale.scale}
            origin={[0, 0, 0]}
          />
          <Depth
            colorA={color}
            colorB="black"
            alpha={1}
            mode="add"
            near={-10 * layerScale.scale}
            far={far * 0.68 * layerScale.scale}
            origin={[0, 0, 0]}
          />
        </LayerMaterial>
      </animated.mesh>
    </Billboard>
  );
};

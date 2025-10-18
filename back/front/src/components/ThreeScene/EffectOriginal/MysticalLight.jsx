import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import { LayerMaterial, Depth } from "lamina";
import { useSpring, animated } from "@react-spring/three";

// MysticalLight 컴포넌트: 회전하는 빛과 광선을 포함하는 그룹
export function MysticalLight({
  finalScale = 0.3,
  position = [0.005, 1.1, 0.85],
  visible,
  ...props
}) {
  return (
    <group position={position} visible={visible} {...props}>
      <RotatingGlow finalScale={finalScale} />
      <LightRays count={1000} />
    </group>
  );
}

// RotatingGlow 컴포넌트: 회전하는 빛나는 구체
const RotatingGlow = ({
  color = "white",
  initialScale = 0.3, //! 빛의 구슬 크기
  finalScale = 0.3,
  animationDuration = 1500,
  animationStartTime = 500,
  near = -0.5,
  far = 0.5,
}) => {
  // 애니메이션 스프링 설정
  const [animatedScale] = useSpring(() => ({
    scale: [initialScale, initialScale, initialScale], //! 빛의 구슬 크기
    from: { scale: [initialScale, initialScale, initialScale] },
    to: { scale: [finalScale, finalScale, finalScale] },
    config: { duration: animationDuration },
    delay: animationStartTime,
  }));

  return (
    <Billboard>
      <animated.mesh scale={animatedScale.scale}>
        <sphereGeometry args={[0.2, 64, 64]} />
        <LayerMaterial
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        >
          {/* 깊이에 따른 색상 변화 레이어들 */}
          <Depth
            colorA={color}
            colorB="black"
            alpha={1}
            mode="normal"
            near={near}
            far={far}
            origin={[0, 0, 0]}
          />
          <Depth
            colorA={color}
            colorB="black"
            alpha={0.5}
            mode="add"
            near={-2}
            far={far * 0.7}
            origin={[0, 0, 0]}
          />
          <Depth
            colorA={color}
            colorB="black"
            alpha={0.5}
            mode="add"
            near={-1}
            far={far * 0.68}
            origin={[0, 0, 0]}
          />
        </LayerMaterial>
      </animated.mesh>
    </Billboard>
  );
};

// LightRays 컴포넌트: 다수의 광선을 생성하고 관리
const LightRays = ({ count = 1000, radius = 0.5 }) => {
  const ref = useRef();
  const [rays, setRays] = useState([]);

  useEffect(() => {
    // 광선 데이터 생성
    const newRays = Array.from({ length: count }, () => {
      const randomRadius = Math.random() * radius;
      const phi = Math.acos(1 - 2 * Math.random());
      const theta = 2 * Math.PI * Math.random();
      const x = randomRadius * Math.sin(phi) * Math.cos(theta);
      const y = randomRadius * Math.sin(phi) * Math.sin(theta);
      const z = randomRadius * Math.cos(phi);
      return {
        start: new THREE.Vector3(0, 0, 0),
        end: new THREE.Vector3(x, y, z),
        width: Math.random() * 0.002 + 0.0005,
        speed: Math.random() * 0.5 + 0.5,
        offset: Math.random() * Math.PI * 2,
        pulseDuration: Math.random() * 2, //! 광선이 퍼졌다 줄어드는 전체 주기 : 0~2초 사이의 펄스 주기
      };
    });
    setRays(newRays);
  }, [count, radius]);

  useFrame((state) => {
    if (ref.current) {
      // 전체 광선 그룹 회전
      ref.current.rotation.x += 0.0002;
      ref.current.rotation.y += 0.0003;
    }
  });

  return (
    <group ref={ref}>
      {rays.map((ray, index) => (
        <Ray key={index} {...ray} />
      ))}
    </group>
  );
};

// Ray 컴포넌트: 개별 광선
const Ray = ({ start, end, width, speed, offset, pulseDuration }) => {
  const ref = useRef();

  useFrame((state, delta) => {
    if (ref.current) {
      const time = state.clock.getElapsedTime();
      const pulseProgress = (Math.sin(time * (Math.PI / pulseDuration)) + 1) / 2;

      // 광선 크기 변화 애니메이션
      const scaleFactor = Math.sin(time * speed + offset) * 0.2 + 0.8;
      ref.current.scale.z = scaleFactor;

      // 광선 약간의 움직임 추가
      const movement = new THREE.Vector3(
        Math.sin(time * speed * 0.3 + offset) * 0.01,
        Math.cos(time * speed * 0.3 + offset) * 0.01,
        Math.sin(time * speed * 0.4 + offset) * 0.01
      );
      ref.current.position.copy(movement);

      // 펄스 진행도에 따른 광선 길이 업데이트
      const currentEnd = new THREE.Vector3().lerpVectors(start, end, pulseProgress);
      ref.current.geometry.setFromPoints([start, currentEnd]);
    }
  });

  return (
    <line ref={ref}>
      <bufferGeometry />
      <lineBasicMaterial
        color="white"
        transparent
        opacity={0.7}
        linewidth={width}
      />
    </line>
  );
};

// import React, { useEffect, useMemo, useRef, useState } from "react";
// import * as THREE from "three";
// import { Sparkles, Shadow, Billboard, useTexture } from "@react-three/drei";
// import { LayerMaterial, Depth } from "lamina";
// import { useSpring, animated } from "@react-spring/three";
// import { useFrame } from "@react-three/fiber";

// export function RotatingGlow({ finalScale, ...props }) {
//   return (
//     <>
//       <group position={[0.005, 1.33, 0.85]}>
//         <mesh>
//           <Glow finalScale={finalScale} />
//         </mesh>
//       </group>
//     </>
//   );
// }

// //! animatedScale의 scale은 0.3에서 2000ms 동안 finalScale로 애니메이션처럼 자연스럽게 변한다.
// const Glow = ({
//   color = "white",
//   depthScale = 1,
//   initialScale = 0.3,
//   finalScale = 0.4,
//   animationDuration = 300,
//   animationStartTime = 500,
//   near = -2, // Depth 컴포넌트에서 깊이 기반 색상 그라데이션의 범위를 정의(그라데이션이 시작되는 가까운 지점을 정의. 이 거리보다 가까운 부분은 colorA로 지정된 색상으로 렌더링)
//   far = 1.4, // Depth 컴포넌트에서 깊이 기반 색상 그라데이션의 범위를 정의(그라데이션이 끝나는 먼 지점을 정의. 이 거리보다 먼 부분은 colorB로 지정된 색상으로 렌더링)
// }) => {
//   const [animatedScale, setAnimatedScale] = useSpring(() => ({
//     scale: initialScale, // 초기 scale 값
//     config: {
//       mass: 1, // 애니메이션 대상의 '무게 (값이 클수록 애니메이션이 더 느리고 '무겁게' 움직암)
//       tension: 300, // 스프링의 '팽팽함' (값이 클수록 애니메이션이 더 빠르고 강하게 목표 상태로 이동)
//       friction: 60, // 애니메이션의 '감쇠' 정도 (값이 클수록 애니메이션이 빨리 안정화되고 덜 튀깁니다)
//       duration: 2000, // 초기 애니메이션 시간값
//     },
//   }));

//   // useEffect 훅을 사용하여 컴포넌트가 마운트된 직후 애니메이션을 시작
//   useEffect(() => {
//     // animationDuration/1000 초 후에 애니메이션 시작
//     const timer = setTimeout(() => {
//       setAnimatedScale({
//         scale: finalScale,
//         config: { duration: animationDuration },
//       });
//     }, animationStartTime);

//     // 컴포넌트가 언마운트될 때 타이머 정리
//     return () => clearTimeout(timer);
//   }, [finalScale]);

//   //! Billboard 컴포넌트를 사용하여 항상 카메라를 향하도록 합니다.
//   //! animated.mesh를 사용하여 scale 애니메이션을 적용합니다.
//   //! LayerMaterial을 사용하여 복잡한 재질을 생성합니다.
//   //! 세 개의 Depth 레이어를 사용하여 깊이감과 발광 효과를 만듭니다.
//   //~ 컴포넌트가 마운트되면 작은 원형으로 시작하여 scale 애니메이션이 시작되어 원형이 급격히 확장되고 LayerMaterial의 설정으로 인해 가장자리로 갈수록 투명해지는 발광 효과가 생깁니다.
//   //~ 첫 번째 레이어: 기본적인 깊이 효과를 생성합니다.
//   //~ 두 번째 레이어: 추가적인 발광 효과를 더합니다 (mode="add").
//   //~ 세 번째 레이어: 더 강한 중심부 발광을 만듭니다 (mode="add").
//   //~ near와 far 값에 initialScale을 곱하는 것은, 오브젝트의 크기가 변할 때 그라데이션 효과도 함께 스케일되도록 하기 위함.
//   return (
//     <Billboard>
//       <animated.mesh scale={animatedScale.scale}>
//         <circleGeometry args={[0.2, 100]} />
//         <LayerMaterial
//           transparent
//           depthWrite={false}
//           blending={THREE.CustomBlending}
//           blendEquation={THREE.AddEquation}
//           blendSrc={THREE.SrcAlphaFactor}
//           blendDst={THREE.DstAlphaFactor}
//         >
//           <Depth
//             colorA={color}
//             colorB="black"
//             alpha={1}
//             mode="normal"
//             near={near * initialScale}
//             far={far * initialScale}
//             origin={[0, 0, 0]}
//           />

//           <Depth
//             colorA={color}
//             colorB="black"
//             alpha={1}
//             mode="add"
//             near={-15 * initialScale}
//             far={far * 0.7 * initialScale}
//             origin={[0, 0, 0]}
//           />
//           <Depth
//             colorA={color}
//             colorB="black"
//             alpha={1}
//             mode="add"
//             near={-10 * initialScale}
//             far={far * 0.68 * initialScale}
//             origin={[0, 0, 0]}
//           />
//         </LayerMaterial>
//       </animated.mesh>
//     </Billboard>
//   );
// };

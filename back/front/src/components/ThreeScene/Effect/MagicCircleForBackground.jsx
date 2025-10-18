import React, { useRef, useState, useEffect, useMemo, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSpring, animated } from '@react-spring/three';
import { BufferGeometry, Color, DoubleSide, Euler, Float32BufferAttribute, MathUtils, Vector3 } from 'three';

// 이징 함수
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export const MagicCircleForBackground = memo(function MagicCircleForBackground({
  initialPosition = [0.005, 1.3, 0],
  targetPosition = [0, 1.3, 0],
  scale = [0.5, 0.5, 0.5],
  color = new Color(`hsl(${(1 / 10) * 360}, 100%, 50%)`),
  rotateSpeed = 0.01 + 1 * 0.005,
  initialRotationAxis = new Vector3(1, 1, 1).normalize(),
  orbitAxis = new Vector3(1, 1, 1).normalize(),
  orbitSpeed = 0.5,
  expansionSpeed = 0.5,
  transitionDuration = 2,
  size = 0.7, // 마법진의 크기를 조절하는 새로운 prop
}) {
  const ref = useRef();
  const [position, setPosition] = useState(initialPosition);
  const [expanding, setExpanding] = useState(false);
  const [orbiting, setOrbiting] = useState(false);
  const [intensity, setIntensity] = useState(1);
  const [orbitAngle, setOrbitAngle] = useState(0);
  const [expansionProgress, setExpansionProgress] = useState(0);
  const [transitionProgress, setTransitionProgress] = useState(0);
  const [opacity, setOpacity] = useState(0);
  const [currentScale, setCurrentScale] = useState(scale.map(s => s * size)); // 크기 조절을 반영한 초기 스케일
  const rotationRef = useRef(new Euler(0, 0, 0));
  const [preExpansionRotateSpeed, setPreExpansionRotateSpeed] = useState(
    rotateSpeed * 300
  ); // 기존 속도의 300배로 설정

  // 마법진을 위한 사용자 정의 geometry 생성
  const magicCircleGeometry = useMemo(() => {
    const geometry = new BufferGeometry();
    const vertices = [];
    const indices = [];

    // 외부 원
    const segments = 64;
    const radius = 1.0 * size; // 크기 조절 반영
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      vertices.push(Math.cos(theta) * radius, Math.sin(theta) * radius, 0);
    }

    // 내부 원
    const innerRadius = 0.9 * size; // 크기 조절 반영
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      vertices.push(
        Math.cos(theta) * innerRadius,
        Math.sin(theta) * innerRadius,
        0
      );
    }

    // 외부 원과 내부 원 연결
    for (let i = 0; i < segments; i++) {
      indices.push(i, i + 1, i + segments + 1);
      indices.push(i, i + segments + 1, i + segments + 2);
    }

    // 첫 번째 오각형 (외곽선만)
    const pentagonRadius = 0.7 * size; // 크기 조절 반영
    const pentagonVertices = 5;
    const pentagonStart = vertices.length / 3;
    for (let i = 0; i <= pentagonVertices; i++) {
      const theta = (i / pentagonVertices) * Math.PI * 2 - Math.PI / 2;
      vertices.push(
        Math.cos(theta) * pentagonRadius,
        Math.sin(theta) * pentagonRadius,
        0
      );
    }

    // 첫 번째 오각형 외곽선 연결
    for (let i = 0; i < pentagonVertices; i++) {
      indices.push(pentagonStart + i, pentagonStart + i + 1);
    }

    // 두 번째 오각형 (외곽선만, 36도 회전)
    const rotatedPentagonStart = vertices.length / 3;
    for (let i = 0; i <= pentagonVertices; i++) {
      const theta =
        (i / pentagonVertices) * Math.PI * 2 -
        Math.PI / 2 +
        (36 * Math.PI) / 180;
      vertices.push(
        Math.cos(theta) * pentagonRadius,
        Math.sin(theta) * pentagonRadius,
        0
      );
    }

    // 두 번째 오각형 외곽선 연결
    for (let i = 0; i < pentagonVertices; i++) {
      indices.push(rotatedPentagonStart + i, rotatedPentagonStart + i + 1);
    }

    // 가장 안쪽 원 (외곽선만)
    const innermostRadius = 0.4 * size; // 크기 조절 반영
    const innermostStart = vertices.length / 3;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      vertices.push(
        Math.cos(theta) * innermostRadius,
        Math.sin(theta) * innermostRadius,
        0
      );
    }

    // 가장 안쪽 원 외곽선 연결
    for (let i = 0; i < segments; i++) {
      indices.push(innermostStart + i, innermostStart + i + 1);
    }

    // 중앙의 별
    const starPoints = 5;
    const starOuterRadius = 0.3 * size; // 크기 조절 반영
    const starInnerRadius = 0.12 * size; // 크기 조절 반영
    const starStart = vertices.length / 3;
    for (let i = 0; i <= starPoints * 2; i++) {
      const theta = (i / starPoints) * Math.PI;
      const r = i % 2 === 0 ? starOuterRadius : starInnerRadius;
      vertices.push(Math.cos(theta) * r, Math.sin(theta) * r, 0);
    }

    // 별 연결
    for (let i = 0; i < starPoints * 2 - 1; i++) {
      indices.push(starStart, starStart + i + 1, starStart + i + 2);
    }

    // 달 모양
    const moonRadius = 0.16 * size; // 크기 조절 반영
    const moonCenter = [0.5 * size, 0.5 * size]; // 크기 조절 반영
    const moonStart = vertices.length / 3;
    for (let i = 0; i <= segments / 2; i++) {
      const theta = (i / (segments / 2)) * Math.PI;
      vertices.push(
        moonCenter[0] + Math.cos(theta) * moonRadius,
        moonCenter[1] + Math.sin(theta) * moonRadius,
        0
      );
    }
    for (let i = segments / 2; i >= 0; i--) {
      const theta = (i / (segments / 2)) * Math.PI;
      vertices.push(
        moonCenter[0] + Math.cos(theta) * moonRadius * 0.8,
        moonCenter[1] + Math.sin(theta) * moonRadius,
        0
      );
    }

    // 달 연결
    for (let i = 0; i < segments; i++) {
      indices.push(moonStart, moonStart + i + 1, moonStart + i + 2);
    }

    const positionAttribute = new Float32BufferAttribute(vertices, 3);
    geometry.setAttribute('position', positionAttribute);
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    return geometry;
  }, [size]); // size가 변경될 때마다 geometry 재생성
  useEffect(() => {
    // magicCircleGeometry가 생성된 후에만 실행되도록 보장
    if (!magicCircleGeometry) {
      console.warn('magicCircleGeometry is not initialized');
      return;
    }

    // 클린업 시 사용할 이전 geometry 저장
    let previousGeometry = magicCircleGeometry;

    // 클린업 함수
    return () => {
      if (previousGeometry) {
        try {
          // position 속성 해제
          const positionAttribute = previousGeometry.attributes.position;
          if (positionAttribute) {
            previousGeometry.deleteAttribute('position');
            positionAttribute.dispose(); // BufferAttribute 해제
          }

          // index 버퍼 해제
          if (previousGeometry.index) {
            const indexAttribute = previousGeometry.index;
            previousGeometry.setIndex(null); // 인덱스 제거
            indexAttribute.dispose(); // BufferAttribute 해제
          }

          // Geometry 완전 해제
          previousGeometry.dispose();
          previousGeometry = null;
        } catch (error) {
          console.error('Error during geometry cleanup:', error);
        }
      }
    };
  }, [magicCircleGeometry]); // magicCircleGeometry 자체를 의존성으로 사용
  // 컴포넌트가 마운트된 후 3초 후에 확장 시작
  useEffect(() => {
    const timeout = setTimeout(() => {
      setExpanding(true);
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  // 매 프레임마다 실행되는 업데이트 함수
  useFrame((state, delta) => {
    // 불투명도 점진적 증가
    if (opacity < 1) {
      setOpacity(prev => Math.min(prev + delta, 0.5));
    }

    if (!expanding && !orbiting) {
      rotationRef.current.x +=
        preExpansionRotateSpeed * initialRotationAxis.x * delta;
      rotationRef.current.y +=
        preExpansionRotateSpeed * initialRotationAxis.y * delta;
      rotationRef.current.z +=
        preExpansionRotateSpeed * initialRotationAxis.z * delta;
      ref.current.setRotationFromEuler(rotationRef.current);
    } else if (expanding && !orbiting) {
      // 확장 진행 상태 업데이트
      setExpansionProgress(prev => {
        const newProgress = prev + delta * expansionSpeed;
        return newProgress >= 1 ? 1 : newProgress;
      });

      // 이징 함수를 사용한 부드러운 확장 효과
      const easedProgress = easeOutCubic(expansionProgress);
      const newPosition = [
        MathUtils.lerp(
          initialPosition[0],
          targetPosition[0],
          easedProgress
        ),
        MathUtils.lerp(
          initialPosition[1],
          targetPosition[1],
          easedProgress
        ),
        initialPosition[2], // z값 고정으로 배경과 평행 유지
      ];
      setPosition(newPosition);

      // 원래 크기의 3배까지 점진적으로 확대
      const newScale = scale.map(s => s * size * (1 + 2 * easedProgress));
      setCurrentScale(newScale);

      // 확장이 완료되면 공전 상태로 전환
      if (expansionProgress >= 1) {
        setOrbiting(true);
      }

      // 마법진이 화면과 평행하도록 회전 조정
      ref.current.rotation.x = 0;
      ref.current.rotation.y = 0;
    } else if (orbiting) {
      // 공전 로직 제거, 최종 위치에 고정
      setPosition(targetPosition);

      // 마법진이 화면과 평행하도록 유지
      ref.current.rotation.x = 0;
      ref.current.rotation.y = 0;
    }

    // 자전 로직 추가 (z축 회전만 유지)
    ref.current.rotation.z += rotateSpeed * delta;

    // 빛의 강도 변화 (깜박임 효과)
    setIntensity(Math.abs(Math.sin(state.clock.getElapsedTime())) * 2);
  });

  // 마법진 렌더링
  return (
    <group>
      <mesh
        ref={ref}
        position={position}
        scale={currentScale}
        geometry={magicCircleGeometry}
      >
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0}
          side={DoubleSide}
        />
      </mesh>
      <lineSegments
        ref={ref}
        position={position}
        scale={currentScale}
        geometry={magicCircleGeometry}
      >
        <lineBasicMaterial color={color} transparent opacity={opacity * 10} />
      </lineSegments>
    </group>
  );
});

// 배경을 위한 마법진 그룹 애니메이션 (중앙에서 원형으로 확장)
export function MagicCircleGroupForBackground({
  position = [0.005, 1.35, 0],
  setDoneAnimationOfBackground,
  visible,
  ...props
}) {
  const [key, setKey] = useState(0);
  const [startExpansion, setStartExpansion] = useState(false);

  let expansionTimeout;
  let DoneAnimationOfBackgroundtime;
  useEffect(() => {
    if (visible) {
      setKey(prevKey => prevKey + 1);

      expansionTimeout = setTimeout(() => {
        setStartExpansion(true);
      }, 3000);

      DoneAnimationOfBackgroundtime = setTimeout(() => {
        setDoneAnimationOfBackground(true);
      }, 6000);
    } else if (!visible) {
      setStartExpansion(false);
    }

    return () => {
      if(expansionTimeout) clearTimeout(expansionTimeout);
      if(DoneAnimationOfBackgroundtime) clearTimeout(DoneAnimationOfBackgroundtime);
    };
  }, [visible]);
  
  const circles = [];
  const circleCount = 8; // 마법진 수
  const spreadRadius = 1; // 마법진이 배치되어 만드는 원의 반경
  const zRange = 0; // 마법진들의 z값

  for (let i = 0; i < circleCount; i++) {
    const angle = (i / circleCount) * Math.PI * 2; // 360도 주위에 균등하게 분포
    const randomAxis = new Vector3(
      Math.random() - 0.5,
      Math.random() - 0.5,
      Math.random() - 0.5
    ).normalize();

    const targetPosition = [
      position[0] + Math.cos(angle) * spreadRadius,
      position[1] + Math.sin(angle) * spreadRadius,
      position[2] + (Math.random() - 0.5) * zRange, // 범위 내 무작위 z 값
    ];

    const color = new Color(`hsl(${(i / circleCount) * 360}, 100%, 70%)`);
    const rotateSpeed = 0.01 + i * 0.03; // 회전 속도 변화 감소
    const expansionSpeed = 0.5 + Math.random() * 0.1; // 확장 속도 변화 감소
    // const size = 0.8 + Math.random() * 0.4; // 각 마법진의 크기를 무작위로 설정
    const scale = [0.2, 0.2, 0.2];

    circles.push(
      <MagicCircleForBackground
        key={i}
        initialPosition={position}
        targetPosition={targetPosition}
        scale={scale}
        color={color}
        rotateSpeed={rotateSpeed}
        initialRotationAxis={randomAxis}
        expansionSpeed={expansionSpeed}
        // size={size}
      />
    );
  }

  return <group>{circles}</group>;
}
import React, {
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// 이징 함수
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// glow 효과가 적용된 선 그리기 함수
function drawGlowingLine(ctx, drawFunc, color, useGlow = true) {
  ctx.save();
  if (useGlow) {
    ctx.shadowColor = color;
    ctx.shadowBlur = 40;
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    for (let i = 0; i < 10; i++) {
      drawFunc();
    }
  } else {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    drawFunc();
  }
  ctx.restore();
}

export function MagicCircle({
  initialPosition = [0.005, 1.3, 0.7],
  targetPosition = [0, 1.3, 0.7],
  scale = [0.5, 0.5, 0.5],
  color = new THREE.Color(`hsl(${(1 / 10) * 360}, 100%, 50%)`),
  rotateSpeed = 0.01 + 1 * 0.005,
  initialRotationAxis = new THREE.Vector3(1, 1, 1).normalize(),
  orbitAxis = new THREE.Vector3(1, 1, 1).normalize(),
  orbitSpeed = 0.5,
  expansionSpeed = 0.5,
  transitionDuration = 2,
  visible, //! visible이 true일 때마다 애니메이션 리셋
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
  const [currentScale, setCurrentScale] = useState(scale.map(s => s * 0.6)); //! 초기 회전 애니메이션시의 마법진들의 크기
  const rotationRef = useRef(new THREE.Euler(0, 0, 0));
  const [preExpansionRotateSpeed, setPreExpansionRotateSpeed] = useState(
    rotateSpeed * 300
  );
  const resetAnimation = useCallback(() => {
    setPosition(initialPosition);
    setExpanding(false);
    setOrbiting(false);
    setIntensity(1);
    setOrbitAngle(0);
    setExpansionProgress(0);
    setTransitionProgress(0);
    setOpacity(0);
    setCurrentScale(scale.map(s => s * 0.6));
    rotationRef.current.set(0, 0, 0);
    setPreExpansionRotateSpeed(rotateSpeed * 300);
  }, [initialPosition, scale, rotateSpeed]);

  useEffect(() => {
    if (visible) {
      resetAnimation();
      const timeout = setTimeout(() => {
        setExpanding(true);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [visible]);

  // 마법진을 위한 사용자 정의 텍스처 생성
  const magicCircleTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // 마법진 그리기 함수
    const drawMagicCircle = () => {
      const segments = 64;

      // 외부 원
      drawGlowingLine(
        ctx,
        () => {
          ctx.beginPath();
          ctx.arc(centerX, centerY, 450, 0, Math.PI * 2);
          ctx.stroke();
        },
        color.getStyle()
      );

      // 내부 원
      drawGlowingLine(
        ctx,
        () => {
          ctx.beginPath();
          ctx.arc(centerX, centerY, 400, 0, Math.PI * 2);
          ctx.stroke();
        },
        color.getStyle()
      );

      // 외부 원과 내부 원 연결
      drawGlowingLine(
        ctx,
        () => {
          for (let i = 0; i < segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const outerX = centerX + Math.cos(angle) * 450;
            const outerY = centerY + Math.sin(angle) * 450;
            const innerX = centerX + Math.cos(angle) * 400;
            const innerY = centerY + Math.sin(angle) * 400;

            ctx.beginPath();
            ctx.moveTo(outerX, outerY);
            ctx.lineTo(innerX, innerY);
            ctx.stroke();
          }
        },
        color.getStyle(),
        false
      );

      // 첫 번째 오각형
      drawGlowingLine(
        ctx,
        () => {
          ctx.beginPath();
          for (let i = 0; i <= 5; i++) {
            const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
            const x = centerX + Math.cos(angle) * 300;
            const y = centerY + Math.sin(angle) * 300;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.stroke();
        },
        color.getStyle()
      );

      // 두 번째 오각형 (36도 회전)
      drawGlowingLine(
        ctx,
        () => {
          ctx.beginPath();
          for (let i = 0; i <= 5; i++) {
            const angle =
              (i / 5) * Math.PI * 2 - Math.PI / 2 + (36 * Math.PI) / 180;
            const x = centerX + Math.cos(angle) * 300;
            const y = centerY + Math.sin(angle) * 300;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.stroke();
        },
        color.getStyle()
      );

      // 가장 안쪽 원
      drawGlowingLine(
        ctx,
        () => {
          ctx.beginPath();
          ctx.arc(centerX, centerY, 150, 0, Math.PI * 2);
          ctx.stroke();
        },
        color.getStyle()
      );

      // 중앙의 별
      drawGlowingLine(
        ctx,
        () => {
          ctx.beginPath();
          for (let i = 0; i < 10; i++) {
            const angle = (i / 5) * Math.PI;
            const r = i % 2 === 0 ? 112.5 : 45;
            const x = centerX + Math.cos(angle) * r;
            const y = centerY + Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.stroke();
        },
        color.getStyle()
      );

      // 달 모양
      drawGlowingLine(
        ctx,
        () => {
          ctx.beginPath();
          ctx.arc(centerX + 187.5, centerY + 187.5, 60, 0, Math.PI * 2);
          ctx.moveTo(centerX + 187.5 + 48, centerY + 187.5);
          ctx.arc(centerX + 187.5, centerY + 187.5, 48, 0, Math.PI * 2, true);
          ctx.stroke();
        },
        color.getStyle()
      );
    };

    drawMagicCircle();

    return new THREE.CanvasTexture(canvas);
  }, [color]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setExpanding(true);
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  useFrame((state, delta) => {
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
      setExpansionProgress(prev => {
        const newProgress = prev + delta * expansionSpeed;
        return newProgress >= 1 ? 1 : newProgress;
      });

      const easedProgress = easeOutCubic(expansionProgress);
      const newPosition = [
        THREE.MathUtils.lerp(
          initialPosition[0],
          targetPosition[0],
          easedProgress
        ),
        THREE.MathUtils.lerp(
          initialPosition[1],
          targetPosition[1],
          easedProgress
        ),
        THREE.MathUtils.lerp(
          initialPosition[2],
          targetPosition[2],
          easedProgress
        ),
      ];
      setPosition(newPosition);
      const newScale = scale.map(s => s * (0.1 + 0.9 * easedProgress));
      setCurrentScale(newScale);

      if (expansionProgress >= 1) {
        setOrbiting(true);
      }
    } else if (orbiting) {
      setTransitionProgress(prev => {
        const newProgress = prev + delta / transitionDuration;
        return newProgress >= 1 ? 1 : newProgress;
      });

      const easedTransition = easeInOutCubic(transitionProgress);

      setOrbitAngle(prev => prev + orbitSpeed * delta * easedTransition);
      const orbitRadius = new THREE.Vector3(...targetPosition)
        .sub(new THREE.Vector3(...initialPosition))
        .length();
      const orbitPosition = new THREE.Vector3(...initialPosition).add(
        new THREE.Vector3().setFromSphericalCoords(
          orbitRadius,
          orbitAxis.y * Math.PI + orbitAngle,
          orbitAxis.x * Math.PI * 2
        )
      );

      const finalPosition = new THREE.Vector3(...position).lerp(
        orbitPosition,
        easedTransition
      );
      setPosition(finalPosition.toArray());

      const lookAtPosition = new THREE.Vector3(...initialPosition);
      ref.current.lookAt(lookAtPosition);
    }

    setIntensity(Math.abs(Math.sin(state.clock.getElapsedTime())) * 2);
  });

  return (
    <group>
      <mesh ref={ref} position={position} scale={currentScale}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={magicCircleTexture}
          transparent
          opacity={Math.min(opacity * 2, 1)}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

export function MagicCircleGroup({
  position = [0.005, 1.25, 0],
  visible = true,
  ...props
}) {
  const circles = useMemo(() => {
    const circleCount = 10; // 마법진 수를 10개로 설정
    const newCircles = [];

    for (let i = 0; i < circleCount; i++) {
      const angle = (i / circleCount) * Math.PI * 2;
      const randomAxis = new THREE.Vector3(
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5
      ).normalize();

      const rotationSize = 2.5; // 회전 반경을 약간 늘림
      const targetPosition = [
        position[0] + Math.cos(angle) * 0.35 * rotationSize,
        position[1] + Math.sin(angle) * 0.35 * rotationSize * Math.random(),
        position[2] + (Math.random() * 0.01 * rotationSize - 0.35), // Z축 변화 범위를 약간 늘림
        // position[0] + Math.cos(angle) * 0.35 * rotationSize,
        // position[1] + Math.sin(angle) * 0.35 * rotationSize,
        // position[2] + (0.01 * rotationSize - 0.35), // Z축 변화 범위를 약간 늘림
      ];

      const color = new THREE.Color(
        `hsl(${(i / circleCount) * 360}, 100%, 70%)`
      );
      const rotateSpeed = 0.01 + i * 0.05; // 회전 속도 조정
      const orbitSpeed = 0.1 + Math.random() * 0.01; // 공전 속도 약간 감소
      const expansionSpeed = 0.3 + Math.random() * 5; //! 확장단계 마법진 크기 변경방법2 : 확장 속도 범위 조정
      const circleSize = [1, 1, 1].map(value => value * 0.5); //! 마법진들 크기 설정

      newCircles.push(
        <MagicCircle
          key={i}
          initialPosition={position}
          targetPosition={targetPosition}
          scale={circleSize}
          color={color}
          rotateSpeed={rotateSpeed}
          initialRotationAxis={randomAxis}
          orbitAxis={randomAxis}
          orbitSpeed={orbitSpeed}
          expansionSpeed={expansionSpeed}
          visible={visible} //! visible이 true일 때마다 애니메이션 리셋
        />
      );
    }

    return newCircles;
  }, [position, visible]); // position 또는 visible이 변경될 때만 circles를 다시 계산

  return <group visible={visible}>{circles}</group>;
}

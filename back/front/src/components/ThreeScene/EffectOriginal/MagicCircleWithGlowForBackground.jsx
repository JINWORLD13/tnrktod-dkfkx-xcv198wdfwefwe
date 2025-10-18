
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSpring, animated } from '@react-spring/three';
import { limitFPS } from '../Utils/limitFPS';

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

export const MagicCircleWithGlow = function MagicCircleWithGlow({
  initialPosition = [0.005, 1.3, 0],
  targetPosition = [0, 1.3, 0],
  scale = 0.4, // 마법진 크기 조절
  color = new THREE.Color(`hsl(${(1 / 10) * 360}, 100%, 50%)`),
  rotateSpeed = 0.01 + 1 * 0.005,
  initialRotationAxis = new THREE.Vector3(1, 1, 1).normalize(),
  expansionSpeed = 0.5,
}) {
  const ref = useRef();
  const [position, setPosition] = useState(initialPosition);
  const [expanding, setExpanding] = useState(false); //! (중요) 초기값을 true로 하면 처음부터 확장된 모습으로 됨.
  const [orbiting, setOrbiting] = useState(false);
  const [intensity, setIntensity] = useState(1);
  const [expansionProgress, setExpansionProgress] = useState(0);
  const [opacity, setOpacity] = useState(0);
  const [currentScale, setCurrentScale] = useState(scale);
  const rotationRef = useRef(new THREE.Euler(0, 0, 0));
  const [preExpansionRotateSpeed, setPreExpansionRotateSpeed] = useState(
    rotateSpeed * 300
  ); // 기존 속도의 300배로 설정

  // glow 효과가 적용된 마법진 텍스처 생성
  const magicCircleTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1600;
    canvas.height = 1600;
    // canvas.width = 1024;
    // canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    const segments = 64;

    // 캔버스 중심점
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // 마법진 그리기 함수
    const drawMagicCircle = () => {
      // 외부 원
      drawGlowingLine(
        ctx,
        () => {
          ctx.beginPath();
          ctx.arc(centerX, centerY, 500, 0, Math.PI * 2);
          ctx.stroke();
        },
        color.getStyle()
      );

      // 내부 원
      drawGlowingLine(
        ctx,
        () => {
          ctx.beginPath();
          ctx.arc(centerX, centerY, 450, 0, Math.PI * 2);
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
            const outerX = centerX + Math.cos(angle) * 500;
            const outerY = centerY + Math.sin(angle) * 500;
            const innerX = centerX + Math.cos(angle) * 450;
            const innerY = centerY + Math.sin(angle) * 450;

            ctx.beginPath();
            ctx.moveTo(outerX, outerY);
            ctx.lineTo(innerX, innerY);
            ctx.stroke();
          }
        },
        color.getStyle(),
        false // glow 효과를 끄고 얇은 선으로 그립니다
      );

      // 첫 번째 오각형
      drawGlowingLine(
        ctx,
        () => {
          ctx.beginPath();
          for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
            const x = centerX + Math.cos(angle) * 350;
            const y = centerY + Math.sin(angle) * 350;
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
          for (let i = 0; i < 5; i++) {
            const angle =
              (i / 5) * Math.PI * 2 - Math.PI / 2 + (36 * Math.PI) / 180;
            const x = centerX + Math.cos(angle) * 350;
            const y = centerY + Math.sin(angle) * 350;
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
          ctx.arc(centerX, centerY, 200, 0, Math.PI * 2);
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
            const r = i % 2 === 0 ? 150 : 60;
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

      // 달 모양 (+ 0인 부분들이 전부 원래는 250이었다. 0으로해 서 이중 원이 가운데로 오게 함.)
      drawGlowingLine(
        ctx,
        () => {
          ctx.beginPath();
          ctx.arc(centerX + 0, centerY + 0, 80, 0, Math.PI * 2);
          ctx.moveTo(centerX + 0 + 64, centerY + 0);
          ctx.arc(centerX + 0, centerY + 0, 64, 0, Math.PI * 2, true);
          ctx.stroke();
        },
        color.getStyle()
      );
      // 다양한 달 모양 그리기
      function drawMoon(ctx, centerX, centerY, moonType = 'crescent') {
        const moonCenterX = centerX + 150;
        const moonCenterY = centerY - 0;
        const moonRadius = 200;

        drawGlowingLine(
          ctx,
          () => {
            ctx.beginPath();

            if (moonType === 'waning_crescent') {
              // 그믐달
              ctx.arc(
                moonCenterX,
                moonCenterY,
                moonRadius,
                -Math.PI / 2,
                Math.PI / 2
              );
              ctx.arc(
                moonCenterX - moonRadius * 0.3,
                moonCenterY,
                moonRadius * 0.9,
                Math.PI / 2,
                -Math.PI / 2,
                true
              );
            } else if (moonType === 'waxing_crescent') {
              // 초승달
              ctx.arc(
                moonCenterX,
                moonCenterY,
                moonRadius,
                Math.PI / 2,
                -Math.PI / 2
              );
              ctx.arc(
                moonCenterX + moonRadius * 0.3,
                moonCenterY,
                moonRadius * 0.9,
                -Math.PI / 2,
                Math.PI / 2,
                true
              );
            } else if (moonType === 'first_quarter') {
              // 상현달
              ctx.arc(
                moonCenterX,
                moonCenterY,
                moonRadius,
                -Math.PI / 2,
                Math.PI / 2
              );
              ctx.lineTo(moonCenterX, moonCenterY - moonRadius);
            } else {
              // 기본 보름달
              ctx.arc(moonCenterX, moonCenterY, moonRadius, 0, Math.PI * 2);
            }

            ctx.closePath();
            ctx.stroke();

            // 달의 음영 효과 (선택사항)
            if (moonType !== 'full') {
              ctx.fillStyle = color.getStyle();
              // ctx.fill();
            }
          },
          color.getStyle()
        );
      }

      // 사용 예시
      drawMoon(ctx, centerX, centerY, 'waning_crescent'); // 그믐달
      // drawMoon(ctx, centerX, centerY, 'waxing_crescent'); // 초승달
      // drawMoon(ctx, centerX, centerY, 'first_quarter'); // 상현달
      // drawMoon(ctx, centerX, centerY, 'full'); // 보름달
    };

    drawMagicCircle();

    return new THREE.CanvasTexture(canvas);
  }, [color]);

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
      // 확장 진행 상태 업데이트(expansionProgress)
      setExpansionProgress(prev => {
        const newProgress = prev + delta * expansionSpeed;
        return newProgress >= 1 ? 1 : newProgress;
      });

      // 이징 함수를 사용한 부드러운 확장 효과
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
        initialPosition[2], // z값 고정으로 배경과 평행 유지
      ];
      setPosition(newPosition);

      // 원래 크기의 3배까지 점진적으로 확대
      const newScale = scale * (1 + 2 * easedProgress);
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
        scale={[currentScale, currentScale, currentScale]}
      >
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
};

// 배경을 위한 마법진 그룹 애니메이션 (중앙에서 원형으로 확장)
export function MagicCircleGroupForBackground({
  position = [0.005, 1.25, 0],
  setDoneAnimationOfBackground,
  visible,
  ...props
}) {
  const [key, setKey] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const circles = [];
  const 궤적 = '원'; // 원, 반원
  const circleCount = 8;
  const spreadRadius = 1;
  const zRange = 0;
  // useFrame(limitFPS((state, delta) => {
  //   // 여기에 업데이트 로직을 작성합니다.
  // }));

  useEffect(() => {
    if (visible && !isAnimating) {
      setIsAnimating(true);
      setKey(prevKey => prevKey + 1);
      const animatingTime = setTimeout(() => {
        setIsAnimating(false);
      }, 3000);
      const DoneAnimationOfBackgroundtime = setTimeout(() => {
        setDoneAnimationOfBackground(true);
      }, 6000);
      return () => {
        clearTimeout(animatingTime);
        clearTimeout(DoneAnimationOfBackgroundtime);
      };
    } else if (!visible) {
      setIsAnimating(false);
    }
  }, [visible, setDoneAnimationOfBackground]);

  for (let i = 0; i < circleCount; i++) {
    let angle;
    let randomAxis;
    let targetPosition;
    if (궤적 === '원') {
      angle = (i / circleCount) * Math.PI * 2;
      randomAxis = new THREE.Vector3(
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5
      ).normalize();
      targetPosition = [
        position[0] + Math.cos(angle) * spreadRadius,
        position[1] + Math.sin(angle) * spreadRadius,
        position[2] + (Math.random() - 0.5) * zRange,
      ];
    } else if (궤적 === '반원') {
      // 균일한 분포를 위해 각도 계산 방식 변경
      angle = (i / (circleCount - 1)) * Math.PI;

      randomAxis = new THREE.Vector3(
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5
      ).normalize();

      // 반원 내 균일 분포를 위한 위치 계산
      targetPosition = [
        position[0] + Math.cos(angle) * spreadRadius,
        position[1] + Math.sin(angle) * spreadRadius,
        position[2] + (Math.random() - 0.5) * zRange,
      ];
    }

    const color = new THREE.Color(`hsl(${(i / circleCount) * 360}, 100%, 70%)`);
    const rotateSpeed = 0.01 + i * 0.03;
    const expansionSpeed = 0.5 + Math.random() * 0.1;

    circles.push(
      <MagicCircleWithGlow
        key={`${i}-${key}`}
        initialPosition={position}
        targetPosition={targetPosition}
        color={color}
        rotateSpeed={rotateSpeed}
        initialRotationAxis={randomAxis}
        expansionSpeed={expansionSpeed}
        {...props}
      />
    );
  }

  return <group visible={visible}>{circles}</group>;
}

// import React, { useRef, useState, useEffect, useMemo } from "react";
// import { useFrame } from "@react-three/fiber";

// import { useSpring, animated } from "@react-spring/three";

// // 이징 함수
// function easeOutCubic(t) {
//   return 1 - Math.pow(1 - t, 3);
// }

// function easeInOutCubic(t) {
//   return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
// }

// // glow 효과가 적용된 선 그리기 함수
// function drawGlowingLine(ctx, drawFunc, color, useGlow = true) {
//   ctx.save();
//   if (useGlow) {
//     ctx.shadowColor = color;
//     ctx.shadowBlur = 40;
//     ctx.strokeStyle = color;
//     ctx.lineWidth = 3;
//     for (let i = 0; i < 10; i++) {
//       drawFunc();
//     }
//   } else {
//     ctx.strokeStyle = color;
//     ctx.lineWidth = 2;
//     drawFunc();
//   }
//   ctx.restore();
// }

// export const MagicCircleWithGlow = function MagicCircleWithGlow({
//   initialPosition = [0.005, 1.3, 0],
//   targetPosition = [0, 1.3, 0],
//   scale = 0.4, // 마법진 크기 조절
//   color = new THREE.Color(`hsl(${(1 / 10) * 360}, 100%, 50%)`),
//   rotateSpeed = 0.01 + 1 * 0.005,
//   initialRotationAxis = new THREE.Vector3(1, 1, 1).normalize(),
//   expansionSpeed = 0.5,
// }) {
//   const ref = useRef();
//   const [position, setPosition] = useState(initialPosition);
//   const [expanding, setExpanding] = useState(false);
//   const [orbiting, setOrbiting] = useState(false);
//   const [intensity, setIntensity] = useState(1);
//   const [expansionProgress, setExpansionProgress] = useState(0);
//   const [opacity, setOpacity] = useState(0);
//   const [currentScale, setCurrentScale] = useState(scale);
//   const rotationRef = useRef(new THREE.Euler(0, 0, 0));
//   const [preExpansionRotateSpeed, setPreExpansionRotateSpeed] = useState(
//     rotateSpeed * 300
//   ); // 기존 속도의 300배로 설정

//   // glow 효과가 적용된 마법진 텍스처 생성
//   const magicCircleTexture = useMemo(() => {
//     const canvas = document.createElement("canvas");
//     canvas.width = 1600;
//     canvas.height = 1600;
//     // canvas.width = 1024;
//     // canvas.height = 1024;
//     const ctx = canvas.getContext("2d");
//     const segments = 64;

//     // 캔버스 중심점
//     const centerX = canvas.width / 2;
//     const centerY = canvas.height / 2;

//     // 마법진 그리기 함수
//     const drawMagicCircle = () => {
//       // 외부 원
//       drawGlowingLine(
//         ctx,
//         () => {
//           ctx.beginPath();
//           ctx.arc(centerX, centerY, 500, 0, Math.PI * 2);
//           ctx.stroke();
//         },
//         color.getStyle()
//       );

//       // 내부 원
//       drawGlowingLine(
//         ctx,
//         () => {
//           ctx.beginPath();
//           ctx.arc(centerX, centerY, 450, 0, Math.PI * 2);
//           ctx.stroke();
//         },
//         color.getStyle()
//       );

//       // 외부 원과 내부 원 연결
//       drawGlowingLine(
//         ctx,
//         () => {
//           for (let i = 0; i < segments; i++) {
//             const angle = (i / segments) * Math.PI * 2;
//             const outerX = centerX + Math.cos(angle) * 500;
//             const outerY = centerY + Math.sin(angle) * 500;
//             const innerX = centerX + Math.cos(angle) * 450;
//             const innerY = centerY + Math.sin(angle) * 450;

//             ctx.beginPath();
//             ctx.moveTo(outerX, outerY);
//             ctx.lineTo(innerX, innerY);
//             ctx.stroke();
//           }
//         },
//         color.getStyle(),
//         false // glow 효과를 끄고 얇은 선으로 그립니다
//       );

//       // 첫 번째 오각형
//       drawGlowingLine(
//         ctx,
//         () => {
//           ctx.beginPath();
//           for (let i = 0; i < 5; i++) {
//             const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
//             const x = centerX + Math.cos(angle) * 350;
//             const y = centerY + Math.sin(angle) * 350;
//             if (i === 0) ctx.moveTo(x, y);
//             else ctx.lineTo(x, y);
//           }
//           ctx.closePath();
//           ctx.stroke();
//         },
//         color.getStyle()
//       );

//       // 두 번째 오각형 (36도 회전)
//       drawGlowingLine(
//         ctx,
//         () => {
//           ctx.beginPath();
//           for (let i = 0; i < 5; i++) {
//             const angle =
//               (i / 5) * Math.PI * 2 - Math.PI / 2 + (36 * Math.PI) / 180;
//             const x = centerX + Math.cos(angle) * 350;
//             const y = centerY + Math.sin(angle) * 350;
//             if (i === 0) ctx.moveTo(x, y);
//             else ctx.lineTo(x, y);
//           }
//           ctx.closePath();
//           ctx.stroke();
//         },
//         color.getStyle()
//       );

//       // 가장 안쪽 원
//       drawGlowingLine(
//         ctx,
//         () => {
//           ctx.beginPath();
//           ctx.arc(centerX, centerY, 200, 0, Math.PI * 2);
//           ctx.stroke();
//         },
//         color.getStyle()
//       );

//       // 중앙의 별
//       drawGlowingLine(
//         ctx,
//         () => {
//           ctx.beginPath();
//           for (let i = 0; i < 10; i++) {
//             const angle = (i / 5) * Math.PI;
//             const r = i % 2 === 0 ? 150 : 60;
//             const x = centerX + Math.cos(angle) * r;
//             const y = centerY + Math.sin(angle) * r;
//             if (i === 0) ctx.moveTo(x, y);
//             else ctx.lineTo(x, y);
//           }
//           ctx.closePath();
//           ctx.stroke();
//         },
//         color.getStyle()
//       );

//       // 달 모양 (+ 0인 부분들이 전부 원래는 250이었다. 0으로해 서 이중 원이 가운데로 오게 함.)
//       drawGlowingLine(
//         ctx,
//         () => {
//           ctx.beginPath();
//           ctx.arc(centerX + 0, centerY + 0, 80, 0, Math.PI * 2);
//           ctx.moveTo(centerX + 0 + 64, centerY + 0);
//           ctx.arc(centerX + 0, centerY + 0, 64, 0, Math.PI * 2, true);
//           ctx.stroke();
//         },
//         color.getStyle()
//       );
//       // 다양한 달 모양 그리기
//       function drawMoon(ctx, centerX, centerY, moonType = "crescent") {
//         const moonCenterX = centerX + 150;
//         const moonCenterY = centerY - 0;
//         const moonRadius = 200;

//         drawGlowingLine(
//           ctx,
//           () => {
//             ctx.beginPath();

//             if (moonType === "waning_crescent") {
//               // 그믐달
//               ctx.arc(
//                 moonCenterX,
//                 moonCenterY,
//                 moonRadius,
//                 -Math.PI / 2,
//                 Math.PI / 2
//               );
//               ctx.arc(
//                 moonCenterX - moonRadius * 0.3,
//                 moonCenterY,
//                 moonRadius * 0.9,
//                 Math.PI / 2,
//                 -Math.PI / 2,
//                 true
//               );
//             } else if (moonType === "waxing_crescent") {
//               // 초승달
//               ctx.arc(
//                 moonCenterX,
//                 moonCenterY,
//                 moonRadius,
//                 Math.PI / 2,
//                 -Math.PI / 2
//               );
//               ctx.arc(
//                 moonCenterX + moonRadius * 0.3,
//                 moonCenterY,
//                 moonRadius * 0.9,
//                 -Math.PI / 2,
//                 Math.PI / 2,
//                 true
//               );
//             } else if (moonType === "first_quarter") {
//               // 상현달
//               ctx.arc(
//                 moonCenterX,
//                 moonCenterY,
//                 moonRadius,
//                 -Math.PI / 2,
//                 Math.PI / 2
//               );
//               ctx.lineTo(moonCenterX, moonCenterY - moonRadius);
//             } else {
//               // 기본 보름달
//               ctx.arc(moonCenterX, moonCenterY, moonRadius, 0, Math.PI * 2);
//             }

//             ctx.closePath();
//             ctx.stroke();

//             // 달의 음영 효과 (선택사항)
//             if (moonType !== "full") {
//               ctx.fillStyle = color.getStyle();
//               // ctx.fill();
//             }
//           },
//           color.getStyle()
//         );
//       }

//       // 사용 예시
//       drawMoon(ctx, centerX, centerY, "waning_crescent"); // 그믐달
//       // drawMoon(ctx, centerX, centerY, 'waxing_crescent'); // 초승달
//       // drawMoon(ctx, centerX, centerY, 'first_quarter'); // 상현달
//       // drawMoon(ctx, centerX, centerY, 'full'); // 보름달
//     };

//     drawMagicCircle();

//     return new THREE.CanvasTexture(canvas);
//   }, [color]);

//   // 컴포넌트가 마운트된 후 3초 후에 확장 시작
//   useEffect(() => {
//     const timeout = setTimeout(() => {
//       setExpanding(true);
//     }, 3000);

//     return () => clearTimeout(timeout);
//   }, []);

//   // 매 프레임마다 실행되는 업데이트 함수
//   useFrame((state, delta) => {
//     // 불투명도 점진적 증가
//     if (opacity < 1) {
//       setOpacity((prev) => Math.min(prev + delta, 0.5));
//     }

//     if (!expanding && !orbiting) {
//       rotationRef.current.x +=
//         preExpansionRotateSpeed * initialRotationAxis.x * delta;
//       rotationRef.current.y +=
//         preExpansionRotateSpeed * initialRotationAxis.y * delta;
//       rotationRef.current.z +=
//         preExpansionRotateSpeed * initialRotationAxis.z * delta;
//       ref.current.setRotationFromEuler(rotationRef.current);
//     } else if (expanding && !orbiting) {
//       // 확장 진행 상태 업데이트
//       setExpansionProgress((prev) => {
//         const newProgress = prev + delta * expansionSpeed;
//         return newProgress >= 1 ? 1 : newProgress;
//       });

//       // 이징 함수를 사용한 부드러운 확장 효과
//       const easedProgress = easeOutCubic(expansionProgress);
//       const newPosition = [
//         THREE.MathUtils.lerp(
//           initialPosition[0],
//           targetPosition[0],
//           easedProgress
//         ),
//         THREE.MathUtils.lerp(
//           initialPosition[1],
//           targetPosition[1],
//           easedProgress
//         ),
//         initialPosition[2], // z값 고정으로 배경과 평행 유지
//       ];
//       setPosition(newPosition);

//       // 원래 크기의 3배까지 점진적으로 확대
//       const newScale = scale * (1 + 2 * easedProgress);
//       setCurrentScale(newScale);

//       // 확장이 완료되면 공전 상태로 전환
//       if (expansionProgress >= 1) {
//         setOrbiting(true);
//       }

//       // 마법진이 화면과 평행하도록 회전 조정
//       ref.current.rotation.x = 0;
//       ref.current.rotation.y = 0;
//     } else if (orbiting) {
//       // 공전 로직 제거, 최종 위치에 고정
//       setPosition(targetPosition);

//       // 마법진이 화면과 평행하도록 유지
//       ref.current.rotation.x = 0;
//       ref.current.rotation.y = 0;
//     }

//     // 자전 로직 추가 (z축 회전만 유지)
//     ref.current.rotation.z += rotateSpeed * delta;

//     // 빛의 강도 변화 (깜박임 효과)
//     setIntensity(Math.abs(Math.sin(state.clock.getElapsedTime())) * 2);
//   });

//   // 마법진 렌더링
//   return (
//     <group>
//       <mesh
//         ref={ref}
//         position={position}
//         scale={[currentScale, currentScale, currentScale]}
//       >
//         <planeGeometry args={[1, 1]} />
//         <meshBasicMaterial
//           map={magicCircleTexture}
//           transparent
//           opacity={Math.min(opacity * 2, 1)}
//           side={THREE.DoubleSide}
//           depthWrite={false}
//         />
//       </mesh>
//     </group>
//   );
// }

// // 배경을 위한 마법진 그룹 애니메이션 (중앙에서 원형으로 확장)
// export function MagicCircleGroupForBackground({
//   position = [0.005, 1.25, 0],
//   setDoneAnimationOfBackground,
//   visible,
//   ...props
// }) {
//   const circles = [];
//   const circleCount = 8; // 마법진 수
//   const spreadRadius = 1; // 마법진이 배치되어 만드는 원의 반경
//   const zRange = 0; // 마법진들의 z값

//   useEffect(() => {
//     let time = setTimeout(() => {
//       setDoneAnimationOfBackground(true);
//     }, 3500);
//     return () => {
//       clearTimeout(time);
//     };
//   }, [visible]);

//   for (let i = 0; i < circleCount; i++) {
//     const angle = (i / circleCount) * Math.PI * 2; // 360도 주위에 균등하게 분포
//     const randomAxis = new THREE.Vector3(
//       Math.random() - 0.5,
//       Math.random() - 0.5,
//       Math.random() - 0.5
//     ).normalize();

//     //! 마법진 궤도 반경 결정
//     const targetPosition = [
//       position[0] + Math.cos(angle) * spreadRadius,
//       position[1] + Math.sin(angle) * spreadRadius,
//       position[2] + (Math.random() - 0.5) * zRange, // 범위 내 무작위 z 값
//     ];

//     const color = new THREE.Color(`hsl(${(i / circleCount) * 360}, 100%, 70%)`);
//     const rotateSpeed = 0.01 + i * 0.03; // 회전 속도 변화 감소
//     const expansionSpeed = 0.5 + Math.random() * 0.1; // 확장 속도 변화 감소
//     // const circleScale = 0.4; // 마법진 크기 조절

//     circles.push(
//       <MagicCircleWithGlow
//         key={i}
//         initialPosition={position}
//         targetPosition={targetPosition}
//         // scale={circleScale}
//         color={color}
//         rotateSpeed={rotateSpeed}
//         initialRotationAxis={randomAxis}
//         expansionSpeed={expansionSpeed}
//         {...props}
//       />
//     );
//   }
//   // if(!visible) return;
//   return <group visible={visible}>{circles}</group>;
// }

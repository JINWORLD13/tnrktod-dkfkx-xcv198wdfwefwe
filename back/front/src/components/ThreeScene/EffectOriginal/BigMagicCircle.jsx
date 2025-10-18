import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sparkles, Shadow, Billboard, useTexture } from '@react-three/drei';
import { LayerMaterial, Depth } from 'lamina';
import { useSpring, animated } from '@react-spring/three';
import { useFrame, useThree } from '@react-three/fiber';

export function BigMagicCircle({
  count = 10,
  speed = 0.5,
  color = 'white',
  radius = 2,
  position = [0.005, 1.25, 0.7],
  orbitRadius = 1, // 마법진 크기 조절
  visible,
  ...props
}) {
  const particlesRef = useRef();
  const magicParticlesRef = useRef();
  const orbitingSparklesRefs = useRef(
    Array(10)
      .fill()
      .map(() => React.createRef())
  );
  const { scene } = useThree();
  useEffect(() => {
    return () => {
      scene.traverse(object => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(mat => mat.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    };
  }, [scene]);
  // Create initial positions for particles
  const positions = useMemo(() => {
    return new Float32Array(count * 3).map((_, i) => {
      const angle = (i / count) * Math.PI * 200;
      return i % 3 === 1
        ? 0
        : Math.cos(angle) * radius * (i % 3 === 0 ? 1 : -1);
    });
  }, [count, radius]);

  // Create positions for magic circle particles
  const magicPositions = useMemo(() => {
    const points = [];
    const segments = 64;
    const innerRadius = 0.4;
    const outerRadius = 0.6;

    // Outer circle
    for (let i = 0; i < segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      points.push(
        Math.cos(theta) * outerRadius,
        Math.sin(theta) * outerRadius,
        0
      );
    }

    // Inner circle
    for (let i = 0; i < segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      points.push(
        Math.cos(theta) * innerRadius,
        Math.sin(theta) * innerRadius,
        0
      );
    }

    // Pentagram
    for (let i = 0; i < 5; i++) {
      const theta1 = (i / 5) * Math.PI * 2;
      const theta2 = (((i + 2) % 5) / 5) * Math.PI * 2;
      points.push(
        Math.cos(theta1) * outerRadius,
        Math.sin(theta1) * outerRadius,
        0,
        Math.cos(theta2) * outerRadius,
        Math.sin(theta2) * outerRadius,
        0
      );
    }

    // Add some random points inside for sparkle effect
    for (let i = 0; i < 50; i++) {
      const r = Math.random() * innerRadius;
      const theta = Math.random() * Math.PI * 2;
      points.push(Math.cos(theta) * r, Math.sin(theta) * r, 0);
    }

    return new Float32Array(points);
  }, []);

  // useEffect(() => {
  //   if (particlesRef.current) {
  //     const geometry = particlesRef.current.geometry;
  //     if (geometry.attributes.position) {
  //       geometry.attributes.position.array.set(positions);
  //       geometry.attributes.position.needsUpdate = true;
  //     } else {
  //       const positionAttribute = new THREE.BufferAttribute(positions, 3);
  //       geometry.setAttribute('position', positionAttribute);
  //     }
  //   }

  //   if (magicParticlesRef.current) {
  //     const geometry = magicParticlesRef.current.geometry;
  //     if (geometry.attributes.position) {
  //       geometry.attributes.position.array.set(magicPositions);
  //       geometry.attributes.position.needsUpdate = true;
  //     } else {
  //       const positionAttribute = new THREE.BufferAttribute(magicPositions, 3);
  //       geometry.setAttribute('position', positionAttribute);
  //     }
  //   }

  //   return () => {
  //     if (particlesRef.current && particlesRef.current.geometry) {
  //       const geometry = particlesRef.current.geometry;
  //       const positionAttribute = geometry.attributes.position;
  //       if (positionAttribute) {
  //         geometry.deleteAttribute('position');
  //         positionAttribute.array = null;
  //         positionAttribute.dispose();
  //       }
  //       geometry.dispose();
  //       particlesRef.current = null;
  //     }

  //     if (magicParticlesRef.current && magicParticlesRef.current.geometry) {
  //       const geometry = magicParticlesRef.current.geometry;
  //       const positionAttribute = geometry.attributes.position;
  //       if (positionAttribute) {
  //         geometry.deleteAttribute('position');
  //         positionAttribute.array = null;
  //         positionAttribute.dispose();
  //       }
  //       geometry.dispose();
  //       magicParticlesRef.current = null;
  //     }
  //   };
  // }, [positions, magicPositions]);

  // Animation
  useFrame((state, delta) => {
    if (
      particlesRef.current &&
      particlesRef.current.geometry.attributes.position
    ) {
      const time = state.clock.getElapsedTime();
      const positionAttribute =
        particlesRef.current.geometry.attributes.position;
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const angle = (i / count) * Math.PI * 2 + time * speed;
        positionAttribute.array[i3] = Math.cos(angle) * radius;
        positionAttribute.array[i3 + 1] = Math.sin(time + i) * 0.2; // Add some vertical movement
        positionAttribute.array[i3 + 2] = Math.sin(angle) * radius;
      }
      positionAttribute.needsUpdate = true;
    }
    if (
      magicParticlesRef.current &&
      magicParticlesRef.current.geometry.attributes.position
    ) {
      const time = state.clock.getElapsedTime();
      const positionAttribute =
        magicParticlesRef.current.geometry.attributes.position;
      for (let i = 0; i < positionAttribute.count; i++) {
        const i3 = i * 3;
        const x = positionAttribute.array[i3];
        const y = positionAttribute.array[i3 + 1];
        const z = positionAttribute.array[i3 + 2];

        // Add some movement to the particles
        positionAttribute.array[i3] = x + Math.sin(time + i) * 0.001;
        positionAttribute.array[i3 + 1] = y + Math.cos(time + i) * 0.001;
        positionAttribute.array[i3 + 2] = z + Math.sin(time * 0.5 + i) * 0.001;
      }
      positionAttribute.needsUpdate = true;
    }
    // Animate orbiting Sparkles
    orbitingSparklesRefs.current.forEach((ref, index) => {
      if (ref.current) {
        const orbitTime =
          state.clock.getElapsedTime() * speed + (index * Math.PI * 2) / 10;
        ref.current.position.x = Math.cos(orbitTime) * orbitRadius;
        ref.current.position.y = Math.sin(orbitTime) * orbitRadius * 0.5;
        ref.current.position.z = Math.sin(orbitTime) * orbitRadius;
      }
    });
  });

  const magicCircleRef = useRef();

  // Magic circle texture
  const magicCircleTexture = useMemo(() => {
    // 캔버스 생성
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // 마법진 그리기 (drawMagicCircle은 사용자가 정의한 함수로 가정)
    drawMagicCircle(ctx, canvas.width / 2, canvas.height / 2, 0, color);

    // 텍스처 생성
    return new THREE.CanvasTexture(canvas);
  }, [color]);

  // 컴포넌트 언마운트 또는 color 변경 시 이전 텍스처 정리
  useEffect(() => {
    return () => {
      // 텍스처가 WebGL 리소스를 해제하도록 dispose 호출
      magicCircleTexture.dispose();
    };
  }, [magicCircleTexture]);

  // Animation
  useFrame((state, delta) => {
    if (magicCircleRef.current) {
      magicCircleRef.current.rotation.z += delta * speed;
    }
  });

  // Magic circle drawing function

  function drawMagicCircle(
    ctx,
    centerX,
    centerY,
    time,
    color,
    useGlow = true, //! 글로우 효과 켜기(true) 및 끄기(false)
    fontWeight = '100' //~ normal, bold, 100~900으로 굴기 조절
  ) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    function drawGlowingText(text, x, y, color, size = '12rem', rotation = 0) {
      ctx.save();
      ctx.font = `${fontWeight} ${size} Arial`;
      ctx.translate(x, y);
      ctx.rotate(rotation);
      if (useGlow) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 3;
        ctx.fillStyle = color;
        for (let i = 0; i < 20; i++) {
          ctx.fillText(text, 0, 0);
        }
      }
      ctx.fillStyle = useGlow ? 'rgb(255, 255, 255, 0.7)' : color;
      ctx.fillText(text, 0, 0);
      ctx.restore();
    }

    function drawGlowingLine(drawFunc, color) {
      ctx.save();
      if (useGlow) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
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

    // Outer circle
    drawGlowingLine(() => {
      ctx.beginPath();
      ctx.arc(centerX, centerY, 240, 0, Math.PI * 2);
      ctx.stroke();
    }, color);

    // Inner circle
    drawGlowingLine(() => {
      ctx.beginPath();
      ctx.arc(centerX, centerY, 200, 0, Math.PI * 2);
      ctx.stroke();
    }, color);

    // Original hexagon
    drawGlowingLine(() => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i + time;
        const x = centerX + 220 * Math.cos(angle);
        const y = centerY + 220 * Math.sin(angle);
        ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    }, color);

    // Rotated hexagon
    drawGlowingLine(() => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i + time + Math.PI / 6;
        const x = centerX + 220 * Math.cos(angle);
        const y = centerY + 220 * Math.sin(angle);
        ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    }, color);

    // Connecting outer and inner circles
    drawGlowingLine(() => {
      const segments = 60;
      ctx.beginPath();
      for (let i = 0; i < segments; i++) {
        const angle = ((Math.PI * 2) / segments) * i;
        const xOuter = centerX + 240 * Math.cos(angle);
        const yOuter = centerY + 240 * Math.sin(angle);
        const xInner = centerX + 200 * Math.cos(angle);
        const yInner = centerY + 200 * Math.sin(angle);
        ctx.moveTo(xOuter, yOuter);
        ctx.lineTo(xInner, yInner);
      }
      ctx.stroke();
    }, color);

    // Runic characters or symbols

    // drawGlowingText("✧", centerX + 20, centerY - 40, "rgb(173, 216, 230)");
    // drawGlowingText("☽", centerX - 140, centerY + 140, "rgb(173, 216, 230)");
    // drawGlowingText("☉", centerX - 180, centerY - 30, "rgb(255, 165, 0)");
    // drawGlowingText("✦", centerX + 20, centerY + 160, "rgb(255, 165, 0)");

    // drawGlowingText("☽", centerX + 120, centerY + 60, "rgb(128, 0, 128)");
    // drawGlowingText("☉", centerX - 80, centerY + 240, "rgb(255, 215, 0)");
    // drawGlowingText("✦", centerX - 70, centerY - 110, "rgb(255, 215, 0)");
    // drawGlowingText("✧", centerX - 260, centerY + 50, "rgb(128, 0, 128)");

    // drawGlowingText("☽", centerX + 150, centerY + 60, "rgb(128, 0, 128)");
    // drawGlowingText("☉", centerX - 80, centerY + 280, "rgb(255, 215, 0)");
    // drawGlowingText("✦", centerX - 70, centerY - 150, "rgb(255, 215, 0)");
    // drawGlowingText("✧", centerX - 300, centerY + 60, "rgb(128, 0, 128)");

    drawGlowingText('✧', centerX + 70, centerY - 90, 'blue');
    drawGlowingText(
      '☽',
      centerX - 160,
      centerY + 60,
      'rgb(128, 0, 128)',
      '12rem',
      Math.PI / 1.3
    );
    drawGlowingText('☉', centerX - 230, centerY - 90, 'red');
    drawGlowingText('✦', centerX + 80, centerY + 220, 'rgb(255, 215, 0)');
  }
  return (
    <>
      <group position={position} visible={visible}>
        {/* <mesh>
          <Sparkles
            ref={sparklesRef}
            count={count}
            scale={scale}
            size={size * 20}
            speed={speed}
            noise={0}
          />
        </mesh> */}
        <mesh ref={magicCircleRef}>
          <planeGeometry args={[orbitRadius * 2, orbitRadius * 2]} />
          <meshBasicMaterial
            map={magicCircleTexture}
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      </group>
    </>
  );
}

import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sparkles, Shadow, Billboard, useTexture, Instance, Instances } from '@react-three/drei';
import { LayerMaterial, Depth } from 'lamina';
import { useSpring, animated } from '@react-spring/three';
import { useFrame } from '@react-three/fiber';

export function GlowingSparkle({
  count = 10,
  scale = 0,
  size = 0.01,  // 구 크기를 조정했습니다
  speed = 0.5,
  color = 'white',
  radius = 1,
  position = [0.005, 1.1, 0.7],
  orbitRadius = 0.5,
  emissive,
  visible,
  ...props
}) {
  const sparklesRef = useRef();
  const particlesRef = useRef();
  const magicParticlesRef = useRef();
  const orbitingSparklesRefs = useRef(
    Array(10)
      .fill()
      .map(() => React.createRef())
  );

  // 주 입자들의 초기 위치와 크기 생성
  const particleData = useMemo(() => {
    const data = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 200;
      data.push({
        position: [
          Math.cos(angle) * radius,
          0,
          Math.sin(angle) * radius
        ],
        scale: [size, size, size]
      });
    }
    return data;
  }, [count, radius, size]);

  // 매직 서클 입자들의 위치와 크기 생성
  const magicParticleData = useMemo(() => {
    const data = [];
    const segments = 64;
    const innerRadius = 0.4;
    const outerRadius = 0.6;

    // 외부 원
    for (let i = 0; i < segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      data.push({
        position: [Math.cos(theta) * outerRadius, Math.sin(theta) * outerRadius, 0],
        scale: [size * 0.5, size * 0.5, size * 0.5]
      });
    }

    // 내부 원
    for (let i = 0; i < segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      data.push({
        position: [Math.cos(theta) * innerRadius, Math.sin(theta) * innerRadius, 0],
        scale: [size * 0.5, size * 0.5, size * 0.5]
      });
    }

    // 오각형
    for (let i = 0; i < 5; i++) {
      const theta1 = (i / 5) * Math.PI * 2;
      const theta2 = (((i + 2) % 5) / 5) * Math.PI * 2;
      data.push(
        {
          position: [Math.cos(theta1) * outerRadius, Math.sin(theta1) * outerRadius, 0],
          scale: [size * 0.5, size * 0.5, size * 0.5]
        },
        {
          position: [Math.cos(theta2) * outerRadius, Math.sin(theta2) * outerRadius, 0],
          scale: [size * 0.5, size * 0.5, size * 0.5]
        }
      );
    }

    // 내부에 랜덤한 위치의 입자 추가
    for (let i = 0; i < 50; i++) {
      const r = Math.random() * innerRadius;
      const theta = Math.random() * Math.PI * 2;
      data.push({
        position: [Math.cos(theta) * r, Math.sin(theta) * r, 0],
        scale: [size * 0.3, size * 0.3, size * 0.3]
      });
    }

    return data;
  }, [size]);

  // 애니메이션
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // 주 입자 애니메이션
    particlesRef.current.children.forEach((child, i) => {
      const angle = (i / count) * Math.PI * 2 + time * speed;
      child.position.x = Math.cos(angle) * radius;
      child.position.y = Math.sin(time + i) * 0.2; // 수직 움직임 추가
      child.position.z = Math.sin(angle) * radius;
    });

    // 매직 입자 애니메이션
    magicParticlesRef.current.children.forEach((child, i) => {
      child.position.x += Math.sin(time + i) * 0.001;
      child.position.y += Math.cos(time + i) * 0.001;
      child.position.z += Math.sin(time * 0.5 + i) * 0.001;
    });

    // 궤도를 도는 Sparkles 애니메이션
    orbitingSparklesRefs.current.forEach((ref, index) => {
      if (ref.current) {
        const orbitTime = time * speed + (index * Math.PI * 2) / 10;
        ref.current.position.x = Math.cos(orbitTime) * orbitRadius - 0.18;
        ref.current.position.y = Math.sin(orbitTime) * orbitRadius * 0.5;
        ref.current.position.z = Math.sin(orbitTime) * orbitRadius;
      }
    });
  });

  return (
    <>
      <group position={position} visible={visible}>
        <mesh>
          {/* Sparkles 컴포넌트는 주석 처리되어 있어 그대로 유지했습니다 */}
        </mesh>
        <group>
          {orbitingSparklesRefs.current.map((ref, index) => (
            <Sparkles
              key={index}
              ref={ref}
              count={1}
              scale={scale / 2}
              size={size * 10}
              speed={0}
              noise={0}
            />
          ))}
          <Instances limit={count} ref={particlesRef}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshBasicMaterial color={color} transparent opacity={0.8} />
            {particleData.map((data, i) => (
              <Instance key={i} position={data.position} scale={data.scale} />
            ))}
          </Instances>
          <Instances limit={magicParticleData.length} ref={magicParticlesRef}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshBasicMaterial color={color} transparent opacity={0.8} />
            {magicParticleData.map((data, i) => (
              <Instance key={i} position={data.position} scale={data.scale} />
            ))}
          </Instances>
        </group>
      </group>
    </>
  );
}
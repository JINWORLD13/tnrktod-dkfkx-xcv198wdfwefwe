import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
export function EmissiveGoldenMesh({ nodes, materials }) {
  const meshRef = useRef();

  // 황금색 정의
  const goldenColor = new THREE.Color('#FFD700'); // 더 진한 황금색

  // 새로운 material 생성
  const emissiveMaterial = new THREE.MeshStandardMaterial({
    color: materials['Material_0.012'].color, // 기존 색상 유지
    emissive: goldenColor, // 발광 색상을 황금색으로 설정
    emissiveIntensity: 1, // 발광 강도를 낮춤
    metalness: 1, // 금속성 추가
    roughness: 1, // 광택 추가
  });

  // 애니메이션을 위한 useFrame 사용 (선택사항)
  useFrame((state, delta) => {
    if (meshRef.current) {
      // 발광 강도를 0.2에서 0.4 사이에서 변화
      meshRef.current.material.emissiveIntensity =
        1 + (Math.sin(state.clock.elapsedTime) + 1) * 2;
    }
  });

  return (
    <mesh
      ref={meshRef}
      geometry={nodes.Mesh_0011.geometry}
      material={emissiveMaterial}
      position={[0, 0.376, -0.724]}
      scale={0.511}
    />
  );
}

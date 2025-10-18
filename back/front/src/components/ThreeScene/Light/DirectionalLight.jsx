import React, { useRef } from 'react';
import {
  useHelper,
} from '@react-three/drei';
import { DirectionalLightHelper } from 'three';

export default function DirectionalLight(props) {
  const lightRef = useRef(); // 싱글톤이니 매번 새로 생성한다면 따로 모듈로 분리하지 않는게 좋음.
  
  // useHelper(lightRef, DirectionalLightHelper, 'cyan'); // helper 사용하려고 일부로 컴포넌트 분리시킴
  return (
    <>
        <directionalLight
          position={[0, 5, 5]}
          intensity={5}
          ref={lightRef}
          color={'yellow'}
          shadow-mapSize={[1024, 1024]}
          castShadow
        >
          <orthographicCamera attach="shadow-camera" args={[3, 0, 0, 0]} />
        </directionalLight>
    </>
  );
}

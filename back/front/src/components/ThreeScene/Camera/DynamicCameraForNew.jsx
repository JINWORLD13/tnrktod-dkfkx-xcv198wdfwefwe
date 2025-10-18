import React from 'react';
import { useFrame, useThree, extend } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import { MathUtils, PerspectiveCamera, Vector3 } from 'three';
extend({ PerspectiveCamera: PerspectiveCamera });
export const DynamicCameraForNew = ({
  isWaiting = false,
  isAnswered = false,
  isReadyToShowDurumagi = false,
}) => {
  const { camera } = useThree();
  const targetPositionRef = useRef(new Vector3());
  const targetFovRef = useRef(30);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(prev => {
      return isWaiting || (isAnswered && !isReadyToShowDurumagi);
    });
    // isWaiting 상태가 변경될 때마다 목표 위치 업데이트
    // { position: new Vector3(0, 0.03, 0.22), fov: 15 }
    const targetPosition = visible ? [0, 0, 5.2] : [0, 0.03 , 0.1];
    targetPositionRef.current.set(...targetPosition);
  }, [visible, isWaiting, isAnswered, isReadyToShowDurumagi]); //! visible 값이 바뀌면 반응하도록 의존성 설정 => useFrame 내부도 내용이 바뀌니 다시 호출(?).

  useFrame(() => {
    // 매 프레임마다 카메라 위치와 FOV를 부드럽게 업데이트
    // lerp의 두번째 매개변수 : 현재 값에서 목표 값으로 얼마나 빠르게 이동할지를 결정(0: 전혀 움직이지 않음 (현재 값 유지), 1: 즉시 목표 값으로 점프)
    camera.position.lerp(targetPositionRef.current, 0.1);
    camera.fov = MathUtils.lerp(camera.fov, targetFovRef.current, 0.1);
    camera.updateProjectionMatrix();
    const lookAtPosition = visible ? [0, 0, 0] : [0, 0.02, 0];
    camera.lookAt(...lookAtPosition);
  });

  useFrame((state, delta) => {
    // 일정 간격으로만 프레임을 업데이트
    // FPS를 낮추는 것이 더 효과적입니다. 100 FPS로 제한하게 되면 시스템은 계속해서 최대 프레임을 처리해야 하므로, 리소스가 많이 소모될 수 있습니다. 반면, 30 FPS나 60 FPS로 제한하면 부하를 줄여 성능이 더 안정적으로 유지
    const FPS = 30;
    if (delta > 1 / FPS) return; // 30 FPS이상으로 제한
  });

  return null;
};

import React, {
  useRef,
  useState,
  useEffect,
  Suspense,
  memo,
  useMemo,
} from 'react';

import { TOUCH } from 'three'; // 상단에 import 추가
import { OrbitControls, Stars, Float, Text3D } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useWindowSizeState } from '@/hooks';
import TalkBubbleForVertical from './Props/TalkBubbleForVertical.jsx';
import { detectHorizon } from '../../../../utils/device/detectHorizon.js';
import TalkBubble from './Props/TalkBubble.jsx';
import { GlowingSparkle } from '../../Effect/GlowingSparkle.jsx';
// import { MysticalLight } from '../../Effect/MysticalLight.jsx';
import { BigMagicCircle } from '../../Effect/BigMagicCircle.jsx';
import { ExplodingGlow } from '../../Effect/ExplodingGlow.jsx';
import { DynamicCamera } from '../../Camera/DynamicCamera.jsx';
import { MagicCircleGroupUsingBlenderForBackground } from '../../Effect/MagicCircleUsingBlenderForBackground.jsx';
import { MagicCircleUsingBlenderGroup } from '../../Effect/MagicCircleUsingBlender.jsx';
// import ErrorBoundary from '../../../../components/ErrorBoundary/ErrorBoundary.jsx';
import { Capacitor } from '@capacitor/core';
import { SceneResourceCleanUp } from '../../Utils/SceneResourceCleanUp.jsx';
// import {Model} from './Model.jsx';
import Model from './Props/Model.jsx';
import { Bloom, EffectComposer, Outline } from '@react-three/postprocessing';

export default function TarotMasterScene({
  stateGroup,
  setStateGroup,
  toggleModalGroup,
  handleStateGroup,
  updateTarotManualModalOpen,
  setReadyToShowDurumagi,
  setDoneAnimationOfBackground,
  userInfo,
  isClickedForTodayCard,
  ...props
}) {
  const {
    answerForm,
    cardForm,
    questionForm,
    modalForm,
    whichTarot,
    cssInvisible,
    country,
    isReadyToShowDurumagi,
    isDoneAnimationOfBackground,
    isVoucherModeOn,
    isAdsWatched,
    ...rest
  } = stateGroup;
  const {
    handleAnsweredState,
    handleCardForm,
    handleQuestionForm,
    handleResetAll,
    handleResetDeck,
    handleSpreadValue,
    handleWhichTarot,
    ...rest2
  } = handleStateGroup;
  let camera = { position: [0, 1.7, 3], fov: 30 };
  const [cleanUp, setCleanUp] = useState(() => {
    return 0;
  });
  // useEffect(() => {
  //   let timer = setTimeout(() => {
  //     setCleanUp(prev => prev + 1);
  //   }, 15000);
  //   // console.log(cleanUp)
  //   return () => {
  //     clearTimeout(timer);
  //   };
  // });
  const [isTalkBubbleClosed, setTalkBubbleClosed] = useState(false);
  const { windowWidth, windowHeight } = useWindowSizeState();
  const [clickStatusForTalkBubble, setClickStatusForTalkBubble] =
    useState(true);
  const [isLightOn, setLightOn] = useState(true);
  const [visibleExceptDuringPlaying, setVisibleExceptDuringPlaying] =
    useState(true);
  const [visibleDuringPlaying, setVisibleDuringPlaying] = useState(false);
  const [visibleForExplosion, setVisibleForExplosion] = useState(false);
  const notInitialAdsMode = !(
    whichTarot === 2 &&
    !isVoucherModeOn &&
    !answerForm?.isWaiting &&
    answerForm?.isAnswered &&
    !isReadyToShowDurumagi &&
    !isDoneAnimationOfBackground &&
    answerForm?.answer?.length === 0
  );

  useEffect(() => {
    // console.log('isTalkBubbleClosed : ', isTalkBubbleClosed);
    // console.log('isReadyToShowDurumagi : ', isReadyToShowDurumagi);
    // console.log('clickStatusForTalkBubble : ', clickStatusForTalkBubble);
    setTalkBubbleClosed(prev => {
      // if (!isReadyToShowDurumagi && !clickStatusForTalkBubble) return false;
      if (clickStatusForTalkBubble) return false;
      return true;
    });
  }, [windowWidth, isReadyToShowDurumagi]);

  useEffect(() => {
    setVisibleExceptDuringPlaying(prev => {
      if (!notInitialAdsMode) return prev;
      return (
        (!answerForm?.isWaiting && !answerForm?.isAnswered) ||
        (answerForm?.isAnswered &&
          isDoneAnimationOfBackground &&
          isReadyToShowDurumagi)
      );
    });
    setVisibleDuringPlaying(prev => {
      if (!notInitialAdsMode) return prev;
      return (
        answerForm?.isWaiting ||
        (answerForm?.isAnswered && !isReadyToShowDurumagi)
      );
    });
    setVisibleForExplosion(prev => {
      // if(!notInitialAdsMode) return prev;
      return answerForm?.isAnswered && isDoneAnimationOfBackground;
    });
  }, [
    answerForm?.isWaiting,
    answerForm?.isAnswered,
    isDoneAnimationOfBackground,
    isReadyToShowDurumagi,
  ]);

  return (
    <>
      <Canvas
        id={'myCanvas'}
        frameloop={modalForm?.tarot ? 'never' : 'always'}
        gl={{
          antialias: false,
          // 프레임버퍼 설정 추가
          alpha: false,
          // 멀티샘플링 비활성화
          powerPreference: 'high-performance',
        }}
        camera={camera}
      >
        <SceneResourceCleanUp
          isWaiting={answerForm?.isWaiting}
          isAnswered={answerForm?.isAnswered}
          isReadyToShowDurumagi={isReadyToShowDurumagi}
          modalForm={modalForm}
          userInfo={userInfo}
          cleanUp={cleanUp}
        />
        <Suspense fallback={null}>
          <DynamicCamera
            isWaiting={answerForm?.isWaiting}
            isAnswered={answerForm?.isAnswered}
            answer={answerForm?.answer}
            isReadyToShowDurumagi={isReadyToShowDurumagi}
            isDoneAnimationOfBackground={isDoneAnimationOfBackground}
            whichTarot={whichTarot}
            isVoucherModeOn={isVoucherModeOn}
            // targetPositionWhenMagicCircleVisible={[0, 0, 0]}
            // targetPositionWhenMagicCircleInvisible={[0, 0.04, 0.25]}
            // lookAtPositionWhenMagicCircleVisible={[0, 0, 0]}
            // lookAtPositionWhenMagicCircleInvisible={[0, 0.03, 0]}
          />
          <EffectComposer>
            <Bloom
              intensity={0.35}
              luminanceThreshold={0.01}
              luminanceSmoothing={10}
              height={300}
              radius={0.8}
            />
            <Outline edgeStrength={10} edgeGlow={0} edgeThickness={1} />
          </EffectComposer>
          <Model
            scale={0.03}
            stateGroup={stateGroup}
            setStateGroup={setStateGroup}
            toggleModalGroup={toggleModalGroup}
            handleStateGroup={handleStateGroup}
            setTalkBubbleClosed={setTalkBubbleClosed}
            setClickStatusForTalkBubble={setClickStatusForTalkBubble}
            updateTarotManualModalOpen={updateTarotManualModalOpen}
            isDoneAnimationOfBackground={isDoneAnimationOfBackground}
            visible={visibleExceptDuringPlaying}
            userInfo={userInfo}
            isClickedForTodayCard={isClickedForTodayCard}
          />
          {visibleExceptDuringPlaying && (
            // <GlowingLantern
            //   color="lightpink"
            //   amount={20}
            //   emissive="orange"
            //   glow="#ff9f50"
            //   size={0.2}
            //   position={[0.23, 1.13, 0.7]}
            //   setLightOn={setLightOn}
            //   visible={visibleExceptDuringPlaying}
            // />
            <group>
              {/* <ambientLight intensity={1} color="#ffcc99" />{' '} */}
              {/* 따뜻한 주변광 */}
              <directionalLight
                position={[0.0, 1.2, -0.4]}
                intensity={0.5} // 강도를 낮춰 깊이감 감소
                color={0xffffff}
                castShadow={false} // 그림자 비활성화
              />
              <pointLight
                position={[0.0, 1.2, -0.4]} // 수정 구체 위치 근처
                intensity={0.1}
                color="#cc99ff" // 보라색 빛
                distance={1}
                decay={2}
              />
              <pointLight
                position={[0.0, 1.5, 1]} // 왼쪽 촛불 위치
                intensity={4}
                color="#ff9f50" // 따뜻한 주황색
                distance={10}
                decay={1.5}
              />
              <pointLight
                // position={[0.0, 1.2, -0.4]} // 얼굴과 수정구슬 사이
                position={[0.0, 1.26, -0.42]} // 얼굴과 수정구슬 사이
                intensity={0.2}
                color="#ff9f50"
                distance={1}
                decay={1.5}
              />
              <spotLight
                position={[0, 2, 0.08]} // 캐릭터 위에서 비추는 조명
                angle={0.8}
                penumbra={1}
                intensity={15}
                color="#ff9f50"
                // color="#cc99ff" // 보라색 빛
                castShadow
                target-position={[0, 0, 0]}
              />
              <pointLight
                position={[0.0, 1.2, -0.1]} // 수정 구체 위치 근처
                intensity={0.7}
                color="#cc99ff" // 보라색 빛
                distance={0.5}
                decay={2}
              />
              <spotLight
                position={[0.0, 2, -1]} // 캐릭터 위에서 비추는 조명
                angle={0.8}
                penumbra={1}
                intensity={1}
                color="#ff9f50"
                // color="#cc99ff" // 보라색 빛
                castShadow
                target-position={[0, 0, -1]}
              />
            </group>
          )}
          {visibleForExplosion && (
            <ExplodingGlow
              isAnswered={answerForm?.isAnswered}
              isDoneAnimationOfBackground={isDoneAnimationOfBackground}
              isReadyToShowDurumagi={isReadyToShowDurumagi}
              setReadyToShowDurumagi={setReadyToShowDurumagi}
              visibleForExplosion={visibleForExplosion}
            />
          )}
          {visibleDuringPlaying && (
            <group>
              <ambientLight intensity={10} />
              <BigMagicCircle visible={visibleDuringPlaying} />
              {/* <MysticalLight count={100} visible={visibleDuringPlaying} /> */}
              <GlowingSparkle visible={visibleDuringPlaying} />
            </group>
          )}
          {visibleDuringPlaying && (
            <group>
              <MagicCircleGroupUsingBlenderForBackground
                setDoneAnimationOfBackground={setDoneAnimationOfBackground}
                visible={visibleDuringPlaying}
              />
              <MagicCircleUsingBlenderGroup visible={visibleDuringPlaying} />
            </group>
          )}
          {isTalkBubbleClosed === false &&
            !answerForm?.isWaiting &&
            !answerForm?.isAnswered && (
              <group>
                {/* Add your components here */}
                {detectHorizon() === true && (
                  <TalkBubble
                    size={[1, 1, 1]}
                    radius={0.1}
                    answerForm={answerForm}
                    stateGroup={stateGroup}
                    isLightOn={isLightOn}
                  />
                )}
                {/* <PointLight position={[0, 0, 5]} intensity={1} color="white" />{' '} */}
                {detectHorizon() === false && (
                  <TalkBubbleForVertical
                    size={[1, 1, 1]}
                    radius={0.1}
                    answerForm={answerForm}
                    stateGroup={stateGroup}
                    isLightOn={isLightOn}
                  />
                )}
              </group>
            )}
        </Suspense>
        <fogExp2 attach="fog" args={['#ff9f50', 0.02]} />
        <color attach="background" args={['#000000']} />
        <StartSpin />
        {/* <Float floatIntensity={1} speed={3}></Float> */}
        {visibleExceptDuringPlaying && (
          <OrbitControls
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 3}
            minAzimuthAngle={-Math.PI / 5} // -45도
            maxAzimuthAngle={Math.PI / 5} // 45도
            enableZoom={false}
            rotateSpeed={3} // 더 느리고 부드러운 회전
            touches={{
              ONE: TOUCH.ROTATE,
              TWO: TOUCH.NONE, // 두 손가락 터치 동작 비활성화(핀치 줌(두 손가락으로 확대/축소)을 시도할 때 OrbitControls가 이를 다른 종류의 조작으로 해석할 수 있습니다.)
            }}
            makeDefault
            enableDamping={true} // 부드럽게 움직이게 함.
            dampingFactor={0.01} // 돌아갈 때의 속도를 조절}
            enablePan={false} // 우클릭으로 카메리 이동 금지
            autoRotate={false} // 카메라 자동 공전 금지
          />
        )}
        {/* <axesHelper args={[10]} /> */}
      </Canvas>
    </>
  );
}

function StartSpin(props) {
  const startRef = useRef();
  useFrame((state, delta) => {
    startRef.current.rotation.x += 0.0005 * delta;
    startRef.current.rotation.y += 0.005 * delta;
  });
  useEffect(() => {
    return () => {
      startRef.current = null;
    };
  }, []);
  return (
    <>
      <Stars
        ref={startRef}
        radius={1}
        depth={5}
        count={1000}
        factor={0.6}
        saturation={1}
        fade
        speed={0.5}
      />
    </>
  );
}

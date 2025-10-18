// ! Text(@react-three/drei). - R3F 트리에서 렌더가 안됨. 이유는, troika 사용하기 때문.
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Text } from '@react-three/drei';
import { useTranslation } from 'react-i18next';

import { useFrame } from '@react-three/fiber';

import { Mesh, MeshBasicMaterial, Shape, ShapeGeometry } from 'three';

export default memo(function TalkBubble(props) {
  const balloonRef = useRef();
  const {
    answerForm,
    cardForm,
    questionForm,
    modalForm,
    whichTarot,
    cssInvisible,
    country,
  } = props?.stateGroup;
  // question.cardCount가 잘 전달되더니 submit 후 리셋됨. 나머진 그대로인데;
  // useFrame(limitFPS((state, delta) => {
  //   // 여기에 업데이트 로직을 작성합니다.
  // }));

  useEffect(() => {
    return () => {
      // group 내 모든 메쉬 정리
      if (balloonRef.current) {
        balloonRef.current.traverse(object => {
          if (object.isMesh) {
            object.geometry.dispose(); // 지오메트리 정리
            object.material.dispose(); // 머티리얼 정리
          }
        });
      }
      // 참조 제거
      // balloonRef는 Three.js의 group 객체를 참조합니다. 단순히 null로 설정하는 것은 참조를 끊을 뿐, group 내의 메쉬, 지오메트리, 머티리얼 등의 리소스를 정리하지 않기에, 명시적으로 위에서 dispose 처리함.
      balloonRef.current = null;
    };
  }, []);

  // const { scene } = useThree();
  //   useEffect(() => {
  //     return () => {
  //       scene.traverse(object => {
  //         if (object.geometry) object.geometry.dispose();
  //         if (object.material) {
  //           if (Array.isArray(object.material)) {
  //             object.material.forEach(mat => mat.dispose());
  //           } else {
  //             object.material.dispose();
  //           }
  //         }
  //       });
  //     };
  //   }, [scene]);

  return (
    <>
      <group name="TalkBubble" ref={balloonRef} {...props}>
        {props?.answerForm?.isWaiting === true ? (
          <WaitingTalk
            whichTarot={whichTarot}
            spreadListNumber={questionForm?.spreadListNumber}
            isLightOn={props?.isLightOn}
          />
        ) : (
          <GreetingTalk isLightOn={props?.isLightOn} />
        )}
        {/* <mesh name="TalkBubbleMaterial2" position={[0.21, 1.73, 0]}>
          <circleGeometry args={[0.05, 120]} />
          <meshPhongMaterial color={'black'} />
        </mesh>
        <mesh name="TalkBubbleMaterial2_1" position={[0.21, 1.73, -0.01]}>
          <circleGeometry args={[0.06, 120]} />
          <meshPhongMaterial color={'#4E064E'} />
        </mesh>
        <mesh name="TalkBubbleMaterial3" position={[0.11 , 1.69, 0]}>
          <circleGeometry args={[0.03, 120]} />
          <meshPhongMaterial color={'black'} />
        </mesh>
        <mesh name="TalkBubbleMaterial3_1" position={[0.11, 1.69, -0.01]}>
          <circleGeometry args={[0.04, 120]} />
          <meshPhongMaterial color={'#4E064E'} />
        </mesh> */}
        {/* <mesh name="TalkBubbleMaterial2" position={[0.2, 1.75, 0]}>
          <circleGeometry args={[0.05, 120]} />
          <meshPhongMaterial color={'black'} />
        </mesh>
        <mesh name="TalkBubbleMaterial2_1" position={[0.2, 1.75, -0.01]}>
          <circleGeometry args={[0.06, 120]} />
          <meshPhongMaterial color={'#4E064E'} />
        </mesh>
        <mesh name="TalkBubbleMaterial3" position={[0.15, 1.65, 0]}>
          <circleGeometry args={[0.03, 120]} />
          <meshPhongMaterial color={'black'} />
        </mesh>
        <mesh name="TalkBubbleMaterial3_1" position={[0.15, 1.65, -0.01]}>
          <circleGeometry args={[0.04, 120]} />
          <meshPhongMaterial color={'#4E064E'} />
        </mesh> */}
      </group>
    </>
  );
});

const WaitingTalk = ({ whichTarot, spreadListNumber, isLightOn, ...props }) => {
  const { t } = useTranslation();
  const browserLanguage = useLanguageChange();
  const meshRefs = useRef([]); // 메쉬 참조 저장
  const textRef = useRef(); // Text 컴포넌트 참조

  useEffect(() => {
    return () => {
      // 메쉬 리소스 정리
      meshRefs.current.forEach(mesh => {
        if (mesh) {
          mesh.geometry.dispose();
          mesh.material.dispose();
          mesh.current = null;
        }
      });
      meshRefs.current = [];

      // Text 컴포넌트 리소스 정리
      if (textRef.current) {
        textRef.current.geometry?.dispose();
        textRef.current.material?.dispose();
        textRef.current = null;
      }
    };
  }, []);

  return (
    <>
      {isLightOn === true && (
        <Text
          ref={textRef}
          color={'gold'}
          font={`${
            browserLanguage === 'ja'
              ? '/assets/font/Kosugi_Maru/KosugiMaru-Regular.ttf'
              : '/assets/font/Dongle/Dongle-Regular.ttf'
          }`}
          fontSize={browserLanguage === 'ja' ? 0.05 : 0.076}
          fontWeight={800}
          position={[0.71, 1.7, 0.01]}
          lineHeight={browserLanguage === 'ja' ? 1.2 : 0.9}
        >
          {`\t${t('talk.wait')}\n${t(
            `talk.time_${
              whichTarot === 2
                ? 'normal'
                : whichTarot === 3
                ? spreadListNumber === 0
                  ? 'deep_one'
                  : 'deep'
                : spreadListNumber === 0
                ? 'serious_one'
                : 'serious'
            }`
          )}\n${t('talk.you_know')}\n${t('talk.tarot1')}\n${t('talk.tarot2')}`}
        </Text>
      )}
      <mesh
        name="TalkBubbleMaterial1"
        position={[0.7, 1.7, 0]}
        ref={el => (meshRefs.current[0] = el)}
      >
        <circleGeometry args={[0.42]} />
        <meshPhongMaterial color={'#1e1b4b'} flatShading />
      </mesh>
      <mesh
        name="TalkBubbleMaterial1_1"
        position={[0.7, 1.7, -0.01]}
        ref={el => (meshRefs.current[1] = el)}
      >
        <circleGeometry args={[0.435]} />
        <meshPhongMaterial color={'#6d28d9'} flatShading />
      </mesh>
    </>
  );
};

const GreetingTalk = memo(({ isLightOn }) => {
  const { t } = useTranslation();
  const browserLanguage = useLanguageChange();
  const meshRefs = useRef([]); // 메쉬 참조
  const textRef = useRef(); // Text 참조
  const shapeRef = useRef(); // ShapeGeometry 참조
  const shapeShadowRef = useRef(); // ShapeShadowGeometry 참조

  useEffect(() => {
    return () => {
      if (shape) shape.dispose();
      if (shapeShadow) shapeShadow.dispose();
    };
  }, []);

  useEffect(() => {
    return () => {
      // ShapeGeometry 정리
      if (shapeRef.current) {
        shapeRef.current.dispose();
        shapeRef.current = null;
      }
      if (shapeShadowRef.current) {
        shapeShadowRef.current.dispose();
        shapeShadowRef.current = null;
      }

      // 메쉬의 머티리얼 정리
      meshRefs.current.forEach(mesh => {
        if (mesh) {
          mesh.material.dispose();
          mesh.current = null;
        }
      });
      meshRefs.current = [];

      // Text 리소스 정리
      if (textRef.current) {
        textRef.current.geometry?.dispose();
        textRef.current.material?.dispose();
        textRef.current = null;
      }
    };
  }, []);

  const { shape, shapeShadow } = useMemo(() => {
    const mainShape = new Shape();
    const width = 0.85;
    const height = 0.35;
    // const height = 0.55;
    // const height = 0.65;
    const radius = 0.18;
    // const radius = 0.3;

    mainShape.moveTo(0, radius);
    mainShape.lineTo(0, height - radius);
    mainShape.quadraticCurveTo(0, height, radius, height);
    mainShape.lineTo(width - radius, height);
    mainShape.quadraticCurveTo(width, height, width, height - radius);
    mainShape.lineTo(width, radius);
    mainShape.quadraticCurveTo(width, 0, width - radius, 0);
    mainShape.lineTo(radius, 0);
    mainShape.quadraticCurveTo(0, 0, 0, radius);

    const shadowShape = new Shape();
    const shadowWidth = width + 0.03;
    const shadowHeight = height + 0.03;

    shadowShape.moveTo(0, radius);
    shadowShape.lineTo(0, shadowHeight - radius);
    shadowShape.quadraticCurveTo(0, shadowHeight, radius, shadowHeight);
    shadowShape.lineTo(shadowWidth - radius, shadowHeight);
    shadowShape.quadraticCurveTo(
      shadowWidth,
      shadowHeight,
      shadowWidth,
      shadowHeight - radius
    );
    shadowShape.lineTo(shadowWidth, radius);
    shadowShape.quadraticCurveTo(shadowWidth, 0, shadowWidth - radius, 0);
    shadowShape.lineTo(radius, 0);
    shadowShape.quadraticCurveTo(0, 0, 0, radius);

    const shapeGeom = new ShapeGeometry(mainShape);
    const shapeShadowGeom = new ShapeGeometry(shadowShape);
    shapeRef.current = shapeGeom;
    shapeShadowRef.current = shapeShadowGeom;

    return { shape: shapeGeom, shapeShadow: shapeShadowGeom };
  }, []);

  return (
    <>
      {isLightOn === true && (
        <Text
          ref={textRef}
          color={'gold'}
          font={`${
            browserLanguage === 'ja'
              ? '/assets/font/Kosugi_Maru/KosugiMaru-Regular.ttf'
              : '/assets/font/Dongle/Dongle-Regular.ttf'
          }`}
          fontSize={browserLanguage === 'ja' ? 0.05 : 0.076}
          fontWeight={800}
          position={
            browserLanguage === 'ja' ? [0.73, 1.71, 0.01] : [0.71, 1.71, 0.01]
          }
          // position={[0.7, 1.7, 0.01]}
          lineHeight={browserLanguage === 'ja' ? 1.2 : 0.9}
          textAlign="center" // 가운데 정렬 추가
          anchorX="center" // X축 기준점을 중앙으로
          anchorY="middle" // Y축 기준점을 중앙으로
        >
          {`\t${t('talk.hello')}\n${t('talk.welcome')}\n${t(
            'talk.click_instruction'
          )}`}
          {/* {`\t${t('talk.hello')}\n${t('talk.welcome')}\n${t(
            'talk.click_instruction'
          )}\n${t('talk.choose_spread')}\n${t('talk.usage')}`} */}
        </Text>
      )}
      <mesh
        name="TalkBubbleMain"
        position={[0.295, 1.5, 0]}
        // position={[0.275, 1.40, 0]}
        // position={[0.275, 1.36, 0]}
        ref={el => (meshRefs.current[0] = el)}
      >
        <primitive object={shape} />
        <meshPhongMaterial color={'#1e1b4b'} flatShading />
      </mesh>
      <mesh
        name="TalkBubbleShadow"
        position={[0.283, 1.4845, -0.01]}
        // position={[0.263, 1.3875, -0.01]}
        // position={[0.263, 1.3475, -0.01]}
        ref={el => (meshRefs.current[1] = el)}
      >
        <primitive object={shapeShadow} />
        <meshPhongMaterial color={'#6d28d9'} flatShading />
      </mesh>
    </>
  );
});
// const GreetingTalk = memo(({ isLightOn, ...props }) => {
//   const { t } = useTranslation();
//   const browserLanguage = useLanguageChange();

//   return (
//     <>
//       {isLightOn === true && (
//         <Text
//           color={'gold'}
//           font={`${
//             browserLanguage === 'ja'
//               ? '/assets/font/Kosugi_Maru/KosugiMaru-Regular.ttf'
//               : '/assets/font/Dongle/Dongle-Regular.ttf'
//           }`}
//           fontSize={`${browserLanguage === 'ja' ? 0.05 : 0.076}`}
//           fontWeight={800}
//           position={[0.7, 1.7, 0.01]}
//           lineHeight={`${browserLanguage === 'ja' ? 1.2 : 0.9}`}
//         >
//           {`\t${t('talk.hello')}\n${t('talk.welcome')}\n${t(
//             'talk.click_instruction'
//           )}\n${t('talk.choose_spread')}\n${t('talk.usage')}`}
//         </Text>
//       )}
//       <mesh name="TalkBubbleMaterial1" position={[0.7, 1.7, 0]}>
//         <circleGeometry args={[0.42]} />
//         <meshPhongMaterial color={'black'} flatShading />
//       </mesh>
//       <mesh name="TalkBubbleMaterial1_1" position={[0.7, 1.7, -0.01]}>
//         <circleGeometry args={[0.435]} />
//         <meshPhongMaterial color={'#4E064E'} flatShading />
//       </mesh>
//     </>
//   );
// });

// import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
// import { Float, Html, Text3D, useFont } from '@react-three/drei';
// import { Text } from 'troika-three-text';
// import { useTranslation } from 'react-i18next';

// import { useFrame, useLoader, useThree } from '@react-three/fiber';
// import { useNavigate } from 'react-router-dom';

// export default function TalkBubble(props) {
//   const balloonRef = useRef();
//   const {
//     answerForm,
//     cardForm,
//     questionForm,
//     modalForm,
//     whichTarot,
//     cssInvisible,
//     country,
//   } = props?.stateGroup;

//   return (
//     <>
//       <group name="TalkBubble" ref={balloonRef} {...props}>
//         {props?.answerForm?.isWaiting === true ? (
//           <WaitingTalk whichTarot={whichTarot} />
//         ) : (
//           <GreetingTalk />
//         )}
//         <mesh name="TalkBubbleMaterial2" position={[0.2, 1.75, 0]}>
//           <circleGeometry args={[0.05, 120]} />
//           <meshPhongMaterial color={'#4E064E'} />
//         </mesh>
//         <mesh name="TalkBubbleMaterial2_1" position={[0.2, 1.75, -0.01]}>
//           <circleGeometry args={[0.06, 120]} />
//           <meshPhongMaterial color={'#4E064E'} />
//         </mesh>
//         <mesh name="TalkBubbleMaterial3" position={[0.15, 1.65, 0]}>
//           <circleGeometry args={[0.03, 120]} />
//           <meshPhongMaterial color={'#4E064E'} />
//         </mesh>
//         <mesh name="TalkBubbleMaterial3_1" position={[0.15, 1.65, -0.01]}>
//           <circleGeometry args={[0.04, 120]} />
//           <meshPhongMaterial color={'#4E064E'} />
//         </mesh>
//       </group>
//     </>
//   );
// }

// const WaitingTalk = memo(props => {
//   const { t } = useTranslation();
//   const { scene } = useThree();

//   const myText = new Text();
//   const talkForNormal = useCallback(() => {
//     scene.add(myText);
//     myText.text = `${t(`talk.wait`)}\n${t(`talk.time_normal`)}\n${t(
//       `talk.you_know`,
//     )}\n${t(`talk.tarot1`)}\n${t(`talk.tarot2`)}`;
//     myText.fontSize = 0.05;
//     myText.position.x = 0.385;
//     myText.position.y = 1.95;
//     myText.position.z = 0.01;
//     myText.color = '#4E064E';
//     // myText.fontFamily = 'italic bold sans-serif';

//     // Update the rendering:
//     myText.sync();
//   });
//   const talkForDeep = useCallback(() => {
//     scene.add(myText);
//     myText.text = `${t(`talk.wait`)}\n${t(`talk.time_deep`)}\n${t(
//       `talk.you_know`,
//     )}\n${t(`talk.tarot1`)}\n${t(`talk.tarot2`)}`;
//     myText.fontSize = 0.05;
//     myText.position.x = 0.385;
//     myText.position.y = 1.95;
//     myText.position.z = 0.01;
//     myText.color = '#4E064E';
//     // myText.fontFamily = 'italic bold sans-serif';

//     // Update the rendering:
//     myText.sync();
//   });

//   useEffect(() => {
//     if (props.whichTarot === 2) {
//       talkForNormal();
//     }
//     if (props.whichTarot === 3) {
//       talkForDeep();
//     }
//     return () => {
//       scene.remove(myText);
//       myText.dispose();
//     };
//   });
//   return (
//     <>
//       <mesh name="TalkBubbleMaterial1" position={[0.7, 1.7, 0]}>
//         <circleGeometry args={[0.42]} />
//         <meshPhongMaterial color={'#4E064E'} flatShading />
//       </mesh>
//       <mesh name="TalkBubbleMaterial1_1" position={[0.7, 1.7, -0.01]}>
//         <circleGeometry args={[0.435]} />
//         <meshPhongMaterial color={'#4E064E'} flatShading />
//       </mesh>
//     </>
//   );
// });

// const GreetingTalk = memo(props => {
//   const { t } = useTranslation();
//   const { scene } = useThree();

//   const myText = new Text();
//   const talk = useCallback(() => {
//     scene.add(myText);
//     myText.text = `\t${t(`talk.hello`)}\n${t(`talk.welcome`)}\n${t(
//       `talk.click_instruction`,
//     )}\n\t${t(`talk.choose_spread`)}\n\t${t(`talk.principle`)}`;
//     myText.fontSize = 0.05;
//     myText.position.x = 0.4;
//     myText.position.y = 1.955;
//     myText.position.z = 0.01;
//     myText.color = '#4E064E';

//     // Update the rendering:
//     myText.sync();
//   });

//   useEffect(() => {
//     talk();
//     return () => {
//       scene.remove(myText);
//       myText.dispose();
//     };
//   });
//   return (
//     <>
//       <CustomText/>
//       <mesh name="TalkBubbleMaterial1" position={[0.7, 1.7, 0]}>
//         <circleGeometry args={[0.42]} />
//         <meshPhongMaterial color={'#4E064E'} flatShading />
//       </mesh>
//       <mesh name="TalkBubbleMaterial1_1" position={[0.7, 1.7, -0.01]}>
//         <circleGeometry args={[0.435]} />
//         <meshPhongMaterial color={'#4E064E'} flatShading />
//       </mesh>
//     </>
//   );
// });

// //! Text
// import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
// import { Float, Html, Text, Text3D, useFont } from '@react-three/drei';
// import { useTranslation } from 'react-i18next';

// import { useLoader, useThree } from '@react-three/fiber';
// import { useNavigate } from 'react-router-dom';
// export default function TalkBubble(props) {
//   const balloonRef = useRef();
//   const {
//     answerForm,
//     cardForm,
//     questionForm,
//     modalForm,
//     whichTarot,
//     cssInvisible,
//     country,
//   } = props?.stateGroup;

//   return (
//     <>
//       <group name="TalkBubble" ref={balloonRef} {...props}>
//         {props?.answerForm?.isWaiting === true ? (
//           <WaitingTalk whichTarot={whichTarot} />
//         ) : (
//           <GreetingTalk />
//         )}
//         <mesh name="TalkBubbleMaterial2" position={[0.2, 1.75, 0]}>
//           <circleGeometry args={[0.05, 120]} />
//           <meshPhongMaterial color={'#4E064E'} />
//         </mesh>
//         <mesh name="TalkBubbleMaterial2_1" position={[0.2, 1.75, -0.01]}>
//           <circleGeometry args={[0.06, 120]} />
//           <meshPhongMaterial color={'#4E064E'} />
//         </mesh>
//         <mesh name="TalkBubbleMaterial3" position={[0.15, 1.65, 0]}>
//           <circleGeometry args={[0.03, 120]} />
//           <meshPhongMaterial color={'#4E064E'} />
//         </mesh>
//         <mesh name="TalkBubbleMaterial3_1" position={[0.15, 1.65, -0.01]}>
//           <circleGeometry args={[0.04, 120]} />
//           <meshPhongMaterial color={'#4E064E'} />
//         </mesh>
//       </group>
//     </>
//   );
// }

// const WaitingTalk = props => {
//   const { t } = useTranslation();
//   return (
//     <mesh name="TalkBubbleMaterial1" position={[0.7, 1.7, 0]}>
//       {/* <sphereGeometry args={[0.35]}/> */}
//       {/* <boxGeometry args={[0.7, 0.7, 0, 100, 100]} /> */}
//       <circleGeometry args={[0.4]} />
//       <meshBasicMaterial color={'#4E064E'} flatShading />
//       <Text
//         position={[-0.28, 0.22, 0.1]}
//         fontSize={0.06}
//         color="#4E064E"
//         anchorX="left"
//         anchorY="top"
//         lineHeight={2}
//         children={`${t(`talk.wait`)}`}
//       />
//       <Text
//         position={[-0.32, 0.11, 0.1]}
//         fontSize={0.06}
//         color="#4E064E"
//         anchorX="left"
//         anchorY="top"
//         lineHeight={2}
//         children={`${t(`talk.time`)}`}
//       />
//       <Text
//         position={[-0.28, -0.0, 0.1]}
//         fontSize={0.06}
//         color="#4E064E"
//         anchorX="left"
//         anchorY="top"
//         lineHeight={2}
//         children={`${t(`talk.you_know`)}`}
//       />
//       <Text
//         position={[-0.3, -0.1, 0.1]}
//         fontSize={0.06}
//         color="#4E064E"
//         anchorX="left"
//         anchorY="top"
//         lineHeight={2}
//         children={`${t(`talk.tarot`)}`}
//       />
//     </mesh>
//   );
// };

// const GreetingTalk = props => {
//   const { t } = useTranslation();
//   const fontUrl =
//     'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@500&display=swap';

//   return (
//     <mesh name="TalkBubbleMaterial1" position={[0.7, 1.7, 0]}>
//       <circleGeometry args={[0.4]} />
//       <meshBasicMaterial color={'#4E064E'} flatShading />
//       <Text
//         position={[-0.28, 0.22, 0.1]}
//         fontSize={0.06}
//         font={fontUrl}
//         characters="ㅇㅏㄴㅕㅇ"
//         color="#4E064E"
//         anchorX="left"
//         anchorY="top"
//         lineHeight={2}
//         children={`안녕${t(`talk.hello`)} ${t(`talk.welcome`)}`}
//       />
//       <Text
//         characters="ㅂㅈㄷㄱㅅㅁㄴㅇㄹㅎㅋㅌㅊㅍㅛㅗㅜㅕㅓㅡㅑㅏㅐㅣㅔ"
//         position={[-0.28, 0.22, 0.1]}
//         fontSize={0.06}
//         font={fontUrl}
//         color="#4E064E"
//         anchorX="left"
//         anchorY="top"
//         lineHeight={2}
//       >
//         안녕
//       </Text>
//       <Text
//         position={[-0.32, 0.11, 0.1]}
//         fontSize={0.06}
//         color="#4E064E"
//         anchorX="left"
//         anchorY="top"
//         lineHeight={2}
//         children={`${t(`talk.click_instruction`)}`}
//       />
//       <Text
//         position={[-0.28, -0.0, 0.1]}
//         fontSize={0.06}
//         color="#4E064E"
//         anchorX="left"
//         anchorY="top"
//         lineHeight={2}
//         children={`${t(`talk.choose_spread`)}`}
//       />
//       <Text
//         position={[-0.28, -0.1, 0.1]}
//         fontSize={0.06}
//         color="#4E064E"
//         anchorX="left"
//         anchorY="top"
//         lineHeight={2}
//         children={`${t(`talk.principle`)}`}
//       />
//     </mesh>
//   );
// };

import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { useLanguageChange } from '@/hooks';
import { limitFPS } from '../../../Utils/limitFPS.jsx';

const CustomText = () => {
  const textRef = useRef();

  useEffect(() => {
    const loadFont = async () => {
      const loader = new FontLoader();
      loader.load('fonts/helvetiker_regular.typeface.json', function (font) {
        const geometry = new TextGeometry('Hello!', {
          font: font,
          size: 1,
          height: 5,
          curveSegments: 12,
          bevelEnabled: true,
          bevelThickness: 10,
          bevelSize: 8,
          bevelOffset: 0,
          bevelSegments: 5,
        });

        // Set position, rotation, scale, etc., if needed
        geometry.computeBoundingBox();
        geometry.center();

        // Create a mesh and add it to the scene
        const textMesh = new Mesh(
          geometry,
          new MeshBasicMaterial({ color: 0xffffff })
        );
        textRef.current = textMesh;
      });
    };

    loadFont();
    return () => {
      if (textRef.current) {
        const { geometry, material } = textRef.current;
        geometry.dispose(); // Geometry 정리
        material.dispose(); // Material 정리
        textRef.current = null; // 참조 제거
      }
    };
  }, []);

  useFrame(() => {
    if (textRef.current) {
      // Example: Update the position of the text
      textRef.current.position.x = 0.07; // Adjust as needed
      textRef.current.position.y = 1.07; // Adjust as needed
      textRef.current.position.z = 0.1; // Adjust as needed
    }
  });

  return <primitive object={textRef} />;
};

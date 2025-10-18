// ! Text(@react-three/drei). - R3F 트리에서 렌더가 안됨. 이유는, troika 사용하기 때문.
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Float, Html, useFont } from '@react-three/drei';
import { Text } from '@react-three/drei';
import { useTranslation } from 'react-i18next';
import * as THREE from 'three';
import { useLoader, useThree } from '@react-three/fiber';
import { useNavigate } from 'react-router-dom';

export default function TalkBubble(props) {
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
        <mesh name="TalkBubbleMaterial2" position={[0.2, 1.75, 0]}>
          <circleGeometry args={[0.05, 120]} />
          <meshPhongMaterial color={'#1e1b4b'} />
        </mesh>
        <mesh name="TalkBubbleMaterial2_1" position={[0.2, 1.75, -0.01]}>
          <circleGeometry args={[0.06, 120]} />
          <meshPhongMaterial color={'#6d28d9'} />
        </mesh>
        <mesh name="TalkBubbleMaterial3" position={[0.15, 1.65, 0]}>
          <circleGeometry args={[0.03, 120]} />
          <meshPhongMaterial color={'#1e1b4b'} />
        </mesh>
        <mesh name="TalkBubbleMaterial3_1" position={[0.15, 1.65, -0.01]}>
          <circleGeometry args={[0.04, 120]} />
          <meshPhongMaterial color={'#6d28d9'} />
        </mesh>
      </group>
    </>
  );
}

const WaitingTalk = ({ whichTarot, spreadListNumber, isLightOn, ...props }) => {
  const { t } = useTranslation();
  const browserLanguage = useLanguageChange();

  return (
    <>
      {isLightOn === true && (
        <Text
          color={'gold'}
          font={`${
            browserLanguage === 'ja'
              ? '/assets/font/Potta_One/PottaOne-Regular.ttf'
              : '/assets/font/Dongle/Dongle-Regular.ttf'
          }`}
          fontSize={`${browserLanguage === 'ja' ? 0.05 : 0.076}`}
          fontWeight={800}
          position={[0.71, 1.7, 0.01]}
          lineHeight={`${browserLanguage === 'ja' ? 1.2 : 0.9}`}
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
          )}\n${t(`talk.you_know`)}\n${t(`talk.tarot1`)}\n${t(`talk.tarot2`)}`}
        </Text>
      )}
      <mesh name="TalkBubbleMaterial1" position={[0.7, 1.7, 0]}>
        <circleGeometry args={[0.42]} />
        <meshPhongMaterial color={'#1e1b4b'} flatShading />
      </mesh>
      <mesh name="TalkBubbleMaterial1_1" position={[0.7, 1.7, -0.01]}>
        <circleGeometry args={[0.435]} />
        <meshPhongMaterial color={'#6d28d9'} flatShading />
      </mesh>
    </>
  );
};

const GreetingTalk = memo(({ isLightOn, ...props }) => {
  const { t } = useTranslation();
  const browserLanguage = useLanguageChange();

  return (
    <>
      {isLightOn === true && (
        <Text
          color={'gold'}
          font={`${
            browserLanguage === 'ja'
              ? '/assets/font/Potta_One/PottaOne-Regular.ttf'
              : '/assets/font/Dongle/Dongle-Regular.ttf'
          }`}
          fontSize={`${browserLanguage === 'ja' ? 0.05 : 0.076}`}
          fontWeight={800}
          position={[0.7, 1.7, 0.01]}
          lineHeight={`${browserLanguage === 'ja' ? 1.2 : 0.9}`}
        >
          {`\t${t('talk.hello')}\n${t('talk.welcome')}\n${t(
            'talk.click_instruction'
          )}\n\t${t('talk.choose_spread')}\n\t${t('talk.usage')}`}
        </Text>
      )}
      <mesh name="TalkBubbleMaterial1" position={[0.7, 1.7, 0]}>
        <circleGeometry args={[0.42]} />
        <meshPhongMaterial color={'#1e1b4b'} flatShading />
      </mesh>
      <mesh name="TalkBubbleMaterial1_1" position={[0.7, 1.7, -0.01]}>
        <circleGeometry args={[0.435]} />
        <meshPhongMaterial color={'#6d28d9'} flatShading />
      </mesh>
    </>
  );
});

// import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
// import { Float, Html, Text3D, useFont } from '@react-three/drei';
// import { Text } from 'troika-three-text';
// import { useTranslation } from 'react-i18next';
// import * as THREE from 'three';
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
// import * as THREE from 'three';
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
        const textMesh = new THREE.Mesh(
          geometry,
          new THREE.MeshBasicMaterial({ color: 0xffffff })
        );
        textRef.current = textMesh;
      });
    };

    loadFont();
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

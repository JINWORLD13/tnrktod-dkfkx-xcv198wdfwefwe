import { useState } from 'react';

// 초기 상태를 컴포넌트 외부에 정의하여 불필요한 재생성 방지
const initialState = {
  question_topic: '',
  subject: '',
  object: '',
  relationship_subject: '',
  relationship_object: '',
  theme: '',
  situation: '',
  question: '',
  spreadTitle: '',
  cardCount: 0,
  spreadListNumber: 0,
  firstOption: '',
  secondOption: '',
  thirdOption: '',
};

/**
 * Custom hook for managing question form state
 * @param {Object} inputState - Initial state to override default values
 * @returns {[Object, Function]} - Current state and state update function
 */
const useQuestionFormState = (inputState = null) => {
  // 초기 상태 설정 로직
  const getInitialState = () => {
    if (!inputState || typeof inputState !== 'object' || Object.keys(inputState)?.length === 0) {
      return initialState;
    }
    // 기본값과 입력값을 병합
    return {
      ...initialState,
      ...inputState
    };
  };

  const [questionForm, setQuestionForm] = useState(getInitialState());

  // 상태 업데이트 함수
  const updateQuestionForm = (newState) => {
    if (typeof newState === 'function') {
      // 함수형 업데이트를 지원
      setQuestionForm(prevState => ({
        ...initialState,
        ...prevState,
        ...newState(prevState)
      }));
    } else {
      // 객체 업데이트를 지원
      setQuestionForm(prevState => ({
        ...initialState,
        ...prevState,
        ...newState
      }));
    }
  };

  return [questionForm, updateQuestionForm];
};

export default useQuestionFormState;

// import { useState } from 'react';

// const useQuestionFormState = inputState => {
//   if (inputState === null || inputState === undefined) {
//     const initialState = {
//       question_topic: '',
//       subject: '',
//       object: '',
//       relationship_subject: '',
//       relationship_object: '',
//       theme: '',
//       situation: '',
//       question: '',
//       spreadTitle: '',
//       cardCount: 0,
//       spreadListNumber: 0,
//     };
//     const [questionForm, setQuestionForm] = useState(initialState);
//     return [questionForm, setQuestionForm];
//   }
//   const [questionForm, setQuestionForm] = useState(inputState);
//   return [questionForm, setQuestionForm];
// };

// export default useQuestionFormState;

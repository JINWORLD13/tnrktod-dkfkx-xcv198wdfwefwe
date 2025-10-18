import { useState } from 'react';

// Define initial state outside the hook for better performance and reusability
// initialState를 hook 외부에 정의하여 불필요한 재생성을 방지
const initialState = {
  questionInfo: {
    question_topic: '',
    subject: '',
    object: '',
    relationship_subject: '',
    relationship_object: '',
    theme: '',
    situation: '',
    question: '',
    firstOption: '',
    secondOption: '',
    thirdOption: '',
  },
  spreadInfo: {
    spreadTitle: '',
    cardCount: 0,
    spreadListNumber: 0,
    selectedTarotCardsArr: [],
  },
  answer: '',
  language: '',
  timeOfCounselling: '',
  createdAt: '',
  updatedAt: '',
  isSubmitted: false,
  isWaiting: false,
  isAnswered: false,
};

/**
 * Custom hook to manage answer form state
 * @param {Object} inputState - Initial state to override default values
 * @returns {[Object, Function]} - Current state and state update function
 */
const useAnswerFormState = (inputState = null) => {
  // Validate input state and merge with default state
  const getInitialState = () => {
    if (!inputState || typeof inputState !== 'object') {
      return initialState;
    }
    return {
      ...initialState,
      ...inputState,
    };
  };

  const [answerForm, setAnswerForm] = useState(getInitialState());

  // Wrapper function for setState to ensure type safety
  const updateAnswerForm = newState => {
    if (typeof newState === 'function') {
      setAnswerForm(prevState => ({
        ...initialState,
        ...prevState,
        ...newState(prevState),
      }));
    } else {
      setAnswerForm(prevState => ({
        ...initialState,
        ...prevState,
        ...newState,
      }));
    }
  };

  return [answerForm, updateAnswerForm];
};

export default useAnswerFormState;

// import { useState } from 'react';

// const useAnswerFormState = inputState => {
//   if (inputState === null || inputState === undefined) {
//     const initialState = {
//       questionInfo: {
//         question_topic: '',
//         subject: '',
//         object: '',
//         relationship_subject: '',
//         relationship_object: '',
//         theme: '',
//         situation: '',
//         question: '',
//       },
//       spreadInfo: {
//         spreadTitle: '',
//         cardCount: 0,
//         spreadListNumber: 0,
//         selectedTarotCardsArr: [],
//       },
//       answer: '',
//       language: '',
//       createdAt: '',
//       updatedAt: '',
//       isSubmitted: false,
//       isWaiting: false,
//       isAnswered: false,
//     };
//     const [answerForm, setAnswerForm] = useState(initialState);
//     return [answerForm, setAnswerForm];
//   }
//   const [answerForm, setAnswerForm] = useState(inputState);
//   return [answerForm, setAnswerForm];
// };

// export default useAnswerFormState;

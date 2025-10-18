import { useState, useCallback } from 'react';

const useSubmitFormState = (inputState) => {
  // 함수로 값 초기화 또는 기본 값 사용 로직을 이동
  const getDefaultState = () => ({
    questionInfo: {
      question_topic: '',
      subject: '',
      object: '',
      relationship_subject: '',
      relationship_object: '',
      theme: '',
      situation: '',
      question: '',
    },
    spreadInfo: {
      spreadTitle: '',
      cardCount: 0,
      spreadListNumber: 0,
      selectedTarotCardsArr: [],
    },
  });

  const initialState = inputState || getDefaultState();
  const [submitForm, setSubmitForm] = useState(initialState);

  const updateSubmitForm = useCallback((newSubmitForm) => {
    setSubmitForm(newSubmitForm);
  }, []);

  return [submitForm, updateSubmitForm];
};

export default useSubmitFormState;

// import { useState } from 'react';

// const useSubmitFormState = inputState => {
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
//     };
//     const [submitForm, setSubmitForm] = useState(initialState);
//     return [submitForm, setSubmitForm];
//   }
//   const [submitForm, setSubmitForm] = useState(inputState);
//   return [submitForm, setSubmitForm];
// };

// export default useSubmitFormState;

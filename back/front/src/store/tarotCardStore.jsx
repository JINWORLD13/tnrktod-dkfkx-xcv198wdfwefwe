import { createSlice } from '@reduxjs/toolkit';
import { tarotDeck } from '../data/TarotCardDeck/TarotCardDeck.jsx';
import { isDevelopmentMode } from '@/utils/constants';

let tarotCard = createSlice({
  name: 'tarotCard',
  initialState: {
    tarotCardDeck: [...tarotDeck],
    selectedTarotCards: new Array(0),
    totalCardsNumber: 0,
  },
  reducers: {
    // state = [...tarotDeck] 구문은 state 변수에 새로운 배열을 할당합니다. 그러나 이렇게 하면 state 변수가 가리키는 메모리 공간이 변경되기 때문에 Redux가 이를 감지하지 못합니다
    resetAllTarotCardsWithoutReverse(state) {
      const resetDeck = [...tarotDeck];
      for (let i = resetDeck?.length - 1; i >= 0; i--) {
        const random = Math.random();
        // randome은 0부터 1 사이 값. 1을 포함하지 않아 + 1 해주어 마지막 인덱스 정보까지 나오도록 설정.
        const j = Math.floor(random * (i + 1));
        [resetDeck[i], resetDeck[j]] = [resetDeck[j], resetDeck[i]];
      }
      return {
        ...state,
        selectedTarotCards: new Array(0),
        tarotCardDeck: resetDeck,
      };
    },
    // ! deck이 초기화 되고 기존 shuffle 반영하면서 shuffle
    shuffleTarotCardDeckWithoutReverse(state) {
      if (state.tarotCardDeck?.length !== 78) {
        if (isDevelopmentMode) {
          console.log('tarot deck is not reset.');
        }
        return;
      }
      const shuffledDeck = [...state.tarotCardDeck];

      for (let i = shuffledDeck?.length - 1; i >= 0; i--) {
        const random = Math.random();
        // randome은 0부터 1 사이 값. 1을 포함하지 않아 + 1 해주어 마지막 인덱스 정보까지 나오도록 설정.
        const j = Math.floor(random * (i + 1));

        [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
      }
      if (isDevelopmentMode) {
        console.log('tarot deck is shuffled without revered cards.');
      }
      return { ...state, tarotCardDeck: shuffledDeck };
    },
    resetAllTarotCards(state) {
      // ! splice()를 사용하면, 기존 배열의 모든 요소를 ...tarotDeck의 요소로 교체합니다. 이렇게 하면 Redux가 변경 사항을 감지하고 적용함.
      // ! deck 초기화
      // state.tarotCardDeck.splice(0, state.tarotCardDeck?.length, ...tarotDeck);

      // ! deck 초기화하고 shuffle
      const resetDeck = [...tarotDeck];
      for (let i = resetDeck?.length - 1; i >= 0; i--) {
        const random = Math.random();
        // randome은 0부터 1 사이 값. 1을 포함하지 않아 + 1 해주어 마지막 인덱스 정보까지 나오도록 설정.
        const j = Math.floor(random * (i + 1));
        const reverse = random < 0.3;
        if (reverse) {
          resetDeck[j] = { ...resetDeck[j], reversed: true }; // & 갑자기 추가시킴
        }

        [resetDeck[i], resetDeck[j]] = [resetDeck[j], resetDeck[i]];
      }
      // ! 선택된 카드들도 제거 (원소들 영구 제거 splice)
      // state.selectedTarotCards.splice(0, state.selectedTarotCards?.length);

      return {
        ...state,
        selectedTarotCards: new Array(0),
        tarotCardDeck: resetDeck,
      };
    },
    // ! deck이 초기화 되고 기존 shuffle 반영하면서 shuffle
    shuffleTarotCardDeck(state) {
      if (state.tarotCardDeck?.length !== 78) {
        if (isDevelopmentMode) {
          console.log('tarot deck is not reset.');
        }
        return;
      }
      const shuffledDeck = [...state.tarotCardDeck];

      for (let i = shuffledDeck?.length - 1; i >= 0; i--) {
        const random = Math.random();
        // randome은 0부터 1 사이 값. 1을 포함하지 않아 + 1 해주어 마지막 인덱스 정보까지 나오도록 설정.
        const j = Math.floor(random * (i + 1));
        const reverse = random < 0.3;
        if (reverse) {
          shuffledDeck[j] = { ...shuffledDeck[j], reversed: true }; // & 갑자기 추가시킴
        }

        [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
      }
      if (isDevelopmentMode) {
        console.log('tarot deck is shuffled with revered cards.');
      }
      return { ...state, tarotCardDeck: shuffledDeck };
    },
    // ! 뽑는건 하나씩 뽑음.
    drawCard(state, action) {
      if (state.selectedTarotCards?.length >= action.payload.cardNumber) {
        if (isDevelopmentMode) {
          console.log('not allowed to draw');
        }
        return;
      }

      const extractedCard =
        state.tarotCardDeck[action.payload.shuffledCardIndex];
      if (isDevelopmentMode) {
        console.log('draw card');
      }
      state.selectedTarotCards.push(extractedCard);
      // `state.tarotCardDeck.splice(action.payload.shuffledCardIndex, 1); // ! 영구적 제거보단 opacity 0 및 click 무효화 처리할 생각임.
      return state; // & 굳이 할 필요가 없을텐데
    },

    setTotalCardsNumber(state, action) {
      state.totalCardsNumber = action.payload;
      return state;
    },
  },
});

export let {
  resetAllTarotCardsWithoutReverse,
  resetAllTarotCards,
  shuffleTarotCardDeckWithoutReverse,
  shuffleTarotCardDeck,
  drawCard,
  setTotalCardsNumber,
} = tarotCard.actions;

export default tarotCard;

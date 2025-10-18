import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguageChange } from '@/hooks';
import { InstructionButton } from '../../../components/common/InstructionButton';
import fontStyles from '../../../styles/scss/Font.module.scss';

export const TopicBox = ({
  styles,
  setInstructionOpen,
  setQuestionKind,
  questionFormInTarotModal,
  handleQuestionFormInTarotModal,
  isSubmittedMode,
  questionForm,
  ...props
}) => {
  const browserLanguage = useLanguageChange();
  const { t } = useTranslation();
  return (
    <div
      className={`${
        isSubmittedMode ? styles['submitted-box'] : styles['question-box']
      }`}
    >
      <div className={styles['input-container']}>
        <div
          className={`${styles['label-box']} ${
            browserLanguage === 'ja'
              ? fontStyles['japanese-font-label']
              : fontStyles['korean-font-label']
          }`}
        >
          <label
            htmlFor="question_topic"
            className={styles['question-topic-label']}
          >
            {t(`question.question_topic`)}
          </label>{' '}
          <InstructionButton
            onClick={e => {
              setInstructionOpen(prev => !prev);
              setQuestionKind(1);
            }}
          ></InstructionButton>
        </div>
        <div className={styles['input-box']}>
          <input
            id="question_topic"
            name="question_topic"
            type="text"
            className={
              browserLanguage === 'ja'
                ? fontStyles['japanese-font-input']
                : fontStyles['korean-font-input']
            }
            value={
              isSubmittedMode
                ? questionForm['question_topic']
                : questionFormInTarotModal['question_topic']
            }
            placeholder={
              isSubmittedMode
                ? questionForm['question_topic']?.length === 0
                  ? t('question.omitted')
                  : t('question.question_topic_instruction')
                : t(`question.question_topic_instruction`)
            }
            onChange={e => {
              if (e.target.value.length <= 40) {
                handleQuestionFormInTarotModal(e);
              }
            }}
            autoComplete="off"
            readOnly={isSubmittedMode}
          />
        </div>
      </div>
    </div>
  );
};

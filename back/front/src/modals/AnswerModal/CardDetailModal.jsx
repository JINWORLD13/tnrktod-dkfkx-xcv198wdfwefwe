import React, { useEffect, useState } from 'react';
import { X, ArrowLeft, Sparkles, EyeOff, EyeIcon } from 'lucide-react';
// import './CardDetailModal.scss';
import styles from './CardDetailModal.module.scss';

const CardDetailModal = ({ card, onClose, language = 'en' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showCards, setShowCards] = useState(true);

  useEffect(() => {
    setIsVisible(true);

    const handleEscape = e => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  // Mock card meanings - In real app, this would come from your data
  const getCardMeaning = cardName => {
    const meanings = {
      'The Fool': {
        upright: 'New beginnings, innocence, spontaneity, a free spirit',
        reversed: 'Recklessness, taken advantage of, inconsideration',
        general:
          "The Fool represents new beginnings, having faith in the future, being inexperienced, not knowing what to expect, having beginner's luck, improvisation and believing in the universe.",
        love: 'In love readings, The Fool suggests new romance, taking a leap of faith in love, or starting fresh in relationships.',
        career:
          'Career-wise, The Fool indicates new job opportunities, starting a business, or taking career risks.',
        advice:
          'Trust your instincts and be open to new experiences. Sometimes taking a leap of faith is necessary for growth.',
      },
      'The Magician': {
        upright: 'Manifestation, resourcefulness, power, inspired action',
        reversed: 'Manipulation, poor planning, untapped talents',
        general:
          'The Magician represents willpower, desire, creation, manifestation, and having the power to make things happen.',
        love: 'In relationships, The Magician suggests taking action to manifest love, using charm and charisma, or being the one to make the first move.',
        career:
          'For career, this card indicates having the skills and resources needed, leadership abilities, and the power to create success.',
        advice:
          'You have all the tools you need to succeed. Focus your energy and take decisive action toward your goals.',
      },
      // Add more card meanings as needed
      Default: {
        upright: 'Positive energy, growth, opportunity',
        reversed: 'Challenges, lessons, inner reflection',
        general:
          'This card carries important spiritual guidance for your current situation.',
        love: 'In matters of the heart, this card suggests paying attention to your emotions and relationships.',
        career:
          'Professionally, this card indicates opportunities for growth and development.',
        advice:
          'Trust the wisdom of the universe and remain open to the messages being sent to you.',
      },
    };

    return meanings[cardName] || meanings['Default'];
  };

  const cardMeaning = getCardMeaning(card.name);
  const isReversed = !!(
    card?.reversed ||
    card?.isReversed ||
    card?.orientation === 'reversed'
  );

  return (
    <div
      className={`${styles.cardDetailOverlay} ${
        isVisible ? styles.visible : ''
      }`}
    >
      <div
        className={`${styles.cardDetailModal} ${
          isVisible ? styles.visible : ''
        }`}
      >
        {/* Cosmic Background */}
        <div className={styles.cosmicBackground}>
          <div className={styles.stars}></div>
          <div className={styles.cosmicDust}></div>
        </div>

        {/* Header */}
        <div className={styles.detailHeader}>
          <button className={styles.backBtn} onClick={handleClose}>
            <ArrowLeft />
            <span>Back</span>
          </button>
          <h2 className={styles.cardTitle}>
            <Sparkles className={styles.titleIcon} />
            {card.name}
            {isReversed && (
              <span className={styles.reversedIndicator}>(Reversed)</span>
            )}
          </h2>
          <button className={styles.closeBtn} onClick={handleClose}>
            <X />
          </button>
        </div>

        {/* Content */}
        <div className={styles.detailContent}>
          {showCards && (
            <div className={styles.cardDisplay}>
              <div className={styles.cardRim}>
                <div
                  className={`${styles.cardImageContainer} ${
                    styles.imageClamp
                  } ${isReversed ? styles.reversed : ''}`}
                >
                  <img
                    src={card.image}
                    alt={`${card.name}${
                      isReversed ? ' (Reversed)' : ''
                    } tarot card`}
                  />
                  <div className={styles.cardAura}></div>
                </div>
              </div>{' '}
              <div className={`${styles.showCard} ${styles}`}>
                <button
                  className={styles.toggleCardsBtn}
                  onClick={() => setShowCards(prev => !prev)}
                >
                  {showCards ? <EyeOff /> : <EyeIcon />}
                </button>
              </div>
            </div>
          )}

          {!showCards && (
            <div
              className={`${
                showCards ? styles.showCard : styles['showCard-alt']
              }`}
            >
              <button
                className={styles.toggleCardsBtn}
                onClick={() => setShowCards(prev => !prev)}
              >
                {showCards ? <EyeOff /> : <EyeIcon />}
              </button>
            </div>
          )}

          {/* Card Information */}
          <div className={styles.cardInfo}>
            <div className={styles.meaningSection}>
              <h3 className={styles.sectionTitle}>
                <span className={styles.icon}>🔮</span>
                Current Interpretation
              </h3>
              <div className={styles.meaningContent}>
                <p className={styles.primaryMeaning}>
                  <strong>{isReversed ? 'Reversed:' : 'Upright:'}</strong>{' '}
                  {isReversed ? cardMeaning.reversed : cardMeaning.upright}
                </p>
              </div>
            </div>

            <div className={styles.meaningSection}>
              <h3 className={styles.sectionTitle}>
                <span className={styles.icon}>⭐</span>
                General Meaning
              </h3>
              <div className={styles.meaningContent}>
                <p>{cardMeaning.general}</p>
              </div>
            </div>

            <div className={styles.meaningSection}>
              <h3 className={styles.sectionTitle}>
                <span className={styles.icon}>💖</span>
                Love & Relationships
              </h3>
              <div className={styles.meaningContent}>
                <p>{cardMeaning.love}</p>
              </div>
            </div>

            <div className={styles.meaningSection}>
              <h3 className={styles.sectionTitle}>
                <span className={styles.icon}>💼</span>
                Career & Finance
              </h3>
              <div className={styles.meaningContent}>
                <p>{cardMeaning.career}</p>
              </div>
            </div>

            <div className={`${styles.meaningSection} ${styles.advice}`}>
              <h3 className={styles.sectionTitle}>
                <span className={styles.icon}>✨</span>
                Cosmic Advice
              </h3>
              <div className={styles.meaningContent}>
                <p className={styles.adviceText}>{cardMeaning.advice}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardDetailModal;

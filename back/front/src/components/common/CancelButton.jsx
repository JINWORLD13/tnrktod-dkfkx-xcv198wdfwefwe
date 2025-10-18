import React, { useRef, useEffect } from 'react';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import styles from './Button.module.scss';
import { useLanguageChange } from '@/hooks';

const isNative = Capacitor.isNativePlatform();

const CancelButton = ({
  className = '',
  autoFocus = false,
  onClick,
  type = 'button',
  children = '',
  ...restProps
}) => {
  const browserLanguage = useLanguageChange();
  const buttonRef = useRef(null);

  useEffect(() => {
    let backButtonListener;

    // Native platform back button handling
    if (isNative) {
      backButtonListener = App.addListener('backButton', e => {
        if (onClick) {
          onClick(e);
          return false; // Prevent default back button behavior
        }
      });
    }

    // ESC and Backspace key handling for web
    const handleEscKey = e => {
      if (!onClick) return;

      // 버튼이 실제로 DOM에서 보이는지 확인
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(buttonRef.current);
        const isVisible =
          rect.width > 0 &&
          rect.height > 0 &&
          computedStyle.display !== 'none' &&
          computedStyle.visibility !== 'hidden';

        if (!isVisible) {
          return; // 숨겨진 버튼은 이벤트 처리 안 함
        }
      }

      // ESC 키: 항상 모달 닫기
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        onClick(e);
        return;
      }

      // Backspace 키: 입력 필드가 아닐 때만 모달 닫기
      if (e.key === 'Backspace') {
        const activeElement = document.activeElement;
        const isInputField =
          activeElement &&
          (activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.isContentEditable);

        // 입력 필드에서는 Backspace 정상 동작
        if (isInputField) {
          return;
        }

        // 입력 필드가 아니면 모달 닫기
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        onClick(e);
      }
    };

    if (!isNative) {
      if (typeof window !== 'undefined') {
        // capture phase에서 먼저 처리하도록 true 설정
        window.addEventListener('keydown', handleEscKey, true);
      }
    }

    // Cleanup function
    return () => {
      if (isNative && backButtonListener) {
        backButtonListener.remove();
      } else if (!isNative) {
        if (typeof window !== 'undefined') {
          window.removeEventListener('keydown', handleEscKey, true);
        }
      }
    };
  }, [onClick]);

  const handleClick = e => {
    if (onClick) {
      e.preventDefault();
      onClick(e);
    }
  };

  const buttonClass = `${
    browserLanguage === 'ja' ? styles['btn-japanese'] : styles['btn']
  } ${className}`.trim();

  return (
    <button
      ref={buttonRef}
      className={buttonClass}
      type={type}
      onClick={handleClick}
      {...restProps}
    >
      {children}
    </button>
  );
};

export default CancelButton;

import React from 'react';
import styles from './LoadingForm.module.scss';

const LoadingForm = () => {
  return (
    <div id="load" className={styles['container']}>
      <div className={styles['spinner']}></div>
    </div>
  );
};

export default LoadingForm;

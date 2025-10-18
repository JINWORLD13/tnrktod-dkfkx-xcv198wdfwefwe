import React from 'react';

const ErrorPage = () => {
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     window.location.reload();
  //   }, 1500); // 1.5초 후에 새로고침

  //   return () => {
  //     clearTimeout(timer); // 컴포넌트 언마운트 시 타이머 정리
  //   };
  // }, []);

  return (
    <div>
      <h1>Error</h1>
      <p>Failed to load the page.</p>
      {/* <p>Failed to load the page. Refreshing in 1.5 seconds...</p> */}
    </div>
  );
};

export default ErrorPage;

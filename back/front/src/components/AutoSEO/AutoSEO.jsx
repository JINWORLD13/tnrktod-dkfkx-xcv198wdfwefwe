import React from 'react';
import { useLocation } from 'react-router-dom';
import SEOMetaTags from '../Helmet/SEOMetaTags.jsx';
import { seoData } from '../../data/seoData/seoData.jsx';

const AutoSEO = ({ children }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  // 현재 경로에 맞는 SEO 정보 가져오기
  const seoInfo = seoData[currentPath] || seoData.default;
  
  return (
    <>
      <SEOMetaTags {...seoInfo} />
      {children}
    </>
  );
};

export default AutoSEO;
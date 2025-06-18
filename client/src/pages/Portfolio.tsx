import React from 'react';
import { Helmet } from 'react-helmet-async';

import PortfolioContainer from '@/components/portfolio/PortfolioContainer';

const Portfolio = () => {
  return (
    <>
      <Helmet>
        <title>Portfolio | Trading Platform</title>
      </Helmet>
      <PortfolioContainer />
    </>
  );
};

export default Portfolio;

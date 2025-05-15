
import React from "react";
import PortfolioContainer from "@/components/portfolio/PortfolioContainer";
import { Helmet } from "react-helmet-async";

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

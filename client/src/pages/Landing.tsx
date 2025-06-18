import React from 'react';

import CTASection from '@/components/landing/CTASection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import Footer from '@/components/landing/Footer';
import Header from '@/components/landing/Header';
import HeroSection from '@/components/landing/HeroSection';
import PricingSection from '@/components/landing/PricingSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';

const Landing = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Landing;

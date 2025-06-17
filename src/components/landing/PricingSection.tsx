import React from 'react';
import { useNavigate } from 'react-router-dom';

import PricingCard from './PricingCard';

const PricingSection = () => {
  const navigate = useNavigate();

  const handlePricingAction = (plan: string) => {
    if (plan === 'basic') {
      navigate('/auth?tab=signup&plan=basic');
    } else if (plan === 'pro') {
      navigate('/auth?tab=signup&plan=pro');
    } else {
      // Enterprise plan - show contact info or navigate to contact page
      window.open('mailto:sales@tradepro.com?subject=Enterprise Plan Inquiry');
    }
  };

  return (
    <section id="pricing" className="container py-16 md:py-20">
      <div className="mb-16 text-center">
        <h2 className="mb-4 text-3xl font-bold">Simple, Transparent Pricing</h2>
        <p className="mx-auto max-w-xl text-muted-foreground">
          No hidden fees. Competitive rates that scale with your trading activity.
        </p>
      </div>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
        <PricingCard
          title="Basic"
          price="$0"
          description="For beginners exploring the markets"
          features={[
            'Standard market access',
            'Basic charting tools',
            'Market research',
            '5 watchlists',
          ]}
          ctaText="Start Free"
          onClick={() => handlePricingAction('basic')}
        />
        <PricingCard
          title="Pro"
          price="$29"
          description="For active traders seeking an edge"
          features={[
            'All Basic features',
            'Advanced charts and indicators',
            'Priority execution',
            'Unlimited watchlists',
            'API access',
          ]}
          ctaText="Upgrade to Pro"
          highlighted={true}
          onClick={() => handlePricingAction('pro')}
        />
        <PricingCard
          title="Enterprise"
          price="Custom"
          description="For institutions and professional traders"
          features={[
            'All Pro features',
            'Institutional liquidity',
            'Dedicated support team',
            'Custom integrations',
            'Advanced risk management',
          ]}
          ctaText="Contact Sales"
          onClick={() => handlePricingAction('enterprise')}
        />
      </div>
    </section>
  );
};

export default PricingSection;

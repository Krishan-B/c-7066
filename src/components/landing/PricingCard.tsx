import React from 'react';
import { Check } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface PricingCardProps {
  title: string;
  price: string;
  description: string;
  features: string[];
  ctaText: string;
  highlighted?: boolean;
  onClick?: () => void;
}

const PricingCard = ({
  title,
  price,
  description,
  features,
  ctaText,
  highlighted = false,
  onClick,
}: PricingCardProps) => {
  return (
    <div
      className={`flex flex-col rounded-lg border p-6 ${
        highlighted
          ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
          : 'border-secondary/20'
      } `}
    >
      <div className="mb-6">
        <h3 className="mb-2 text-xl font-bold">{title}</h3>
        <div className="flex items-baseline">
          <span className="text-3xl font-bold">{price}</span>
          {price !== 'Custom' && <span className="ml-1 text-muted-foreground">/month</span>}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>
      <ul className="mb-8 flex-grow space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <Check className="mr-2 h-4 w-4 text-success" />
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>
      <Button variant={highlighted ? 'default' : 'outline'} className="w-full" onClick={onClick}>
        {ctaText}
      </Button>
    </div>
  );
};

export default PricingCard;

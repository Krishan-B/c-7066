import React from "react";
import { Button } from "@/shared/ui/button";
import { Check } from "lucide-react";

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
      className={`
      border rounded-lg p-6 flex flex-col
      ${
        highlighted
          ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
          : "border-secondary/20"
      }
    `}
    >
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <div className="flex items-baseline">
          <span className="text-3xl font-bold">{price}</span>
          {price !== "Custom" && (
            <span className="text-muted-foreground ml-1">/month</span>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-2">{description}</p>
      </div>
      <ul className="space-y-3 mb-8 flex-grow">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <Check className="h-4 w-4 text-success mr-2" />
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>
      <Button
        variant={highlighted ? "default" : "outline"}
        className="w-full"
        onClick={onClick}
      >
        {ctaText}
      </Button>
    </div>
  );
};

export default PricingCard;


import React from "react";
import TestimonialCard from "./TestimonialCard";
import TrustBadge from "./TrustBadge";

const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="py-16 md:py-20 bg-secondary/5">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Trusted by Traders Worldwide</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            See what our community has to say about trading with TradePro
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <TestimonialCard 
            quote="TradePro's platform has transformed how I trade. The interface is intuitive and the execution is lightning fast."
            author="Sarah K."
            role="Day Trader"
            rating={5}
          />
          <TestimonialCard 
            quote="As someone who trades multiple asset classes, having everything in one platform has been a game-changer for my strategy."
            author="Michael T."
            role="Portfolio Manager"
            rating={5}
          />
          <TestimonialCard 
            quote="The analytics and research tools are incredible. I make more informed decisions and my returns have improved significantly."
            author="David R."
            role="Swing Trader"
            rating={4}
          />
        </div>
        
        <div className="flex justify-center mt-16 gap-8">
          <TrustBadge text="128-bit SSL Encryption" />
          <TrustBadge text="Regulated & Compliant" />
          <TrustBadge text="24/7 Support" />
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

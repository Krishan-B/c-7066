
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

const CTASection = () => {
  const navigate = useNavigate();
  
  return (
    <section className="py-16 md:py-20 container">
      <div className="bg-primary/10 rounded-lg p-8 md:p-12 text-center max-w-4xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Ready to Start Trading?</h2>
        <p className="text-base md:text-lg mb-6 md:mb-8 max-w-lg mx-auto">
          Join thousands of traders using TradePro to access global markets and reach their financial goals.
        </p>
        <Button 
          size="lg" 
          className="px-8"
          onClick={() => navigate("/auth?tab=signup")}
        >
          Create Your Free Account
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </section>
  );
};

export default CTASection;

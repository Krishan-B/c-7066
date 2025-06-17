import { ArrowRight, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section id="about" className="container py-16 md:py-20">
      <div className="mx-auto max-w-4xl rounded-lg bg-primary/10 p-8 md:p-12">
        <div className="flex flex-col items-center gap-8 md:flex-row">
          <div className="flex-1 text-center md:text-left">
            <h2 className="mb-4 text-2xl font-bold md:text-3xl">Ready to Start Trading?</h2>
            <p className="mb-6 max-w-lg text-base md:text-lg">
              Join thousands of traders using TradePro to access global markets and reach their
              financial goals.
            </p>
            <div className="mb-6 space-y-2">
              <div className="flex items-center">
                <CheckCircle className="mr-2 h-5 w-5 text-primary" />
                <span>Commission-free trading on select assets</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="mr-2 h-5 w-5 text-primary" />
                <span>Advanced charting and analysis tools</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="mr-2 h-5 w-5 text-primary" />
                <span>24/7 access to global markets</span>
              </div>
            </div>
            <Button size="lg" className="px-8" onClick={() => navigate('/auth?tab=signup')}>
              Create Your Free Account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-1 justify-center">
            <div className="rounded-lg border border-secondary/30 bg-background p-6 shadow-lg">
              <div className="flex max-w-xs flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Account Setup</span>
                  <span className="text-success">Free</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Basic Analytics</span>
                  <span className="text-success">Free</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Real-time Market Data</span>
                  <span className="text-success">Free</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Educational Resources</span>
                  <span className="text-success">Free</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const element = document.getElementById('pricing');
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  View All Features
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;

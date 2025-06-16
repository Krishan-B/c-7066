import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle } from 'lucide-react';

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section id="about" className="py-16 md:py-20 container">
      <div className="bg-primary/10 rounded-lg p-8 md:p-12 max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Start Trading?</h2>
            <p className="text-base md:text-lg mb-6 max-w-lg">
              Join thousands of traders using TradePro to access global markets and reach their
              financial goals.
            </p>
            <div className="space-y-2 mb-6">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-primary mr-2" />
                <span>Commission-free trading on select assets</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-primary mr-2" />
                <span>Advanced charting and analysis tools</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-primary mr-2" />
                <span>24/7 access to global markets</span>
              </div>
            </div>
            <Button size="lg" className="px-8" onClick={() => navigate('/auth?tab=signup')}>
              Create Your Free Account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-background p-6 rounded-lg shadow-lg border border-secondary/30">
              <div className="flex flex-col gap-4 max-w-xs">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Account Setup</span>
                  <span className="text-success">Free</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Basic Analytics</span>
                  <span className="text-success">Free</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Real-time Market Data</span>
                  <span className="text-success">Free</span>
                </div>
                <div className="flex justify-between items-center">
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

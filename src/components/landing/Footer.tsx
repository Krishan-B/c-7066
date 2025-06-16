import { useNavigate } from 'react-router-dom';
import { LineChart } from 'lucide-react';

const Footer = () => {
  const navigate = useNavigate();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="mt-auto bg-secondary/10 py-12">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold mb-4">Platform</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => scrollToSection('features')}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Features
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('pricing')}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Pricing
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/auth')}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Get Started
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => {
                    /* Navigate to blog when implemented */
                  }}
                  className="text-sm text-muted-foreground hover:text-foreground bg-transparent border-none p-0 cursor-pointer"
                >
                  Blog
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    /* Navigate to market research when implemented */
                  }}
                  className="text-sm text-muted-foreground hover:text-foreground bg-transparent border-none p-0 cursor-pointer"
                >
                  Market Research
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    /* Navigate to help center when implemented */
                  }}
                  className="text-sm text-muted-foreground hover:text-foreground bg-transparent border-none p-0 cursor-pointer"
                >
                  Help Center
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => scrollToSection('about')}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    /* Navigate to careers when implemented */
                  }}
                  className="text-sm text-muted-foreground hover:text-foreground bg-transparent border-none p-0 cursor-pointer"
                >
                  Careers
                </button>
              </li>
              <li>
                <a
                  href="mailto:contact@tradepro.com"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => {
                    /* Navigate to terms when implemented */
                  }}
                  className="text-sm text-muted-foreground hover:text-foreground bg-transparent border-none p-0 cursor-pointer"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    /* Navigate to privacy policy when implemented */
                  }}
                  className="text-sm text-muted-foreground hover:text-foreground bg-transparent border-none p-0 cursor-pointer"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    /* Navigate to disclosures when implemented */
                  }}
                  className="text-sm text-muted-foreground hover:text-foreground bg-transparent border-none p-0 cursor-pointer"
                >
                  Disclosures
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-secondary/30 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <button
              className="flex items-center cursor-pointer bg-transparent border-none p-0 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              aria-label="Scroll to top"
              type="button"
            >
              <LineChart className="h-5 w-5 text-primary" />
              <span className="text-sm font-bold ml-2">TradePro</span>
            </button>
            <span className="text-sm text-muted-foreground ml-4">
              © 2025 TradePro. All rights reserved.
            </span>
          </div>
          <div className="flex gap-4">
            <a
              href="https://twitter.com/tradepro"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Twitter
            </a>
            <a
              href="https://facebook.com/tradepro"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Facebook
            </a>
            <a
              href="https://linkedin.com/company/tradepro"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              LinkedIn
            </a>
            <a
              href="https://instagram.com/tradepro"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Instagram
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

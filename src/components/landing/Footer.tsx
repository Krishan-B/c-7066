import { LineChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h3 className="mb-4 font-bold">Platform</h3>
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
            <h3 className="mb-4 font-bold">Resources</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => {
                    /* Navigate to blog when implemented */
                  }}
                  className="cursor-pointer border-none bg-transparent p-0 text-sm text-muted-foreground hover:text-foreground"
                >
                  Blog
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    /* Navigate to market research when implemented */
                  }}
                  className="cursor-pointer border-none bg-transparent p-0 text-sm text-muted-foreground hover:text-foreground"
                >
                  Market Research
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    /* Navigate to help center when implemented */
                  }}
                  className="cursor-pointer border-none bg-transparent p-0 text-sm text-muted-foreground hover:text-foreground"
                >
                  Help Center
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 font-bold">Company</h3>
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
                  className="cursor-pointer border-none bg-transparent p-0 text-sm text-muted-foreground hover:text-foreground"
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
            <h3 className="mb-4 font-bold">Legal</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => {
                    /* Navigate to terms when implemented */
                  }}
                  className="cursor-pointer border-none bg-transparent p-0 text-sm text-muted-foreground hover:text-foreground"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    /* Navigate to privacy policy when implemented */
                  }}
                  className="cursor-pointer border-none bg-transparent p-0 text-sm text-muted-foreground hover:text-foreground"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    /* Navigate to disclosures when implemented */
                  }}
                  className="cursor-pointer border-none bg-transparent p-0 text-sm text-muted-foreground hover:text-foreground"
                >
                  Disclosures
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between border-t border-secondary/30 pt-8 md:flex-row">
          <div className="mb-4 flex items-center md:mb-0">
            <button
              className="flex cursor-pointer items-center rounded-sm border-none bg-transparent p-0 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
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
              <span className="ml-2 text-sm font-bold">TradePro</span>
            </button>
            <span className="ml-4 text-sm text-muted-foreground">
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

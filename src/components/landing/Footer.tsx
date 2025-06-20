
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { LineChart, Twitter, Facebook, Linkedin, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";

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
              <li><button onClick={() => scrollToSection('features')} className="text-sm text-muted-foreground hover:text-foreground">Features</button></li>
              <li><button onClick={() => scrollToSection('pricing')} className="text-sm text-muted-foreground hover:text-foreground">Pricing</button></li>
              <li><button onClick={() => navigate('/auth')} className="text-sm text-muted-foreground hover:text-foreground">Get Started</button></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Blog</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Market Research</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Help Center</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><button onClick={() => scrollToSection('about')} className="text-sm text-muted-foreground hover:text-foreground">About Us</button></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Careers</a></li>
              <li><a href="mailto:contact@tradepro.com" className="text-sm text-muted-foreground hover:text-foreground">Contact</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Terms of Service</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy Policy</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Disclosures</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-secondary/30 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="flex items-center cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <LineChart className="h-5 w-5 text-primary" />
              <span className="text-sm font-bold ml-2">TradePro</span>
            </div>
            <span className="text-sm text-muted-foreground ml-4">© 2025 TradePro. All rights reserved.</span>
          </div>
          <div className="flex gap-4">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
              <Twitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
              <Facebook className="h-5 w-5" />
              <span className="sr-only">Facebook</span>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
              <Linkedin className="h-5 w-5" />
              <span className="sr-only">LinkedIn</span>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
              <Instagram className="h-5 w-5" />
              <span className="sr-only">Instagram</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

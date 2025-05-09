
import React from "react";
import { Link } from "react-router-dom";
import { LineChart, Twitter, Facebook, Linkedin, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="mt-auto bg-secondary/10 py-12">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold mb-4">Platform</h3>
            <ul className="space-y-2">
              <li><Link to="#" className="text-sm text-muted-foreground hover:text-foreground">Features</Link></li>
              <li><Link to="#" className="text-sm text-muted-foreground hover:text-foreground">Pricing</Link></li>
              <li><Link to="#" className="text-sm text-muted-foreground hover:text-foreground">Security</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><Link to="#" className="text-sm text-muted-foreground hover:text-foreground">Blog</Link></li>
              <li><Link to="#" className="text-sm text-muted-foreground hover:text-foreground">Market Research</Link></li>
              <li><Link to="#" className="text-sm text-muted-foreground hover:text-foreground">Help Center</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link to="#" className="text-sm text-muted-foreground hover:text-foreground">About Us</Link></li>
              <li><Link to="#" className="text-sm text-muted-foreground hover:text-foreground">Careers</Link></li>
              <li><Link to="#" className="text-sm text-muted-foreground hover:text-foreground">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="#" className="text-sm text-muted-foreground hover:text-foreground">Terms of Service</Link></li>
              <li><Link to="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
              <li><Link to="#" className="text-sm text-muted-foreground hover:text-foreground">Disclosures</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-secondary/30 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <LineChart className="h-5 w-5 text-primary" />
            <span className="text-sm font-bold ml-2">TradePro</span>
            <span className="text-sm text-muted-foreground ml-4">© 2025 TradePro. All rights reserved.</span>
          </div>
          <div className="flex gap-4">
            <Link to="#" className="text-muted-foreground hover:text-foreground">
              <Twitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </Link>
            <Link to="#" className="text-muted-foreground hover:text-foreground">
              <Facebook className="h-5 w-5" />
              <span className="sr-only">Facebook</span>
            </Link>
            <Link to="#" className="text-muted-foreground hover:text-foreground">
              <Linkedin className="h-5 w-5" />
              <span className="sr-only">LinkedIn</span>
            </Link>
            <Link to="#" className="text-muted-foreground hover:text-foreground">
              <Instagram className="h-5 w-5" />
              <span className="sr-only">Instagram</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

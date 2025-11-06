import React from 'react';
import { Link } from 'react-router-dom';
import { Separator } from "@/components/ui/separator";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/30 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Platform Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/questions" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  Questions
                </Link>
              </li>
              <li>
                <Link to="/tags" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  Tags
                </Link>
              </li>
              <li>
                <Link to="/users" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  Users
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Support</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  Guidelines
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <Separator className="my-6" />
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-muted-foreground text-sm">
            © {currentYear} All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
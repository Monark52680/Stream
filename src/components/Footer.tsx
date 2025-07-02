import React from 'react';
import { Gamepad2, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

export default function Footer() {
  const footerLinks = {
    Platform: ['Store', 'Library', 'Community', 'Support'],
    Company: ['About Us', 'Careers', 'Press', 'Contact'],
    Resources: ['Developer Portal', 'Publisher Resources', 'System Requirements', 'Help Center'],
    Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Legal Info'],
  };

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Youtube, href: '#', label: 'YouTube' },
  ];

  return (
    <footer className="bg-gaming-darker border-t border-gaming-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-gradient-primary p-2 rounded-lg">
                <Gamepad2 className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                STREAM
              </span>
            </div>
            <p className="text-gaming-muted mb-6 max-w-sm">
              The ultimate gaming platform connecting millions of players worldwide. 
              Discover, play, and share your gaming journey with STREAM.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  className="p-2 bg-gaming-card hover:bg-primary-500 text-gaming-muted hover:text-white rounded-lg transition-colors duration-200"
                  aria-label={label}
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-gaming-text font-semibold mb-4">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-gaming-muted hover:text-primary-400 transition-colors duration-200"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="border-t border-gaming-border pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gaming-muted text-sm">
              © 2024 STREAM Gaming Platform. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gaming-muted hover:text-primary-400 text-sm transition-colors duration-200">
                Privacy
              </a>
              <a href="#" className="text-gaming-muted hover:text-primary-400 text-sm transition-colors duration-200">
                Terms
              </a>
              <a href="#" className="text-gaming-muted hover:text-primary-400 text-sm transition-colors duration-200">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
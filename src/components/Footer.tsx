
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="py-6 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} harmonyX • Powered by MultiversX & Eliza
            </p>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-all duration-250 ease-in-out">
              Terms
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-all duration-250 ease-in-out">
              Privacy
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-all duration-250 ease-in-out">
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

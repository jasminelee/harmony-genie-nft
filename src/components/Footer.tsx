
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="py-6 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} harmony.genie • Powered by MultiversX & Mubert
            </p>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-all-250">
              Terms
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-all-250">
              Privacy
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-all-250">
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

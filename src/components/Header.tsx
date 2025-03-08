import React from 'react';
import { MusicIcon } from 'lucide-react';
import ConnectWallet from './ConnectWallet';

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-morphism">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MusicIcon className="h-6 w-6 text-music-primary" />
          <span className="font-semibold text-xl tracking-tight">harmony.genie</span>
        </div>
        <div className="flex items-center space-x-4">
          <ConnectWallet />
        </div>
      </div>
    </header>
  );
};

export default Header;

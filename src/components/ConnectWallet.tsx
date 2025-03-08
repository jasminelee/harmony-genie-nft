import React, { useState } from 'react';
import { useGetAccountInfo, useGetLoginInfo } from '@multiversx/sdk-dapp/hooks';
import { logout } from '@multiversx/sdk-dapp/utils';
import { 
  WalletConnectLoginButton, 
  ExtensionLoginButton,
  WebWalletLoginButton
} from '@multiversx/sdk-dapp/UI';
import { Wallet, LogOut, ChevronDown, ChevronUp } from 'lucide-react';
import { shortenAddress } from '@/utils/addressUtils';

const ConnectWallet: React.FC = () => {
  const { address } = useGetAccountInfo();
  const { isLoggedIn } = useGetLoginInfo();
  const [showOptions, setShowOptions] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  if (isLoggedIn && address) {
    return (
      <button 
        onClick={handleLogout}
        className="px-4 py-1.5 rounded-full font-medium transition-all duration-250 ease-in-out flex items-center space-x-2 bg-green-100 text-green-700 hover:bg-green-200"
      >
        <span>{shortenAddress(address)}</span>
        <LogOut className="h-4 w-4" />
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={toggleOptions}
        className="px-4 py-1.5 rounded-full font-medium transition-all duration-250 ease-in-out flex items-center space-x-2 bg-secondary text-secondary-foreground hover:bg-secondary/90"
      >
        <span>Connect Wallet</span>
        <Wallet className="h-4 w-4 mr-1" />
        {showOptions ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {showOptions && (
        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1" role="menu" aria-orientation="vertical">
            <div className="px-3 py-2 text-xs font-medium text-gray-500">
              Select a wallet
            </div>
            
            <div className="px-2 py-1">
              <ExtensionLoginButton
                callbackRoute="/"
                buttonClassName="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                loginButtonText="MultiversX Wallet"
              />
            </div>
            
            <div className="px-2 py-1">
              <WalletConnectLoginButton 
                callbackRoute="/"
                buttonClassName="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                loginButtonText="xPortal Mobile App"
              />
            </div>
            
            <div className="px-2 py-1">
              <WebWalletLoginButton 
                callbackRoute="/"
                buttonClassName="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                loginButtonText="Web Wallet"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectWallet; 
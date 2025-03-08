import React, { useState } from 'react';
import { CheckCircle, Loader, AlertCircle, ExternalLink, Wallet, ChevronDown, ChevronUp, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGetAccountInfo, useGetLoginInfo } from '@multiversx/sdk-dapp/hooks';
import { 
  WalletConnectLoginButton,
  ExtensionLoginButton,
  WebWalletLoginButton
} from '@multiversx/sdk-dapp/UI';
import { mintNFTWithAgent, NFTMintParams } from '@/utils/mxAgent';

type MintStatus = 'idle' | 'minting' | 'success' | 'error';

interface NFTMintProps {
  songData: {
    title: string;
    artist: string;
    genre: string;
    audioUrl: string;
    imageUrl?: string;
  };
  className?: string;
}

const NFTMint: React.FC<NFTMintProps> = ({ songData, className }) => {
  const [status, setStatus] = useState<MintStatus>('idle');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showWalletOptions, setShowWalletOptions] = useState(false);
  const { address } = useGetAccountInfo();
  const { isLoggedIn } = useGetLoginInfo();

  const handleMint = async () => {
    if (!isLoggedIn || !address) {
      setError('Please connect your wallet first');
      return;
    }

    try {
      setStatus('minting');
      
      // Prepare NFT minting parameters
      const nftParams: NFTMintParams = {
        title: songData.title,
        description: `AI-generated ${songData.genre} music`,
        mediaUrl: songData.audioUrl,
        genre: songData.genre,
        address: address
      };
      
      // Call the mintNFTWithAgent function
      const result = await mintNFTWithAgent(nftParams);
      
      if (result.success) {
        setTxHash(result.transactionHash);
        setStatus('success');
      } else {
        throw new Error(result.error || 'NFT minting failed');
      }
      
    } catch (err) {
      console.error('NFT minting error:', err);
      let errorMessage = 'Failed to mint NFT';
      
      if (err instanceof Error) {
        // Check for common MultiversX errors
        if (err.message.includes('invalid signature')) {
          errorMessage = 'Transaction failed: Invalid signature. Please try again.';
        } else if (err.message.includes('insufficient funds')) {
          errorMessage = 'Transaction failed: Insufficient funds for gas fees';
        } else if (err.message.includes('insufficient gas limit')) {
          errorMessage = 'Transaction failed: Insufficient gas limit. Please try again.';
        } else if (err.message.includes('user rejected')) {
          errorMessage = 'Transaction was rejected by the user';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      setStatus('error');
    }
  };

  const toggleWalletOptions = () => {
    setShowWalletOptions(!showWalletOptions);
  };

  const handleClosePopup = () => {
    // Reset the status to idle
    setStatus('idle');
    // Clear any error messages
    setError(null);
  };

  return (
    <div className={cn("bg-white rounded-xl p-4 border shadow-sm", className)}>
      <h3 className="font-medium text-lg mb-3">Mint as NFT</h3>
      
      <div className="space-y-4 relative">
        {status === 'idle' && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Mint your generated music as a unique NFT on the MultiversX blockchain.
            </p>
            {isLoggedIn ? (
              <button
                onClick={handleMint}
                className="w-full py-2.5 px-4 rounded-lg bg-music-primary text-white hover:bg-music-primary/90 transition-all-250 flex items-center justify-center space-x-2"
              >
                <span>Mint this track</span>
              </button>
            ) : (
              <div className="relative">
                <button
                  onClick={toggleWalletOptions}
                  className="w-full py-2.5 px-4 rounded-lg bg-music-primary text-white hover:bg-music-primary/90 transition-all-250 flex items-center justify-center space-x-2"
                >
                  <span>Connect wallet to mint</span>
                  <Wallet className="h-4 w-4 mr-1" />
                  {showWalletOptions ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>

                {showWalletOptions && (
                  <div className="absolute left-0 right-0 mt-2 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                      <div className="px-3 py-2 text-xs font-medium text-gray-500">
                        Select a wallet
                      </div>
                      
                      <div className="px-2 py-1">
                        <ExtensionLoginButton
                          callbackRoute="/"
                          buttonClassName="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          loginButtonText="MultiversX DeFi Wallet"
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
            )}
          </div>
        )}

        {status === 'minting' && (
          <div className="flex flex-col items-center justify-center py-4 relative bg-white rounded-lg border p-4 shadow-sm">
            <button 
              onClick={handleClosePopup} 
              className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 z-10"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <Loader className="h-8 w-8 text-music-primary animate-spin mb-3" />
            <p className="text-sm font-medium">Minting your NFT...</p>
            <p className="text-xs text-muted-foreground mt-1">
              Please wait while we process your transaction
            </p>
          </div>
        )}

        {status === 'success' && txHash && (
          <div className="flex flex-col items-center justify-center py-2 relative bg-white rounded-lg border p-4 shadow-sm">
            <button 
              onClick={handleClosePopup} 
              className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 z-10"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <CheckCircle className="h-8 w-8 text-green-500 mb-3" />
            <p className="text-sm font-medium">NFT Minted Successfully!</p>
            <p className="text-xs text-muted-foreground text-center mt-1 mb-3">
              Your music is now immortalized on the MultiversX blockchain
            </p>
            
            <a
              href={`https://testnet-explorer.multiversx.com/transactions/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-music-primary hover:text-music-primary/80 flex items-center space-x-1"
            >
              <span>View on MultiversX Explorer</span>
              <ExternalLink className="h-3 w-3" />
            </a>
            
            <button
              onClick={() => setStatus('idle')}
              className="mt-4 py-2 px-4 rounded-lg text-sm border border-input hover:bg-secondary/50 transition-all-250"
            >
              Mint another track
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center justify-center py-2 relative bg-white rounded-lg border p-4 shadow-sm">
            <button 
              onClick={handleClosePopup} 
              className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 z-10"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <AlertCircle className="h-8 w-8 text-destructive mb-3" />
            <p className="text-sm font-medium">Minting Failed</p>
            <p className="text-xs text-muted-foreground text-center mt-1 mb-3">
              {error || 'There was an error minting your NFT. Please try again.'}
            </p>
            
            <button
              onClick={() => setStatus('idle')}
              className="mt-2 py-2 px-4 rounded-lg text-sm border border-input hover:bg-secondary/50 transition-all-250"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NFTMint;

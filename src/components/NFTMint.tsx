
import React, { useState } from 'react';
import { CheckCircle, Loader, AlertCircle, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

type MintStatus = 'idle' | 'minting' | 'success' | 'error';

interface NFTMintProps {
  onMint: () => Promise<any>;
  className?: string;
}

const NFTMint: React.FC<NFTMintProps> = ({ onMint, className }) => {
  const [status, setStatus] = useState<MintStatus>('idle');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleMint = async () => {
    try {
      setStatus('minting');
      // In a real app, this would actually mint the NFT on MultiversX
      const result = await onMint();
      
      // Mock successful response with transaction hash
      setTimeout(() => {
        setTxHash('0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef');
        setStatus('success');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mint NFT');
      setStatus('error');
    }
  };

  return (
    <div className={cn("bg-white rounded-xl p-4 border shadow-sm", className)}>
      <h3 className="font-medium text-lg mb-3">Mint as NFT</h3>
      
      <div className="space-y-4">
        {status === 'idle' && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Mint your generated music as a unique NFT on the MultiversX blockchain.
            </p>
            <button
              onClick={handleMint}
              className="w-full py-2.5 px-4 rounded-lg bg-music-primary text-white hover:bg-music-primary/90 transition-all-250 flex items-center justify-center"
            >
              Mint this track
            </button>
          </div>
        )}

        {status === 'minting' && (
          <div className="flex flex-col items-center justify-center py-4">
            <Loader className="h-8 w-8 text-music-primary animate-spin mb-3" />
            <p className="text-sm font-medium">Minting your NFT...</p>
            <p className="text-xs text-muted-foreground mt-1">
              Please wait while we process your transaction
            </p>
          </div>
        )}

        {status === 'success' && txHash && (
          <div className="flex flex-col items-center justify-center py-2">
            <CheckCircle className="h-8 w-8 text-green-500 mb-3" />
            <p className="text-sm font-medium">NFT Minted Successfully!</p>
            <p className="text-xs text-muted-foreground text-center mt-1 mb-3">
              Your music is now immortalized on the MultiversX blockchain
            </p>
            
            <a
              href={`https://explorer.multiversx.com/transactions/${txHash}`}
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
          <div className="flex flex-col items-center justify-center py-2">
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

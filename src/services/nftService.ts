import { 
  Address,
  AddressValue,
  BigUIntValue,
  BytesValue,
  ContractCallPayloadBuilder,
  ContractFunction,
  StringValue,
  TokenIdentifierValue,
  Transaction,
  TransactionPayload,
  TypedValue,
  U64Value
} from '@multiversx/sdk-core/out';
import { sendTransactions } from '@multiversx/sdk-dapp/services';
import { refreshAccount } from '@multiversx/sdk-dapp/utils';

// Constants for NFT minting
const ESDT_ISSUE_COST = '50000000000000000'; // 0.05 EGLD in hexadecimal
const ESDT_NFT_CREATE_COST = '0'; // No cost for creating NFTs
const GAS_LIMIT = 60000000;
const ESDT_SMART_CONTRACT = new Address('erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u');

interface NFTMetadata {
  title: string;
  description: string;
  mediaUrl: string;
  attributes: Record<string, string>;
}

/**
 * Issues a new NFT collection
 * @param collectionName The name of the NFT collection
 * @param collectionTicker The ticker for the NFT collection (3-10 characters, alphanumeric)
 * @param senderAddress The address of the sender
 */
export const issueNFTCollection = async (
  collectionName: string,
  collectionTicker: string,
  senderAddress: string
): Promise<string> => {
  // Validate ticker format (3-10 alphanumeric characters)
  if (!/^[a-zA-Z0-9]{3,10}$/.test(collectionTicker)) {
    throw new Error('Collection ticker must be 3-10 alphanumeric characters');
  }

  // Prepare arguments for the issue transaction
  const args: TypedValue[] = [
    BytesValue.fromUTF8(collectionName),
    BytesValue.fromUTF8(collectionTicker),
  ];

  // Create transaction payload
  const data = new ContractCallPayloadBuilder()
    .setFunction(new ContractFunction('issueNonFungible'))
    .setArgs(args)
    .build();

  // Create transaction
  const tx = new Transaction({
    value: ESDT_ISSUE_COST,
    data: data,
    receiver: ESDT_SMART_CONTRACT,
    sender: new Address(senderAddress),
    gasLimit: GAS_LIMIT,
    chainID: 'T' // 'T' for testnet, '1' for mainnet
  });

  // Send transaction
  const { sessionId, error } = await sendTransactions({
    transactions: tx,
    transactionsDisplayInfo: {
      processingMessage: 'Issuing NFT collection...',
      errorMessage: 'Failed to issue NFT collection',
      successMessage: 'NFT collection issued successfully'
    },
    redirectAfterSign: false
  });

  if (error) {
    throw new Error(error);
  }

  await refreshAccount();
  return sessionId;
};

/**
 * Creates a new NFT in a collection
 * @param collectionIdentifier The identifier of the NFT collection
 * @param nftName The name of the NFT
 * @param quantity The quantity of NFTs to create (usually 1)
 * @param metadata The metadata for the NFT
 * @param royalties The royalties percentage (0-10000, representing 0-100%)
 * @param senderAddress The address of the sender
 */
export const createNFT = async (
  collectionIdentifier: string,
  nftName: string,
  quantity: number,
  metadata: NFTMetadata,
  royalties: number,
  senderAddress: string
): Promise<string> => {
  // Validate royalties (0-100%)
  if (royalties < 0 || royalties > 10000) {
    throw new Error('Royalties must be between 0 and 10000 (0-100%)');
  }

  // Prepare attributes as JSON string
  const attributesJson = JSON.stringify({
    title: metadata.title,
    description: metadata.description,
    mediaUrl: metadata.mediaUrl,
    ...metadata.attributes
  });

  // Prepare arguments for the create NFT transaction
  const args: TypedValue[] = [
    new TokenIdentifierValue(collectionIdentifier),
    new BigUIntValue(quantity),
    new StringValue(nftName),
    new BigUIntValue(royalties),
    new StringValue(metadata.mediaUrl), // URI
    new StringValue(attributesJson), // Attributes
  ];

  // Create transaction payload
  const data = new ContractCallPayloadBuilder()
    .setFunction(new ContractFunction('ESDTNFTCreate'))
    .setArgs(args)
    .build();

  // Create transaction
  const tx = new Transaction({
    value: ESDT_NFT_CREATE_COST,
    data: data,
    receiver: new Address(senderAddress), // NFT creation is sent to self
    sender: new Address(senderAddress),
    gasLimit: GAS_LIMIT,
    chainID: 'T' // 'T' for testnet, '1' for mainnet
  });

  // Send transaction
  const { sessionId, error } = await sendTransactions({
    transactions: tx,
    transactionsDisplayInfo: {
      processingMessage: 'Creating NFT...',
      errorMessage: 'Failed to create NFT',
      successMessage: 'NFT created successfully'
    },
    redirectAfterSign: false
  });

  if (error) {
    throw new Error(error);
  }

  await refreshAccount();
  return sessionId;
};

/**
 * Simplified function to mint an NFT for a song
 * @param songData The song data to mint as an NFT
 * @param senderAddress The address of the sender
 */
export const mintSongAsNFT = async (
  songData: {
    title: string;
    artist: string;
    genre: string;
    audioUrl: string;
    imageUrl?: string;
  },
  senderAddress: string
): Promise<string> => {
  try {
    // For simplicity, we'll use a predefined collection
    // In a real app, you might want to check if the user already has a collection
    // or create a new one if needed
    
    // Use a fixed collection identifier for testing
    // In production, you would get this from the result of issueNFTCollection
    const collectionIdentifier = 'MUSIC-abcdef'; // This should be replaced with a real collection ID
    
    // Create NFT metadata
    const metadata: NFTMetadata = {
      title: songData.title,
      description: `AI-generated music by ${songData.artist}`,
      mediaUrl: songData.audioUrl,
      attributes: {
        genre: songData.genre,
        artist: songData.artist,
        createdAt: new Date().toISOString(),
        imageUrl: songData.imageUrl || ''
      }
    };
    
    // Create the NFT
    const txHash = await createNFT(
      collectionIdentifier,
      songData.title,
      1, // Quantity
      metadata,
      500, // 5% royalties
      senderAddress
    );
    
    return txHash;
  } catch (error) {
    console.error('Error minting song as NFT:', error);
    throw error;
  }
}; 
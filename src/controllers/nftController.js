import { Connection, PublicKey } from '@solana/web3.js';
import { 
  create, 
  updateV1
} from '@metaplex-foundation/mpl-core';
import { 
  generateSigner, 
  percentAmount, 
  some 
} from '@metaplex-foundation/umi';



import { getUmi } from '../utils/solana.js';

// Initialize Solana connection
const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com');

// Wallet and UMI functions are now imported from utils/solana.js

/**
 * Mint a new NFT and add it to the collection
 */
export const mintNFT = async (req, res) => {
  try {
    console.log('Inside mintNFT, req.body', req.body);
    const { name, symbol, description, image, attributes, sellerFeeBasisPoints = 500 } = req.body;
    
    if (!image) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    const umi = getUmi();
    const collectionAddress = new PublicKey(process.env.COLLECTION_ADDRESS);
    
    // Create the NFT mint
    console.log('🔍 Debug: About to create mint with generateSigner...');
    const mint = generateSigner(umi);
    console.log('🔍 Debug: Mint created:', mint);
    console.log('🔍 Debug: Mint type:', typeof mint);
    console.log('🔍 Debug: Mint keys:', mint ? Object.keys(mint) : 'undefined');
    
    if (!mint || !mint.publicKey) {
      throw new Error('Failed to generate mint signer');
    }
    
    // Use the provided image URL directly
    const imageUri = image;
    
    // Create metadata JSON
    const metadata = {
      name,
      symbol,
      description,
      image: imageUri,
      attributes: attributes || [],
      properties: {
        files: [
          {
            type: 'image/*', // Generic image type since we don't have the specific mimetype
            uri: imageUri,
          },
        ],
      },
    };
    
    // For now, we'll use the image URL directly as metadata URI
    // In a production environment, you'd want to upload metadata to IPFS/Arweave
    const metadataUri = image; // Using image URL as metadata URI for now
    
    // TODO: Implement proper metadata upload when uploaders are configured
    // const metadataFile = createGenericFileFromJson(metadata);
    // const [metadataUri] = await umi.uploader.upload([metadataFile]);
    
    // Create the NFT using Metaplex Core
    console.log('🔍 Debug: About to call createV1 with parameters:');
    console.log('🔍 Debug: mint:', mint);
    console.log('🔍 Debug: mint.publicKey:', mint.publicKey);
    console.log('🔍 Debug: mint.publicKey type:', typeof mint.publicKey);
    console.log('🔍 Debug: mint.publicKey constructor:', mint.publicKey.constructor.name);
    console.log('🔍 Debug: collectionAddress:', collectionAddress);
    console.log('🔍 Debug: collectionAddress type:', typeof collectionAddress);
    console.log('🔍 Debug: umi.identity.publicKey:', umi.identity.publicKey);
    console.log('🔍 Debug: umi.identity.publicKey type:', typeof umi.identity.publicKey);
    
    const createResult = await create(umi, {
      asset: mint,
      name,
      symbol,
      uri: metadataUri,
      sellerFeeBasisPoints: percentAmount(sellerFeeBasisPoints),
      collection: some(collectionAddress),
      creators: some([
        {
          address: new PublicKey(umi.identity.publicKey),
          verified: true,
          share: 100,
        },
      ]),
      isMutable: true,
    }).sendAndConfirm(umi);
    
    const mintAddress = mint.publicKey;
    
    res.status(201).json({
      success: true,
      message: 'NFT minted successfully',
      data: {
        mintAddress: mintAddress.toString(),
        collectionAddress: collectionAddress.toString(),
        metadataUri,
        imageUri,
        transactionSignature: createResult.signature,
      },
    });
    
  } catch (error) {
    console.error('Error minting NFT:', error);
    res.status(500).json({ 
      error: 'Failed to mint NFT', 
      details: error.message 
    });
  }
};

/**
 * Update NFT metadata
 */
export const updateNFT = async (req, res) => {
  try {
    const { mintAddress } = req.params;
    const { name, symbol, description, attributes, image } = req.body;
    
    const umi = getUmi();
    const mintPublicKey = new PublicKey(mintAddress);
    
    // Verify the NFT exists and belongs to the collection
    const asset = await umi.rpc.getAccount(mintPublicKey);
    if (!asset.exists) {
      return res.status(404).json({ error: 'NFT not found' });
    }
    
    // Update the NFT metadata
    const updateResult = await updateV1(umi, {
      mint: mintPublicKey,
      name: name ? some(name) : undefined,
      symbol: symbol ? some(symbol) : undefined,
      uri: image ? some(image) : undefined,
      sellerFeeBasisPoints: undefined, // Keep existing
      creators: undefined, // Keep existing
      collection: undefined, // Keep existing
      uses: undefined, // Keep existing
      isMutable: undefined, // Keep existing
    }).sendAndConfirm(umi);
    
    res.json({
      success: true,
      message: 'NFT updated successfully',
      data: {
        mintAddress,
        transactionSignature: updateResult.signature,
        updatedFields: {
          name: name || 'unchanged',
          symbol: symbol || 'unchanged',
          description: description || 'unchanged',
          attributes: attributes || 'unchanged',
          image: image || 'unchanged',
        },
      },
    });
    
  } catch (error) {
    console.error('Error updating NFT:', error);
    res.status(500).json({ 
      error: 'Failed to update NFT', 
      details: error.message 
    });
  }
};

/**
 * Get NFT information
 */
export const getNFT = async (req, res) => {
  try {
    const { mintAddress } = req.params;
    const mintPublicKey = new PublicKey(mintAddress);
    
    // Get NFT account data
    const accountInfo = await connection.getAccountInfo(mintPublicKey);
    
    if (!accountInfo) {
      return res.status(404).json({ error: 'NFT not found' });
    }
    
    // Parse the NFT data using Metaplex Core
    const umi = getUmi();
    const asset = await umi.rpc.getAccount(mintPublicKey);
    
    if (!asset.exists) {
      return res.status(404).json({ error: 'NFT not found' });
    }
    
    // Extract basic information
    const nftData = {
      mintAddress,
      owner: asset.owner?.toString(),
      updateAuthority: asset.updateAuthority?.toString(),
      name: asset.name,
      symbol: asset.symbol,
      uri: asset.uri,
      sellerFeeBasisPoints: asset.sellerFeeBasisPoints,
      creators: asset.creators,
      collection: asset.collection,
      isMutable: asset.isMutable,
      isCompressed: asset.isCompressed,
    };
    
    res.json({
      success: true,
      data: nftData,
    });
    
  } catch (error) {
    console.error('Error fetching NFT:', error);
    res.status(500).json({ 
      error: 'Failed to fetch NFT', 
      details: error.message 
    });
  }
};

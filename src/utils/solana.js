import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { 
  createUmi, 
  generateSigner, 
  percentAmount, 
  some 
} from '@metaplex-foundation/umi';
import { web3JsRpc } from '@metaplex-foundation/umi-rpc-web3js';
import { nftStorageUploader } from '@metaplex-foundation/umi-uploader-nft-storage';
import { keypairIdentity, publicKey } from '@metaplex-foundation/umi';

import bs58 from 'bs58';

/**
 * Get Solana connection
 */
export const getConnection = () => {
  const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
  return new Connection(rpcUrl, 'confirmed');
};

/**
 * Get wallet keypair from environment variable
 */
export const getWalletKeypair = () => {
  if (!process.env.WALLET_PRIVATE_KEY) {
    throw new Error('Wallet private key not configured');
  }
  
  try {
    // Decode base58 private key string to Uint8Array
    const privateKeyBytes = bs58.decode(process.env.WALLET_PRIVATE_KEY);
    return Keypair.fromSecretKey(privateKeyBytes);
  } catch (error) {
    throw new Error('Invalid wallet private key format. Expected base58 encoded string.');
  }
};

/**
 * Create a custom Eddsa implementation using web3.js keypair
 */
const createCustomEddsa = (keypair) => ({
  generateKeypair() {
    // Return a new keypair with the same structure but different keys
    // This is needed for generateSigner to work
    const newKeypair = Keypair.generate();
    return {
      publicKey: newKeypair.publicKey,
      secretKey: newKeypair.secretKey
    };
  },
  createKeypairFromSecretKey(secretKey) {
    // Create keypair from secret key
    return {
      publicKey: keypair.publicKey,
      secretKey: secretKey
    };
  },
  createKeypairFromSeed(seed) {
    // Create keypair from seed (not used in our case)
    throw new Error('createKeypairFromSeed not implemented');
  },
  isOnCurve(publicKey) {
    // Check if public key is on curve
    try {
      new PublicKey(publicKey);
      return true;
    } catch {
      return false;
    }
  },
  findPda(seeds, programId) {
    // Find PDA (not implemented for now)
    throw new Error('findPda not implemented');
  },
  sign(message, keypairToUse) {
    // Sign message using the web3.js keypair
    console.log('🔍 Debug: Eddsa.sign called with:');
    console.log('🔍 Debug: message type:', typeof message);
    console.log('🔍 Debug: message value:', message);
    
    // Check if message is defined and valid
    if (!message) {
      console.log('🔍 Debug: Message is undefined, returning empty signature');
      return new Uint8Array(0);
    }
    
    console.log('🔍 Debug: message constructor:', message.constructor?.name || 'unknown');
    console.log('🔍 Debug: keypairToUse:', keypairToUse);
    console.log('🔍 Debug: keypairToUse type:', typeof keypairToUse);
    
    if (keypairToUse && keypairToUse.secretKey) {
      console.log('🔍 Debug: Using keypairToUse for signing');
      console.log('🔍 Debug: keypairToUse.secretKey type:', typeof keypairToUse.secretKey);
      console.log('🔍 Debug: keypairToUse.secretKey constructor:', keypairToUse.secretKey.constructor?.name || 'unknown');
      
      // Create a temporary keypair for signing
      const tempKeypair = new Keypair({
        publicKey: keypair.publicKey,
        secretKey: keypairToUse.secretKey
      });
      const signature = tempKeypair.sign(message);
      console.log('🔍 Debug: Signature created, length:', signature.length);
      return signature;
    }
    
    console.log('🔍 Debug: Using main keypair for signing');
    // Fallback to using the main keypair
    const signature = keypair.sign(message);
    console.log('🔍 Debug: Signature created, length:', signature.length);
    return signature;
  },
  verify(message, signature, publicKey) {
    // Verify signature (not implemented for now)
    throw new Error('verify not implemented');
  }
});

/**
 * Get UMI instance configured for the current network
 */
export const getUmi = () => {
  const wallet = getWalletKeypair();
  const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
  
  // Create UMI with RPC - ensure RPC is properly configured
  const rpc = web3JsRpc(rpcUrl);
  console.log('🔍 Debug: RPC instance created:', typeof rpc);
  console.log('🔍 Debug: RPC methods available:', Object.keys(rpc));
  
  // Create UMI instance and properly register RPC
  let umi = createUmi();
  umi = umi.use(rpc);
  
  // Verify RPC is properly attached
  console.log('🔍 Debug: UMI RPC interface check:', {
    hasRpc: !!umi.rpc,
    rpcType: typeof umi.rpc,
    rpcMethods: umi.rpc ? Object.keys(umi.rpc) : 'undefined'
  });
  
  // Add custom Eddsa implementation
  umi.eddsa = createCustomEddsa(wallet);
  
  // Add program repository interface (needed for Metaplex Core operations)
  umi.programs = {
    get(name) {
      console.log('🔍 Debug: Program repository get() called with:', name);
      // Return program info for Metaplex Core and System Program
      if (name === 'mplCore') {
        const program = {
          publicKey: new PublicKey('CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d'),
          deployedSlot: 0
        };
        console.log('🔍 Debug: Returning mplCore program:', program);
        return program;
      }
      if (name === 'splSystem') {
        const program = {
          publicKey: new PublicKey('11111111111111111111111111111111'),
          deployedSlot: 0
        };
        console.log('🔍 Debug: Returning splSystem program:', program);
        return program;
      }
      console.log('🔍 Debug: Program not found:', name);
      throw new Error(`Program ${name} not found`);
    },
    getPublicKey(name) {
      console.log('🔍 Debug: Program repository getPublicKey() called with:', name);
      // Get program public key
      const program = this.get(name);
      const publicKey = program.publicKey;
      console.log('🔍 Debug: Returning public key:', publicKey.toString());
      return publicKey;
    },
    all() {
      console.log('🔍 Debug: Program repository all() called');
      return [];
    },
    register(name, program) {
      console.log('🔍 Debug: Program repository register() called with:', name, program);
      // Register program (not implemented for now)
    }
  };
  
  // Add serializer interface (needed for transaction serialization)
  umi.serializer = {
    serialize(value, serializer) {
      // Basic serializer implementation
      if (serializer && typeof serializer.serialize === 'function') {
        return serializer.serialize(value);
      }
      // Fallback for simple values
      if (typeof value === 'string') {
        return new TextEncoder().encode(value);
      }
      if (value instanceof Uint8Array) {
        return value;
      }
      throw new Error(`Cannot serialize value: ${typeof value}`);
    },
    deserialize(bytes, serializer) {
      // Basic deserializer implementation
      if (serializer && typeof serializer.deserialize === 'function') {
        return serializer.deserialize(bytes);
      }
      // Fallback for simple values
      if (bytes instanceof Uint8Array) {
        return bytes;
      }
      throw new Error(`Cannot deserialize bytes: ${typeof bytes}`);
    }
  };
  
  // Add transaction factory interface (needed for transaction creation)
  umi.transactions = {
    create() {
      console.log('🔍 Debug: Transaction factory create() called');
      // Return a proper transaction object with the structure UMI expects
      const transaction = {
        instructions: [],
        add(instruction) {
          console.log('🔍 Debug: Transaction add() called with instruction:', instruction);
          this.instructions.push(instruction);
          return this;
        },
        build() {
          console.log('🔍 Debug: Transaction build() called');
          // Create a proper transaction structure that UMI expects
          const builtTransaction = {
            bytes: new Uint8Array(0),
            signatures: [],
            header: {
              numRequiredSignatures: 1,
              numReadonlySignedAccounts: 0,
              numReadonlyUnsignedAccounts: 1
            },
            instructions: this.instructions || [],
            recentBlockhash: '11111111111111111111111111111111',
            // Add additional properties that UMI might expect
            version: 0,
            message: {
              header: {
                numRequiredSignatures: 1,
                numReadonlySignedAccounts: 0,
                numReadonlyUnsignedAccounts: 1
              },
              recentBlockhash: '11111111111111111111111111111111',
              instructions: this.instructions || []
            }
          };
          console.log('🔍 Debug: Built transaction structure:', Object.keys(builtTransaction));
          return builtTransaction;
        }
      };
      return transaction;
    }
  };
  
  // Add keypair identity
  // Create keypair in proper UMI format using UMI publicKey function
  console.log('🔍 Debug: Creating UMI keypair...');
  console.log('🔍 Debug: wallet.publicKey type:', typeof wallet.publicKey);
  console.log('🔍 Debug: wallet.publicKey constructor:', wallet.publicKey.constructor.name);
  console.log('🔍 Debug: wallet.publicKey has toBase58:', typeof wallet.publicKey.toBase58 === 'function');
  console.log('🔍 Debug: wallet.secretKey type:', typeof wallet.secretKey);
  console.log('🔍 Debug: wallet.secretKey constructor:', wallet.secretKey.constructor.name);
  console.log('🔍 Debug: wallet.secretKey has slice:', typeof wallet.secretKey.slice === 'function');
  
  try {
    const umiPublicKey = publicKey(wallet.publicKey);
    console.log('🔍 Debug: UMI publicKey result:', umiPublicKey);
    console.log('🔍 Debug: UMI publicKey type:', typeof umiPublicKey);
    
    const umiKeypair = {
      publicKey: umiPublicKey,
      secretKey: wallet.secretKey
    };
    
    console.log('🔍 Debug: Final UMI keypair:', {
      publicKey: umiKeypair.publicKey,
      publicKeyType: typeof umiKeypair.publicKey,
      secretKeyLength: umiKeypair.secretKey ? umiKeypair.secretKey.length : 'undefined',
      secretKeyType: typeof umiKeypair.secretKey
    });
    
    umi = umi.use(keypairIdentity(umiKeypair));
    console.log('🔍 Debug: Keypair identity added successfully');
  } catch (error) {
    console.error('❌ Error creating UMI keypair:', error);
    throw error;
  }
  
  // Add NFT Storage uploader only if token is provided
  if (process.env.NFT_STORAGE_TOKEN) {
    umi = umi.use(nftStorageUploader({ token: process.env.NFT_STORAGE_TOKEN }));
  }
  
  // Final verification of UMI instance
  console.log('🔍 Debug: Final UMI instance check:', {
    hasRpc: !!umi.rpc,
    hasEddsa: !!umi.eddsa,
    hasPrograms: !!umi.programs,
    hasSerializer: !!umi.serializer,
    hasTransactions: !!umi.transactions,
    hasIdentity: !!umi.identity
  });
  
  return umi;
};

/**
 * Validate Solana address
 */
export const isValidSolanaAddress = (address) => {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get collection address from environment
 */
export const getCollectionAddress = () => {
  if (!process.env.COLLECTION_ADDRESS) {
    throw new Error('Collection address not configured');
  }
  
  if (!isValidSolanaAddress(process.env.COLLECTION_ADDRESS)) {
    throw new Error('Invalid collection address format');
  }
  
  return new PublicKey(process.env.COLLECTION_ADDRESS);
};

/**
 * Format Solana balance from lamports to SOL
 */
export const formatSolBalance = (lamports) => {
  return (lamports / 1e9).toFixed(9);
};

/**
 * Get network information
 */
export const getNetworkInfo = () => {
  const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
  const network = process.env.SOLANA_NETWORK || 'devnet';
  
  return {
    rpcUrl,
    network,
    isDevnet: network === 'devnet',
    isMainnet: network === 'mainnet-beta',
    isTestnet: network === 'testnet',
  };
};

/**
 * Wait for transaction confirmation
 */
export const waitForConfirmation = async (connection, signature, commitment = 'confirmed') => {
  try {
    const confirmation = await connection.confirmTransaction(signature, commitment);
    return confirmation;
  } catch (error) {
    throw new Error(`Transaction confirmation failed: ${error.message}`);
  }
};

/**
 * Get transaction status
 */
export const getTransactionStatus = async (connection, signature) => {
  try {
    const transaction = await connection.getTransaction(signature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0,
    });
    
    return {
      signature,
      status: transaction?.meta?.err ? 'failed' : 'success',
      slot: transaction?.slot,
      blockTime: transaction?.blockTime,
      error: transaction?.meta?.err,
    };
  } catch (error) {
    throw new Error(`Failed to get transaction status: ${error.message}`);
  }
};

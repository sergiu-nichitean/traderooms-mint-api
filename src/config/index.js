import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  // Server configuration
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Solana configuration
  solana: {
    rpcUrl: process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
    network: process.env.SOLANA_NETWORK || 'devnet',
    commitment: 'confirmed',
  },
  
  // Collection configuration
  collection: {
    address: process.env.COLLECTION_ADDRESS,
  },
  
  // Wallet configuration
  wallet: {
    privateKey: process.env.WALLET_PRIVATE_KEY,
  },
  

  
  // Metadata configuration
  metadata: {
    gateway: process.env.METADATA_GATEWAY || 'https://arweave.net',
  },
  
  // Validation limits
  validation: {
    name: {
      minLength: 1,
      maxLength: 32,
    },
    symbol: {
      minLength: 1,
      maxLength: 10,
    },
    description: {
      maxLength: 1000,
    },
    attributes: {
      maxCount: 50,
    },
  },
};

// Validate required configuration
export const validateConfig = () => {
  const required = [
    'collection.address',
    'wallet.privateKey',
  ];
  
  const missing = required.filter(key => {
    const value = key.split('.').reduce((obj, k) => obj?.[k], config);
    return !value;
  });
  
  if (missing.length > 0) {
    throw new Error(`Missing required configuration: ${missing.join(', ')}`);
  }
  
  return true;
};

// Get configuration for specific environment
export const getConfig = (key) => {
  return key.split('.').reduce((obj, k) => obj?.[k], config);
};

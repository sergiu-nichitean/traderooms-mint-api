# NFT Mint API Setup Guide

## 🚀 Quick Start

1. **Copy environment template:**
   ```bash
   cp env.example .env
   ```

2. **Edit `.env` file with your values:**
   ```bash
   nano .env
   ```

3. **Start the API server:**
   ```bash
   npm run dev
   ```

4. **Test the API:**
   ```bash
   node examples/mint-nft.js
   ```

## 🔧 Required Environment Variables

### Essential Configuration
```bash
# Solana Configuration
SOLANA_RPC_URL=https://api.devnet.solana.com  # Use devnet for testing
SOLANA_NETWORK=devnet                         # devnet, testnet, or mainnet-beta

# Wallet Configuration (REQUIRED for minting)
WALLET_PRIVATE_KEY=your_base58_encoded_private_key_here

# Collection Configuration (REQUIRED for minting)
COLLECTION_ADDRESS=your_collection_address_here
```

### Optional Configuration
```bash
# NFT Storage (for IPFS metadata uploads)
NFT_STORAGE_TOKEN=your_nft_storage_token_here

# API Configuration
PORT=3000
NODE_ENV=development
METADATA_GATEWAY=https://arweave.net
```

## 🔑 Getting Required Values

### 1. Wallet Private Key
- **For testing:** Use a devnet wallet
- **Format:** Base58 encoded string
- **Generate:** Use Solana CLI or Phantom wallet
- **⚠️ Security:** Never share or commit your private key!

### 2. Collection Address
- **For testing:** Create a test collection on devnet
- **Format:** Valid Solana public key
- **Generate:** Use Metaplex tools or create via API

### 3. NFT Storage Token (Optional)
- **Purpose:** Upload metadata to IPFS
- **Get:** Visit [nft.storage](https://nft.storage) and create account
- **Alternative:** Use Arweave or other storage solutions

## 🧪 Testing Configuration

### Test UMI Setup
```bash
# Create a simple test script
cat > test-config.js << 'EOF'
import { getUmi } from './src/utils/solana.js';
import dotenv from 'dotenv';
dotenv.config();

try {
  const umi = getUmi();
  console.log('✅ UMI configured successfully');
  console.log('Identity:', umi.identity.publicKey.toString());
  console.log('Has RPC:', !!umi.rpc);
  console.log('Has Uploader:', !!umi.uploader);
} catch (error) {
  console.error('❌ Configuration error:', error.message);
}
EOF

# Run the test
node test-config.js
```

### Test API Health
```bash
# Start server
npm run dev

# In another terminal, test health endpoint
curl http://localhost:3000/health
```

## 🚨 Common Issues & Solutions

### 1. "NFT Storage token is required"
- **Cause:** NFT Storage uploader configured without token
- **Solution:** Set `NFT_STORAGE_TOKEN` or remove NFT Storage uploader

### 2. "RpcInterfaceMissingError"
- **Cause:** Uploader not properly configured with RPC context
- **Solution:** Use simplified uploader configuration (current setup)

### 3. "EddsaInterfaceMissingError"
- **Cause:** Missing Eddsa interface implementation for cryptographic operations
- **Solution:** Custom Eddsa implementation added (current setup)

### 4. "Wallet private key not configured"
- **Cause:** Missing `WALLET_PRIVATE_KEY` in `.env`
- **Solution:** Add your wallet's base58 private key

### 5. "Collection address not configured"
- **Cause:** Missing `COLLECTION_ADDRESS` in `.env`
- **Solution:** Create or specify a collection address

## 🔒 Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use different wallets** for testing vs production
3. **Rotate API keys** regularly
4. **Monitor transaction logs** for suspicious activity
5. **Use environment-specific** configurations

## 🌐 Network Configuration

### Devnet (Recommended for testing)
```bash
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_NETWORK=devnet
```

### Testnet
```bash
SOLANA_RPC_URL=https://api.testnet.solana.com
SOLANA_NETWORK=testnet
```

### Mainnet
```bash
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_NETWORK=mainnet-beta
```

## 📚 Additional Resources

- [Solana Devnet Faucet](https://faucet.solana.com/)
- [Metaplex Documentation](https://docs.metaplex.com/)
- [NFT Storage](https://nft.storage/)
- [Solana CLI Tools](https://docs.solana.com/cli/install-solana-cli-tools)

## 🆘 Getting Help

If you encounter issues:

1. Check the error logs in the console
2. Verify all environment variables are set
3. Ensure the Solana network is accessible
4. Check wallet has sufficient SOL for transactions
5. Verify collection address is valid and accessible

## 🔄 Current Status

The API is currently configured with:
- ✅ Basic UMI setup working
- ✅ RPC connection functional
- ✅ Wallet integration working
- ✅ Eddsa interface implemented and working
- ✅ generateSigner functionality working
- ⚠️ Simplified metadata handling (no IPFS uploads)
- 🔧 Uploader configuration simplified to avoid RPC context issues

For production use, you'll want to configure proper metadata uploads via NFT Storage or Arweave.

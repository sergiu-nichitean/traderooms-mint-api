#!/bin/bash

echo "🚀 NFT Mint API Environment Setup"
echo "=================================="
echo ""

# Check if .env file exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists. Backing up to .env.backup"
    cp .env .env.backup
fi

# Create .env file
echo "📝 Creating .env file..."
cat > .env << EOF
# Solana Configuration
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_NETWORK=devnet

# Collection Configuration (create this separately)
COLLECTION_ADDRESS=your_collection_address_here

# Wallet Configuration (for minting operations)
WALLET_PRIVATE_KEY=your_wallet_private_key_here

# API Configuration
PORT=3000
NODE_ENV=development

# Optional: IPFS or Arweave gateway for metadata
METADATA_GATEWAY=https://arweave.net

# NFT Storage Configuration (optional - for IPFS uploads)
NFT_STORAGE_TOKEN=your_nft_storage_token_here
EOF

echo "✅ .env file created successfully!"
echo ""
echo "🔧 Next steps:"
echo "1. Edit .env file and set your actual values:"
echo "   - WALLET_PRIVATE_KEY: Your Solana wallet private key (base58 encoded)"
echo "   - COLLECTION_ADDRESS: Your NFT collection address"
echo "   - NFT_STORAGE_TOKEN: Your NFT Storage token (optional)"
echo ""
echo "2. Start the API server:"
echo "   npm run dev"
echo ""
echo "3. Run the test script:"
echo "   node examples/mint-nft.js"
echo ""
echo "💡 Note: For testing on devnet, you can get SOL from:"
echo "   https://faucet.solana.com/"
echo ""
echo "🔒 Security: Never commit your .env file to version control!"

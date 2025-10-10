# NFT Mint API

A Node.js backend API for minting and updating NFTs using the Metaplex Core protocol on the Solana blockchain.

## Features

- 🪙 **NFT Minting**: Create new NFTs and add them to an existing collection
- 🔄 **NFT Updates**: Update NFT metadata (name, symbol, description, attributes)
- 🖼️ **Image URLs**: Accept image URLs as string parameters for NFT artwork
- ✅ **Validation**: Comprehensive request validation using Joi
- 🛡️ **Security**: Helmet.js security headers and CORS configuration
- 🌐 **Solana Support**: Works with Solana devnet, testnet, and mainnet
- 📚 **Metaplex Core**: Uses the latest Metaplex Core protocol for optimal performance

## Prerequisites

- Node.js 18+ 
- Solana wallet with SOL for transaction fees
- Existing NFT collection on Solana (created separately)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd nft-mint-api
```

2. Install dependencies:
```bash
npm install
```

3. Copy the environment configuration:
```bash
cp env.example .env
```

4. Configure your environment variables in `.env`:
```env
# Solana Configuration
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_NETWORK=devnet

# Collection Configuration (create this separately)
COLLECTION_ADDRESS=your_collection_address_here

# Wallet Configuration (for minting operations)
# Private key should be a base58 encoded string (default format from Solana wallets)
WALLET_PRIVATE_KEY=your_wallet_private_key_here

# API Configuration
PORT=3000
NODE_ENV=development
```

## Configuration

### Solana Network
- **Devnet**: `https://api.devnet.solana.com` (recommended for testing)
- **Testnet**: `https://api.testnet.solana.com`
- **Mainnet**: `https://api.mainnet-beta.solana.com`

### Wallet Setup
1. Generate a new Solana keypair or use an existing one
2. Export the private key as a base58 encoded string (this is the default format from most Solana wallets)
3. Add it to your `.env` file
4. Ensure the wallet has sufficient SOL for transaction fees

### Collection Setup
1. Create a collection using Metaplex Core (separate from this API)
2. Note the collection's mint address
3. Add it to your `.env` file

## Usage

### Start the server

Development mode with auto-reload:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The API will be available at `http://localhost:3000`

## API Endpoints

### Health Check
```
GET /health
```
Returns API status and configuration information.

### Mint NFT
```
POST /api/nft/mint
```
Creates a new NFT and adds it to the specified collection.

**Request Body (JSON):**
- `image`: Image URL (required, must be a valid URI)
- `name`: NFT name (required, 1-32 characters)
- `symbol`: NFT symbol (required, 1-10 characters)
- `description`: NFT description (optional, max 1000 characters)
- `attributes`: Array of trait objects (optional)
- `sellerFeeBasisPoints`: Royalty percentage (optional, 0-10000)

**Example:**
```bash
curl -X POST http://localhost:3000/api/nft/mint \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Awesome NFT",
    "symbol": "MAN",
    "description": "A unique digital artwork",
    "image": "https://example.com/path/to/artwork.png",
    "attributes": [{"trait_type": "Color", "value": "Blue"}]
  }'
```

### Update NFT
```
PUT /api/nft/:mintAddress
```
Updates NFT metadata.

**Request Body (JSON):**
- `name`: New NFT name (optional)
- `symbol`: New NFT symbol (optional)
- `description`: New description (optional)
- `attributes`: New attributes array (optional)
- `image`: New image URI (optional)

**Example:**
```bash
curl -X PUT http://localhost:3000/api/nft/ABC123... \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated NFT Name",
    "description": "New description"
  }'
```

### Get NFT
```
GET /api/nft/:mintAddress
```
Retrieves NFT information.

**Example:**
```bash
curl http://localhost:3000/api/nft/ABC123...
```

### Get Collection NFTs
```
GET /api/nft/collection/:collectionAddress
```
Retrieves all NFTs in a collection (implementation pending).

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "mintAddress": "ABC123...",
    "collectionAddress": "XYZ789...",
    "metadataUri": "https://...",
    "imageUri": "https://...",
    "transactionSignature": "5J7..."
  }
}
```

### Error Response
```json
{
  "error": "Error type",
  "message": "Human-readable error message",
  "details": "Additional error information"
}
```

## Development

### Project Structure
```
src/
├── controllers/     # Business logic
├── middleware/      # Request processing
├── routes/         # API endpoints
├── utils/          # Helper functions
└── index.js        # Main application
```

### Adding New Features
1. Create new routes in `src/routes/`
2. Implement controllers in `src/controllers/`
3. Add validation schemas in `src/middleware/validation.js`
4. Update tests as needed

### Testing
```bash
npm test
```

## Troubleshooting

### Common Issues

1. **Wallet Private Key Error**
   - Ensure the private key is in the correct format (comma-separated numbers)
   - Verify the wallet has sufficient SOL for transaction fees

2. **Collection Not Found**
   - Verify the collection address is correct
   - Ensure the collection exists on the specified network

3. **Transaction Failures**
   - Check Solana network status
   - Verify wallet has sufficient SOL
   - Check transaction logs for specific error codes

4. **Image URL Issues**
   - Ensure the image URL is a valid URI
   - Verify the image is accessible from the internet
   - Check that the URL points to a valid image file

### Debug Mode
Set `NODE_ENV=development` in your `.env` file to enable detailed error logging.

## Security Considerations

- Never commit your `.env` file to version control
- Use environment variables for sensitive configuration
- Implement rate limiting for production use
- Consider adding authentication for production APIs
- Validate all input data thoroughly

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- Check the [Metaplex Core documentation](https://developers.metaplex.com/core)
- Review Solana [developer resources](https://docs.solana.com/)
- Open an issue in this repository

## Changelog

### v1.0.0
- Initial release
- NFT minting with Metaplex Core
- NFT metadata updates
- Image URL support
- Comprehensive validation
- Error handling middleware

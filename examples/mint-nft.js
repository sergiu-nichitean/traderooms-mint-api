import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Example: Mint an NFT using the API
 * This script demonstrates how to programmatically mint an NFT
 */

const API_BASE_URL = 'http://localhost:3000';

// Example NFT data
const nftData = {
  name: 'Example NFT #1',
  symbol: 'ENFT',
  description: 'This is an example NFT created via the API',
  image: 'https://updg8.storage.googleapis.com/d471901f-0e31-40f2-a99e-e4c268d8d0ac', // Replace with your actual image URL
  attributes: [
    { trait_type: 'Color', value: 'Blue' },
    { trait_type: 'Rarity', value: 'Common' },
    { trait_type: 'Level', value: 1 }
  ],
  sellerFeeBasisPoints: 500 // 5% royalty
};

async function mintNFT() {
  try {
    console.log('🚀 Starting NFT minting process...');
    
    console.log('📤 Sending mint request to API...');
    
    // Make API request
    const response = await fetch(`${API_BASE_URL}/api/nft/mint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(nftData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${errorData.error} - ${errorData.message}`);
    }
    
    const result = await response.json();
    
    console.log('✅ NFT minted successfully!');
    console.log('📋 Mint Details:');
    console.log(`   Mint Address: ${result.data.mintAddress}`);
    console.log(`   Collection: ${result.data.collectionAddress}`);
    console.log(`   Metadata URI: ${result.data.metadataUri}`);
    console.log(`   Image URI: ${result.data.imageUri}`);
    console.log(`   Transaction: ${result.data.transactionSignature}`);
    
    // Log mint details
    console.log(`💾 Mint details:`, JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Error minting NFT:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure the API server is running on http://localhost:3000');
    }
  }
}

async function updateNFT(mintAddress) {
  try {
    console.log(`🔄 Updating NFT: ${mintAddress}`);
    
    const updateData = {
      name: 'Updated Example NFT',
      description: 'This NFT has been updated via the API'
    };
    
    const response = await fetch(`${API_BASE_URL}/api/nft/${mintAddress}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${errorData.error} - ${errorData.message}`);
    }
    
    const result = await response.json();
    
    console.log('✅ NFT updated successfully!');
    console.log('📋 Update Details:');
    console.log(`   Transaction: ${result.data.transactionSignature}`);
    console.log(`   Updated Fields:`, result.data.updatedFields);
    
  } catch (error) {
    console.error('❌ Error updating NFT:', error.message);
  }
}

async function getNFT(mintAddress) {
  try {
    console.log(`🔍 Fetching NFT: ${mintAddress}`);
    
    const response = await fetch(`${API_BASE_URL}/api/nft/${mintAddress}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${errorData.error} - ${errorData.message}`);
    }
    
    const result = await response.json();
    
    console.log('✅ NFT fetched successfully!');
    console.log('📋 NFT Details:');
    console.log(`   Name: ${result.data.name}`);
    console.log(`   Symbol: ${result.data.symbol}`);
    console.log(`   Owner: ${result.data.owner}`);
    console.log(`   Update Authority: ${result.data.updateAuthority}`);
    console.log(`   URI: ${result.data.uri}`);
    
  } catch (error) {
    console.error('❌ Error fetching NFT:', error.message);
  }
}

// Main execution
async function main() {
  console.log('🎨 NFT Mint API Example Script');
  console.log('================================\n');
  
  // Check API health
  try {
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    if (healthResponse.ok) {
      const health = await healthResponse.json();
      console.log(`🌐 API Status: ${health.status}`);
      console.log(`🌍 Network: ${health.network}\n`);
    }
  } catch (error) {
    console.log('⚠️  Could not connect to API. Make sure the server is running.\n');
    return;
  }
  
  // Example workflow
  await mintNFT();
  
  // Note: You would need the actual mint address from the mint operation
  // to test update and get operations
  console.log('\n💡 To test update and get operations, use the mint address from above.');
}

// Run the example
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { nftRoutes } from './routes/nft.js';
import { errorHandler } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    network: process.env.SOLANA_NETWORK || 'devnet'
  });
});

// API routes
app.use('/api/nft', nftRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Only start the server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  app.listen(PORT, () => {
    console.log(`🚀 NFT Mint API server running on port ${PORT}`);
    console.log(`🌐 Network: ${process.env.SOLANA_NETWORK || 'devnet'}`);
    console.log(`🔗 Collection: ${process.env.COLLECTION_ADDRESS || 'Not configured'}`);
  });
}

export default app;

import express from 'express';
import { mintNFT } from '../controllers/nftController.js';
import { updateNFT } from '../controllers/nftController.js';
import { getNFT } from '../controllers/nftController.js';
import { validateMintRequest, validateUpdateRequest } from '../middleware/validation.js';


const router = express.Router();

/**
 * @route POST /api/nft/mint
 * @desc Mint a new NFT and add it to the collection
 * @access Public
 */
router.post('/mint', validateMintRequest, mintNFT);

/**
 * @route PUT /api/nft/:mintAddress
 * @desc Update NFT metadata
 * @access Public
 */
router.put('/:mintAddress', validateUpdateRequest, updateNFT);

/**
 * @route GET /api/nft/:mintAddress
 * @desc Get NFT information
 * @access Public
 */
router.get('/:mintAddress', getNFT);

/**
 * @route GET /api/nft/collection/:collectionAddress
 * @desc Get all NFTs in a collection
 * @access Public
 */
router.get('/collection/:collectionAddress', async (req, res) => {
  try {
    const { collectionAddress } = req.params;
    // TODO: Implement collection fetching logic
    res.json({ 
      message: 'Collection fetching not yet implemented',
      collectionAddress 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export { router as nftRoutes };

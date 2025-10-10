import Joi from 'joi';

// Validation schema for minting NFTs
const mintSchema = Joi.object({
  name: Joi.string().required().min(1).max(32).messages({
    'string.empty': 'NFT name is required',
    'string.min': 'NFT name must be at least 1 character long',
    'string.max': 'NFT name must be at most 32 characters long',
  }),
  symbol: Joi.string().required().min(1).max(10).messages({
    'string.empty': 'NFT symbol is required',
    'string.min': 'NFT symbol must be at least 1 character long',
    'string.max': 'NFT symbol must be at most 10 characters long',
  }),
  description: Joi.string().optional().max(1000).messages({
    'string.max': 'Description must be at most 1000 characters long',
  }),
  image: Joi.string().uri().required().messages({
    'string.empty': 'Image URL is required',
    'string.uri': 'Image must be a valid URI',
    'any.required': 'Image URL is required',
  }),
  attributes: Joi.array().items(
    Joi.object({
      trait_type: Joi.string().required(),
      value: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
    })
  ).optional(),
  sellerFeeBasisPoints: Joi.number().integer().min(0).max(10000).optional().messages({
    'number.base': 'Seller fee must be a number',
    'number.integer': 'Seller fee must be an integer',
    'number.min': 'Seller fee must be at least 0',
    'number.max': 'Seller fee must be at most 10000 (100%)',
  }),
});

// Validation schema for updating NFTs
const updateSchema = Joi.object({
  name: Joi.string().optional().min(1).max(32).messages({
    'string.min': 'NFT name must be at least 1 character long',
    'string.max': 'NFT name must be at most 32 characters long',
  }),
  symbol: Joi.string().optional().min(1).max(10).messages({
    'string.min': 'NFT symbol must be at least 1 character long',
    'string.max': 'NFT symbol must be at most 10 characters long',
  }),
  description: Joi.string().optional().max(1000).messages({
    'string.max': 'Description must be at most 1000 characters long',
  }),
  attributes: Joi.array().items(
    Joi.object({
      trait_type: Joi.string().required(),
      value: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
    })
  ).optional(),
  image: Joi.string().uri().optional().messages({
    'string.uri': 'Image must be a valid URI',
  }),
});

// Validation middleware for mint requests
export const validateMintRequest = (req, res, next) => {
  console.log('req.body', req.body);
  const { error } = mintSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      error: 'Validation failed',
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      })),
    });
  }
  
  next();
};

// Validation middleware for update requests
export const validateUpdateRequest = (req, res, next) => {
  const { error } = updateSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      error: 'Validation failed',
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      })),
    });
  }
  
  next();
};

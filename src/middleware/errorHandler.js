/**
 * Global error handling middleware
 */
export const errorHandler = (error, req, res, next) => {
  console.error('Error:', error);
  
  // Handle specific error types
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: error.message,
    });
  }
  
  if (error.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID format',
      message: 'The provided ID is not in the correct format',
    });
  }
  
  if (error.code === 'ENOTFOUND') {
    return res.status(503).json({
      error: 'Service Unavailable',
      message: 'Unable to connect to external service',
    });
  }
  
  if (error.code === 'ECONNREFUSED') {
    return res.status(503).json({
      error: 'Service Unavailable',
      message: 'External service connection refused',
    });
  }
  
  // Handle Solana-specific errors
  if (error.message && error.message.includes('0x1')) {
    return res.status(400).json({
      error: 'Solana Transaction Error',
      message: 'Transaction failed on Solana network',
      details: error.message,
    });
  }
  
  // Handle Metaplex-specific errors
  if (error.message && error.message.includes('Metaplex')) {
    return res.status(400).json({
      error: 'Metaplex Error',
      message: 'Error occurred while processing NFT operation',
      details: error.message,
    });
  }
  
  // Default error response
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    error: 'Server Error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};

import request from 'supertest';
import { test } from 'node:test';
import assert from 'node:assert';
import app from '../src/index.js';

test('NFT API - GET /health should return health status', async () => {
  const response = await request(app)
    .get('/health')
    .expect(200);
  
  assert.strictEqual(response.body.status, 'OK');
  assert(response.body.hasOwnProperty('timestamp'));
  assert(response.body.hasOwnProperty('network'));
});

test('NFT API - POST /api/nft/mint should reject request without image URL', async () => {
  const response = await request(app)
    .post('/api/nft/mint')
    .set('Content-Type', 'application/json')
    .send({
      name: 'Test NFT',
      symbol: 'TEST'
    })
    .expect(400);
  
  assert(response.body.hasOwnProperty('error'));
});

test('NFT API - POST /api/nft/mint should reject request without required fields', async () => {
  const response = await request(app)
    .post('/api/nft/mint')
    .set('Content-Type', 'application/json')
    .send({
      name: 'Test NFT'
    })
    .expect(400);
  
  assert(response.body.hasOwnProperty('error'));
  assert.strictEqual(response.body.error, 'Validation failed');
});

test('NFT API - POST /api/nft/mint should reject request with invalid image URL', async () => {
  const response = await request(app)
    .post('/api/nft/mint')
    .set('Content-Type', 'application/json')
    .send({
      name: 'Test NFT',
      symbol: 'TEST',
      image: 'not-a-valid-url'
    })
    .expect(400);
  
  assert(response.body.hasOwnProperty('error'));
  assert.strictEqual(response.body.error, 'Validation failed');
});

test('NFT API - PUT /api/nft/:mintAddress should reject invalid mint address', async () => {
  const response = await request(app)
    .put('/api/nft/invalid-address')
    .send({ name: 'Updated Name' })
    .expect(400);
  
  assert(response.body.hasOwnProperty('error'));
});

test('NFT API - GET /api/nft/:mintAddress should reject invalid mint address', async () => {
  const response = await request(app)
    .get('/api/nft/invalid-address')
    .expect(400);
  
  assert(response.body.hasOwnProperty('error'));
});

test('NFT API - 404 Handler should return 404 for non-existent endpoints', async () => {
  const response = await request(app)
    .get('/non-existent')
    .expect(404);
  
  assert.strictEqual(response.body.error, 'Endpoint not found');
});

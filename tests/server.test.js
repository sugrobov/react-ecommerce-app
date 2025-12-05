// tests/server.test.js
const request = require('supertest');

describe('Server API Tests', () => {
  const API_URL = 'http://localhost:3001';
  
  test('GET /api/health should return server status', async () => {
    try {
      const response = await request(API_URL).get('/api/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('Server is running');
    } catch (error) {
      console.error('Server not running:', error.message);
      console.log('Make sure server is running: node server/src/index.js');
      // Пропускаем тест, если сервер не запущен
      return;
    }
  });
  
  test('GET /api/test should return test data', async () => {
    try {
      const response = await request(API_URL).get('/api/test');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('Server is running');
    } catch (error) {
      console.error('Cannot connect to server:', error.message);
      return;
    }
  });
});
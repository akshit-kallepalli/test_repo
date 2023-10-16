const request = require('supertest');
const app = require('../app'); // make sure the path is correct to your app.js or server.js

describe('GET /healthz', () => {
  it('responds with json', async () => {
    await request(app)
      .get('/healthz')
      .expect('Content-Type', /json/)
      .expect(200, {
        status: 'UP'
      });
  });
});

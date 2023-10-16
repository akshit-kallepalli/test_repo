const request = require('supertest');
const app = require('./app');

describe('GET /healthz', () => {
  let server;

  // Start the server before the tests run
  beforeAll((done) => {
    server = app.listen(4000, () => {
      done();
    });
  });

  // Close the server after the tests run
  afterAll((done) => {
    server.close(() => {
      done();
    });
  });

  it('responds with json', async () => {
    await request(server)
      .get('/healthz')
      .expect('Content-Type', /json/)
      .expect(200, {
        status: 'UP'
      });
  });
});

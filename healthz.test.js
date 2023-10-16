const request = require('supertest');
const app = require('./app');

describe('GET /healthz', () => {
  let server;

  beforeAll(() => {
    server = app.listen(9000);
  });

  afterAll((done) => {
    server.close(done);
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

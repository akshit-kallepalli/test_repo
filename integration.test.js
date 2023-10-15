const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('/app.js'); 

const { expect } = chai;

chai.use(chaiHttp);

describe('/healthz Endpoint', () => {
  it('should return status 200 and an empty response', (done) => {
    chai.request(app)
      .get('/healthz')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.empty; 
        done();
      });
  });
});


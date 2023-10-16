const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('./app'); // Your Express app's entry point
const expect = chai.expect;

chai.use(chaiHttp);

describe('Integration tests for /healthz endpoint', () => {
   it('should return 200 for health check', (done) => {
      chai.request(app)
         .get('/healthz')
         .end((err, res) => {
            expect(res).to.have.status(200);
            done();
         });
   });
});

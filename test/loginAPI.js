const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = require('chai').expect;
const server = require('../app');

chai.use(chaiHttp);

var commonObj = {};

describe('/POST Login', () => {
    it('should be able to login successfully', (done) => {
        let userCreds = {
            username: "mac",
            password: "111111"
        }
      chai.request(server)
          .post('/users/login')
          .send(userCreds)
          .end((err, res) => {
              res =  JSON.parse(res.text);
              commonObj.uid = res.id;

              expect(err).to.equal(null);
              expect(res.status).to.equal(200);
              expect(res.success).to.equal(true);
              expect(res.msg).to.equal("login successful");
            done();
          });
    });

    it('should not be able to login successfully with invalid username', (done) => {
        let userCreds = {
            username: "mac1",
            password: "111111"
        }
      chai.request(server)
          .post('/users/login')
          .send(userCreds)
          .end((err, res) => {
              res =  JSON.parse(res.text);
              expect(err).to.equal(null);
              expect(res.status).to.equal(400);
            done();
          });
    });

    it('should not be able to login successfully with invalid password', (done) => {
        let userCreds = {
            username: "mac",
            password: "111112"
        }
      chai.request(server)
          .post('/users/login')
          .send(userCreds)
          .end((err, res) => {
              res =  JSON.parse(res.text);
              expect(err).to.equal(null);
              expect(res.status).to.equal(400);
            done();
          });
    });

});
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = require('chai').expect;
const server = require('../app');
chai.use(chaiHttp);

var commonObj = {};

describe('/GET All Programs', () => {

    it('should be able to fetch programs', (done) => {
        let userCreds = {
          username: "mac",
          password: "111111"
        }

        var agent = chai.request.agent(server);
        agent
          .post('/users/login')
          .send(userCreds)
          .then(function (res) {
            expect(res).to.have.cookie('program_sess');

            return agent.get('/programs/')
              .then(function (res2) {
                expect(res2.statusCode).to.equal(200);
                done();
              }).catch(done);
          });
    });

    it('should be not able to fetch programs when credentials are incorrect', (done) => {
      let userCreds = {
        username: "mac1",
        password: "111111"
      }

      var agent = chai.request.agent(server);
      agent
        .post('/users/login')
        .send(userCreds)
        .then(function (res) {
          expect(res).to.not.have.cookie('program_sess');

          return agent.get('/programs/')
            .then(function (res2) {
              res2 = JSON.parse(res2.text);
              expect(res2.success).to.equal(false);
              expect(res2.msg).to.equal('LoggedIn user not found');
              done();
            }).catch(done);
        });
  });
});

describe('/POST Programs', () => {
  it('should be able to create a new program', (done) => {
    let userCreds = {
      username: "mac",
      password: "111111"
    }

    let random_name = Math.floor(Math.random()*1000);

    let programData = {
      program_name: 'test-create-prg-' + random_name,
      program_desc: 'test-create-prg-desc',
      program_startDate: 1764527400,
      program_endDate: 1767205800,
    }

    commonObj.name = programData.program_name;

    var agent = chai.request.agent(server);
    agent
      .post('/users/login')
      .send(userCreds)
      .then(function (res) {
        expect(res).to.have.cookie('program_sess');

        return agent.post('/programs/')
          .send(programData)
          .then(function (res2) {
            expect(res2.statusCode).to.equal(200);
            res2 = JSON.parse(res2.text);
            commonObj.p_id = res2.p_id;
            expect(res2.program_name).to.equal(commonObj.name);
            expect(res2.program_desc).to.equal(programData.program_desc);
            done();
          }).catch(done);
      });
  });

  it('should not be able to create a new program of duplicate name', (done) => {
    let userCreds = {
      username: "mac",
      password: "111111"
    }

    let random_name = Math.floor(Math.random()*1000);

    let programData = {
      program_name: commonObj.name,
      program_desc: 'test-create-prg-desc',
      program_startDate: 1764527400,
      program_endDate: 1767205800,
    }


    var agent = chai.request.agent(server);
    agent
      .post('/users/login')
      .send(userCreds)
      .then(function (res) {
        expect(res).to.have.cookie('program_sess');

        return agent.post('/programs/')
          .send(programData)
          .then(function (res2) {
            res2 = JSON.parse(res2.text);
            expect(res2.status).to.equal(400);
            expect(res2.msg).to.equal('Record already exists');
            done();
          }).catch(done);
      });
  });

  it('should not be able to create a new program when parameters are missing', (done) => {
    let userCreds = {
      username: "mac",
      password: "111111"
    }
  
    let programData = {};
  
    var agent = chai.request.agent(server);
    agent
      .post('/users/login')
      .send(userCreds)
      .then(function (res) {
        expect(res).to.have.cookie('program_sess');

        return agent.post('/programs/')
          .send(programData)
          .then(function (res2) {
            res2 = JSON.parse(res2.text);
            expect(res2.success).to.equal(false);
            expect(res2.msg).to.equal('Invalid input parameter');
            done();
          }).catch(done);
      });
  });

  it('should not be able to create a new program when parameters are incorrect', (done) => {
    let userCreds = {
      username: "mac",
      password: "111111"
    }
  
    let programData = {
      program_name1: commonObj.name,
      program_desc: 'test-create-prg-desc',
      program_startDate: 1764527400,
      program_endDate: 1767205800,
    }
  
    var agent = chai.request.agent(server);
    agent
      .post('/users/login')
      .send(userCreds)
      .then(function (res) {
        expect(res).to.have.cookie('program_sess');

        return agent.post('/programs/')
          .send(programData)
          .then(function (res2) {
            res2 = JSON.parse(res2.text);
            expect(res2.success).to.equal(false);
            expect(res2.msg).to.equal('Invalid input parameter');
            done();
          }).catch(done);
      });
  });

});

describe('/GET Program', () => {
  it('should be able to fetch details of a program', (done) => {
    let userCreds = {
      username: "mac",
      password: "111111"
    }

    var agent = chai.request.agent(server);
    agent
      .post('/users/login')
      .send(userCreds)
      .then(function (res) {
        expect(res).to.have.cookie('program_sess');

        return agent.get('/programs/' + commonObj.name)
          .then(function (res2) {
            expect(res2.statusCode).to.equal(200);
            res2 = JSON.parse(res2.text);
            expect(res2.program_name).to.equal(commonObj.name);
            expect(typeof res2.program_desc).to.be.string;
            done();
          }).catch(done);
      });
  });

  it('should not be able to fetch details of a program when program doesn\'t exists', (done) => {
    let userCreds = {
      username: "mac",
      password: "111111"
    }

    var agent = chai.request.agent(server);
    agent
      .post('/users/login')
      .send(userCreds)
      .then(function (res) {
        expect(res).to.have.cookie('program_sess');

        return agent.get('/programs/' + 'thisShouldNotExistEever')
          .then(function (res2) {
            res2 = JSON.parse(res2.text);
            expect(res2.success).to.equal(true);
            expect(res2.msg).to.equal('No programs found');
            done();
          }).catch(done);
      });
  });
});

describe('/PUT Program', () => {
  it('should be able to update description of a program', (done) => {
    let userCreds = {
      username: "mac",
      password: "111111"
    }

    let programData = {
      program_name: commonObj.name,
      program_desc: 'this is just a test description for update',
      program_startDate: 1764527400,
      program_endDate: 1767205800,
      p_id: commonObj.p_id,
   }

    var agent = chai.request.agent(server);
    agent
      .post('/users/login')
      .send(userCreds)
      .then(function (res) {
        expect(res).to.have.cookie('program_sess');

        return agent.put('/programs/')
          .send(programData)
          .then(function (res2) {
            expect(res2.statusCode).to.equal(201);
            res2 = JSON.parse(res2.text);
            expect(res2.success).to.equal(true);
            expect(res2.msg).to.equal('Update successful');
            done();
          }).catch(done);
      });
  });

  it('should not be able to update description of a program when parameters are incorrect', (done) => {
    let userCreds = {
      username: "mac",
      password: "111111"
    }

    let programData = {
      program_name1: commonObj.name,
      program_desc: 'this is just a test description for update',
      program_startDate: 1764527400,
      program_endDate: 1767205800,
      p_id: commonObj.p_id,
   }

    var agent = chai.request.agent(server);
    agent
      .post('/users/login')
      .send(userCreds)
      .then(function (res) {
        expect(res).to.have.cookie('program_sess');

        return agent.put('/programs/')
          .send(programData)
          .then(function (res2) {
            res2 = JSON.parse(res2.text);
            expect(res2.success).to.equal(false);
            expect(res2.msg).to.equal('Invalid input parameter');
            done();
          }).catch(done);
      });
  });
});

describe('/DELETE Program', () => {
  it('should be able to set a program as inactive', (done) => {
    let userCreds = {
      username: "mac",
      password: "111111"
    }

    let programData = {
      program_name: commonObj.name
   }

    var agent = chai.request.agent(server);
    agent
      .post('/users/login')
      .send(userCreds)
      .then(function (res) {
        expect(res).to.have.cookie('program_sess');

        return agent.delete('/programs/')
          .send(programData)
          .then(function (res2) {
            res2 = JSON.parse(res2.text);
            expect(res2.success).to.equal(true);
            expect(res2.msg).to.equal('program deleted successfully');
            done();
          }).catch(done);
      });
  });

  it('should not be able to set a program as inactive when program_name is missing', (done) => {
    let userCreds = {
      username: "mac",
      password: "111111"
    }

    let programData = {
   }

    var agent = chai.request.agent(server);
    agent
      .post('/users/login')
      .send(userCreds)
      .then(function (res) {
        expect(res).to.have.cookie('program_sess');

        return agent.delete('/programs/')
          .send(programData)
          .then(function (res2) {
            res2 = JSON.parse(res2.text);
            expect(res2.success).to.equal(false);
            expect(res2.msg).to.equal('Invalid input parameter');
            done();
          }).catch(done);
      });
  });

  it('should not be able to set a program as inactive when program_name is invalid', (done) => {
    let userCreds = {
      username: "mac",
      password: "111111"
    }

    let programData = {
      program_name: 'this sure wont exist'
   }

    var agent = chai.request.agent(server);
    agent
      .post('/users/login')
      .send(userCreds)
      .then(function (res) {
        expect(res).to.have.cookie('program_sess');

        return agent.delete('/programs/')
          .send(programData)
          .then(function (res2) {
            res2 = JSON.parse(res2.text);
            expect(res2.status).to.equal(400);
            expect(res2.msg).to.equal('record not found');
            done();
          }).catch(done);
      });
  });
});
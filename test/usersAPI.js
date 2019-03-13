const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = require('chai').expect;
const server = require('../app');

chai.use(chaiHttp);

var commonObj = {};

describe('/POST Register', () => {
    it('should be able to register successfully', (done) => {
        var random_name = Math.floor(Math.random()*1000);
        var username = "test-" + random_name;
        var userCreds = {
            first_name: 'tester' + random_name,
            last_name: 'foobar',
            email: 'test@foobar.com',
            username: username,
            password: "111111"
        };
        chai.request(server)
            .post('/users/register')
            .send(userCreds)
            .end((err, res) => {
                res =  JSON.parse(res.text);
                commonObj.username = res.data.username; 
                expect(err).to.equal(null);
                expect(res.success).to.equal(true);
                expect(res.msg).to.equal("User registered");
                expect(res.data.username).to.equal(username);
                done();
            });
    });

    it('should not be able to register successfully when parameters are missing', (done) => {
        var random_name = Math.floor(Math.random()*1000);
        var username = "test-" + random_name;
        var userCreds = {
            username: username,
            password: "111111",
            email: 'test@mail.com'
        };
        chai.request(server)
            .post('/users/register')
            .send(userCreds)
            .end((err, res) => {
                res =  JSON.parse(res.text);
                expect(err).to.equal(null);
                expect(res.success).to.equal(false);
                expect(res.msg).to.equal("invalid input parameters");
                done();
            });
    });

    it('should not be able to register successfully when email is incorrect', (done) => {
        var random_name = Math.floor(Math.random()*1000);
        var username = "test-" + random_name;
        var userCreds = {
            username: username,
            first_name: 'tester' + random_name,
            last_name: 'foobar',
            password: "111111",
            email: 'incorrect@email',
        };

        chai.request(server)
            .post('/users/register')
            .send(userCreds)
            .end((err, res) => {
                res =  JSON.parse(res.text);
                expect(err).to.equal(null);
                expect(res.success).to.equal(false);
                expect(res.msg).to.equal("invalid email");
                done();
            });
    });

    it('should not be able to register successfully when username already exists', (done) => {
        var userCreds = {
            username: commonObj.username,
            first_name: 'tester01',
            last_name: 'foobar',
            password: "111111",
            email: 'test@mail.com'
        };

        chai.request(server)
            .post('/users/register')
            .send(userCreds)
            .end((err, res) => {
                res =  JSON.parse(res.text);
                expect(err).to.equal(null);
                expect(res.status).to.equal(false);
                expect(res.msg).to.equal("username exists");
                done();
            });
    });
});

describe('/POST Login', () => {
    it('should be able to login successfully', (done) => {
        let userCreds = {
            username: commonObj.username,
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
            username: commonObj.username,
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

    it('should not be able to login successfully when parameters are missing', (done) => {
        let userCreds = {};
        chai.request(server)
            .post('/users/login')
            .send(userCreds)
            .end((err, res) => {
                expect(err).to.equal(null);
                res =  JSON.parse(res.text);
                expect(res.success).to.equal(false);
                expect(res.msg).to.equal('invalid credentials');
                done();
            });
    });

});
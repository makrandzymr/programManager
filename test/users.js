const expect = require('chai').expect;
const login = require('../model/userModel').login;
const register = require('../model/userModel').register;

var commonObj = {};

describe('Users', function () {

    describe('#register()', function () {
        it('should be able to register into the system successfully', function () {
            var random_name = Math.floor(Math.random()*1000);
            var opts = {
                first_name: 'tester' + random_name,
                last_name: 'foobar',
                email: 'test@foobar.com',
                username: "test-" + random_name,
                password: "111111"
            };

            return register(opts)
                .then(function(result) {
                    commonObj.name = opts.username;
                    expect(result.success).to.equal(true);
                    expect(result.msg).to.equal('User registered');
                    expect(result.data.first_name).to.equal(opts.first_name);
                });
        });   

        it('should not be able to register into the system successfully when username already exists', function () {
            var opts = {
                username: commonObj.name,
                first_name: 'tester',
                last_name: 'foobar',
                email: 'test@foobar.com',
                password: "111111"
            };

            return register(opts)
                .then(function(result) {
                }).catch(function(err) {
                    expect(err.status).to.equal(false);
                    expect(err.msg).to.equal('username exists');
                });
        });      
    });
    
    describe('#login()', function () {
        it('should be able to log into the system successfully', function () {
            var opts = {
                username: commonObj.name,
                password: "111111"
            };

            return login(opts)
                .then(function(result) {
                    expect(result.status).to.equal(200);
                    expect(result.success).to.equal(true);
                    expect(result.msg).to.equal('login successful');
                });
        });

        it('should not be able to log into the system if username is incorrect', function () {
            var opts = {
                username: 'thisIsAnIncorrectUserName',
                password: "111111"
            };

            return login(opts)
                .then(function(result) {
                }).catch(function(e) {
                    expect(e.status).to.equal(400);
                    expect(e.success).to.equal(false);
                    expect(e.msg).to.equal('user not found');
                });
        });

        it('should not be able to log into the system if password is incorrect', function () {
            var opts = {
                username: commonObj.name,
                password: "222222"
            };

            return login(opts)
                .then(function(result) {
                }).catch(function(e) {
                    expect(e.status).to.equal(400);
                    expect(e.success).to.equal(false);
                    expect(e.msg).to.equal('user not found');
                });
        });
    });
});
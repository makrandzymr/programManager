'user strict';
var getSqlConnection = require('../config/database');
var Promise = require("bluebird");
var nconf = require('nconf');
nconf.set('db_users', 'users');

//User object constructor
var User = function(user){
    this.created_at = new Date();
};

/** User Login functionality
 * @param  {Object} req [API request object]
 * @return {Object} promise 
 */
User.login = function login(req) {
    return User.findByUsername(req)
        .then(function(response) {
            if(response.username && response.password && req.body.password === response.password) {
                return Promise.resolve({
                    msg:'login successful',
                    success: true,
                    status: 200,
                    id: response.id
                });
            } else {
                var err = new Error('User not found');
                err.status = 400;
                throw err;
            }
        }).catch(function(err) {
            return Promise.reject(err);
        });
};

/** User Register functionality
 * @param  {Object} req [API request object]
 * @return {Object} promise 
 */
User.register = function register(req) {
    return User.insertUserQuery(req)
        .then(function(rows) {
            var response = {
                success: true,
                msg: 'User registered',
                data: rows
            };

            return Promise.resolve(response);
        }).catch(function(err) {
            return Promise.reject(err);
        });
};

/** Insert query for new user creation process
 * @param  {Object} req [API request object]
 * @return {Object} promise 
 */
User.insertUserQuery = function insertUserQuery(req) {
    var db = nconf.get('db_users');
    var today = new Date();
    var users= {
        "first_name":req.body.first_name,
        "last_name":req.body.last_name,
        "username":req.body.username,
        "email":req.body.email,
        "password":req.body.password,
        "created":today,
        "modified":today
    }

    return Promise.using(getSqlConnection(), function(connection) {
        return connection.query(
            `INSERT INTO ${db} SET ?`, users).then(function(rows) {
            return Promise.resolve(rows);
        }).catch(function(error) {
            return Promise.reject(error);
        });
    });
}

/** Query method to find a user by username
 * @param  {Object} req [API request object]
 * @return {Object} promise 
 */
User.findByUsername = function findByUsername(req) {
    var db = nconf.get('db_users');
    var userObj = {
        username: req.body.username,
        password: req.body.password
    }

    return Promise.using(getSqlConnection(), function(connection) {
        return connection.query(
            `SELECT id, username, first_name, last_name, password FROM users WHERE username = "${userObj.username}"`)
            .then(function(rows) {
                if(rows.length > 0) {
                    return Promise.resolve(rows[0]);
                } else {
                    var err = new Error('User not found');
                    err.status = 400;
                    throw err;
                }
            }).catch(function(error) {
                return Promise.reject(error);
            });
    });
}

module.exports= User;
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
 * @param  {Object} opts [API request object parameters]
 * @return {Object} promise 
 */
User.login = function login(opts) {
    return User.findByUsername(opts)
        .then(function(response) {
            if(response.username && response.password && opts.password === response.password) {
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
 * @param  {Object} opts [API request object paramters]
 * @return {Object} promise 
 */
User.register = function register(opts) {
    return User.insertUserQuery(opts)
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
 * @param  {Object} opts [API request object parameters]
 * @return {Object} promise 
 */
User.insertUserQuery = function insertUserQuery(opts) {
    var db = nconf.get('db_users');
    var today = new Date();
    var users= {
        "first_name":opts.first_name,
        "last_name":opts.last_name,
        "username":opts.username,
        "email":opts.email,
        "password":opts.password,
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
 * @param  {Object} opts [API request object parameters]
 * @return {Object} promise 
 */
User.findByUsername = function findByUsername(opts) {
    var db = nconf.get('db_users');
    var userObj = {
        username: opts.username,
        password: opts.password
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
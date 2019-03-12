'user strict';
var Promise = require("bluebird");
const Sequelize = require('sequelize');
const sequelize = new Sequelize('mysql://root:password@localhost:3306/programs');

const UserSchema = sequelize.define('users', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
    },
    username: {
      type: Sequelize.STRING
    },
    first_name: {
        type: Sequelize.STRING
    },
    last_name: {
      type: Sequelize.STRING
    },
    email: {
      type: Sequelize.STRING
    },
    password: {
      type: Sequelize.STRING
    },
    created: {
      type: Sequelize.DATE
    },
    modified: {
      type: Sequelize.DATE
    },
  },
  { timestamps: false  }
);

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
    var today = new Date();
    var dbInsert = {
        "first_name":opts.first_name,
        "last_name":opts.last_name,
        "username":opts.username,
        "email":opts.email,
        "password":opts.password,
        "created":today,
        "modified":today
    }

    UserSchema.create(dbInsert)
        .then(function(rows) {
            return Promise.resolve(rows);
        }).catch(function(error) {
            return Promise.reject(error);
        });
}

/** Query method to find a user by username
 * @param  {Object} opts [API request object parameters]
 * @return {Object} promise 
 */
User.findByUsername = function findByUsername(opts) {
    var userObj = {
        username: opts.username
    }

    return UserSchema.findOne({
        where: userObj
    }).then(function(rows) {
        if(rows != null) {
            return Promise.resolve(rows);
        } else {
            var err = new Error('User not found');
            err.status = 400;
            throw err;
        }
    }).catch(function(error) {
        return Promise.reject(error);
    });
}

module.exports= User;
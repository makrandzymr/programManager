"use strict";

var User = require('../model/userModel');

let controller = {
    /** Method to log into the system
     * @param  {Object} req [API request object]
     * @param  {Object} res [API response object]
     * @return {Object} response 
     */
    login: function(req, res) {
        var opts = req.body;
        if(!opts.username || !opts.password) {
            return res.send({
                success: false,
                msg: 'invalid credentials'
            });
        }

        if(req.session.userId) {
            res.redirect('/users/dashboard');
        }
        
        return User.login(opts).then(function(response) {
            req.session.userId = response.id;
            res.json(response);
        }).catch(function(err) {
            return res.send(err);
        });
        
    },

    getDashboard:  function(req, res) {
        return res.render('dashboard');
    },
    /** Method to register a user
     * @param  {Object} req [API request object]
     * @param  {Object} res [API response object]
     * @return {Object} response 
     */
    register: function(req, res) {
        var opts = req.body;
        var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;

        if(!opts.first_name || !opts.last_name || !opts.email || !opts.password || !opts.username) {
            return res.send({
                success: false,
                msg: 'invalid input parameters'
            });
        }

        if (reg.test(opts.email) == false) {
            return res.send({
                success: false,
                msg: 'invalid email'
            });
        }

        return User.register(opts).then(function(response) {
            return res.send(200, response);
        }).catch(function(err) {
            return res.send(err);
        });
    }
};
module.exports = controller;
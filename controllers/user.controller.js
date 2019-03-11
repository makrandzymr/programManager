"use strict";

var User = require('../model/userModel');

let controller = {
    /** Method to log into the system
     * @param  {Object} req [API request object]
     * @param  {Object} res [API response object]
     * @return {Object} response 
     */
    login: function(req, res) {
        const { username, password } = req.body
        if(!username || !password) {
            return res.send({
                success: false,
                msg: 'invalid credentials'
            });
        }
        
        return User.login(req).then(function(response) {
            req.session.userId = response.id;
            return res.render('dashboard', {response: response});
        }).catch(function(err) {
            return res.send(err);
        });
        
    },

    /** Method to register a user
     * @param  {Object} req [API request object]
     * @param  {Object} res [API response object]
     * @return {Object} response 
     */
    register: function(req, res) {
        var opts = req.body;
        var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;

        if(!opts.first_name || !opts.last_name || !opts.email || !opts.password) {
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

        return User.register(req).then(function(response) {
            return res.send(200, response);
        }).catch(function(err) {
            return res.send(err);
        });
    }
};
module.exports = controller;
"use strict";

var Program = require('../model/programModel');
let controller = {
    /** Method to fetch programs created by user
     * @param  {Object} req [API request object]
     * @param  {Object} res [API response object]
     * @return {Object} response 
     */
    getUserPrograms: function (req, res) {
        if(!req.session.userId) {
            return res.send({
                success: false,
                msg: 'LoggedIn user not found'
            });
        }

        var opts = {
            userId: req.session.userId,
            program_startdate: req.query.program_startdate,
            program_enddate: req.query.program_enddate,
        }

        return Program.getAllPrograms(opts).then(function(response) {
            res.render('dashboard', {listing: response.data});
        }).catch(function(err) {
            res.send(err);
        });

    },
    /** Method to fetch a single program by name
     * @param  {Object} req [API request object]
     * @param  {Object} res [API response object]
     * @return {Object} response 
     */
    getProgram: function (req, res) {
        if(!req.session.userId) {
            return res.send({
                success: false,
                msg: 'LoggedIn user not found'
            });
        }

        if(!req.params.programName) {
            return res.send({
                success: false,
                msg: 'Invalid input parameter'
            });
        }

        var opts = {
            userId: req.session.userId,
            program_name: req.params.programName
        }
        
        return Program.getProgram(opts).then(function(response) {
            return res.json(response.data);
        }).catch(function(err) {
            return res.send(err);
        });

    },

    /** Method to create a new program
     * @param  {Object} req [API request object]
     * @param  {Object} res [API response object]
     * @return {Object} response 
     */
    addProgram: function (req, res) {
        if(!req.session.userId) {
            return res.send({
                success: false,
                msg: 'LoggedIn user not found'
            });
        }

        if(!req.body.program_name || !req.body.program_desc || !req.body.program_startDate || !req.body.program_endDate) {
            return res.send({
                success: false,
                msg: 'Invalid input parameter'
            });
        }

        if(req.body.program_startDate > req.body.program_endDate) {
            return res.send({
                success: false,
                msg: 'Invalid Start and End dates'
            });
        }
        
        var opts = {
            userId: req.session.userId,
            program_name: req.body.program_name,
            program_desc: req.body.program_desc,
            program_startDate: req.body.program_startDate,
            program_endDate: req.body.program_endDate,
        }

        return Program.create(opts).then(function(response) {
            return res.json(response);
        }).catch(function(err) {
            return res.send(err);
        });
    },

    /** Method to update a program
     * @param  {Object} req [API request object]
     * @param  {Object} res [API response object]
     * @return {Object} response 
     */
    updateProgram: function (req, res) {
        var opts = req.body;

        if(!req.session.userId) {
            return res.send({
                success: false,
                msg: 'LoggedIn user not found'
            });
        }

        if(!opts.program_name || !opts.program_desc || !opts.program_startDate || !opts.program_endDate || !opts.p_id) {
            return res.send({
                success: false,
                msg: 'Invalid input parameter'
            });
        } 

        var params = {
            userId: req.session.userId,
            program_name: opts.program_name,
            program_desc: opts.program_desc,
            program_startDate: opts.program_startDate,
            program_endDate: opts.program_endDate,
            p_id: opts.p_id,
        }

        return Program.updateProgram(params)
            .then(function(response) {
                return res.send(201, response);
            }).catch(function(err) {
                return res.send(500, err);
            });
    },

    /** Method to set a program as inactive
     * @param  {Object} req [API request object]
     * @param  {Object} res [API response object]
     * @return {Object} response 
     */
    deleteUserProgram: function (req, res) {
        var opts = req.body;
        if(!req.session.userId) {
            return res.send({
                success: false,
                msg: 'LoggedIn user not found'
            });
        }

        if(!opts.program_name) {
            return res.send({
                success: false,
                msg: 'Invalid input parameter'
            });
        }

        var params = {
            userId: req.session.userId,
            program_name: opts.program_name
        }

        return Program.setInactive(params).then(function(response) {
            return res.send(201, response);
        }).catch(function(err) {
            return res.send(500, err);
        });
    }
};
module.exports = controller;
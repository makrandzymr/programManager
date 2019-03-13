const expect = require('chai').expect;
const getAllPrograms = require('../model/programModel').getAllPrograms;
const getProgram = require('../model/programModel').getProgram;
const createProgram = require('../model/programModel').create;
const updateProgram = require('../model/programModel').updateProgram;
const deleteProgram = require('../model/programModel').setInactive;

var commonObj = {};

describe('Programs', function () {

    describe('#create()', function () {
        var random_name = Math.floor(Math.random()*1000);
        var program_name = 'test-program-model-testing-' + random_name;
        var opts = {
            userId: 1,
            program_name: program_name,
            program_desc: 'test-program,-description',
            program_startDate: 1764527400, // 12/01/2025,
            program_endDate: 1767205800, //01/01/2026
        };

        commonObj.name = opts.program_name;

        it('should be able to create a program successfully', function () {
            return createProgram(opts)
                .then(function(result) {
                    commonObj.p_id = result.p_id;
                    expect(result.affectedRows).to.not.equal(null);
                    expect(result.program_name).to.equal(program_name);
                });
        });

        it('should not be able to create a duplicate program', function () {
            return createProgram(opts)
                .then(function(result) {

                }).catch(function(err) {
                    expect(err.status).to.equal(400);
                    expect(err.msg).to.equal('Record already exists');
                })
        });        
    });


    describe('#getAllPrograms()', function () {
        var opts = {
            userId: 1
        }

        it('should fetch all programs when start and end date not specified', function () {
            return getAllPrograms(opts)
                .then(function(result) {
                    expect(result.success).to.equal(true);
                    expect(result.msg).to.equal('programs found');
                    expect(result.data.length).to.greaterThan(0);
                });
        });

        it('should fetch specific programs when start and end date are specified', function () {
            opts.program_startdate =  '12/01/2025';
            opts.program_enddate =  '01/01/2026';
            return getAllPrograms(opts)
                .then(function(result) {
                    expect(result.success).to.equal(true);
                    expect(result.msg).to.equal('programs found');
                    expect(result.data.length).to.greaterThan(0);
                });
        });

        it('should not fetch programs when start and end date are specified and programs don\'t exist', function () {
            opts.program_startdate =  '03/04/2020';
            opts.program_enddate =  '03/09/2025';
            return getAllPrograms(opts)
                .then(function(result) {
                    expect(result.success).to.equal(true);
                    expect(result.msg).to.equal('No programs found');
                });
        });
    });

    describe('#getProgram()', function () {
        var opts = {
            userId: 1,
            program_name: commonObj.name
        }

        it('should fetch details of a single program', function () {
            return getProgram(opts)
                .then(function(result) {
                    expect(result.success).to.equal(true);
                    expect(result.msg).to.equal('program found');
                    expect(result.data).to.not.equal(null);
                    expect(result.data.program_name).to.equal(commonObj.name);
                });
        });

        it('should not fetch details of a program which does not exists', function () {
            opts.program_name = "this does not exists";
            return getProgram(opts)
                .then(function(result) {

                }).catch(function(err) {
                    expect(err.success).to.equal(true);
                    expect(err.msg).to.equal('No programs found');
                });
        });
    });

    describe('#updateProgram()', function () {
        
        it('should be able to successfully update a program', function () {
            var opts = {
                program_name: commonObj.name,
                program_desc: 'test-program-description',
                program_startdate: 1764527400,
                program_enddate: 1767205800,
                userId: 1,
                p_id: commonObj.p_id,
            }
            return updateProgram(opts)
                .then(function(result) {
                    expect(result.success).to.equal(true);
                    expect(result.msg).to.equal('Update successful');
                });
        }); 
        
        it('should fail to update a program when the program Id doesn\'t exists', function () {
            var opts = {
                program_name: commonObj.name,
                program_desc: 'test-program-description',
                program_startdate: 1764527400,
                program_enddate: 1767205800,
                u_id: 99999,
                p_id: 999999,
            }
            return updateProgram(opts)
                .then(function(result) {
                    expect(result.success).to.equal(false);
                    expect(result.msg).to.equal('record to update does not exist');
                });
        }); 
    });

    describe('#deleteProgram()', function () {
        
        it('should successfully set a program as inactive', function () {
            var opts = {
                userId: 1,
                program_name: commonObj.name
            }
            return deleteProgram(opts)
                .then(function(result) {
                    expect(result.success).to.equal(true);
                    expect(result.msg).to.equal('program deleted successfully');
                });
        });

        it('should not be able to set an unexisting program as inactive', function () {
            var opts = {
                userId: 1,
                program_name:  'this cant be deleted'
            }
            return deleteProgram(opts)
                .then(function(result) {
                }).catch(function(err) {
                    expect(err.status).to.equal(400);
                    expect(err.msg).to.equal('record not found');
                });
        });        
    });

});
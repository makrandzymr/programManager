'user strict';
var getSqlConnection = require('../config/database');
var Promise = require("bluebird");
var nconf = require('nconf');
nconf.set('db_program_details', 'program_details');

//Program object constructor
var Program = function(program){
    this.created_at = new Date();
};

/**
 * @param  {Object} req [API request object]
 * @return {Object} promise [JSON with success, msg & data]
 */
Program.getAllPrograms = function getAllPrograms(req) {
    return Program.getProgramsQuery(req)
        .then(function(rows) {
            if(rows.length == 0) {
                return Promise.resolve({
                    success: true,
                    msg: 'No programs found'
                });
            }

            var response = {
                success: true,
                msg: 'programs found',
                data: rows
            };
            return Promise.resolve(response);
        }).catch(function(err) {
            return Promise.reject(err);
        });    
};

/**
 * @param  {Object} req [API request object]
 * @return {Object} promise [JSON with success, msg & data]
 */
Program.getProgram = function getProgram(req) {
    return Program.getProgramDetails(req)
        .then(function(rows) {
            if(rows.length == 0) {
                return Promise.resolve({
                    success: true,
                    msg: 'No programs found'
                });
            }

            var response = {
                success: true,
                msg: 'programs found',
                data: rows
            };
            return Promise.resolve(response);
        }).catch(function(err) {
            return Promise.reject(err);
        });
    
};


/**
 * @param  {Object} req [API request object]
 * @return {Object} promise [JSON with success, msg & data]
 */
Program.updateProgram = function updateProgram(req) {
    return Program.updateProgramQuery(req)
        .then(function(rows) {
            return ({
                success: true,
                msg: 'Update successful',
                data: rows
            });
        
        }).catch(function(err) {
            return Promise.reject(err);
        })
};



/**
 * @param  {Object} req [API request object]
 * @return {Object} promise [JSON with success , msg]
 */
Program.create = function create(req) {
    return Program.findProgramExists(req.body.program_name)
        .then(function(rows) {
            return Program.createProgramQuery(req);
        }).catch(function(err) {
            return Promise.reject(err);
        });
};

/** Set a Program as inactive. Inactive programs won't be listed
 * @param  {Object} req [API request object]
 * @return {Object} promise [JSON with success , msg]
 */
Program.setInactive = function setInactive(req) {
    return Program.findProgramForDeletion(req.body.program_name)
        .then(function(rows) {
            return Program.deleteProgramQuery(req)
        }).catch(function(err) {
            return Promise.reject(err);
        });
}

/** Query method to fetch programs based on dates
 * @param  {Object} req [API request object]
 * @return {Object} promise [JSON with success , msg]
 */
Program.getProgramsQuery = function getProgramsQuery(req) {
    var userId = req.session.userId,
        opts = req.query,
        query,
        db = nconf.get('db_program_details'),
        dbWhere = {
            u_id : userId,
            is_active : 1,
            program_startDate: Math.floor(new Date(opts.program_startdate).getTime() / 1000),
            program_endDate: Math.floor(new Date(opts.program_enddate).getTime() / 1000)
        }

    if(opts.program_startdate && opts.program_enddate) {
        query = `select p_id, program_name, program_desc, is_active, program_startdate, program_enddate, u_id
        from ${db} where u_id = ${dbWhere.u_id} AND is_active = ${dbWhere.is_active} 
        AND program_startDate BETWEEN ${dbWhere.program_startDate} AND ${dbWhere.program_endDate} 
        AND program_endDate BETWEEN ${dbWhere.program_startDate} AND ${dbWhere.program_endDate}`;
    } else {
        query = `select p_id, program_name, program_desc, is_active, program_startdate, program_enddate, u_id
        from ${db} where u_id = ${dbWhere.u_id} AND is_active = ${dbWhere.is_active}`;
    }
    return Promise.using(getSqlConnection(), function(connection) {
        return connection.query(query).then(function(rows) {
            return Promise.resolve(rows);
        }).catch(function(e) {
            return Promise.reject(e);
        });
    });    
}


/** Query method to fetch programs details for a single program
 * @param  {Object} req [API request object]
 * @return {Object} promise 
 */
Program.getProgramDetails = function getProgramDetails(req) {
    var userId = req.session.userId;
    var db = nconf.get('db_program_details');
    var dbWhere = {
        u_id : userId,
        is_active : 1,
        program_name : req.params.programName,
    }
    return Promise.using(getSqlConnection(), function(connection) {
        return connection.query(
            `select p_id, program_name, program_desc, is_active, program_startdate, program_enddate, u_id
            from ${db} where u_id = ${dbWhere.u_id} AND is_active = ${dbWhere.is_active} AND program_name = "${dbWhere.program_name}"`)
            .then(function(rows) {
                return Promise.resolve(rows);
            })
            .catch(function(e) {
                return Promise.reject(e);
            });  
    });  
}

/** Query method to check if program exists
 * @param  {Object} req [API request object]
 * @return {Object} promise
 */
Program.findProgramExists = function findProgramExists(program_name) {
    var db = nconf.get('db_program_details'),
        dbWhere = {
            program_name : program_name,
        };
    
    return Promise.using(getSqlConnection(), function(connection) {
        return connection.query(
            `SELECT program_name FROM ${db} WHERE ?`, dbWhere)
            .then(function(records) {
                if(records.length > 0) {
                    var err = new Error('Record already exists');
                    throw err;
                } else {
                    return Promise.resolve(records);
                }
            })
            .catch(function(e) {
                return Promise.reject(e);
            });
    });
}

/** Query method to fetch programs by program name
 * @param  {Object} req [API request object]
 * @return {Object} promise 
 */
Program.findProgramForDeletion = function findProgramForDeletion(program_name) {
    var db = nconf.get('db_program_details'),
        dbWhere = {
            program_name : program_name,
        };
    
    return Promise.using(getSqlConnection(), function(connection) {
        return connection.query(
            `SELECT program_name FROM ${db} WHERE ?`, dbWhere)
            .then(function(records) {
                if(records.length > 0) {
                    return Promise.resolve(records);
                } else {
                    var err = new Error('Record doesn\'t exists');
                    throw err;
                }
            })
            .catch(function(e) {
                return Promise.reject(e);
            });
    });
}

/** Query method to create new programs
 * @param  {Object} req [API request object]
 * @return {Object} promise 
 */
Program.createProgramQuery = function createProgramQuery(req) {
    var db = nconf.get('db_program_details');
    var opts = req.body;
    var dbInsert = {
        program_name: opts.program_name,
        program_desc: opts.program_desc,
        program_startdate: opts.program_startDate,
        program_enddate: opts.program_endDate,
        is_active: 1,
        u_id: req.session.userId,
    };

    return Promise.using(getSqlConnection(), function(connection) {
        return connection.query(`INSERT into ${db} SET ?`, dbInsert)
            .then(function(rows) {
                return Promise.resolve(rows);
            }).catch(function(err) {
                return Promise.resolve(err);
            });
    });
}

/** Query method to set programs as inactive
 * @param  {Object} req [API request object]
 * @return {Object} promise 
 */
Program.deleteProgramQuery = function deleteProgramQuery(req) {
    var db = nconf.get('db_program_details');
    var opts = req.body;
    var dbSet = {
        is_active : 0
    };

    var dbWhere = {
        u_id: req.session.userId,
        program_name: opts.program_name
    }

    return Promise.using(getSqlConnection(), function(connection) {
        return connection.query(
            `UPDATE ${db} SET is_active = ${dbSet.is_active} 
            WHERE program_name = "${dbWhere.program_name}" AND u_id = ${dbWhere.u_id}`)
            .then(function(rows) {
                return Promise.resolve(rows);
            })
            .catch(function(e) {
                return Promise.reject(e);
            });
    });
}

/** Query method to update program details
 * @param  {Object} req [API request object]
 * @return {Object} promise 
 */
Program.updateProgramQuery = function updateProgramQuery(req) {
    var db = nconf.get('db_program_details');
    var opts = req.body;
    var dbSet = {
        program_name: opts.program_name,
        program_desc: opts.program_desc,
        program_startdate: opts.program_startDate,
        program_enddate: opts.program_endDate
    };

    var dbWhere = {
        u_id: req.session.userId,
        p_id: opts.p_id,
    }
    
    return Promise.using(getSqlConnection(), function(connection) {
        return connection.query(
            `UPDATE ${db} SET program_desc = "${dbSet.program_desc}",
            program_startdate = "${dbSet.program_startdate}",  program_enddate = "${dbSet.program_enddate}"
        
            WHERE p_id = ${dbWhere.p_id} AND u_id = ${dbWhere.u_id}`)
            .then(function(rows) {
                return Promise.resolve(rows);
            })
            .catch(function(e) {
                return Promise.reject(e);
            })
    });
}

module.exports= Program;
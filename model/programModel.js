'use strict';
var Promise = require("bluebird");
const Sequelize = require('sequelize');
const sequelize = new Sequelize('mysql://root:password@localhost:3306/programs');

//Program object constructor
var Program = function(program){
    this.created_at = new Date();
};

const ProgramSchema = sequelize.define('program_details', {
    p_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    u_id: {
      type: Sequelize.INTEGER
    },
    program_name: {
      type: Sequelize.STRING
    },
    program_desc: {
      type: Sequelize.STRING
    },
    is_active: {
      type: Sequelize.INTEGER
    },
    program_startdate: {
      type: Sequelize.BIGINT
    },
    program_enddate: {
      type: Sequelize.BIGINT
    },
  },
  { timestamps: false  }
);

  
/**
 * @param  {Object} opts [API request object params]
 * @return {Object} promise [JSON with success, msg & data]
 */
Program.getAllPrograms = function getAllPrograms(opts) {
    return Program.getProgramsQuery(opts)
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
 * @param  {Object} opts [API request object parameters]
 * @return {Object} promise [JSON with success, msg & data]
 */
Program.getProgram = function getProgram(opts) {
    return Program.getProgramDetails(opts)
        .then(function(rows) {
            if(rows == null) {
                return Promise.reject({
                    success: true,
                    msg: 'No programs found'
                });
            }

            var response = {
                success: true,
                msg: 'program found',
                data: rows
            };
            return Promise.resolve(response);
        }).catch(function(err) {
            return Promise.reject(err);
        });
    
};


/**
 * @param  {Object} opts [API request object parameters]
 * @return {Object} promise [JSON with success, msg & data]
 */
Program.updateProgram = function updateProgram(opts) {
    return Program.updateProgramQuery(opts)
        .then(function(rows) {
            if(rows == 0) {
                return ({
                    success: false,
                    msg: 'record to update does not exist',
                });
            }

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
 * @param  {Object} opts [API request object paramters]
 * @return {Object} promise [JSON with success , msg]
 */
Program.create = function create(opts) {
    return Program.findProgramExists(opts.program_name)
        .then(function() {
            return Program.createProgramQuery(opts);
        }).catch(function(err) {
            return Promise.reject(err);
        });
};

/** Set a Program as inactive. Inactive programs won't be listed
 * @param  {Object} opts [API request object parameters]
 * @return {Object} promise [JSON with success , msg]
 */
Program.setInactive = function setInactive(opts) {
    return Program.findProgramForDeletion(opts.program_name)
        .then(function() {
            return Program.deleteProgramQuery(opts)
        })
        .then(function() {
            return Promise.resolve({
                success: true,
                msg: 'program deleted successfully'
            });
        }).catch(function(err) {
            return Promise.reject(err);
        });
}

/** Query method to fetch programs based on dates
 * @param  {Object} opts [API request object paramters]
 * @return {Object} promise [JSON with success , msg]
 */
Program.getProgramsQuery = function getProgramsQuery(opts) {
    var userId = opts.userId,
        dbWhere = {
            u_id : userId,
            is_active : 1
        };

    if(opts.program_startdate && opts.program_enddate) {
        var program_startDate=  Math.floor(new Date(opts.program_startdate).getTime() / 1000);
        var program_endDate= Math.floor(new Date(opts.program_enddate).getTime() / 1000);
        var dbWhere = {
            u_id : userId,
            is_active : 1,
            program_startDate: {
                $between: [program_startDate, program_endDate]
            },
            program_endDate: {
                $between: [program_startDate, program_endDate]
            }
        };
    }

    return ProgramSchema.findAll({
        where: dbWhere
    })
    .then(rows => {
        return Promise.resolve(rows);
    }).catch(function(e) {
        return Promise.reject(e);
    });
}


/** Query method to fetch programs details for a single program
 * @param  {Object} opts [API request object paramters]
 * @return {Object} promise 
 */
Program.getProgramDetails = function getProgramDetails(opts) {
    var userId = opts.userId,
        dbWhere = {
            u_id : userId,
            is_active : 1,
            program_name : opts.program_name,
        }

    return ProgramSchema.findOne({
        where: dbWhere
    })
    .then(function(rows) {
        return Promise.resolve(rows);
    })
    .catch(function(e) {
        return Promise.reject(e);
    }); 

}

/** Query method to check if program exists
 * @param "string" program_name [program name string]
 * @return {Object} promise
 */
Program.findProgramExists = function findProgramExists(program_name) {
    var dbWhere = {
            program_name : program_name
        };
    
    return ProgramSchema.count({
        where: dbWhere
    })
    .then(function(rowCount) {
        if(rowCount != 0) {
            var err = new Error('Record already exists');
            err.status = 400;
            err.msg = 'Record already exists';
            throw err;
        } else {
            return Promise.resolve(true);
        }
    })
    .catch(function(e) {
        return Promise.reject(e);
    });
}

/** Query method to fetch programs by program name
 * @param  "String" program_name [Program Name]
 * @return {Object} promise 
 */
Program.findProgramForDeletion = function findProgramForDeletion(program_name) {
    var dbWhere = {
        program_name : program_name
    };

    return ProgramSchema.count({
        where: dbWhere
    })
    .then(function(rowCount) {
        if(rowCount != 0) {
            return Promise.resolve(true);
        } else {
            var err = new Error('Record doesn\'t exists');
            err.status = 400;
            err.msg = 'record not found';
            throw err;
        }
    })
    .catch(function(e) {
        return Promise.reject(e);
    });
}

/** Query method to create new programs
 * @param  {Object} opts [API request object paramters]
 * @return {Object} promise 
 */
Program.createProgramQuery = function createProgramQuery(opts) {
    var dbInsert = {
        program_name: opts.program_name,
        program_desc: opts.program_desc,
        program_startdate: opts.program_startDate,
        program_enddate: opts.program_endDate,
        is_active: 1,
        u_id: opts.userId,
    };

    return ProgramSchema.create(dbInsert)
        .then(function(rows) {
            return Promise.resolve(rows);
        }).catch(function(err) {
            return Promise.resolve(err);
        });
}

/** Query method to set programs as inactive
 * @param  {Object} opts [API parameters]
 * @return {Object} promise 
 */
Program.deleteProgramQuery = function deleteProgramQuery(opts) {
    var dbSet = {
        is_active : 0
    }, dbWhere = {
        u_id: opts.userId,
        program_name: opts.program_name
    }

    return ProgramSchema.update(dbSet, {
        where: dbWhere
    })
    .then(function(rows) {
        return Promise.resolve(rows);
    })
    .catch(function(e) {
        return Promise.reject(e);
    });
}

/** Query method to update program details
 * @param  {Object} opts [API paramters]
 * @return {Object} promise 
 */
Program.updateProgramQuery = function updateProgramQuery(opts) {
    var dbSet = {
        program_desc: opts.program_desc,
        program_startdate: opts.program_startDate,
        program_enddate: opts.program_endDate
    }, dbWhere = {
        u_id: opts.userId,
        p_id: opts.p_id,
    }
    
    return ProgramSchema.update(dbSet, {
        where: dbWhere
    })
    .then(function(rows) {
        return Promise.resolve(rows);
    })
    .catch(function(e) {
        return Promise.reject(e);
    }); 
}

module.exports= Program;
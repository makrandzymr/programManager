'user strict';
var nconf = require('nconf');
var mysql = require('promise-mysql');
var pool;

nconf.argv()
   .env()
   .file({ file: 'config.json' });

   
nconf.set('database:host', '127.0.0.1');
nconf.set('database:user', 'root');
nconf.set('database:password', 'password');
nconf.set('database:name', 'programs');
var db = nconf.get('database');

pool = mysql.createPool({
    host: db.host,
    user: db.user,
    password: db.password,
    database: db.name,
    connectionLimit: 100
  });

function getSqlConnection() {
    return pool.getConnection().disposer(function(connection) {
        pool.releaseConnection(connection);
    });
}

module.exports = getSqlConnection;



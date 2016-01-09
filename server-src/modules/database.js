const mysql = require('mysql');
const config = require('../../config/config');
const Log = require('./logging');
const Stats = require('./datadog');
const fs = require('fs');

/**
 * Start the database connection
 * @param [callback]
 */
function openPool(callback){
    if(!config.db){
        Log.die('system','Database','Connection information not specified',config.db);
    }

    // Connect to DB server
    const pool = mysql.createPool(config.db);

    // Start the first connection
    pool.getConnection(function(err){
        if(err){
            Log.die('system','Database','Failed to connect',err);
        } else {
            Log.info('system','Database','Connection established');
        }

        if(typeof callback === 'function'){
            callback();
        }
    });

    /**
     * Execute a query that reports to datadog
     * @param queryName String Name of the query to report
     * @param module String Name of the module the stat is part of
     * @param [arguments] {*}
     */
    pool.statQuery = function(queryName,module){
        var args = Array.prototype.slice.call(arguments);
        queryName = args.shift();
        module = args.shift();
        var callback = args.pop();

        var timer = process.hrtime();
        args.push(function(err,data){
            var tags = ['query:' + queryName,'' + module,'status:' + (err? 'error':'success')];
            Stats.reportTime('cec.db_query_time',timer,tags);
            callback.call(this,err,data);
        });
        pool.query.apply(pool,args);
    };

    return pool;
}


module.exports = function(callback){
    Log.info('system','Database','Connection attempt');
    return module.exports = openPool(callback);
};

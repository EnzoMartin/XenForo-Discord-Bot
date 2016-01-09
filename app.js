const express = require('express');
const http = require('http');
const async = require('async');

const Stats = require('./server-src/modules/datadog');
const Reports = require('./server-src/modules/reporting');
const Log = require('./server-src/modules/logging');
const Redis = require('./server-src/modules/redis');
const config = require('./config/config');
const Database = require('./server-src/modules/database');

/**
 * Connect to Redis
 * @param callback
 */
function connectRedis(callback){
    async.parallel([
        function(callback){
            Redis.on('connect',function(){
                Log.info('System','Redis','Connected');
                callback();
            });
        },
        function(callback){
            Redis.Sub.on('connect',function(){
                Log.info('System','Redis-Sub','Connected');
                callback();
            });
        },
        function(callback){
            Redis.Pub.on('connect',function(){
                Log.info('System','Redis-Pub','Connected');
                callback();
            });
        }
    ],function(){
        Redis.clearStartupKeys(function(){
            Redis.Pub.publish('cec:servers','connected');
            callback(null);
        });
    });
}

/**
 * Connect to MySQL
 * @param callback
 */
function connectMySQL(callback){
    Database(function(){
        callback(null);
    });
}

/**
 * Finish the application startup process
 * @param callback
 */
function start(callback){
    const expressConfig = require('./config/express');
    const bindRoutes = require('./config/routes');
    const reporting = require('./server-src/modules/reporting');

    // Start the application
    Log.info('system','Main','Starting application');

    var app = express();

    // Express settings
    expressConfig(app);
    Log.info('system','Main','Set up Express');

    // Express routes
    bindRoutes(app);
    Log.info('system','Main','Bind Express routes');

    // Start
    var server = http.createServer(app);
    if(config.isProd){
        server.listen(config.port,'localhost');
    } else {
        server.listen(config.port);
    }
    Log.info('system','Main','Start HTTP server');

    Log.info('system','Main','Start Discord bot');
    require('./server-src/modules/discord').initialize();

    // Start
    if(config.isDev){
        Log.info('system','Main','Application started at http://' + config.ip + ':' + config.port);
    } else {
        Log.info('system','Main','Application started on port ' + config.port);
    }

    if(typeof callback === 'function'){
        callback(app,server);
    }
}

/**
 * Begin application startup by connecting the essentials and configuring database
 * @param callback
 */
function initialize(callback){
    // Start the report loop if datadog enabled
    if(!config.datadogMock){
        Reports.startReporting();
    }

    async.parallel([
        connectRedis,
        connectMySQL
    ],function(){
        start(callback);
    });
}

module.exports = {
    initialize
};
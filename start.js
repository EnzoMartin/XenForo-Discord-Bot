const startup = process.hrtime();
const Log = require('./server-src/modules/logging');
const fs = require('fs');
const configGenerate = require('./config/config').initialize;

// Load configurations
const env = process.env.SERVER_ENV || process.env.NODE_ENV || 'development';
const config = configGenerate(env);
const App = require('./app');
Log.info('system','Main','Running in "' + env + '" mode on IP "' + config.ip + ':' + config.port + '"');

// Start our application
App.initialize(function(){
    var elapsed = process.hrtime(startup);
    elapsed = elapsed[0] * 1000 + elapsed[1] / 1000000;
    Log.info('system','Main','App started in ' + elapsed + 'ms');
});
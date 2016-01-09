const StatsD = require('node-statsd');
const config = require('../../config/config');
const Log = require('./logging');

Log.info('system','DataDog','Initialize Datadog');
const client = new StatsD({mock:config.datadogMock,global_tags:['server:' + config.serverId]});

client.socket.on('error',function(error){
    Log.error('system','DataDog','Error occurred',error);
});

module.exports = client;
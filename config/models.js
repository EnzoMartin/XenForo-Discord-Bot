'use strict';

const pjson = require('../package.json');
const os = require('os');
const networks = os.networkInterfaces();
const fs = require('fs');
const uuid = require('node-uuid');
const path = require('path');
const Log = require('../server-src/modules/logging');

const rootPath = path.normalize(__dirname + '/..');
const secret = process.env.SECRET || 'c0g8+em8x%@=45%^kdrn=&+$1qgw91dsn@a6z3pwoyx_&y++fs';
const sessionKeyPrefix = 'cec:session-v1:';
const cookieSid = 'criticaledgechat.sid';
const allowedImageExtensions = ['jpg','png','jpeg','gif'];

function createServerId() {
    var id = uuid.v4();
    fs.writeFile('serverid.txt',id,{encoding:'utf8'},function(err){
        if(err){
            Log.die('system','Config','Failed to create server ID file',err);
        }
    });
    return id;
}

// Find the current IP
Log.info('system','Config','Checking machine IP');
var ip = '127.0.0.1';
for (var name in networks) {
    var network = networks[name];
    var i = 0;
    var len = network.length;

    while (i < len) {
        var adapter = network[i];
        if (adapter.family === 'IPv4' && adapter.internal === false) {
            ip = adapter.address;
            break;
        }
        i++;
    }

    if (ip !== '127.0.0.1') {
        break;
    }
}

// Get or generate the server ID
var serverId = null;
try {
    serverId = fs.readFileSync('serverid.txt',{encoding:'utf8'});
    if(!serverId){
        serverId = createServerId();
    }
} catch(err){
    serverId = createServerId();
}


class Database {
    constructor (config) {
        this.host = config.host || process.env.DB_HOST || '127.0.0.1';
        this.user = config.user || process.env.DB_USER;
        this.port = config.port || process.env.DB_PORT || 3306;
        this.password = config.password || process.env.DB_PASSWORD;
        this.database = config.database || process.env.DB_DATABASE;
        this.dateStrings = false;
        this.timezone = 'UTC';
        this.typeCast = function(field, next) {
            if (field.type === 'TINY' && field.length == 1) {
                return (field.string() == '1');
            }
            return next();
        }
    }
}

class Redis {
    constructor (config) {
        this.host = config.host || process.env.REDIS_HOST || 'localhost';
        this.port = config.port || process.env.REDIS_PORT || 6379;
    }
}

class Configuration {
    setBaseConfig (config) {
        this.root = config.rootPath || rootPath;
        this.cookieSid = config.cookieSid || cookieSid;
        this.sessionKeyPrefix = config.sessionKeyPrefix || sessionKeyPrefix;
        this.secret = config.secret || secret;
        this.serverId = config.serverId || serverId;
        this.version = config.version || pjson.version;
        this.allowedImageExtensions = config.allowedImageExtensions || allowedImageExtensions;
        this.ip = config.ip || ip;
        this.env = config.env || 'development';
        this.port = config.port || process.env.PORT || 3000;
        this.url = config.url || process.env.MOCHA_URL || 'http://localhost';
        this.reporter = config.reporter || process.env.MOCHA_REPORTER || 'spec';
        this.redisConfig = config.redisConfig || {};
        this.isDev = typeof config.isDev === 'boolean' ? config.isDev : true;
        this.isProd = typeof config.isProd === 'boolean' ? config.isProd : false;
        this.stackError = typeof config.stackError === 'boolean' ? config.stackError : true;
        this.prettyHTML = typeof config.prettyHTML === 'boolean' ? config.prettyHTML :false;
        this.expressLog = typeof config.expressLog === 'boolean' ? config.expressLog :true;
        this.socketLog = typeof config.socketLog === 'boolean' ? config.socketLog :false;
        this.datadogMock = typeof config.datadogMock === 'boolean' ? config.datadogMock :true;
        this.socketLogLevel = typeof config.stackError === 'number' ? config.stackError : 1;
        this.expressLogLevel = config.expressLogLevel || 'dev';
        this.databaseConfig = config.databaseConfig || {};
        this.discord = config.discord || {};
    }

    constructor (config){
        this.setBaseConfig(config);

        this.db = new Database(this.databaseConfig);
        this.redis = new Redis(this.redisConfig);
    }
}

module.exports = {
    Database,
    Redis,
    Configuration
};

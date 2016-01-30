'use strict';

const pjson = require('../package.json');
const os = require('os');
const networks = os.networkInterfaces();
const fs = require('fs');
const uuid = require('node-uuid');
const path = require('path');
const Log = require('../server-src/modules/logging');
const rootPath = path.normalize(__dirname + '/..');

function createServerId() {
    var id = uuid.v4();
    fs.writeFile('serverid.txt',id,{encoding:'utf8'},function(err){
        if(err){
            Log.die('system','Config','Failed to create server ID file',err);
        }
    });
    return id;
}

/**
 * Returns the boolean value or true
 * @param variable
 * @returns {boolean}
 */
function getBooleanValue(variable) {
    return typeof variable === 'boolean' ? variable : true;
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

class Discord {
    constructor (config) {
        this.serverName = config.serverName || process.env.DISCORD_SERVER;
        this.email = config.email || process.env.DISCORD_EMAIL;
        this.password = config.password || process.env.DISCORD_PASSWORD;
    }
}

class Configuration {
    setBaseConfig (config) {
        this.root = config.rootPath || rootPath;
        this.serverId = config.serverId || serverId;
        this.version = config.version || pjson.version;
        this.ip = config.ip || ip;
        this.env = config.env || 'development';
        this.port = config.port || process.env.PORT || 3000;
        this.url = config.url || process.env.MOCHA_URL || 'http://localhost';
        this.reporter = config.reporter || process.env.MOCHA_REPORTER || 'spec';
        this.isDev = typeof config.isDev === 'boolean' ? config.isDev : true;
        this.isProd = typeof config.isProd === 'boolean' ? config.isProd : false;
        this.stackError = typeof config.stackError === 'boolean' ? config.stackError : true;
        this.prettyHTML = typeof config.prettyHTML === 'boolean' ? config.prettyHTML :false;
        this.expressLog = typeof config.expressLog === 'boolean' ? config.expressLog :true;
        this.socketLog = typeof config.socketLog === 'boolean' ? config.socketLog :false;
        this.datadogMock = typeof config.datadogMock === 'boolean' ? config.datadogMock :true;
        this.socketLogLevel = typeof config.stackError === 'number' ? config.stackError : 1;
        this.expressLogLevel = config.expressLogLevel || 'dev';

        this.redisConfig = config.redisConfig || {};
        this.databaseConfig = config.databaseConfig || {};
        this.discordConfig = config.discordConfig || false;
    }

    constructor (config){
        this.setBaseConfig(config);

        this.db = new Database(this.databaseConfig);
        this.redis = new Redis(this.redisConfig);
        this.discord = new Discord(this.discordConfig);
    }
}

class Role {
    generatePermissions (permissions) {
        return {
            // general
            createInstantInvite: getBooleanValue(permissions.createInstantInvite),
            kickMembers: permissions.kickMembers || false,
            banMembers: permissions.banMembers || false,
            manageRoles: permissions.manageRoles || false,
            managePermissions: permissions.managePermissions || false,
            manageChannels: permissions.manageChannels || false,
            manageChannel: permissions.manageChannel || false,
            manageServer: permissions.manageServer || false,
            // text
            readMessages: getBooleanValue(permissions.readMessages),
            sendMessages: getBooleanValue(permissions.sendMessages),
            sendTTSMessages: permissions.sendTTSMessages || false,
            manageMessages: permissions.manageMessages || false,
            embedLinks: getBooleanValue(permissions.embedLinks),
            attachFiles: getBooleanValue(permissions.attachFiles),
            readMessageHistory: getBooleanValue(permissions.readMessageHistory),
            mentionEveryone: permissions.mentionEveryone || false,
            // voice
            voiceConnect: getBooleanValue(permissions.voiceConnect),
            voiceSpeak: getBooleanValue(permissions.voiceSpeak),
            voiceMuteMembers: permissions.voiceMuteMembers || false,
            voiceDeafenMembers: permissions.voiceDeafenMembers || false,
            voiceMoveMembers: permissions.voiceMoveMembers || false,
            voiceUseVAD: permissions.voiceUseVAD || false
        };
    }

    constructor (role) {
        if(typeof role.name === 'undefined'){
            throw new Error('Need to specify a name for the role');
        }

        this.level = role.level || 0;
        this.hoist = role.hoist || false;
        this.color = role.color || parseInt(0, 16);
        this.name = role.name;
        this.position = typeof role.position === 'undefined' ? -1 : role.position;
        this.usergroupId = parseInt(role.usergroupId || 1, 10);

        this.permissions = this.generatePermissions(role.permissions || {});
    }
}

class Channel {
    constructor (channel) {
        if(typeof channel.name === 'undefined'){
            throw new Error('Need to specify a name for the channel');
        }

        this.name = channel.name;
        this.topic = channel.topic || '';
        this.type = channel.type || 'text';
        this.deleteAllMessages = channel.deleteAllMessages || false;
        this.minLevel = channel.minLevel || 0;
        this.isDefaultChannel = channel.isDefaultChannel || false;
    }
}

module.exports = {
    Database,
    Redis,
    Discord,
    Role,
    Channel,
    Configuration
};

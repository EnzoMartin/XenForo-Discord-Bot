const Redis = require('ioredis');
const config = require('../../config/config');
const Log = require('./logging');
const async = require('async');

const Client = new Redis(config.redis.port,config.redis.host);
const Sub = new Redis(config.redis.port,config.redis.host);
const Pub = new Redis(config.redis.port,config.redis.host);

// Ensure we throw an exception in development
if(config.isDev){
    Client.on('error',function(err){
        Log.error('System','Redis',err);
    });

    Sub.on('error',function(err){
        Log.error('System','Redis-Sub',err);
    });

    Pub.on('error',function(err){
        Log.error('System','Redis-Pub',err);
    });
}

/**
 * Send an event
 * @param data Object
 * @param data.type String
 * @param [data.id] String
 * @param [data.ids] Array
 */
Pub.trigger = function(data){
    Pub.publish('cec:trigger',JSON.stringify(data),function(err){
        if(err){
            Log.error('system','Redis-Pub','Failed to publish event',err);
        }
    });
};

/**
 * Clear out the given key matches
 * @param type String
 * @param index Number
 * @param callback
 */
function runDeleteScan(type,index,callback){
    Client.scan([index,'match','cec:' + type +':*','count',1000000],function(err,data){
        if(err){
            Log.error('system','Redis','Failed to scan for keys like "' + type + '"',err);
        }

        if (data.length) {
            var nextIndex = parseInt(data[0], 10);
            var keys = data[1];

            if (nextIndex !== 0) {
                runDeleteScan(type, nextIndex, callback);
            }

            if (keys.length) {
                Client.del(keys, function (err) {
                    if (err) {
                        Log.error('system', 'Redis', 'Failed to delete the active "' + type + '" keys from index "' + index + '"', err);
                    }

                    if (nextIndex === 0) {
                        callback();
                    }
                });
            } else if (nextIndex === 0) {
                callback();
            }
        } else {
            callback();
        }
    });
}

/**
 * Run a scan and return all keys
 * @param key
 * @param index
 * @param callback
 * @param [result]
 */
function runScan(key,index,callback,result){
    result = result || [];
    Client.scan([index, 'match', key, 'count', 1000000], function (err, data) {
        if (err) {
            Log.error('system', 'Redis', 'Failed to scan for "' + key + '"', err);
        }

        if (data.length) {
            var nextIndex = parseInt(data[0], 10);
            var keys = data[1];

            if (nextIndex !== 0) {
                runScan(key, nextIndex, callback, result);
            }

            if (keys.length) {
                result = result.concat(keys);

                if (nextIndex === 0) {
                    callback(result);
                }
            } else if (nextIndex === 0) {
                callback(result);
            }
        } else {
            callback(result);
        }
    });
}

/**
 * Clear out startup keys
 * @param callback
 */
function clearStartupKeys(callback){
    async.parallel([
        function(callback){
            runDeleteScan('online:' + config.serverId,0,function(){
                callback();
            });
        }
    ],function(){
        callback();
    });
}

function deleteKeyMatch(match,callback){
    runDeleteScan(match,0,callback);
}

module.exports = Client;
module.exports.Pub = Pub;
module.exports.Sub = Sub;
module.exports.runScan = runScan;
module.exports.deleteKeyMatch = deleteKeyMatch;
module.exports.clearStartupKeys = clearStartupKeys;
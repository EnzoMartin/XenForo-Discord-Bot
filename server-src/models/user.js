const db = require('../modules/database');
const Log = require('../modules/logging');
const Redis = require('../modules/redis');
const async = require('async');
const getUserByEmail = require('../queries/getUserByEmail.sql');
const verifyUserDiscordId = require('../queries/verifyUserDiscordId.sql');

function setKeyExpires(key, expires){
    if(expires){
        Redis.expire(key, 3600, function(err){
            if(err){
                Log.error('system','User','Failed to set expire time on "' + key + '"',err);
            }
        });
    } else {
        Redis.persist(key, function(err){
            if(err){
                Log.error('system','User','Failed to remove expire time on "' + key + '"',err);
            }
        });
    }
}

module.exports = {
    getUserByEmail: function(email, callback){
        db.statQuery('get_user_by_email','user',getUserByEmail,[email],function(err,result){
            if(err){
                Log.error('system','User','Failed to get user by email "' + email + '"',err);
            }
            callback(err,result);
        });
    },
    verifyUserDiscordId: function(userId, callback){
        Redis.get('cec:emails:user:' + userId, function(err,email){
            db.statQuery('verify_user_discord_id','user',verifyUserDiscordId,[email, userId],function(err,result){
                if(err){
                    Log.error('system','User','Failed to verify user\'s "' + email + '" discord id',err);
                }
                callback(err,result);
            });
        });
    },
    getUserStatus: function(userId, callback){
        Redis.get('cec:status:user:' + userId, function(err, result){
            if(err){
                Log.error('system','User','Failed to get user "' + userId + '" status',err);
            }
            callback(err,result);
        });
    },
    setUserAsInitiated: function(userId, callback){
        var key = 'cec:status:user:' + userId;
        Redis.set(key, 'initiated', function(err, result){
            if(err){
                Log.error('system','User','Failed to set user "' + userId + '" as pending verification',err);
            }
            setKeyExpires(key, true);
            callback(err,result);
        });
    },
    setUserAsPending: function(userId, email, callback){
        async.parallel([
            function (callback){
                var key = 'cec:status:user:' + userId;
                Redis.set(key, 'pending', function(err, result){
                    if(err){
                        Log.error('system','User','Failed to set user "' + userId + '" as pending verification',err);
                    }
                    setKeyExpires(key, true);
                    callback(err,result);
                });
            },
            function (callback){
                var key = 'cec:emails:user:' + userId;
                Redis.set(key, email, function(err, result){
                    if(err){
                        Log.error('system','User','Failed to set user "' + userId + '" email',err);
                    }
                    callback(err,result);
                });
            }
        ], function(err,result){
            callback(err,result);
        });
    },
    setUserAsVerified: function(userId, callback){
        var key = 'cec:status:user:' + userId;
        Redis.set(key, 'verified', function(err, result){
            if(err){
                Log.error('system','User','Failed to set user "' + userId + '" as pending verification',err);
            }
            setKeyExpires(key, false);
            callback(err,result);
        });
    }
};
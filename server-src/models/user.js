const db = require('../modules/database');
const Log = require('../modules/logging');
const getUserByEmail = require('../queries/getUserByEmail.sql');

module.exports = {
    getUserByEmail: function(email, callback){
        db.statQuery('get_user_by_email','user',getUserByEmail,[email],function(err,result){
            if(err){
                Log.error('system','User','Failed to get user by email "' + email + '"',err);
            }
            callback(err,result);
        });
    }
};
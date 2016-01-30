const User = require('./user');
const Client = require('../modules/discord').Client;
const emailRegex = /(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/g;

module.exports = {
    verifyUser: function(message){
        var userId = message.author.id;
        User.getUserStatus(userId,function(err,status){
            switch(status){
                case 'verified':
                    Client.reply(message,message.author + ', you\'ve already been verified and the appropriate permissions have been granted to you');
                    break;
                case 'pending':
                    Client.reply(message,'Checking your profile for a matching ID...',function(){
                        User.verifyUserDiscordId(userId,function(err,result){
                            if(!err && result.length){
                                User.setUserAsVerified(userId,function(err){
                                    Client.reply(message,'Thanks ' + message.author + '! You\'ve been verified and granted appropriate permissions on Discord');
                                });
                                //TODO: Add role granting
                            } else {
                                Client.reply(message,'Couldn\'t verify your account, are you sure you entered `' + userId + '` into the Discord ID field on the forums?');
                            }
                        });
                    });
                    break;
                case 'initiated':
                    var email = message.content.match(emailRegex);
                    var isValidEmail = email && email.length;

                    if(isValidEmail){
                        Client.reply(message,'Verifying your account with email `' + email[0] + '`...',function(){
                            User.getUserByEmail(email[0],function(err,result){
                                if(!err && result.length){
                                    User.setUserAsPending(userId,result[0].email,function(err){
                                        Client.reply(message,'Your Discord ID is `' + userId + '`, enter the ID into the `Discord ID` field at https://www.criticaledge.net/account/personal-details',function(){
                                            Client.reply(message,'Let me know once you\'ve saved it to your profile');
                                        });
                                    });
                                } else {
                                    Client.reply(message,'No account with the supplied email has been found, please try again');
                                }
                            });
                        });
                    } else {
                        Client.reply(message,'`' + message.content + '` is not valid, please enter a valid email');
                    }
                    break;
                default:
                    User.setUserAsInitiated(userId,function(err){
                        Client.sendMessage(message.author,'Hello ' + message.author + ', your account is not verified, preventing you from accessing the regular channels',function(){
                            Client.sendMessage(message.author,'Please enter the email you use for your Critical Edge Forum account');
                        });
                    });
                    break;
            }
        });
    }
};
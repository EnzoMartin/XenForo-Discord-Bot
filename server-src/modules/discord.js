'use strict';
const Discord = require('discord.js');
const async = require('async');
const config = require('../../config/config');
const Definitions = require('../../config/Definitions');
const Log = require('./logging');
const Client = new Discord.Client();
const User = require('../models/user');

const emailRegex = /(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/g;
var BotUser = null;
var Server = null;
var SilencedChannels = [];

Client.on('message', function(message){
    if(message.channel.isPrivate && message.author !== BotUser){
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
                        Client.reply(message,'Hello ' + message.author + ', your account is not verified',function(){
                            Client.reply(message,'Please enter the email you use for your Critical Edge Forum account');
                        });
                    });
                    break;
            }
        });
    } else if (message.author !== BotUser && SilencedChannels.indexOf(message.channel.name.toLowerCase()) !== -1) {
        Client.deleteMessage(message,function(err){
            // Silent error
        });

    } else if (message.author !== BotUser && message.channel.name.toLowerCase() === 'bot-testing-area') {
        if(message.content.indexOf('!slap') !== -1){
            if(message.mentions.filter((user) => user.name === 'DarkLord7854').length){
                Client.reply(message, 'You can\'t slap this person');
            } else if (message.mentions.length) {
                var users = message.mentions.map((user) => user.mention());
                Client.sendMessage(message.channel,'Slaps ' + users.join(' ') + ' with a large trout',false);
            } else {
                Client.reply(message, 'You need to mention one or more people to slap');
            }
        }

        console.log(message.author.name,message.content);
    }
});

Client.on('ready', () => {
	Log.info('system','Discord','Bot client connected and ready');
    Server = Client.servers.find((server) => server.name === config.discord.serverName);
    BotUser = Client.user;

    var Channels = Server.channels;
    var Channel = Channels.find((channel) => channel.name.indexOf('bot-testing') !== -1);
    var Roles = Server.roles;

    var filteredChannels = Definitions.channels.reduce(function(filtered,channel){
        let existingChannel = Channels.find((item) => item.name === channel.name && item.type === channel.type);
        if(!existingChannel){
            filtered.add.push(channel);
        } else {
            filtered.update.push({existingChannel,channel});
        }
        return filtered;
    },{add:[],update:[]});

    var addChannels = filteredChannels.add;
    var updateChannels = filteredChannels.update;

    var removeChannels = Channels.filter((item) => !Definitions.channels.find((channel) => channel.name === item.name));
    async.parallel(removeChannels.map((channel) => function(callback){
        Client.deleteChannel(channel, callback);
    }), function(err){
        if(err){
            //Log.error('system','Discord','Failed to delete some channels',err);
        }
    });

    async.parallel(addChannels.map((channel) => function(callback){
        Server.createChannel(channel.name, channel.type, callback);
    }), function(err){
        if(err){
            Log.error('system','Discord','Failed to create some channels',err);
        }
    });

    async.parallel(updateChannels.map((item) => function(callback){
        Client.setChannelNameAndTopic(item.existingChannel, item.channel.name, item.channel.topic, callback);
    }), function(err){
        if(err){
            Log.error('system','Discord','Failed to update some channels',err);
        }
    });

    var removeRoles = Roles.filter((item) => !Definitions.roles.find((role) => role.name === item.name));
    async.parallel(removeRoles.map((role) => function(callback){
        Client.deleteRole(role, callback);
    }), function(err){
        if(err){
            Log.error('system','Discord','Failed to delete some roles',err);
        }
    });

    var addOrUpdateRoles = Definitions.roles.reduce(function(toModify, roleDefinition){
        var existingRole = Roles.find((item) => item.name === roleDefinition.name);
        if(existingRole){
            var isDifferent = (
                roleDefinition.hoist !== existingRole.hoist ||
                roleDefinition.position !== existingRole.position ||
                roleDefinition.color !== existingRole.color
            );

            if(!isDifferent){
                // Check the permissions if we haven't already found the role to be different
                var existingPermissions = existingRole.serialise();
                isDifferent = Object.keys(roleDefinition.permissions).find(
                    (key) => roleDefinition.permissions[key] !== existingPermissions[key]
                );
            }

            if(isDifferent){
                roleDefinition.permissions = Object.keys(roleDefinition.permissions).reduce(function(permissions, key){
                    if(roleDefinition.permissions[key]){
                        permissions.push(key);
                    }
                    return permissions;
                }, []);

                toModify.update.push({
                    role: existingRole,
                    data: roleDefinition
                });
            }
        } else {
            roleDefinition.permissions = Object.keys(roleDefinition.permissions).reduce(function(permissions, key){
                if(roleDefinition.permissions[key]){
                    permissions.push(key);
                }
                return permissions;
            }, []);
            toModify.add.push(roleDefinition);
        }

        return toModify;
    }, {
        add:[],
        update:[]
    });

    async.parallel(addOrUpdateRoles.add.map((item) => function(callback){
        Client.createRole(Server, item, callback);
    }), function(err){
        if(err){
            Log.error('system','Discord','Failed to add some roles',err);
        }
    });

    async.parallel(addOrUpdateRoles.update.map((item) => function(callback){
        Client.updateRole(item.role, item.data, callback);
    }), function(err){
        if(err){
            Log.error('system','Discord','Failed to update some roles',err);
        }
    });

    // TODO: Run through users and ensure they have correct roles
    //console.log('users',Client.users);
    Client.sendMessage(Channel, 'Bot connected and ready', false, function(err){
        if(err){
            console.error('message failed',err)
        }
    });
});


module.exports = {
    initialize: function(){
        Client.login(config.discord.email,config.discord.password);
    }
};
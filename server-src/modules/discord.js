'use strict';
const Discord = require('discord.js');
const async = require('async');
const config = require('../../config/config');
const Definitions = require('../../config/Definitions');
const Log = require('./logging');
const Client = new Discord.Client();

module.exports = {
    initialize: function(callback){
        Client.login(config.discord.email,config.discord.password);

        Client.on('ready', () => {
            Log.info('system','Discord','Bot client connected and ready');
            const Server = Client.servers.find((server) => server.name === config.discord.serverName);
            const BotUser = Client.user;
            const SilencedChannels = [];

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

                // Populate the silenced channels list
                if(channel.deleteAllMessages){
                    SilencedChannels.push(channel.name);
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
                Server.createChannel(channel.name, channel.type, (err,createdChannel) => {
                    if(err){
                        callback(err);
                    } else {
                        // Need to set the topic after creation of the channel
                        Client.setChannelNameAndTopic(createdChannel, channel.name, channel.topic, callback);
                    }
                });
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

            module.exports = {
                Client,
                Server,
                SilencedChannels,
                BotUser
            };

            callback();
        });
    }
};
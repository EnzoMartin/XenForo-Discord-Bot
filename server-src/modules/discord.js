const Discord = require('discord.js');
const config = require('../../config/config');
const Log = require('./logging');
const Client = new Discord.Client();
const User = require('../models/user');

const emailRegex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
var Username = null;

Client.on('message', function(message){
    if(message.channel.isPrivate){
        if(message.content.indexOf('!verify') !== -1){
            var email = message.content.split('!verify ')[1];
            var isValidEmail = emailRegex.test(email);
            if(isValidEmail){
                User.getUserByEmail(email,function(err,result){
                    if(!err && result.length){
                        Client.reply(message,'Thank you, your account has been verified');
                    }
                });
            }
        }
    } else if (message.author.name !== Username && message.channel.name.toLowerCase() === 'bot-testing-area') {
        var username = message.author.name.toLowerCase();

        if(message.content.indexOf('!slap') !== -1){
            if(message.mentions.filter((user) => user.name === 'DarkLord7854').length){
                Client.reply(message, 'You can\'t slap this person');
            } else if (message.mentions.length) {
                var users = message.mentions.map((user) => user.mention());
                Client.sendMessage(message.channel,'Slaps ' + users.join(' ') + ' with a large trout',false, function(err){
                    if(err){
                        console.log('failed to reply', err)
                    }
                })
            } else {
                Client.reply(message, 'You need to mention one or more people to slap');
            }
        }
        if(username === 'doltasdasd'){
            Client.deleteMessage(message, function(err){
                console.log(err);
                if(!err){
                    //Client.reply(message,'Deleted your message');
                }
            });
        }

        console.log(message.author.name,message.content);
    }
});

Client.on('ready', () => {
	Log.info('system','Discord','Bot client connected and ready');
    var Channels = Client.channels;
    var User = Client.user;
    Username = User.username;
    var Channel = Channels.find(function(channel){
        return channel.name.indexOf('bot-testing') !== -1;
    });

    Client.sendMessage(Channel, 'Bot connected and ready', false, function(err){
        if(err){
            console.error('message failed',err)
        }
    });


    //console.log('users',Client.users);
});


module.exports = {
    initialize: function(){
        Client.login(config.discord.email,config.discord.password);
    }
};
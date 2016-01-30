'use strict';
const Discord = require('../modules/discord');
const async = require('async');
const config = require('../../config/config');
const Definitions = require('../../config/Definitions');
const Log = require('../modules/logging');
const Message = require('./message');

const Server = Discord.Server;
const Client = Discord.Client;
const SilencedChannels = Discord.SilencedChannels;
const BotUser = Discord.BotUser;

Client.on('message', function(message){
    if(message.channel.isPrivate && message.author !== BotUser){
        Message.verifyUser(message);
    } else if (message.author !== BotUser && SilencedChannels.indexOf(message.channel.name.toLowerCase()) !== -1) {
        Client.deleteMessage(message,function(err){
            // Silent error
        });
        Message.verifyUser(message);
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
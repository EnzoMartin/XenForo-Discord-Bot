const Models = require('./models');

module.exports = {
    actions: {

    },
    channels: [
        {
            name: 'welcome',
            type: 'text',
            topic: 'Please verify your user by messaging the EdgyBot',
            deleteAllMessages: true,
            minLevel: 500
        },
        {
            name: 'general',
            isDefaultChannel: true,
            topic: 'Random bullshittery',
            type: 'text',
            minLevel: 1
        },
        {
            name: 'moderators',
            topic: 'Moderator & Admin only chat',
            type: 'text',
            minLevel: 500
        },
        {
            name: 'voice',
            type: 'voice',
            minLevel: 1
        }
    ].map((channel) => new Models.Channel(channel)),
    roles: [
        {
            level: 0,
            hoist: false,
            color: parseInt(0, 16),
            name: '@everyone',
            usergroupId: 1,
            position: -1,
            permissions:{
                // general
                createInstantInvite:false,
                kickMembers: false,
                banMembers: false,
                manageRoles: false,
                managePermissions: false,
                manageChannels: false,
                manageChannel: false,
                manageServer: false,
                // text
                readMessages: true,
                sendMessages: true,
                sendTTSMessages: false,
                manageMessages: false,
                embedLinks: false,
                attachFiles: false,
                readMessageHistory: true,
                mentionEveryone: false,
                // voice
                voiceConnect: false,
                voiceSpeak: false,
                voiceMuteMembers: false,
                voiceDeafenMembers: false,
                voiceMoveMembers: false,
                voiceUseVAD: false
            }
        },
        {
            level: 1,
            hoist: true,
            color: parseInt('FFBB00', 16),
            name: 'Member',
            usergroupId: 2,
            position: 1,
            permissions:{
                // general
                createInstantInvite:false,
                kickMembers: false,
                banMembers: false,
                manageRoles: false,
                managePermissions: false,
                manageChannels: false,
                manageChannel: false,
                manageServer: false,
                // text
                readMessages: true,
                sendMessages: true,
                sendTTSMessages: true,
                manageMessages: false,
                embedLinks: true,
                attachFiles: true,
                readMessageHistory: true,
                mentionEveryone: true,
                // voice
                voiceConnect: true,
                voiceSpeak: true,
                voiceMuteMembers: false,
                voiceDeafenMembers: false,
                voiceMoveMembers: false,
                voiceUseVAD: true
            }
        },
        {
            level: 2,
            hoist: false,
            color: parseInt('1F8B4C', 16),
            name: 'Green Donor',
            usergroupId: 2,
            position: 2,
            permissions:{
                // general
                createInstantInvite:false,
                kickMembers: false,
                banMembers: false,
                manageRoles: false,
                managePermissions: false,
                manageChannels: false,
                manageChannel: false,
                manageServer: false,
                // text
                readMessages: true,
                sendMessages: true,
                sendTTSMessages: true,
                manageMessages: false,
                embedLinks: true,
                attachFiles: true,
                readMessageHistory: true,
                mentionEveryone: true,
                // voice
                voiceConnect: true,
                voiceSpeak: true,
                voiceMuteMembers: false,
                voiceDeafenMembers: false,
                voiceMoveMembers: false,
                voiceUseVAD: true
            }
        },
        {
            level: 2,
            hoist: false,
            color: parseInt('95A5A6', 16),
            name: 'Silver Donor',
            usergroupId: 2,
            position: 3,
            permissions:{
                // general
                createInstantInvite:false,
                kickMembers: false,
                banMembers: false,
                manageRoles: false,
                managePermissions: false,
                manageChannels: false,
                manageChannel: false,
                manageServer: false,
                // text
                readMessages: true,
                sendMessages: true,
                sendTTSMessages: true,
                manageMessages: false,
                embedLinks: true,
                attachFiles: true,
                readMessageHistory: true,
                mentionEveryone: true,
                // voice
                voiceConnect: true,
                voiceSpeak: true,
                voiceMuteMembers: false,
                voiceDeafenMembers: false,
                voiceMoveMembers: false,
                voiceUseVAD: true
            }
        },
        {
            level: 2,
            hoist: false,
            color: parseInt('607D8B', 16),
            name: 'Platinum Donor',
            usergroupId: 2,
            position: 4,
            permissions:{
                // general
                createInstantInvite:false,
                kickMembers: false,
                banMembers: false,
                manageRoles: false,
                managePermissions: false,
                manageChannels: false,
                manageChannel: false,
                manageServer: false,
                // text
                readMessages: true,
                sendMessages: true,
                sendTTSMessages: true,
                manageMessages: false,
                embedLinks: true,
                attachFiles: true,
                readMessageHistory: true,
                mentionEveryone: true,
                // voice
                voiceConnect: true,
                voiceSpeak: true,
                voiceMuteMembers: false,
                voiceDeafenMembers: false,
                voiceMoveMembers: false,
                voiceUseVAD: true
            }
        },
        {
            level: 500,
            hoist: true,
            color: parseInt('9B59B6', 16),
            name: 'Moderator',
            usergroupId: 4,
            position: 5,
            permissions:{
                // general
                createInstantInvite:true,
                kickMembers: true,
                banMembers: true,
                manageRoles: true,
                managePermissions: false,
                manageChannels: false,
                manageChannel: false,
                manageServer: false,
                // text
                readMessages: true,
                sendMessages: true,
                sendTTSMessages: true,
                manageMessages: true,
                embedLinks: true,
                attachFiles: true,
                readMessageHistory: true,
                mentionEveryone: true,
                // voice
                voiceConnect: true,
                voiceSpeak: true,
                voiceMuteMembers: true,
                voiceDeafenMembers: true,
                voiceMoveMembers: true,
                voiceUseVAD: true
            }
        },
        {
            level: 1000,
            hoist: true,
            color: parseInt('E67E22', 16),
            name: 'Administrator',
            usergroupId: 3,
            position: 6,
            permissions:{
                // general
                createInstantInvite:true,
                kickMembers: true,
                banMembers: true,
                manageRoles: true,
                managePermissions: true,
                manageChannels: true,
                manageChannel: true,
                manageServer: true,
                // text
                readMessages: true,
                sendMessages: true,
                sendTTSMessages: true,
                manageMessages: true,
                embedLinks: true,
                attachFiles: true,
                readMessageHistory: true,
                mentionEveryone: true,
                // voice
                voiceConnect: true,
                voiceSpeak: true,
                voiceMuteMembers: true,
                voiceDeafenMembers: true,
                voiceMoveMembers: true,
                voiceUseVAD: true
            }
        }
    ].map((role) => new Models.Role(role))
};
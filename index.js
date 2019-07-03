require('dotenv').config();

const Discord = require('discord.js');
const client = new Discord.Client();
const ytdl = require('ytdl-core');
const streamOptions = {
    volume: 0.5

};
const ytdlOptions = {
    quality: 'lowestaudio',
    format: 'audioonly'
};

let dispatcher;

const token = process.env.BOT_TOKEN;

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', message => {
    const command = message.content.split(" ")[0];
    const content = message.content.replace(command, "");
    
    if ('join' === command ) {
        if (message.member.voiceChannel) {
            message.member.voiceChannel.join();
            message.reply(`Joining ${message.member.voiceChannel.name}`);
        }
    }

    if ('leave' === command) {
        if (message.member.voiceChannel) {
            message.member.voiceChannel.leave();
            message.reply(`Leaving ${message.member.voiceChannel.name}`);
        }
    }

    if ('play' === command) {
        if (message.member.voiceChannel) {

            if (ytdl.validateURL(content)) {
                message.member.voiceChannel.join()
                    .then(connection => {
                        dispatcher = connection.playStream(ytdl(content, ytdlOptions), streamOptions);
                        ytdl.getBasicInfo(content)
                            .then(info => {
                                message.reply(`Playing ${info.title}`);
                            });
                        dispatcher.on('end', () => {
                            message.member.voiceChannel.leave();
                        });
                    })
                    .catch(err => {
                        message.reply(err);
                    });
            }
        }
    }

    if ('pause' === command) {
        if (message.member.voiceChannel) {
            if (dispatcher) {
                dispatcher.pause()
            }
        }
    }

    if ('resume' === command) {
        if (message.member.voiceChannel) {
            if (dispatcher) {
                dispatcher.resume();
            }
        }
    }

    if ('volume' === command) {
        if ('' === content) {
            message.reply(`Volume ${streamOptions.volume * 100}%`);
            return ;
        }

        if (isNaN(content)) {
            message.reply('Invalid volume parameter');
            return ;
        }
        if (!isNaN(content)) {
            streamOptions.volume = content;
            message.reply(`Volume set to ${streamOptions.volume * 100}%`);
            if (dispatcher) {
                dispatcher.setVolume(streamOptions.volume);
            } 
            return ;
        }
    }
})

client.login(token); 
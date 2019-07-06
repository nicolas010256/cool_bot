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

const token = process.env.BOT_TOKEN;

let currentSong = null;
let playlist = [];

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async message => {
    const command = message.content.split(' ')[0];
    const content = message.content.replace(command, '');
    const channel = message.channel;
    const voiceChannel = message.member.voiceChannel;
    
    if ('join' === command ) {
        if (voiceChannel) {
            message.member.voiceChannel.join();
            message.reply(`Joining ${voiceChannel.name}`);
        }
    }
    
    if ('leave' === command) {
        if (voiceChannel) {
            message.member.voiceChannel.leave();
            channel.send(`Leaving ${voiceChannel.name}`)
        }
    }
    
    if ('play' === command) {
        if (ytdl.validateURL(content) && voiceChannel) {
            const connection  = await voiceChannel.join();

            if (currentSong) {
                playlist = [content, ...playlist];
            } else {
                currentSong = content;
                const info = await ytdl.getBasicInfo(currentSong);
            
                channel.send(`Playing ${info.title}`);

                const dispatcher = connection.playStream(ytdl(currentSong, ytdlOptions), streamOptions);
                dispatcher.on('end', () => {
                    channel.send(`${info.title} ended!`);
                    currentSong = playlist.pop();
                    if (currentSong !== undefined) {
                        dispatcher = connection.playStream(ytdl(currentSong, ytdlOptions), streamOptions);
                    } else {
                        voiceChannel.leave();
                    }
                });
            }
            
            return;
        }
        
        if (content === '') {
            if (currentSong) {
                const info = await ytdl.getBasicInfo(currentSong);
                channel.send(`Playing ${info.title}`);
            } else {
                channel.send('Playing nothing');
            }

            return null;
        }
    }

    if ('volume' === command) {
        
        if (content == null || content === '') {
            channel.send(`Volume at ${streamOptions.volume * 100}%`);
            return ;
        }

        if (!isNaN(content)) {
            streamOptions.volume = content;
            channel.send(`Volume set to ${streamOptions.volume * 100}%`);

            if (voiceChannel) {
                if (voiceChannel.connection) {
                    const dispatcher = voiceChannel.connection.dispatcher;
                    dispatcher.setVolume(streamOptions.volume);
                }
            }
            return ;
        }
    }

    if ('pause' === command) {
        if (voiceChannel) {
            if (voiceChannel.connection) {
                const dispatcher = voiceChannel.connection.dispatcher;
                dispatcher.pause();
            }
        }
    }

    if ('resume' === command) {
        if (voiceChannel) {
            if (voiceChannel.connection) {
                const dispatcher = voiceChannel.connection.dispatcher;
                dispatcher.pause()
            }
        }
    }
});

client.login(token); 
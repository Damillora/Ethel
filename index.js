const fs = require("fs");
// Load configuration
require('dotenv').config();

// Load mappings
let rawdata = fs.readFileSync("mapping.json");
let mappings = JSON.parse(rawdata);

const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

var musicStatus = {};

client.on('voiceStateUpdate', (oldState,newState) => {
    let oldMember = oldState.member;
    let newMember = newState.member;
    if(newMember.user.bot) return;
    let newUserChannel = newState.channel;
    let oldUserChannel = oldState.channel;

    // Avoid undefineds
    let botUserId = newMember.guild.me.id;
    let botVoiceState = newMember.guild.voiceStates.cache.get(botUserId) ? newMember.guild.voiceStates.cache.get(botUserId) : null; 
    let botUserChannel = botVoiceState ? botVoiceState.channel : null;
    let botUserChannelId = botUserChannel ? botUserChannel.id : null;

    let guildName = newMember.guild.name;
    
    if(newUserChannel !== null) {
        console.log(newMember.user.tag+": "+newUserChannel.name);

        let newUserChannelName = newUserChannel.name;
        let filename = mappings[guildName][newUserChannelName];

        // Do not leave anything when no BGM is specified
        if(filename == undefined) return;

        // Cannot join a new voice channel while connected to another channel, Discord limitation
        if(botUserChannelId !== null && newUserChannel.id !== botUserChannelId) {
            botUserChannel.leave();
        }
        if(musicStatus[guildName] === newUserChannelName) {
            return;
        }
        setTimeout( () => {
        // Loop the music
        // Use an object to detect if we have played music or not
        musicStatus[guildName] = newUserChannelName;
        newUserChannel.join().then(connection => {
            const play = () => {
                connection
                .play("./music/"+filename)
                .on('finish', play);
            };
            console.log("Playing ./music/"+filename);
            play();
        });
        }, 1000);
    }
});

client.login(process.env.DISCORD_BOT_TOKEN);

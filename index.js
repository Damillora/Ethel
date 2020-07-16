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

client.on('voiceStateUpdate', (oldState,newState) => {
    let oldMember = oldState.member;
    let newMember = newState.member;

    if(newMember.user.bot) return;
    let newUserChannel = newState.channel;
    let oldUserChannel = oldState.channel;

    // Avoid undefineds
    let botVoiceState = newMember.guild.voiceState ?? null;
    let botUserChannel = botVoiceState ? botVoiceState.channel : null;
    let botUserChannelId = botUserChannel ? botUserChannel.id : null;

    let guildName = newMember.guild.name;
    
    if(oldUserChannel === null && newUserChannel !== null) {
        console.log(newMember.user.tag+": "+newUserChannel.name);

        let newUserChannelName = newUserChannel.name;
        let filename = mappings[guildName][newUserChannelName];

        // Do not leave anything when no BGM is specified
        if(filename == undefined) return;

        // Cannot join a new voice channel while connected to another channel, Discord limitation
        if(botUserChannelId !== null && newUserChannel.id !== botUserChannelId) {
            botUserChannel.leave();
        }

        // Loop the music
        newUserChannel.join().then(connection => {
            const play = () => {
                connection
                .play("./music/"+filename)
                .on('finish', play);
            };
            console.log("Playing ./music/"+filename);
            play();
        });
    }
});

client.login(process.env.DISCORD_BOT_TOKEN);

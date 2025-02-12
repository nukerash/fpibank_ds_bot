require('dotenv').config();
const {IntentsBitField, Partials, Client} = require('discord.js'),
    config = require('./config.json'),
    fs = require("fs");
config.cfg = {
    ...config.cfg,
    intents: new IntentsBitField(config.cfg.intents),
    partials: [Partials.Channel]
};

// Replace ${DISCORD_TOKEN} with actual environment variable
const token = config.token.replace('${DISCORD_TOKEN}', process.env.DISCORD_TOKEN);
const bot = new Client(config.cfg);
bot.login(token);

require('./handlers')(bot);
require('./events')(bot);

bot.Memory = require("./Memory.json");

// Modify the mute function to accept guildId directly
bot.mute = async (guildId, userId, duration, reason, moderator) => {
    if (!guildId) {
        console.error('Guild ID is required');
        return;
    }
    await require('./events/mute')(bot, guildId, userId, duration, reason, moderator);
};

bot.setMaxListeners(500);

setInterval(() => {
    try {
        fs.writeFileSync("./Memory.json", JSON.stringify(bot.Memory, null, "\t"));
    } catch (err) {
        console.error('Error saving Memory.json:', err);
    }
}, 5000); // Сохраняем каждые 5 секунд вместо каждой секунды

fs.writeFileSync("./Memory.json", JSON.stringify(bot.Memory, null, "\t"));

bot.createGuild = (message) => {
    return {
        id: message.guild.id,
        name: message.guild.name,
        members: {},
        ticketChannelId: null,
        ticketChannels: [],
        ticketEnabled: true,
        ticketCooldownHours: 6,
        ticketCooldownMinutes: 0,
        noMessagesChannels: null,
        noMessages: true,
        tasks: {},
        taskChannelId: null,
        tasksCategoryId: null,
        mainWorkChannel: null,
        engWorkChannel: null,
        whitelistRoles: []
    }
}

bot.createTask = (message) => {
    return {
        id: message.id,
        endDate: 0,
        members: [],
        taskClaimedMember: null,
        requestMessagesIds: []
    }
}

bot.createMember = (message) => {
    return {
        id: message.member.user.id,
        name: message.member.user.globalName,
        nextRequestDate: 0,
        tonWallet: null
    }
}

const readline = require('node:readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
rl.question(``, name => {
    if(name == "reload")
        exit();
    rl.close();
});
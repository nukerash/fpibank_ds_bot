/**
 * @param {import('discord.js').Client} bot 
 * @param {import('discord.js').Message} message 
*/
module.exports = async (bot, message) => {
    if (message.author.bot || !message.guild) return;

    const guildData = bot.Memory.guilds[message.guild.id];
    if (!guildData) return;

    if (!guildData.members) {
        guildData.members = {};
    }

    if (!guildData.members[message.author.id]) {
        guildData.members[message.author.id] = {
            warns: 0
        };
    }

    const mainWorkChannel = guildData.mainWorkChannel;
    const engWorkChannel = guildData.engWorkChannel;
    const whitelistRoles = guildData.whitelistRoles || [];

    const isWorkChannel = message.channel.id === mainWorkChannel || message.channel.id === engWorkChannel;

    // Функция для отправки временных сообщений
    const sendTemp = async (content) => {
        const msg = await message.channel.send(content);
        setTimeout(() => msg.delete().catch(() => {}), 10000);
    };

    if (isWorkChannel) {
        const hasWhitelistRole = message.member.roles.cache.some(role => whitelistRoles.includes(role.id));

        const urlRegex = /https?:\/\/[^\s]+/g;
        if (urlRegex.test(message.content) && !hasWhitelistRole) {
            try {
                await message.delete();

                // Increment warns
                guildData.members[message.author.id].warns = (guildData.members[message.author.id].warns || 0) + 1;

                // Save to Memory.json
                const fs = require('fs');
                fs.writeFileSync("./Memory.json", JSON.stringify(bot.Memory, null, "\t"));

                const responseMessage = message.channel.id === engWorkChannel
                    ? `${message.author}, links are not allowed in work channels. Warning ${guildData.members[message.author.id].warns}`
                    : `${message.author}, ссылки запрещены в рабочих чатах. Предупреждение ${guildData.members[message.author.id].warns}`;

                await sendTemp({content: responseMessage});
            } catch (err) {
                console.error('Error handling link deletion:', err);
            }
        }
    }

    if(!guildData.noMessagesChannels) return;
    
    message.guild.channels.fetch(guildData.noMessagesChannels).then(channel => {
        if(message.channel == channel && guildData.noMessages)
            message.delete().catch(err => null);
    }).catch(err => null);
};
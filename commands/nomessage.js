const { PermissionsBitField } = require("discord.js");

module.exports = async (bot,message,args,argsF) => {
    if(!message.member.permissions.has(PermissionsBitField.Flags.Administrator))
        return message.reply({
            ephemeral: true,
            content: `\`У вас нет прав на выполнение данной команды.\``
        });
    bot.Memory.guilds[message.guild.id].noMessagesChannels = args.channel;
    message.reply({
        ephemeral: true,
        content: `\`Теперь в канал:\` <#${args.channel}> \`нельзя отправлять сообщения.\``
    });
};
module.exports.names = ["nomessage"];
module.exports.interaction = {
    name: 'nomessage',  
    description: 'Канал без сообщений',
    defaultPermission: true,
    options: [
        {
            name: "channel",
            description: "Канал",
            type: 7,
            required: true
        }
    ]
};
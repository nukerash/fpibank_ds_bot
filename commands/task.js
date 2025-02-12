const { ActionRowBuilder } = require("@discordjs/builders");
const { ButtonBuilder } = require("@discordjs/builders");
const { EmbedBuilder, AttachmentBuilder, ButtonStyle, PermissionsBitField } = require("discord.js");
const ms = require("ms");

module.exports = async (bot,message,args,argsF) => {
    if(!message.member.permissions.has(PermissionsBitField.Flags.Administrator))
        return message.reply({
            ephemeral: true,
            content: `\`У вас нет прав на выполнение данной команды.\``
        });
    const embed = new EmbedBuilder()
        .setAuthor({name: message.member.user.globalName, iconURL: message.member.user.avatarURL()})
        .setColor(0x2b2d31)
        .setDescription(args.mission)
        .setFields([
            {
                name: "Награда:",
                value: `${args.reward} ФПИ Банок`,
                inline: true
            },
        ])
        .setThumbnail(message.member.user.avatarURL())
        .setTimestamp(new Date());
    const attachment = args.attachment ? new AttachmentBuilder(message.options.getAttachment("attachment").attachment) : null;
    const claimButton = new ButtonBuilder()
        .setCustomId("claim-mission")
        .setLabel("Подать заявку.")
        .setStyle(ButtonStyle.Success);
    const deleteButton = new ButtonBuilder()
        .setCustomId("task-delete")
        .setLabel("Удалить пост.")
        .setStyle(ButtonStyle.Danger);
    const row = new ActionRowBuilder()
        .addComponents(claimButton, deleteButton);
    message.channel.send({
        embeds: [embed],
        files: args.attachment ? [attachment] : null,
        components: [row],
        content: `||${ms(args.time)}||`
    }).then(msg => {
        bot.Memory.guilds[message.guild.id].tasks[msg.id] = bot.createTask(msg);
    }).catch(err => console.error(err));
    message.reply({
        ephemeral: true,
        content: `\`Задание создано.\``
    });
};
module.exports.names = ["task"];
module.exports.interaction = {
    name: 'task',
    description: 'Создание поста с заданием',
    defaultPermission: true,
    options: [
        {
            name: "mission",
            description: "Задание",
            type: 3,
            required: true
        },
        {
            name: "reward",
            description: "Награда за выполнение задания(в фпи банках)",
            type: 10,
            required: true
        },
        {
            name: "time",
            description: "Время на выполнение задания(e.g 1m - 1 минута, 1h - 1 час, 1d - 1 день).",
            type: 3,
            required: true
        },
        {
            name: "attachment",
            description: "(Необзательно) Вложение(файл) если нужно",
            type: 11,
            required: false
        }
    ]
};
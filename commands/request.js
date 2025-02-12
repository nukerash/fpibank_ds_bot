const { PermissionsBitField, AttachmentBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ActionRow } = require("discord.js");

module.exports = async (bot,message,args,argsF) => {
    if(bot.Memory.guilds[message.guild.id].ticketEnabled == false)
        return message.reply({
            ephemeral: true,
            content: "\`Тикеты отключены.\`"
        });
    // if(Date.now() <= bot.Memory.guilds[message.guild.id].members[message.member.id].nextRequestDate)
    //     return message.reply({
    //         ephemeral: true,
    //         content: `У вас кд на заявки! Вы сможете отправить заявку <t:${Math.floor(bot.Memory.guilds[message.guild.id].members[message.member.id].nextRequestDate / 1000)}:R>`
    //     });
    if(bot.Memory.guilds[message.guild.id].ticketChannelId == null)
        return message.reply({
            ephemeral: true,
            content: "\`Похоже что канал для заявок не установлен. Попробуйте позже.\`"
        });
    message.guild.channels.fetch(bot.Memory.guilds[message.guild.id].ticketChannelId).then(channel => {
        var attach = null;
        var attach2 = null;
        var attach3 = null;
        const attachment = message.options.getAttachment("attachment");
        if(attachment) attach = new AttachmentBuilder(attachment.attachment);
        const attachment2 = message.options.getAttachment("attachment2");
        if(attachment2) attach2 = new AttachmentBuilder(attachment2.attachment);
        const attachment3 = message.options.getAttachment("attachment3");
        if(attachment3) attach3 = new AttachmentBuilder(attachment3.attachment);

        const embed = new EmbedBuilder()
            .setAuthor({name: message.member.user.globalName, iconURL: message.member.user.avatarURL()})
            .setColor(0x2b2d31)
            .setDescription(`${args.vacancy ? `${args.message}\n\n\`Вакансия:\` ${args.vacancy}\nОтправил: <@${message.member.user.id}>` : `${args.message}\nОтправил: <@${message.member.user.id}>`}`)
            .setTimestamp(new Date())
            .setThumbnail(message.member.user.avatarURL());

        const row = new ActionRowBuilder();

        const cancel = new ButtonBuilder()
            .setCustomId("request-cancel")
            .setLabel("Отклонить!")
            .setStyle(ButtonStyle.Danger);

        const Files = [];
        if(attach)
            Files.push(attach);
        if(attach2)
            Files.push(attach2);
        if(attach3)
            Files.push(attach3);
        row.addComponents(cancel);
        bot.Memory.guilds[message.guild.id].ticketChannels.forEach(channell => {
            message.guild.channels.fetch(channell).then(channelll => {
                const button = new ButtonBuilder()
                    .setCustomId(`${channelll.id}`)
                    .setLabel(`${channelll.name}`)
                    .setStyle(ButtonStyle.Success);
                row.addComponents(button);
            }).catch(err => console.error(err));
        });
        channel.send({
            embeds: [embed],
            components: [row],
        }).then(msg => {
            setTimeout(() => {
                msg.edit({
                    embeds: [embed],
                    files: Files,
                    components: [row],
                    content: `||${msg.id}||`
                });
            }, 1000);
        }).catch(err => console.error(err));
        bot.Memory.guilds[message.guild.id].members[message.member.id].nextRequestDate = Date.now() + 600000;
        message.reply({
            ephemeral: true,
            content: `\`Ваша заявка была успешно отправлена!\``
        }).catch(err => null);
    }).catch(err =>{
        console.log("ошибка :(");
        console.error(err);
        return message.reply({
            ephemeral: true,
            content: `\`Скорее всего канал был удалён! Попробуйте позже.\``
        });
    }).catch(err => console.error(err));
};
module.exports.names = ["request"];
module.exports.interaction = {
    name: 'request',
    description: 'Создание поста для заявок',
    defaultPermission: true,
    options: [
        {
            name: "create",
            description: "Отправить заявку",
            type: 1,
            options: [
                {
                    name: "message",
                    description: "Сообщение под свой пост",
                    type: 3,
                    required: true
                },
                {
                    name: "attachment",
                    description: "Файл вашей работы",
                    type: 11,
                    required: false
                },
                {
                    name: "attachment2",
                    description: "2 Файл вашей работы",
                    type: 11,
                    required: false
                },
                {
                    name: "attachment3",
                    description: "3 Файл вашей работы",
                    type: 11,
                    required: false
                },
                {
                    name: "vacancy",
                    description: "(Необязательно) Если вы подаёте заявку как вакансию, то вам нужно выбрать свою специальность.",
                    type: 3,
                    required: false,
                }
            ]
        }
    ]
};
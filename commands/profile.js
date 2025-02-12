const { ActionRowBuilder } = require("@discordjs/builders");
const { ButtonBuilder } = require("@discordjs/builders");
const { EmbedBuilder, GuildMember, ButtonStyle } = require("discord.js");

module.exports = async (bot,message,args,argsF) => {
    let member = null;

    const changeTonButton = new ButtonBuilder()
        .setCustomId("profile-change-ton")
        .setLabel("Изменить TON кошелёк.")
        .setStyle(ButtonStyle.Primary);
    const changeDescriptionButton = new ButtonBuilder()
        .setCustomId("profile-change-description")
        .setLabel("Изменить о себе.")
        .setStyle(ButtonStyle.Primary);
    const row = new ActionRowBuilder()
        .addComponents(changeTonButton, changeDescriptionButton);

    if(!args.member) {
        member = message.member;
        const memMember = bot.Memory.guilds[message.guild.id].members[member.id];
        if(!memMember) bot.Memory.guilds[message.guild.id].members[member.id] = bot.createMember(message);
        const ton = bot.Memory.guilds[message.guild.id].members[member.id].tonWallet;
        const description = bot.Memory.guilds[message.guild.id].members[member.id].description;
        const embed = new EmbedBuilder().setAuthor({name: member.user.globalName, iconURL: member.user.avatarURL()})
            .setColor(0x2b2d31)
            .setTimestamp(new Date())
            .setFields([
                {name: "TON Кошелёк:", value: ton == null ? "Пусто" : ton}
            ])
            .setDescription(`О себе: ${description ? description : "Пусто"}`)
            .setTitle(`Профиль ${member.user.globalName}`);
        message.reply({
            ephemeral: true,
            embeds: [embed],
            components: [row]
        });
    }
    else {
        message.guild.members.fetch(args.member).then(m => {
            member = m;
            const memMember = bot.Memory.guilds[message.guild.id].members[member.id];
            if(!memMember) bot.Memory.guilds[message.guild.id].members[member.id] = bot.createMember(message);
            const ton = bot.Memory.guilds[message.guild.id].members[member.id].tonWallet;
            const description = bot.Memory.guilds[message.guild.id].members[member.id].description;
            const embed = new EmbedBuilder().setAuthor({name: member.user.globalName, iconURL: member.user.avatarURL()})
                .setColor(0x2b2d31)
                .setTimestamp(new Date())
                .setFields([
                    {name: "TON Кошелёк:", value: ton == null ? "Пусто" : ton}
                ])
                .setDescription(`О себе: ${description ? description : "Пусто"}`)
                .setTitle(`Профиль ${member.user.globalName}`);
            message.reply({
                ephemeral: true,
                embeds: [embed]
            });
        });
    }
};
module.exports.names = ["profile"];
module.exports.interaction = {
    name: 'profile',
    description: 'Команда профиля',
    defaultPermission: true,
    options: [
        {
            name: "member",
            description: "Дискорд пользователь чей профиль вам интересен.",
            type: 6,
            required: false
        }
    ]
};
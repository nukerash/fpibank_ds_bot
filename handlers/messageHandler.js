const Discord = require('discord.js');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');

module.exports = (bot) => {
    bot.commands = new Discord.Collection();
    bot.commands.any = [];

    const commandFiles = fs.readdirSync('./commands');

    for (const file of commandFiles) {
        console.log(file);
        const command = require(`../commands/${file}`);
        for (const name of command.names) bot.commands.set(name, command);
        bot.commands.any.push(command);
    }

    bot.on('messageCreate', async (message) => {
        if (message.author.bot || !message.guild) return;

        const guildData = bot.Memory.guilds[message.guild.id];
        if (!guildData) return;

        // Обработка команды !recreate
        const prefix = '!';
        if (!message.content.startsWith(prefix)) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        if (command === 'recreate') {
            if (!message.reference) return message.reply('Вы должны ответить на сообщение с заявкой.');

            const repliedMessage = await message.channel.messages.fetch(message.reference.messageId);
            if (!repliedMessage) return message.reply('Не удалось найти сообщение с заявкой.');

            if (repliedMessage.embeds.length === 0) return message.reply('Это сообщение не содержит заявки.');

            const originalEmbed = repliedMessage.embeds[0];

            // Создаем новый Embed на основе оригинального
            const newEmbed = new EmbedBuilder()
                .setAuthor(originalEmbed.author)
                .setColor(originalEmbed.color)
                .setDescription(originalEmbed.description)
                .setTimestamp(originalEmbed.timestamp ? new Date(originalEmbed.timestamp) : null)
                .setThumbnail(originalEmbed.thumbnail?.url);

            // Создаем ActionRowBuilder с кнопками
            const row = new ActionRowBuilder();

            // Кнопка "Отклонить"
            const cancelButton = new ButtonBuilder()
                .setCustomId("request-cancel")
                .setLabel("Отклонить!")
                .setStyle(ButtonStyle.Danger);

            row.addComponents(cancelButton);

            // Добавляем кнопки для выбора канала (аналогично request.js)
            if (guildData.ticketChannels && guildData.ticketChannels.length > 0) {
                guildData.ticketChannels.forEach(channelId => {
                    message.guild.channels.fetch(channelId).then(channel => {
                        const channelButton = new ButtonBuilder()
                            .setCustomId(channel.id) // Используем ID канала как customId
                            .setLabel(channel.name)   // Название канала как текст кнопки
                            .setStyle(ButtonStyle.Success); // Стиль кнопки

                        row.addComponents(channelButton);
                    }).catch(err => {
                        console.error(`Ошибка при получении канала ${channelId}:`, err);
                    });
                });
            }

            // Отправляем новое сообщение с Embed и кнопками
            message.channel.send({
                embeds: [newEmbed],
                components: [row], // Передаем ActionRowBuilder с кнопками
            }).then(() => {
                message.reply('Заявка успешно пересоздана.');
            }).catch(err => {
                console.error('Ошибка при отправке сообщения с кнопками:', err);
                message.reply('Произошла ошибка при пересоздании заявки.');
            });
        }
    });
};
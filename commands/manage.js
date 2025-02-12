const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionsBitField, ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder } = require("discord.js");

module.exports = async (bot, message, args, argsF) => {
    try {
        // Проверка на ID пользователя или права администратора
        const allowedUserId = "797587223217831986"; // ID пользователя, которому разрешено использовать команду
        if (message.member.id !== allowedUserId && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply({
                ephemeral: true,
                content: `\`У вас нет прав на выполнение данной команды.\``
            });
        }

        // Получаем данные из памяти
        const guildData = bot.Memory.guilds[message.guild.id];

        // Проверяем и заменяем пустые значения
        const ticketChannelId = guildData.ticketChannelId || "Не указан";
        const ticketChannels = guildData.ticketChannels || [];
        const taskChannelId = guildData.taskChannelId || "Не указан";
        const noMessagesChannels = guildData.noMessagesChannels || "Не указан";
        const tasksCategoryId = guildData.tasksCategoryId || "Не указан";
        const mainWorkChannel = guildData.mainWorkChannel || "Не указан";
        const engWorkChannel = guildData.engWorkChannel || "Не указан";
        const whitelistRoles = guildData.whitelistRoles || [];
        const moderRoles = guildData.moderRoles || [];

        // Форматируем список каналов и ролей
        const formattedTicketChannels = ticketChannels.length > 0
            ? ticketChannels.map(channelId => `<#${channelId}>`).join(", ")
            : "Пусто.";

        const formattedWhitelistRoles = whitelistRoles.length > 0
            ? whitelistRoles.map(roleId => `<@&${roleId}>`).join(", ")
            : "Не указаны";

        const formattedModerRoles = moderRoles.length > 0
            ? moderRoles.map(roleId => `<@&${roleId}>`).join(", ")
            : "Не указаны";

        // Создание Embed
        const embed = new EmbedBuilder()
            .setAuthor({ name: "Настройки сервера", iconURL: bot.user.avatarURL() })
            .setColor(0x2b2d31)
            .setFields([
                {
                    name: "Заявки(тикеты):",
                    value: `\`${guildData.ticketEnabled ? "Вкл." : "Выкл."}\`\n\`Канал заявок:\` <#${ticketChannelId}>`,
                    inline: true
                },
                {
                    name: "Каналы с одобренными заявками:",
                    value: formattedTicketChannels,
                    inline: true
                },
                {
                    name: "Канал с заявками на задания:",
                    value: `<#${taskChannelId}>`,
                    inline: true
                },
                {
                    name: "Удаление сообщений(nomessage):",
                    value: `<#${noMessagesChannels}>`,
                    inline: true
                },
                {
                    name: "Категория с каналами заданий:",
                    value: `<#${tasksCategoryId}>`,
                    inline: true
                },
                {
                    name: "Основной рабочий чат:",
                    value: `<#${mainWorkChannel}>`,
                    inline: true
                },
                {
                    name: "Английский рабочий чат:",
                    value: `<#${engWorkChannel}>`,
                    inline: true
                },
                {
                    name: "Вайтлист роли:",
                    value: formattedWhitelistRoles,
                    inline: true
                },
                {
                    name: "Модераторские роли:",
                    value: formattedModerRoles,
                    inline: true
                },
                {
                    name: "Макс. количество варнов:",
                    value: `\`${guildData.maxWarns}\``,
                    inline: true
                },
                {
                    name: "Длительность наказания:",
                    value: `\`${guildData.punishmentDuration}\``,
                    inline: true
                },
                {
                    name: "Роль для мута:",
                    value: `<@&${guildData.muteRoleId}>`,
                    inline: true
                }
            ]);

        // Создание кнопок
        const requestsButton = new ButtonBuilder()
            .setCustomId("request-settings")
            .setLabel("Вкл./выкл. заявки.")
            .setStyle(ButtonStyle.Success);

        const requestsChannelButton = new ButtonBuilder()
            .setCustomId("request-channel")
            .setLabel("Установить канал для заявок.")
            .setStyle(ButtonStyle.Secondary);

        const closeButton = new ButtonBuilder()
            .setCustomId("close-settings")
            .setLabel("Закрыть.")
            .setStyle(ButtonStyle.Danger);

        const acceptedRequestsButton = new ButtonBuilder()
            .setCustomId("accepted-requests-add")
            .setLabel("Добавить канал для одобренных заявок.")
            .setStyle(ButtonStyle.Danger);

        const acceptedRequestsClearButton = new ButtonBuilder()
            .setCustomId("accepted-requests-clear")
            .setLabel("Очистить каналы с одобренными заявками.")
            .setStyle(ButtonStyle.Danger);

        const updateButton = new ButtonBuilder()
            .setCustomId("update-button")
            .setLabel("Обновить сообщение.")
            .setStyle(ButtonStyle.Primary);

        const tasksChannel = new ButtonBuilder()
            .setCustomId("set-tasks-channel")
            .setLabel("Установить канал для заявок заданий.")
            .setStyle(ButtonStyle.Secondary);

        const tasksCategory = new ButtonBuilder()
            .setCustomId("set-tasks-category")
            .setLabel("Установить категорию с чатами заданий.")
            .setStyle(ButtonStyle.Secondary);

        const mainWorkChannelButton = new ButtonBuilder()
            .setCustomId("set-main-work-channel")
            .setLabel("Установить основной рабочий чат.")
            .setStyle(ButtonStyle.Secondary);

        const engWorkChannelButton = new ButtonBuilder()
            .setCustomId("set-eng-work-channel")
            .setLabel("Установить английский рабочий чат.")
            .setStyle(ButtonStyle.Secondary);

        const whitelistRoleButton = new ButtonBuilder()
            .setCustomId("set-whitelist-role")
            .setLabel("Добавить вайтлист роль.")
            .setStyle(ButtonStyle.Secondary);

        const removeWhitelistRoleButton = new ButtonBuilder()
            .setCustomId("remove-whitelist-role")
            .setLabel("Удалить вайтлист роль.")
            .setStyle(ButtonStyle.Danger);

        const addModerRoleButton = new ButtonBuilder()
            .setCustomId("add-moder-role")
            .setLabel("Добавить модер-роль")
            .setStyle(ButtonStyle.Secondary);

        const removeModerRoleButton = new ButtonBuilder()
            .setCustomId("remove-moder-role")
            .setLabel("Удалить модер-роль")
            .setStyle(ButtonStyle.Danger);

        const setMaxWarnsButton = new ButtonBuilder()
            .setCustomId("set-max-warns")
            .setLabel("Установить макс. количество варнов")
            .setStyle(ButtonStyle.Secondary);

        const setPunishmentDurationButton = new ButtonBuilder()
            .setCustomId("set-punishment-duration")
            .setLabel("Установить длительность наказания")
            .setStyle(ButtonStyle.Secondary);

        const setMuteRoleButton = new ButtonBuilder()
            .setCustomId("set-mute-role")
            .setLabel("Установить роль для мута")
            .setStyle(ButtonStyle.Secondary);

        // Создание строк с кнопками
        const row = new ActionRowBuilder().addComponents(
            requestsButton,
            requestsChannelButton,
            acceptedRequestsButton,
            acceptedRequestsClearButton,
            closeButton
        );

        const row2 = new ActionRowBuilder().addComponents(
            updateButton,
            tasksChannel,
            tasksCategory,
            mainWorkChannelButton,
            engWorkChannelButton
        );

        const row3 = new ActionRowBuilder().addComponents(
            addModerRoleButton,
            removeModerRoleButton
        );

        const row4 = new ActionRowBuilder().addComponents(
            whitelistRoleButton,
            removeWhitelistRoleButton
        );

        const row5 = new ActionRowBuilder().addComponents(
            setMaxWarnsButton,
            setPunishmentDurationButton,
            setMuteRoleButton
        );

        // Отправка сообщения с Embed и кнопками (только вызывающему пользователю)
        await message.reply({
            embeds: [embed],
            components: [row, row2, row3, row4, row5],
            ephemeral: true // Сообщение будет видно только вызывающему пользователю
        });

        // Создание модальных окон для ввода значений
        const maxWarnsModal = new ModalBuilder()
            .setCustomId('max-warns-modal')
            .setTitle('Установить макс. количество варнов')
            .addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('max-warns-input')
                        .setLabel('Макс. количество варнов')
                        .setStyle(TextInputStyle.Short)
                        .setPlaceholder('Введите число')
                        .setRequired(true)
                )
            );

        const punishmentDurationModal = new ModalBuilder()
            .setCustomId('punishment-duration-modal')
            .setTitle('Установить длительность наказания')
            .addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('punishment-duration-input')
                        .setLabel('Длительность наказания')
                        .setStyle(TextInputStyle.Short)
                        .setPlaceholder('Введите длительность (например, 20s)')
                        .setRequired(true)
                )
            );

        const muteRoleModal = new ModalBuilder()
            .setCustomId('mute-role-modal')
            .setTitle('Установить роль для мута')
            .addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('mute-role-input')
                        .setLabel('ID роли для мута')
                        .setStyle(TextInputStyle.Short)
                        .setPlaceholder('Введите ID роли')
                        .setRequired(true)
                )
            );

        const addModerRoleModal = new ModalBuilder()
            .setCustomId('add-moder-role-modal')
            .setTitle('Добавить модер-роль')
            .addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('moder-role-input')
                        .setLabel('ID роли для модерации')
                        .setStyle(TextInputStyle.Short)
                        .setPlaceholder('Введите ID роли')
                        .setRequired(true)
                )
            );

        const removeModerRoleModal = new ModalBuilder()
            .setCustomId('remove-moder-role-modal')
            .setTitle('Удалить модер-роль')
            .addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('moder-role-input')
                        .setLabel('ID роли для модерации')
                        .setStyle(TextInputStyle.Short)
                        .setPlaceholder('Введите ID роли')
                        .setRequired(true)
                )
            );

        // Обработчики взаимодействий
        bot.on('interactionCreate', async interaction => {
            const guildData = bot.Memory.guilds[interaction.guild.id];
            if (!guildData.moderRoles) guildData.moderRoles = [];

            if (interaction.isModalSubmit()) {
                if (interaction.replied || interaction.deferred) return;

                if (interaction.customId === 'max-warns-modal') {
                    const maxWarns = interaction.fields.getTextInputValue('max-warns-input');
                    guildData.maxWarns = parseInt(maxWarns, 10);
                    await interaction.reply({ content: `Макс. количество варнов установлено на ${maxWarns}`, ephemeral: true });
                }

                if (interaction.customId === 'punishment-duration-modal') {
                    const duration = interaction.fields.getTextInputValue('punishment-duration-input');
                    guildData.punishmentDuration = duration;
                    await interaction.reply({ content: `Длительность наказания установлена на ${duration}`, ephemeral: true });
                }

                if (interaction.customId === 'mute-role-modal') {
                    const roleId = interaction.fields.getTextInputValue('mute-role-input');
                    guildData.muteRoleId = roleId;
                    await interaction.reply({ content: `Роль для мута установлена на <@&${roleId}>`, ephemeral: true });
                }

                if (interaction.customId === 'add-moder-role-modal') {
                    const roleId = interaction.fields.getTextInputValue('moder-role-input');
                    if (!guildData.moderRoles.includes(roleId)) {
                        guildData.moderRoles.push(roleId);
                        await interaction.reply({ content: `Модераторская роль <@&${roleId}> добавлена.`, ephemeral: true });
                    } else {
                        await interaction.reply({ content: `Эта роль уже является модераторской.`, ephemeral: true });
                    }
                }

                if (interaction.customId === 'remove-moder-role-modal') {
                    const roleId = interaction.fields.getTextInputValue('moder-role-input');
                    const index = guildData.moderRoles.indexOf(roleId);
                    if (index > -1) {
                        guildData.moderRoles.splice(index, 1);
                        await interaction.reply({ content: `Модераторская роль <@&${roleId}> удалена.`, ephemeral: true });
                    } else {
                        await interaction.reply({ content: `Эта роль не является модераторской.`, ephemeral: true });
                    }
                }
            }

            if (interaction.isButton()) {
                if (interaction.replied || interaction.deferred) return;

                if (interaction.customId === 'set-max-warns') {
                    await interaction.showModal(maxWarnsModal);
                }

                if (interaction.customId === 'set-punishment-duration') {
                    await interaction.showModal(punishmentDurationModal);
                }

                if (interaction.customId === 'set-mute-role') {
                    await interaction.showModal(muteRoleModal);
                }

                if (interaction.customId === 'add-moder-role') {
                    await interaction.showModal(addModerRoleModal);
                }

                if (interaction.customId === 'remove-moder-role') {
                    const options = guildData.moderRoles.map(roleId => ({
                        label: interaction.guild.roles.cache.get(roleId)?.name || 'Unknown Role',
                        value: roleId
                    }));

                    const selectMenu = new StringSelectMenuBuilder()
                        .setCustomId('select-moder-role')
                        .setPlaceholder('Выберите роль для удаления')
                        .addOptions(options);

                    const row = new ActionRowBuilder().addComponents(selectMenu);

                    await interaction.reply({
                        content: 'Выберите роль для удаления:',
                        components: [row],
                        ephemeral: true
                    });
                }
            }

            if (interaction.isStringSelectMenu()) {
                if (interaction.replied || interaction.deferred) return;

                if (interaction.customId === 'select-moder-role') {
                    const selectedRoleId = interaction.values[0];
                    const index = guildData.moderRoles.indexOf(selectedRoleId);

                    if (index > -1) {
                        guildData.moderRoles.splice(index, 1);
                        await interaction.update({ content: `Модераторская роль <@&${selectedRoleId}> удалена.`, components: [], ephemeral: true });
                    } else {
                        await interaction.update({ content: `Эта роль не является модераторской.`, components: [], ephemeral: true });
                    }
                }
            }
        });

    } catch (error) {
        console.error("Error in manage command:", error);
        message.reply({
            ephemeral: true,
            content: "Произошла ошибка при выполнении команды. Пожалуйста, попробуйте позже."
        });
    }
};

module.exports.names = ["manage"];
module.exports.interaction = {
    name: 'manage',
    description: 'Управление ботом на сервере',
    defaultPermission: true,
    options: [] // explicitly set empty options to ensure no subcommands
};
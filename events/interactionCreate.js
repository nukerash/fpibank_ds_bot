const { ActionRowBuilder } = require("@discordjs/builders");
const { ButtonBuilder } = require("@discordjs/builders");
const {
  EmbedBuilder,
  ButtonStyle,
  GuildChannel,
  ChannelType,
  ModalBuilder,
  TextInputStyle,
  TextInputBuilder,
  PermissionFlagsBits,
  PermissionsBitField,
  AttachmentBuilder,
  ActionRow,
  CategoryChannel,
} = require("discord.js");

/**
 * @param {import('discord.js').Client} bot
 * @param {import('discord.js').BaseInteraction} interaction
 * @param {import('discord.js').GuildChannelManager} channels
 */
module.exports = async (bot, interaction) => {
  if (interaction.isButton()) {
    const allowedUserId = "797587223217831986";

    if (interaction.customId === "set-main-work-channel") {
      if (
        interaction.member.id !== allowedUserId &&
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.Administrator
        )
      ) {
        return interaction.reply({
          ephemeral: true,
          content: `\`У вас нет прав на выполнение данной команды.\``,
        });
      }

      const id = new TextInputBuilder()
        .setCustomId("main-work-channel-id")
        .setLabel("Айди основного рабочего чата")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("Айди канала");

      const row = new ActionRowBuilder().addComponents(id);
      const modal = new ModalBuilder()
        .addComponents(row)
        .setCustomId("main-work-channel-modal")
        .setTitle("Айди основного рабочего чата");

      await interaction.showModal(modal);
    }

    if (interaction.customId === "set-eng-work-channel") {
      if (
        interaction.member.id !== allowedUserId &&
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.Administrator
        )
      ) {
        return interaction.reply({
          ephemeral: true,
          content: `\`У вас нет прав на выполнение данной команды.\``,
        });
      }

      const id = new TextInputBuilder()
        .setCustomId("eng-work-channel-id")
        .setLabel("Айди английского рабочего чата")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("Айди канала");

      const row = new ActionRowBuilder().addComponents(id);
      const modal = new ModalBuilder()
        .addComponents(row)
        .setCustomId("eng-work-channel-modal")
        .setTitle("Айди английского рабочего чата");

      await interaction.showModal(modal);
    }

    if (interaction.customId === "set-whitelist-role") {
      if (
        interaction.member.id !== allowedUserId &&
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.Administrator
        )
      ) {
        return interaction.reply({
          ephemeral: true,
          content: `\`У вас нет прав на выполнение данной команды.\``,
        });
      }

      const id = new TextInputBuilder()
        .setCustomId("whitelist-role-id")
        .setLabel("Айди вайтлист роли")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("Айди роли");

      const row = new ActionRowBuilder().addComponents(id);
      const modal = new ModalBuilder()
        .addComponents(row)
        .setCustomId("whitelist-role-modal")
        .setTitle("Айди вайтлист роли");

      await interaction.showModal(modal);
    }
    if (interaction.customId == "request-cancel") {
      if (
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.Administrator
        )
      )
        return interaction.reply({
          ephemeral: true,
          content: `\`У вас нет прав на выполнение данной команды.\``,
        });
      interaction.message.delete().catch((err) => null);
    }
    if (interaction.customId == "close-settings") {
      if (
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.Administrator
        )
      )
        return interaction.reply({
          ephemeral: true,
          content: `\`У вас нет прав на выполнение данной команды.\``,
        });
      interaction.message.delete().catch((err) => console.error(err));
    }
    if (interaction.customId == "task-delete") {
      if (
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.Administrator
        )
      )
        return interaction.reply({
          ephemeral: true,
          content: `\`У вас нет прав на выполнение данной команды.\``,
        });
      if (
        bot.Memory.guilds[interaction.guild.id].tasks[interaction.message.id]
          .requestMessagesIds.length
      ) {
        for (var msg of bot.Memory.guilds[interaction.guild.id].tasks[
          interaction.message.id
        ].requestMessagesIds) {
          interaction.guild.channels
            .fetch(bot.Memory.guilds[interaction.guild.id].taskChannelId)
            .then((chnl) => {
              chnl.messages
                .fetch(msg)
                .then((mesage) => {
                  mesage.delete().catch((err) => null);
                })
                .catch((err) => null);
            });
        }
      }
      delete bot.Memory.guilds[interaction.guild.id].tasks[
        interaction.message.id
      ];
      interaction
        .reply({
          ephemeral: true,
          content: "`Успешно.`",
        })
        .catch((err) => null);
      interaction.message.delete().catch((err) => null);
    }
    if (interaction.customId == "request-settings") {
      if (
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.Administrator
        )
      )
        return interaction.reply({
          ephemeral: true,
          content: `\`У вас нет прав на выполнение данной команды.\``,
        });
      bot.Memory.guilds[interaction.guild.id].ticketEnabled =
        !bot.Memory.guilds[interaction.guild.id].ticketEnabled;
      const embed = new EmbedBuilder()
        .setAuthor({ name: "Настройки сервера", iconURL: bot.user.avatarURL() })
        .setColor(0x2b2d31)
        .setFields([
          {
            name: "Заявки(тикеты):",
            value: `\`${
              bot.Memory.guilds[interaction.guild.id].ticketEnabled
                ? "Вкл."
                : "Выкл."
            }\`\n\`Канал заявок:\` <#${
              bot.Memory.guilds[interaction.guild.id].ticketChannelId
            }>`,
            inline: true,
          },
          {
            name: "Каналы с одобренными заявками:",
            value: `${
              bot.Memory.guilds[interaction.guild.id].ticketChannels.length == 1
                ? `<#${
                    bot.Memory.guilds[interaction.guild.id].ticketChannels[0]
                  }>`
                : bot.Memory.guilds[interaction.guild.id].ticketChannels
                    .length > 1
                ? `<#${bot.Memory.guilds[
                    interaction.guild.id
                  ].ticketChannels.join("> <#")}>`
                : "Пусто."
            }`,
            inline: true,
          },
          {
            name: "Канал с заявками на задания:",
            value: `<#${
              bot.Memory.guilds[interaction.guild.id].taskChannelId
            }>`,
            inline: true,
          },
          {
            name: "Удаление сообщений(nomessage):",
            value: `<#${
              bot.Memory.guilds[interaction.guild.id].noMessagesChannels
            }>`,
            inline: true,
          },
          {
            name: "Категория с каналами заданий:",
            value: `<#${
              bot.Memory.guilds[interaction.guild.id].tasksCategoryId
            }>`,
            inline: true,
          },
        ]);
      const row = new ActionRowBuilder();
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
      row.addComponents(
        requestsButton,
        requestsChannelButton,
        acceptedRequestsButton,
        acceptedRequestsClearButton,
        closeButton
      );
      const row2 = new ActionRowBuilder();
      row2.addComponents(updateButton, tasksChannel, tasksCategory);
      interaction.message
        .edit({
          embeds: [embed],
          components: [row, row2],
        })
        .catch((err) => console.error(err));
      interaction.reply({
        ephemeral: true,
        content: `Заявки \`${
          bot.Memory.guilds[interaction.guild.id].ticketEnabled
            ? "включены"
            : "отключены"
        }\``,
      });
    }
    if (interaction.customId == "request-channel") {
      if (
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.Administrator
        )
      )
        return interaction.reply({
          ephemeral: true,
          content: `\`У вас нет прав на выполнение данной команды.\``,
        });
      const id = new TextInputBuilder()
        .setCustomId("request-channel-id")
        .setLabel("Айди канала")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("Айди канала");
      const row = new ActionRowBuilder().addComponents(id);
      const modal = new ModalBuilder()
        .addComponents(row)
        .setCustomId("request-channel-modal")
        .setTitle("Айди канала");
      await interaction.showModal(modal);
    }
    if (interaction.customId == "accepted-requests-add") {
      if (
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.Administrator
        )
      )
        return interaction.reply({
          ephemeral: true,
          content: `\`У вас нет прав на выполнение данной команды.\``,
        });
      const id = new TextInputBuilder()
        .setCustomId("accepted-channel-id")
        .setLabel("Айди канала")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("Айди канала");
      const row = new ActionRowBuilder().addComponents(id);
      const modal = new ModalBuilder()
        .addComponents(row)
        .setCustomId("accepted-channel-modal")
        .setTitle("Айди канала");
      await interaction.showModal(modal);
    }
    if (interaction.customId == "accepted-requests-clear") {
      if (
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.Administrator
        )
      )
        return interaction.reply({
          ephemeral: true,
          content: `\`У вас нет прав на выполнение данной команды.\``,
        });
      bot.Memory.guilds[interaction.guild.id].ticketChannels = [];
      interaction.reply({
        ephemeral: true,
        content: `\`Список каналов с одобренными заявками очищен.\``,
      });
    }
    if (interaction.customId == "update-button") {
      const embed = new EmbedBuilder()
        .setAuthor({ name: "Настройки сервера", iconURL: bot.user.avatarURL() })
        .setColor(0x2b2d31)
        .setFields([
          {
            name: "Заявки(тикеты):",
            value: `\`${
              bot.Memory.guilds[interaction.guild.id].ticketEnabled
                ? "Вкл."
                : "Выкл."
            }\`\n\`Канал заявок:\` <#${
              bot.Memory.guilds[interaction.guild.id].ticketChannelId
            }>`,
            inline: true,
          },
          {
            name: "Каналы с одобренными заявками:",
            value: `${
              bot.Memory.guilds[interaction.guild.id].ticketChannels.length == 1
                ? `<#${
                    bot.Memory.guilds[interaction.guild.id].ticketChannels[0]
                  }>`
                : bot.Memory.guilds[interaction.guild.id].ticketChannels
                    .length > 1
                ? `<#${bot.Memory.guilds[
                    interaction.guild.id
                  ].ticketChannels.join("> <#")}>`
                : "Пусто."
            }`,
            inline: true,
          },
          {
            name: "Канал с заявками на задания:",
            value: `<#${
              bot.Memory.guilds[interaction.guild.id].taskChannelId
            }>`,
            inline: true,
          },
          {
            name: "Удаление сообщений(nomessage):",
            value: `<#${
              bot.Memory.guilds[interaction.guild.id].noMessagesChannels
            }>`,
            inline: true,
          },
          {
            name: "Категория с каналами заданий:",
            value: `<#${
              bot.Memory.guilds[interaction.guild.id].tasksCategoryId
            }>`,
            inline: true,
          },
        ]);
      const row = new ActionRowBuilder();
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
      row.addComponents(
        requestsButton,
        requestsChannelButton,
        acceptedRequestsButton,
        acceptedRequestsClearButton,
        closeButton
      );
      const row2 = new ActionRowBuilder();
      row2.addComponents(updateButton, tasksChannel, tasksCategory);
      interaction.message.edit({
        embeds: [embed],
        components: [row, row2],
      });
      interaction.reply({
        ephemeral: true,
        content: `\`Сообщение обновлено.\``,
      });
    }
    if (
      interaction.customId ==
      bot.Memory.guilds[interaction.guild.id].ticketChannels.filter(
        (id) => id == interaction.customId
      )
    ) {
      if (
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.Administrator
        )
      )
        return interaction.reply({
          ephemeral: true,
          content: `\`У вас нет прав на выполнение данной команды.\``,
        });
      var attach = null;
      var attach2 = null;
      var attach3 = null;
      if (interaction.message.attachments.at(0))
        attach = new AttachmentBuilder(
          interaction.message.attachments.at(0).attachment
        );
      if (interaction.message.attachments.at(1))
        attach2 = new AttachmentBuilder(
          interaction.message.attachments.at(1).attachment
        );
      if (interaction.message.attachments.at(2))
        attach3 = new AttachmentBuilder(
          interaction.message.attachments.at(2).attachment
        );
      const Files = [];
      if (attach) Files.push(attach);
      if (attach2) Files.push(attach2);
      if (attach3) Files.push(attach3);
      interaction.guild.channels.fetch(interaction.customId).then((channel) => {
        channel
          .send({
            files: Files,
            embeds: interaction.message.embeds,
          })
          .catch((err) => console.error(err));
      });
      interaction.message.delete().catch((err) => null);
    }
    if (interaction.customId == "claim-mission") {
      if (
        interaction.member.id ==
        bot.Memory.guilds[interaction.guild.id].tasks[
          interaction.message.id
        ].members.find((i) => i == interaction.member.id)
      )
        return interaction.reply({
          ephemeral: true,
          content: `\`Вы уже подали заявку.\``,
        });
      const id = new TextInputBuilder()
        .setCustomId("task-request-message")
        .setLabel("Сообщение...")
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder("Сообщение...");
      const row = new ActionRowBuilder().addComponents(id);
      const modal = new ModalBuilder()
        .addComponents(row)
        .setCustomId("request-task")
        .setTitle("Заявка на задание.");
      await interaction.showModal(modal);
    }
    if (interaction.customId == "task-cancel") {
      if (
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.Administrator
        )
      )
        return interaction.reply({
          ephemeral: true,
          content: `\`У вас нет прав на выполнение данной команды.\``,
        });
      interaction.message.delete().catch((err) => null);
    }
    if (interaction.customId == "task-claim") {
      if (
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.Administrator
        )
      )
        return interaction.reply({
          ephemeral: true,
          content: `\`У вас нет прав на выполнение данной команды.\``,
        });
      const postMessageID = interaction.message.content
        .replaceAll("||", "")
        .split("_")[0];
      const postChannelID = interaction.message.content
        .replaceAll("||", "")
        .split("_")[1];
      const postRequestMemberID = interaction.message.content
        .replaceAll("||", "")
        .split("_")[2];

      if (
        bot.Memory.guilds[interaction.guild.id].tasks[postMessageID]
          .requestMessagesIds.length
      ) {
        for (var msg of bot.Memory.guilds[interaction.guild.id].tasks[
          postMessageID
        ].requestMessagesIds) {
          interaction.channel.messages
            .fetch(msg)
            .then((mesage) => {
              mesage.delete().catch((err) => null);
            })
            .catch((err) => null);
        }
      }

      interaction.guild.channels
        .fetch(postChannelID)
        .then((channel) => {
          channel.messages
            .fetch(postMessageID)
            .then((msg) => {
              if (
                bot.Memory.guilds[interaction.guild.id].tasks[msg.id]
                  .taskClaimedMember != null
              )
                return interaction.reply({
                  ephemeral: true,
                  content: `\`На это задание уже был принят человек:\` <@${
                    bot.Memory.guilds[interaction.guild.id].tasks[msg.id]
                      .taskClaimedMember
                  }>`,
                });
              bot.Memory.guilds[interaction.guild.id].tasks[msg.id].endDate =
                interaction.createdTimestamp + msg.content.replaceAll("||", "");
              interaction.guild.members
                .fetch(postRequestMemberID)
                .then((mem) => {
                  const embed = new EmbedBuilder()
                    .setAuthor({
                      name: mem.user.globalName,
                      iconURL: mem.user.avatarURL(),
                    })
                    .setColor(0x2b2d31)
                    .setDescription(msg.embeds[0].description)
                    .setFields([
                      {
                        name: "Награда:",
                        value: `${msg.embeds[0].fields[0].value}`,
                        inline: true,
                      },
                      {
                        name: "Поручено:",
                        value: `<@${postRequestMemberID}>`,
                      },
                    ])
                    .setThumbnail(mem.user.avatarURL())
                    .setTimestamp(new Date());
                  const attach =
                    interaction.message.attachments.first() == undefined
                      ? null
                      : new AttachmentBuilder(
                          interaction.message.attachments.first().attachment
                        );
                  // const updateTimerButton = new ButtonBuilder()
                  //     .setCustomId("task-timer-update")
                  //     .setLabel("Обновить таймер.")
                  //     .setStyle(ButtonStyle.Danger);
                  const deleteButton = new ButtonBuilder()
                    .setCustomId("task-delete")
                    .setLabel("Удалить пост.")
                    .setStyle(ButtonStyle.Danger);
                  const row = new ActionRowBuilder().addComponents(
                    deleteButton
                  );

                  msg
                    .edit({
                      embeds: [embed],
                      files: attach != null ? [attach] : null,
                      components: [row],
                      content: `${msg.content}`,
                    })
                    .catch((err) => console.error(err));

                  interaction.guild.channels
                    .fetch(
                      bot.Memory.guilds[interaction.guild.id].tasksCategoryId
                    )
                    .then((channell) => {
                      channell.children
                        .create({
                          name: `задание-${mem.user.globalName}`,
                          type: ChannelType.GuildText,
                          permissionOverwrites: [
                            {
                              id: bot.user.id,
                              allow: [
                                PermissionFlagsBits.ViewChannel,
                                PermissionFlagsBits.ManageChannels,
                                PermissionFlagsBits.EmbedLinks,
                                PermissionFlagsBits.AttachFiles,
                              ],
                            },
                            {
                              id: mem.id,
                              allow: [
                                PermissionFlagsBits.ViewChannel,
                                PermissionFlagsBits.AttachFiles,
                              ],
                            },
                            {
                              id: interaction.guild.roles.everyone.id,
                              deny: [PermissionFlagsBits.ViewChannel],
                            },
                          ],
                        })
                        .then((channell) => {
                          interaction.reply({
                            content: `Заявка <@${postRequestMemberID}> принята! ${channell}`,
                            ephemeral: true,
                          });
                          const taskChannelEmbed = new EmbedBuilder()
                            .setAuthor({
                              name: `Задание для ${mem.user.globalName}`,
                              iconURL: bot.user.avatarURL(),
                            })
                            .setColor(0x2b2d31)
                            .setDescription(
                              `Задание: ${msg.embeds[0].description}`
                            )
                            .setFields([
                              {
                                name: "Ссылка на задание:",
                                value: `${msg.url}`,
                                inline: true,
                              },
                              {
                                name: "Поручено:",
                                value: `<@${mem.id}>`,
                                inline: true,
                              },
                              {
                                name: "Срок:",
                                value: `<t:${
                                  Math.floor(
                                    interaction.createdTimestamp / 1000
                                  ) +
                                  Math.floor(
                                    parseInt(
                                      msg.content.replaceAll("||", "") / 1000
                                    )
                                  )
                                }:R>`,
                                inline: true,
                              },
                            ]);
                          const deleteChannelButton = new ButtonBuilder()
                            .setCustomId("task-channel-delete")
                            .setLabel("Удалить канал.")
                            .setStyle(ButtonStyle.Danger);
                          const taskChannelRow =
                            new ActionRowBuilder().addComponents(
                              deleteChannelButton
                            );
                          channell
                            .send({
                              embeds: [taskChannelEmbed],
                              components: [taskChannelRow],
                            })
                            .catch((err) => console.error(err));
                        })
                        .catch((err) => {
                          console.error(err);
                          return interaction.reply({
                            ephemeral: true,
                            content: `\`Некорректный айди категории. Поменяйте его через /manage. Либо у бота нет прав на создание каналов под выбранной категорией.\``,
                          });
                        });
                    })
                    .catch((err) => {
                      console.error(err);
                      return interaction.reply({
                        ephemeral: true,
                        content: `\`Некорректный айди категории. Поменяйте его через /manage. Либо у бота нет прав на создание каналов под выбранной категорией.\``,
                      });
                    });
                  bot.Memory.guilds[interaction.guild.id].tasks[
                    msg.id
                  ].taskClaimedMember = postRequestMemberID;
                  interaction.message.delete().catch((err) => null);
                })
                .catch((err) => console.error(err));
            })
            .catch((err) => console.error(err));
        })
        .catch((err) => console.error(err));
    }
    if (interaction.customId == "set-tasks-channel") {
      if (
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.Administrator
        )
      )
        return interaction.reply({
          ephemeral: true,
          content: `\`У вас нет прав на выполнение данной команды.\``,
        });
      const id = new TextInputBuilder()
        .setCustomId("tasks-channel-id")
        .setLabel("Айди канала")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("Айди канала");
      const row = new ActionRowBuilder().addComponents(id);
      const modal = new ModalBuilder()
        .addComponents(row)
        .setCustomId("tasks-channel-modal")
        .setTitle("Айди канала");
      await interaction.showModal(modal);
    }
    if (interaction.customId == "set-tasks-category") {
      if (
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.Administrator
        )
      )
        return interaction.reply({
          ephemeral: true,
          content: `\`У вас нет прав на выполнение данной команды.\``,
        });
      const id = new TextInputBuilder()
        .setCustomId("tasks-category-id")
        .setLabel("Айди канала")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("Айди канала");
      const row = new ActionRowBuilder().addComponents(id);
      const modal = new ModalBuilder()
        .addComponents(row)
        .setCustomId("tasks-category-modal")
        .setTitle("Айди канала");
      await interaction.showModal(modal);
    }
    if (interaction.customId == "task-channel-delete") {
      if (
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.Administrator
        )
      )
        return interaction.reply({
          ephemeral: true,
          content: `\`У вас нет прав на выполнение данной команды.\``,
        });
      interaction.channel.delete().catch((err) => console.error(err));
    }
    if (interaction.customId == "profile-change-ton") {
      const id = new TextInputBuilder()
        .setCustomId("profile-change-ton-input")
        .setLabel("Ваш тон кошелек...")
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder("Ваш тон кошелёк...");
      const row = new ActionRowBuilder().addComponents(id);
      const modal = new ModalBuilder()
        .addComponents(row)
        .setCustomId("profile-change-ton-modal")
        .setTitle("Изменение TON кошелька");
      await interaction.showModal(modal);
    }
    if (interaction.customId == "profile-change-description") {
      const id = new TextInputBuilder()
        .setCustomId("profile-change-description-input")
        .setLabel("Описание...")
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder("Описание...");
      const row = new ActionRowBuilder().addComponents(id);
      const modal = new ModalBuilder()
        .addComponents(row)
        .setCustomId("profile-change-description-modal")
        .setTitle("Изменение описания профиля");
      await interaction.showModal(modal);
    }
  }
  if (interaction.isModalSubmit()) {
    const changeTonButton = new ButtonBuilder()
      .setCustomId("profile-change-ton")
      .setLabel("Изменить TON кошелёк.")
      .setStyle(ButtonStyle.Primary);
    const changeDescriptionButton = new ButtonBuilder()
      .setCustomId("profile-change-description")
      .setLabel("Изменить о себе.")
      .setStyle(ButtonStyle.Primary);
    const row = new ActionRowBuilder().addComponents(
      changeTonButton,
      changeDescriptionButton
    );
    if (interaction.customId == "request-channel-modal") {
      interaction.guild.channels
        .fetch(interaction.components[0].components[0].value)
        .then((channel) => {
          bot.Memory.guilds[interaction.guild.id].ticketChannelId = channel.id;
          interaction.reply({
            ephemeral: true,
            content: `\`Теперь в канал:\` <#${channel.id}> \`будут отправляться заявки\``,
          });
        })
        .catch((err) => {
          return interaction.reply({
            ephemeral: true,
            content: `\`Некорректный айди канала.\``,
          });
        });
    }
    if (interaction.customId == "accepted-channel-modal") {
      interaction.guild.channels
        .fetch(interaction.components[0].components[0].value)
        .then((channel) => {
          bot.Memory.guilds[interaction.guild.id].ticketChannels.push(
            channel.id
          );
          interaction.reply({
            ephemeral: true,
            content: `\`Канал добавлен.\``,
          });
        })
        .catch((err) => {
          return interaction.reply({
            ephemeral: true,
            content: `\`Некорректный айди канала.\``,
          });
        });
    }
    if (interaction.customId == "tasks-channel-modal") {
      interaction.guild.channels
        .fetch(interaction.components[0].components[0].value)
        .then((channel) => {
          bot.Memory.guilds[interaction.guild.id].taskChannelId = channel.id;
          interaction.reply({
            ephemeral: true,
            content: `\`Теперь в канал:\` <#${channel.id}> \`будут отправляться заявки заданий.\``,
          });
        })
        .catch((err) => {
          return interaction.reply({
            ephemeral: true,
            content: `\`Некорректный айди канала.\``,
          });
        });
    }
    if (interaction.customId == "tasks-category-modal") {
      interaction.guild.channels
        .fetch(interaction.components[0].components[0].value)
        .then((channel) => {
          bot.Memory.guilds[interaction.guild.id].tasksCategoryId = channel.id;
          interaction.reply({
            ephemeral: true,
            content: `\`Теперь в категории:\` <#${channel.id}> \`будут создаваться каналы для людей которых приняли на задание.\``,
          });
        })
        .catch((err) => {
          return interaction.reply({
            ephemeral: true,
            content: `\`Некорректный айди категории.\``,
          });
        });
    }
    if (interaction.customId == "request-task") {
      const embed = new EmbedBuilder()
        .setAuthor({
          name: interaction.member.user.globalName,
          iconURL: interaction.member.user.avatarURL(),
        })
        .setColor(0x2b2d31)
        .setTimestamp(new Date())
        .setDescription(
          `<@${interaction.member.id}> хочет взять задание ${interaction.message.url}!\n**Его сообщение:**\n${interaction.components[0].components[0].value}`
        )
        .setThumbnail(interaction.member.user.avatarURL());
      const cancelButton = new ButtonBuilder()
        .setCustomId("task-cancel")
        .setLabel("Отклонить.")
        .setStyle(ButtonStyle.Danger);
      const claimButton = new ButtonBuilder()
        .setCustomId("task-claim")
        .setLabel("Принять.")
        .setStyle(ButtonStyle.Success);
      const row = new ActionRowBuilder().addComponents(
        claimButton,
        cancelButton
      );
      if (bot.Memory.guilds[interaction.guild.id].taskChannelId == null)
        return interaction.reply({
          ephemeral: true,
          content: `\`Канал для заявок не установлен.\``,
        });
      interaction.guild.channels
        .fetch(bot.Memory.guilds[interaction.guild.id].taskChannelId)
        .then((channel) => {
          channel
            .send({
              content: `||${interaction.message.id}_${interaction.channel.id}_${interaction.member.id}||`,
              embeds: [embed],
              components: [row],
            })
            .then((chl) => {
              interaction.reply({
                ephemeral: true,
                content: `\`Заявка отправлена.\``,
              });
              bot.Memory.guilds[interaction.guild.id].tasks[
                interaction.message.id
              ].requestMessagesIds.push(chl.id);
            })
            .catch((err) => console.error(err));
        })
        .catch((err) => console.error(err));
      bot.Memory.guilds[interaction.guild.id].tasks[
        interaction.message.id
      ].members.push(interaction.member.id);
    }
    if (interaction.customId == "profile-change-ton-modal") {
      bot.Memory.guilds[interaction.guild.id].members[
        interaction.member.id
      ].tonWallet = interaction.components[0].components[0].value;
      interaction.reply({
        ephemeral: true,
        content: `TON кошелёк установлен: \`${
          bot.Memory.guilds[interaction.guild.id].members[interaction.member.id]
            .tonWallet
        }\``,
      });
    }
    if (interaction.customId == "profile-change-description-modal") {
      bot.Memory.guilds[interaction.guild.id].members[
        interaction.member.id
      ].description = interaction.components[0].components[0].value;
      interaction.reply({
        ephemeral: true,
        content: `Описание установлено: \`${
          bot.Memory.guilds[interaction.guild.id].members[interaction.member.id]
            .description
        }\``,
      });
    }
    if (interaction.customId === "main-work-channel-modal") {
      const channelId = interaction.components[0].components[0].value;
      bot.Memory.guilds[interaction.guild.id].mainWorkChannel = channelId;
      await interaction.reply({
        ephemeral: true,
        content: `\`Основной рабочий чат установлен:\` <#${channelId}>`,
      });
    }

    if (interaction.customId === "eng-work-channel-modal") {
      const channelId = interaction.components[0].components[0].value;
      bot.Memory.guilds[interaction.guild.id].engWorkChannel = channelId;
      await interaction.reply({
        ephemeral: true,
        content: `\`Английский рабочий чат установлен:\` <#${channelId}>`,
      });
    }

    if (interaction.customId === "whitelist-role-modal") {
      const roleId = interaction.components[0].components[0].value;
      if (!bot.Memory.guilds[interaction.guild.id].whitelistRoles) {
        bot.Memory.guilds[interaction.guild.id].whitelistRoles = [];
      }
      bot.Memory.guilds[interaction.guild.id].whitelistRoles.push(roleId);
      await interaction.reply({
        ephemeral: true,
        content: `\`Вайтлист роль добавлена:\` <@&${roleId}>`,
      });
    }
  }
};

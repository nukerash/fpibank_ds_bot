const ms = require('ms');

module.exports = (bot) => {
    bot.on('messageCreate', async (message) => {
        const sendTemp = async (content) => {
            const msg = await message.channel.send(content);
            setTimeout(() => msg.delete().catch(() => {}), 10000);
        };

        if (message.content.startsWith('!mute')) {
            const guildData = bot.Memory.guilds[message.guild.id];
            if (!guildData) return;

            const hasModerRole = message.member.roles.cache.some(role => guildData.moderRoles.includes(role.id));
            if (!hasModerRole) {
                return sendTemp('You do not have permission to use this command.');
            }

            const args = message.content.split(' ').slice(1);
            let user = message.mentions.users.first();
            let time, reason;

            if (message.reference) {
                const referencedMessage = await message.channel.messages.fetch(message.reference.messageId);
                user = referencedMessage.author;
                time = args[0];
                reason = args.slice(1).join(' ') || 'No reason provided';
            } else {
                if (!message.mentions.users.size && args[0]) {
                    try {
                        user = await bot.users.fetch(args[0]);
                    } catch (err) {
                        return sendTemp('User not found.');
                    }
                }
                time = args[1];
                reason = args.slice(2).join(' ') || 'No reason provided';
            }

            if (!user || !time) {
                return sendTemp('Usage: !mute @user/userID time reason');
            }

            const member = message.guild.members.cache.get(user.id);
            if (!member) {
                return sendTemp('User not found.');
            }

            const muteRole = message.guild.roles.cache.get(guildData.muteRoleId);
            if (!muteRole) {
                return sendTemp('Mute role not found.');
            }

            try {
                const duration = ms(time);
                if (!duration) {
                    return sendTemp('Invalid time format. Use formats like "10s", "1m", "1h"');
                }

                // Устанавливаем время окончания мута
                if (!guildData.members[user.id]) {
                    guildData.members[user.id] = {};
                }
                
                guildData.members[user.id].muteEnd = Date.now() + duration;
                guildData.members[user.id].muteReason = reason;
                guildData.members[user.id].mutedBy = message.author.tag;

                // Добавляем роль мута
                await member.roles.add(muteRole);

                // Сохраняем изменения сразу после установки мута
                const fs = require('fs');
                fs.writeFileSync("./Memory.json", JSON.stringify(bot.Memory, null, "\t"));

                await sendTemp({
                    content: `\`${user.tag}\` был замьючен на \`${time}\`${reason !== 'No reason provided' ? ` по причине: \`${reason}\`` : '.'}`
                });
            } catch (err) {
                console.error('Mute error:', err);
                await sendTemp('Failed to mute the user.');
            }
        }

        if (message.content.startsWith('!unmute')) {
            const guildData = bot.Memory.guilds[message.guild.id];
            if (!guildData) return;

            const hasModerRole = message.member.roles.cache.some(role => guildData.moderRoles.includes(role.id));
            if (!hasModerRole) {
                return sendTemp('You do not have permission to use this command.');
            }

            const args = message.content.split(' ').slice(1);
            let user = message.mentions.users.first() || bot.users.cache.get(args[0]);

            if (message.reference) {
                const referencedMessage = await message.channel.messages.fetch(message.reference.messageId);
                user = referencedMessage.author;
            }

            if (!user) {
                return sendTemp('Usage: !unmute @user or !unmute userID');
            }

            const member = message.guild.members.cache.get(user.id);
            if (!member) {
                return sendTemp('User not found.');
            }

            const muteRole = message.guild.roles.cache.get(guildData.muteRoleId);
            if (!muteRole) {
                return sendTemp('Mute role not found.');
            }

            try {
                await member.roles.remove(muteRole);
                delete guildData.members[user.id].muteEnd;
                delete guildData.members[user.id].muteReason;
                delete guildData.members[user.id].mutedBy;

                const fs = require('fs');
                fs.writeFileSync("./Memory.json", JSON.stringify(bot.Memory, null, "\t"));

                await sendTemp(`${user.tag} has been unmuted.`);
            } catch (err) {
                await sendTemp('Failed to unmute the user.');
            }
        }
    });

    setInterval(async () => {
        try {
            for (const guildId in bot.Memory.guilds) {
                const guildData = bot.Memory.guilds[guildId];
                if (!guildData?.members) continue;

                const maxWarns = guildData.maxWarns || 3;
                const punishmentDuration = guildData.punishmentDuration 
                    ? ms(guildData.punishmentDuration) 
                    : 5000;

                for (const memberId in guildData.members) {
                    try {
                        const memberData = guildData.members[memberId];
                        if (!memberData?.warns || memberData.warns < maxWarns || memberData.muteEnd) {
                            continue;
                        }

                        console.log(`[AutoMute] Processing member ${memberId} with ${memberData.warns} warnings`);
                        
                        const guild = await bot.guilds.fetch(guildId).catch(() => null);
                        if (!guild) {
                            console.log(`[AutoMute] Guild ${guildId} not found`);
                            continue;
                        }

                        const member = await guild.members.fetch(memberId).catch(() => null);
                        if (!member) {
                            console.log(`[AutoMute] Member ${memberId} not found`);
                            continue;
                        }

                        const muteRole = await guild.roles.fetch(guildData.muteRoleId).catch(() => null);
                        if (!muteRole) {
                            console.log(`[AutoMute] Mute role not found for guild ${guildId}`);
                            continue;
                        }

                        // Применяем мут
                        await member.roles.add(muteRole).catch(err => {
                            console.error(`[AutoMute] Failed to add mute role:`, err);
                            return;
                        });

                        // Устанавливаем время окончания мута
                        const muteEndTime = Date.now() + punishmentDuration;
                        console.log(`[AutoMute] Setting mute end time for ${memberId}:`, {
                            currentTime: Date.now(),
                            duration: punishmentDuration,
                            endTime: muteEndTime
                        });
                        
                        memberData.muteEnd = muteEndTime; // Store as number
                        memberData.muteReason = "Exceeded maximum warnings";
                        memberData.mutedBy = "AutoMute";
                        memberData.warns = 0;

                        console.log(`[AutoMute] Mute data set:`, {
                            muteEnd: memberData.muteEnd,
                            currentTime: Date.now(),
                            duration: punishmentDuration,
                            timeLeft: memberData.muteEnd - Date.now()
                        });

                        // Немедленно сохраняем изменения
                        try {
                            const fs = require('fs');
                            fs.writeFileSync("./Memory.json", JSON.stringify(bot.Memory, null, "\t"));
                            console.log(`[AutoMute] Successfully saved mute data for ${memberId}`);
                        } catch (err) {
                            console.error('[AutoMute] Failed to save Memory.json:', err);
                        }
                    } catch (err) {
                        console.error(`[AutoMute] Error processing member ${memberId}:`, err);
                        continue;
                    }
                }
            }
        } catch (err) {
            console.error('[AutoMute] Error in warns check interval:', err);
        }
    }, 1000);
};

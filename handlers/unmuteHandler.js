const fs = require('fs').promises;

module.exports = (bot) => {
    let isChecking = false;
    let needsSave = false;
    
    // Функция сохранения изменений
    const saveChanges = async () => {
        if (!needsSave) return;
        try {
            await fs.writeFile("./Memory.json", JSON.stringify(bot.Memory, null, "\t"));
            needsSave = false;
        } catch (err) {
            console.error('Failed to save Memory.json:', err);
        }
    };

    // Основной цикл проверки
    setInterval(async () => {
        if (isChecking || !bot.Memory?.guilds) return;
        isChecking = true;

        try {
            for (const guildId in bot.Memory.guilds) {
                const guildData = bot.Memory.guilds[guildId];
                if (!guildData?.members) continue;

                // Получаем гильдию из кэша
                const guild = bot.guilds.cache.get(guildId);
                if (!guild) continue;

                // Получаем роль из кэша
                const muteRole = guild.roles.cache.get(guildData.muteRoleId);
                if (!muteRole) continue;

                // Получаем бота из кэша
                const botMember = guild.members.cache.get(bot.user.id);
                if (!botMember?.permissions.has('ManageRoles')) continue;

                for (const memberId in guildData.members) {
                    const memberData = guildData.members[memberId];
                    if (!memberData?.muteEnd) continue;

                    const muteEndTime = typeof memberData.muteEnd === 'number' 
                        ? memberData.muteEnd 
                        : new Date(memberData.muteEnd).getTime();

                    if (isNaN(muteEndTime)) {
                        delete memberData.muteEnd;
                        needsSave = true;
                        continue;
                    }

                    if (Date.now() >= muteEndTime) {  // Changed condition
                        const member = guild.members.cache.get(memberId);
                        if (!member) continue;

                        try {
                            await member.roles.remove(muteRole);
                            delete memberData.muteEnd;
                            delete memberData.muteReason;
                            delete memberData.mutedBy;
                            needsSave = true;
                            console.log(`Successfully unmuted ${memberId}`);
                        } catch (err) {
                            console.error(`Failed to unmute ${memberId}:`, err.message);
                        }
                    }
                }
            }

            // Сохраняем изменения в конце цикла
            if (needsSave) {
                await saveChanges();
            }
        } catch (err) {
            console.error('Error in unmute check interval:', err);
        } finally {
            isChecking = false;
        }
    }, 1000); // Проверяем каждые 1 секунд
};

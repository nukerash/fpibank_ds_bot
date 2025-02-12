module.exports = async (bot, guildId, userId, duration, reason, moderator) => {
    if (!guildId || typeof guildId !== 'string') return;
    if (!bot.Memory.guilds[guildId]) return;

    let guildObj = bot.guilds.cache.get(guildId);
    if (!guildObj) {
        try {
            guildObj = await bot.guilds.fetch(guildId);
        } catch (err) {
            return;
        }
    }

    let member;
    try {
        member = await guildObj.members.fetch(userId);
    } catch (err) {
        return;
    }

    const muteRole = guildObj.roles.cache.get(bot.Memory.guilds[guildId].muteRoleId);
    if (!muteRole) return;

    try {
        await member.roles.add(muteRole);
    } catch (err) {
        return;
    }

    // Check if member exists in Memory, create if not
    if (!bot.Memory.guilds[guildId].members[userId]) {
        bot.Memory.guilds[guildId].members[userId] = {
            id: userId,
            name: member.user.username,
            nextRequestDate: 0,
            tonWallet: null,
            warns: 0
        };
    }

    const muteEnd = Date.now() + duration;

    // Now we can safely set these properties
    bot.Memory.guilds[guildId].members[userId].muteEnd = muteEnd;
    bot.Memory.guilds[guildId].members[userId].muteReason = reason;
    bot.Memory.guilds[guildId].members[userId].mutedBy = moderator;
    bot.Memory.guilds[guildId].members[userId].warns = 0; // Reset warns

    try {
        await member.send(`You have been muted for the following reason: ${reason}. Your mute will end on ${new Date(muteEnd).toLocaleString()}. Muted by: ${moderator}`);
    } catch (err) {}

    // Save changes to Memory.json
    const fs = require('fs');
    fs.writeFileSync("./Memory.json", JSON.stringify(bot.Memory, null, "\t"));
};

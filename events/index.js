const fs = require('fs');
module.exports = (bot) => {
    const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
    for (const file of eventFiles) {
        const event = require(`./${file}`);
        const name = file.slice(0, -3);
        bot.on(name, async (...args) => {
            try {
                await event(bot, ...args);
            } catch (err) {
                console.error(`Error in ${name} event:`, err);
            }
        });
    }
};
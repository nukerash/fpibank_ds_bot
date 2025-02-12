module.exports = async (bot,message,args,argsF) => {
    return message.reply({
        ephemeral: true,
        content: `${bot.ws.ping}ms pong!`
    });
};
module.exports.names = ["ping"];
module.exports.interaction = {
    name: 'ping',
    description: 'Просто проверочная команда, ничего больше',
    defaultPermission: true
};
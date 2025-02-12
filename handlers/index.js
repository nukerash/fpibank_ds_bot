module.exports = (bot) => {
    require('./messageHandler.js')(bot);
    require('./interactionHandler.js')(bot);
    require('./muteHandler.js')(bot);
    require('./unmuteHandler.js')(bot);
};
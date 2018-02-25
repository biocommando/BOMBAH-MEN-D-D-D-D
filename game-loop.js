const consts = require('./game-constants');
const gameUpdater = require('./game-updater');


module.exports = {
    start: state => startGameLoop(state)
};

const startGameLoop = state => {
    setTimeout(() => gameLoop(state), 0);
    setTimeout(() => expirePlayers(state), 0);
};

// Expire players and remove them from the objects array
// NOTE! The player may remain active in the history for indefinite amount of time
// so removing the player object from all historical frames may be required
const expirePlayers = state => {
    const time = Date.now();
    state.players = state.players.filter(player => time < player.expires);
    state.objects = state.objects.filter(object => object.type !== consts.objectTypes.player 
        || state.players.some(player => player.globalId === object.id));
    setTimeout(() => expirePlayers(state), consts.expirePlayersInterval);
};
let lock = false;
const gameLoop = state => {
    setTimeout(() => gameLoop(state), consts.frameDelay);
    gameUpdater.update(state);
};


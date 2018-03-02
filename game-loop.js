const consts = require('./game-constants');
const gameUpdater = require('./game-updater');


module.exports = {
    start: state => startGameLoop(state)
};

const startGameLoop = state => {
    setTimeout(() => gameLoop(state), 0);
    setTimeout(() => expirePlayers(state), 0);
};

// Expire players and notify the game loop
const expirePlayers = state => {
    const time = Date.now();
    const origNumPlayers = state.players.length;
    state.players = state.players.filter(player => time < player.expires);
    if (origNumPlayers > state.players.length) {
        console.log('Player(s) disconnected. Active players: ',
        state.players);
    }
    state.objects
        .filter(object => object.type === consts.objectTypes.player &&
            !state.players.some(player => player.publicId === object.id))
        .forEach(expiredObject => state.updates.push({
            type: consts.updateTypes.events.deleteObject,
            id: expiredObject.id
        }));
    setTimeout(() => expirePlayers(state), consts.expirePlayersInterval);
};
let lock = false;
const gameLoop = state => {
    setTimeout(() => gameLoop(state), consts.frameDelay);
    gameUpdater.update(state);
};


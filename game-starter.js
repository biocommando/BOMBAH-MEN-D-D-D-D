const objCreator = require('./object-creator');
const consts = require('./game-constants');

module.exports = {
    start: state => startForNewPlayer(state)
}

const startForNewPlayer = state => {
    const player = {
        uniqueId: uniqueIdGen(16),
        globalId: uniqueIdGen(5),
        created: Date.now(),
        expires: Date.now() + consts.playerExpireMillis,
        score: 0
    };
    state.players.push(player);
    state.updates.push({
        type: consts.updateTypes.events.createPlayer,
        globalId: player.globalId,
        frameIndex: state.frameIndex});
    return player;
};

const uniqueIdGen = (complexity) => {
    const ids = [];
    const randomId = () => Array(complexity).fill().map(() => String.fromCharCode(65 + Math.trunc(26 * Math.random()))).join('');
    const generate = () => {
        var id;
        do {
            id = randomId();
        } while(ids.some(i => i == id));
        ids.push(id);
        return id;
    };
    return generate();
};
const objCreator = require('./object-creator');
const consts = require('./game-constants');
const idPool = require('./id-pool');
const randomName = require('./random-name');

module.exports = {
    start: (state, name, oldSessionId) => startForNewPlayer(state, name, oldSessionId)
}
const playerIdPool = idPool.create();
const startForNewPlayer = (state, name, oldSessionId) => {
    name = name ? name : randomName.get();
    const player = {
        sessionId: sessionIdGenerator(16),
        publicId: playerIdPool.nextId(),
        created: Date.now(),
        expires: Date.now() + consts.playerExpireMillis,
        score: {
            kills: 0
        },
        name
    };
    state.players.push(player);
    state.players = state.players.filter(plr => plr.sessionId !== oldSessionId);
    state.updates.push({
        type: consts.updateTypes.events.createObject,
        objectType: consts.objectTypes.player,
        publicId: player.publicId,
        name
    });
    console.log('Player joined: ', player);
    return player;
};

const sessionIdGenerator = (complexity) => {
    const ids = [];
    const randomId = () =>
        Array(complexity).fill().map(() => String.fromCharCode(65 + Math.trunc(26 * Math.random()))).join('');
    const generate = () => {
        var id;
        do {
            id = randomId();
        } while (ids.some(i => i == id));
        ids.push(id);
        return id;
    };
    return generate();
};
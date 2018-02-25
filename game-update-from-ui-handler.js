const consts = require('./game-constants');

module.exports = {
    addUpdate: (state, data) => update(state, data)
}

const update = (state, data) => {
    const player = state.players.find(plr => plr.uniqueId === data.uniqueId);
    if (player === undefined) {
        return {error: 'unique player id not found'};
    }
    player.expires = Date.now() + consts.playerExpireMillis;
    if (data.type === consts.updateTypes.session.heartbeat) {
        return {};
    }

    const check = (typesArray, typeToCheck) => typesArray.some(types => {
        for(var type in types) {
            if (types[type] === typeToCheck) {
                return true;
            }
        }
        return false;
    });
    
    if (!check([consts.updateTypes.movement, consts.updateTypes.interaction], data.type)) {
        return {error: 'update type not allowed'};
    }
    state.updates.push({
        type: data.type,
        frameIndex: data.frameIndex,
        playerId: player.globalId
    });
    return {};
};
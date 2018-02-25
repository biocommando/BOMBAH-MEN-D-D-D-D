const consts = require('./game-constants');
const gameStarter = require('./game-starter');
const randomName = require('./random-name');

module.exports = {
    init: state => initRandomEvents(state)
}

const initRandomEvents = state => {
    // randomBombDrop(state, 2, 10000);
    // botCreation(state, 5, 10000);
};

const randomBombDrop = (state, numBombs, delayMs) => {
    const bombDrop = () => {
        for (var i = 0; i < numBombs; i++) {
            state.updates.push({ 
                type: consts.updateTypes.events.createObject,
                objectType: consts.objectTypes.bomb
             });
        }
        setTimeout(bombDrop, delayMs);
    };
    setTimeout(bombDrop, delayMs);
};

const botCreation = (state, playerLimit, delayMs) => {
    const insideBox = (object, x1, y1, x2, y2) =>
        object.x >= x1 && object.x <= x2 && object.y >= y1 && object.y <= y2;
    const botLogic = player => {
        const rand = Math.trunc(Math.random() * 4);
        const actionType = [
            consts.updateTypes.movement.downStart,
            consts.updateTypes.movement.upStart,
            consts.updateTypes.movement.leftStart,
            consts.updateTypes.movement.rightStart,
            consts.updateTypes.movement.rightStop,
            consts.updateTypes.movement.downStop,
        ].find((a, i) => i === rand);
        state.updates.push({
            type: actionType,
            playerId: player.publicId
        });
        if (Math.random() > 0.8) {
            state.updates.push({
                type: consts.updateTypes.interaction.dropBomb,
                playerId: player.publicId
            });
        }
        if (state.players.some(plr => plr.sessionId === player.sessionId)) {
            setTimeout(() => botLogic(player), 1000);
        }
    };
    const createBot = () => {
        const name = randomName.get();
        const player = gameStarter.start(state, `${name} (bot)`);
        botLogic(player);
    };
    const botCreationLoop = () => {
        if (state.players.length < playerLimit) {
             createBot();
        }
        setTimeout(botCreationLoop, delayMs);
    };
    setTimeout(botCreationLoop, delayMs);
};
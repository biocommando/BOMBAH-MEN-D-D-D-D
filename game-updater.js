const consts = require('./game-constants');
const objCreator = require('./object-creator');
module.exports = {
    update: (state) => updateGame(state)
}
let frameIndex = 0;
const framesToPersist = 200;
let frames = [{ objects: [], frameIndex: 0 }];

const gameRules = (objects, updates) => {
    let nextObjects = deepCopy(objects);
    // Handle updates
    updates && updates.forEach(update => {
        const randomPosition = () => {
            return {
                x: (consts.playArea.width - 50) * Math.random() + 25,
                y: (consts.playArea.height - 50) * Math.random() + 25
            }
        };

        if (update.type === consts.updateTypes.events.createPlayer) {
            const xy = randomPosition();
            const y = (consts.playArea.height - 50) * Math.random() + 25;
            nextObjects.push(objCreator.create(consts.objectTypes.player, xy.x, xy.y, update.globalId));
        } else if (update.type === consts.updateTypes.events.createBomb) {
            const xy = randomPosition();
            nextObjects.push(objCreator.create(consts.objectTypes.bomb, xy.x, xy.y));
        } else {
            const playerObject = nextObjects.find(obj => obj.id === update.playerId);
            if (!playerObject) {
                return;
            }
            switch (update.type) {
                case consts.updateTypes.movement.downStart:
                    playerObject.dy = consts.playerSpeed;
                    break;
                case consts.updateTypes.movement.upStart:
                    playerObject.dy = -consts.playerSpeed;
                    break;
                case consts.updateTypes.movement.downStop:
                case consts.updateTypes.movement.upStop:
                    playerObject.dy = 0;
                    break;
                case consts.updateTypes.movement.leftStart:
                    playerObject.dx = -consts.playerSpeed;
                    break;
                case consts.updateTypes.movement.rightStart:
                    playerObject.dx = consts.playerSpeed;
                    break;
                case consts.updateTypes.movement.leftStop:
                case consts.updateTypes.movement.rightStop:
                    playerObject.dx = 0;
                    break;
                case consts.updateTypes.interaction.dropBomb:
                    if (playerObject.reload <= 0) {
                        playerObject.reload = consts.playerReload;
                        nextObjects.push(objCreator.create(consts.objectTypes.bomb, playerObject.x, playerObject.y, playerObject.globalId));
                    }
                    break;
                default:
                    console.log('unknown event ', update.type);
                    break;
            }
        }
    });
    // Move objects etc.
    nextObjects.forEach(object => {
        const insideBox = (x1, y1, x2, y2) => object.x >= x1 && object.x <= x2 && object.y >= y1 && object.y <= y2;
        const insideCircle = (obj, x, y, r) => (obj.x - x) * (obj.x - x) + (obj.y - y) * (obj.y - y) <= r * r;

        // Move objects
        const ex = object.x;
        const ey = object.y;
        object.x += object.dx;
        if (!insideBox(0, 0, consts.playArea.width, consts.playArea.height)) {
            object.x = ex;
        }
        object.y += object.dy;
        if (!insideBox(0, 0, consts.playArea.width, consts.playArea.height)) {
            object.y = ey;
        }

        object.hitpoints -= object.hpReduction;
        // Type specific actions
        if (object.type === consts.objectTypes.bomb) {
            if (object.hitpoints <= 0) {
                nextObjects.push(objCreator.create(consts.objectTypes.explosion, object.x, object.y, object.owner));
            }
        } else if (object.type === consts.objectTypes.explosion) {
            nextObjects
                .filter(o => o.type === consts.objectTypes.player && insideCircle(o, object.x, object.y, object.radius))
                .forEach(o => {
                    o.hitpoints -= object.damage;
                });
        } else if (object.type === consts.objectTypes.player) {
            if (object.reload > 0) {
                object.reload--;
            }
            // While this would lead to smoother (and more reliable) movement for one client
            // it makes other player's movements super jerky.
            // object.dx = object.dy = 0;
        }
    });
    // Remove objects with hitpoints reduced to zero or less
    nextObjects = nextObjects.filter(o => o.hitpoints > 0);

    return nextObjects;
};
let nextRandomBombDrop = Date.now() + 10000;
const updateGame = (state) => {
    // Every 10 seconds there will be 4 randomly placed bombs
    if (Date.now() > nextRandomBombDrop) {
        nextRandomBombDrop = Date.now() + 10000;
        for(var i = 0; i < 4; i++) {
            state.updates.push({type: consts.updateTypes.events.createBomb, frameIndex});
        }
    }
    frameIndex++;
    const sortedUpdates = state.updates
        .filter(update => update.frameIndex >= frameIndex - framesToPersist)
        .sort((a, b) => a.frameIndex - b.frameIndex);
    if (sortedUpdates.length > 0) {
        const updatesPerFrame = {};
        sortedUpdates.forEach(update => {
            if (updatesPerFrame[update.frameIndex] === undefined) {
                updatesPerFrame[update.frameIndex] = [];
            }
            updatesPerFrame[update.frameIndex].push(update);
        });
        let idx = frames.findIndex(frame => frame.frameIndex === sortedUpdates[0].frameIndex);
        var len = frames.length;
        idx = idx >= 1 ? idx : (idx === -1 ? frames.length : 1); // Frame not found -> frame in future
        frames.splice(idx);
        let objects = frames[idx - 1].objects;
        const lastFrameIndex = frames[idx - 1].frameIndex;
        /*console.log(frameIndex);
        console.log(sortedUpdates);
        console.log(objects);
        console.log('replaying ' + (len - idx) + ' frames');*/
        for (var i = lastFrameIndex + 1; i <= frameIndex; i++) {
            objects = gameRules(objects, updatesPerFrame[i]);
            frames.push({ objects, frameIndex: i });
        }
    } else {
        frames.push({ objects: gameRules(state.objects), frameIndex });
    }
    state.updates = [];
    if (frames.length >= framesToPersist) {
        /*console.log('deleting' + (frames.length - framesToPersist + 1));
        var a = frames.splice(0, frames.length - framesToPersist + 1);
        console.log(a);*/
        frames = frames.filter(frame => frame.frameIndex >= frameIndex - framesToPersist);
    }
    state.objects = deepCopy(frames[frames.length - 1].objects);
    state.frameIndex = frameIndex;
}

const deepCopy = o => JSON.parse(JSON.stringify(o));
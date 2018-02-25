const consts = require('./game-constants');
const objCreator = require('./object-creator');
module.exports = {
    update: (state) => updateGame(state)
}
let frameIndex = 0;
const frames = {
    current: [],
    history: [],
    update: function (objects) {
        this.history = this.current;
        this.current = objects;
    }
}

/** The game rules.
 * The rules update the object array according to the update events and then the new state is
 * calculated based on the updated state. All additions and removals of objects should be
 * completely event based. */
const gameRules = (objects, notifyUpdates, updates) => {
    let nextObjects = deepCopy(objects);
    // Handle updates
    updates && updates.forEach(update => {
        const randomPosition = () => {
            return {
                x: (consts.playArea.width - 50) * Math.random() + 25,
                y: (consts.playArea.height - 50) * Math.random() + 25
            }
        };

        if (update.type === consts.updateTypes.events.createObject) {
            console.log(update);
            const xy = update.xy ? update.xy : randomPosition();
            const object = objCreator.create(update.objectType, xy.x, xy.y, update.publicId);
            object.name = update.name;
            nextObjects.push(object);
        } else if (update.type === consts.updateTypes.events.deleteObject) {
            console.log(update);
            nextObjects = nextObjects.filter(object => object.id !== update.id);
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
                        notifyUpdates.push({
                            type: consts.updateTypes.events.createObject,
                            objectType: consts.objectTypes.bomb,
                            publicId: playerObject.id,
                            xy: { x: playerObject.x, y: playerObject.y }
                        });
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
        const insideBox = (x1, y1, x2, y2) =>
            object.x >= x1 && object.x <= x2 && object.y >= y1 && object.y <= y2;
        const insideCircle = (obj, x, y, r) =>
            (obj.x - x) * (obj.x - x) + (obj.y - y) * (obj.y - y) <= r * r;

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
                notifyUpdates.push({
                    type: consts.updateTypes.events.createObject,
                    objectType: consts.objectTypes.explosion,
                    publicId: object.owner,
                    xy: { x: object.x, y: object.y }
                });
            }
        } else if (object.type === consts.objectTypes.explosion) {
            nextObjects
                .filter(o => o.type === consts.objectTypes.player
                    && insideCircle(o, object.x, object.y, object.radius))
                .forEach(o => {
                    o.hitpoints -= object.damage;
                    if (o.hitpoints < 0) {
                        notifyUpdates.push({
                            type: consts.updateTypes.events.playerKilled,
                            killedBy: object.owner,
                            killed: o.id,
                            backwardsUpdate: true
                        });
                    }
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
    nextObjects
        .filter(o => o.hitpoints <= 0)
        .forEach(o => notifyUpdates.push({ type: consts.updateTypes.events.deleteObject, id: o.id }));

    return nextObjects;
};

const updateGame = (state) => {
    const notifyUpdates = [];
    if (state.updates.length > 0) {
        const sorter = (a, b) => a.order === undefined || b.order === undefined ? 0 : a.order - b.order;
        const sortedUpdates = state.updates.sort(sorter);
        frames.current = gameRules(frames.history, notifyUpdates, sortedUpdates);
        // History will be overridden after this
    }

    [state.updates, notifyUpdates].forEach(updates =>
        updates.filter(update => update.type === consts.updateTypes.events.playerKilled)
        .forEach(killedUpdate => {
            console.log(killedUpdate);
            const killer = state.players.find(player => player.publicId === killedUpdate.killedBy);
            if (killer !== undefined) {
                killer.score.kills += killedUpdate.killed === killer.publicId ? 0 : 1;
            }
        })
    );
    state.updates = notifyUpdates.filter(update => !update.backwardsUpdate);

    frames.update(gameRules(frames.current, state.updates));
    state.objects = deepCopy(frames.current);
}

const deepCopy = o => JSON.parse(JSON.stringify(o));
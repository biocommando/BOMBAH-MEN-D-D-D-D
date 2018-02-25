const consts = require('./game-constants');
const idPool = require('./id-pool');

module.exports = {
    create: (type, x, y, id) => createObject(type, x, y, id)
};
const nonPlayerIdPool = idPool.create();
const createObject = (type, x, y, id) => {
    if (!Object.keys(consts.objectTypes).some(key => consts.objectTypes[key] === type)) {
        return;
    }
    const object = {
        type, x, y,
        dx: 0,
        dy: 0,
        hpReduction: 0,
        hitpoints: consts.maxHitPoints
    };
    if (type === consts.objectTypes.player) {
        object.id = id;
        object.reload = 0;
    } else {
        object.id = nonPlayerIdPool.nextId();
        object.owner = id;
        if (type === consts.objectTypes.explosion) {
            object.radius = consts.explosionRadius;
            object.damage = consts.explosionDamage;
            object.hpReduction = consts.hitpointReductionRates.explosion;
        } else {
            object.hpReduction = consts.hitpointReductionRates.bomp;
        }
    }
    return object;
};

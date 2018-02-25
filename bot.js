import { setTimeout } from 'timers';

const request = require('request');
const consts = require('./game-constants');

const actions = [
    consts.updateTypes.movement.downStart,
    consts.updateTypes.movement.upStart,
    consts.updateTypes.movement.leftStart,
    consts.updateTypes.movement.rightStart,
    consts.updateTypes.interaction.dropBomb,
];

const randomAction = () => actions[Math.trunc(actions.length * Math.random())];
const uniqueId = '';
let action = randomAction();

const act = () => {
    if (action === consts.updateTypes.interaction.dropBomb || Math.random() > 0.9) {
        action = randomAction();
    }
    const update = {uniqueId, type: action, };
    request({url: 'http://localhost:3001/update', method: 'POST', json: true, body: update}, (err, res, body) => {

    })
    setTimeout(act, consts.frameDelay);
}

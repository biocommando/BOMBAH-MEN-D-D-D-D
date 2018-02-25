const consts = module.exports;
let objects = [];
let frameIndex = 0;
const keyHandler = createKeyHandler();
const playerSpeed = consts.playerSpeed;
var uniqueId;
var globalId;
var player;
let expire = Date.now() + 10000;
let gameStarted = false;
const explosionSound = createAudioPlayer('explosion');

const sprites = new Image();
sprites.src = './sprites.png';
const drawView = () => {
    const context2d = document.getElementById('game-canvas').getContext('2d');
    context2d.font = '14px monospace';
    context2d.clearRect(0, 0, 600, 600);
    objects.forEach(object => {
        if (object.type === consts.objectTypes.player) {
            context2d.drawImage(sprites, 0, frameIndex % 16 < 8 ? 0 : 31, 23, 31,
                object.x - 23, object.y - 31, 23 * 2, 31 * 2);
            context2d.fillStyle = 'white';
            context2d.fillText(object.hitpoints, object.x - 15, object.y - 40);
            if (player === object) {
                context2d.fillText("[YOU]", object.x - 15, object.y + 40);
            }
        } else if (object.type === consts.objectTypes.bomb
            && (object.hitpoints > 20 || frameIndex % 2 === 0)) {
            context2d.drawImage(sprites, 0, 65, 23, 19, object.x - 23, object.y - 19, 23 * 2, 19 * 2);
            context2d.fillStyle = 'white';
            context2d.fillText(object.hitpoints, object.x, object.y - 30);
        } else if (object.type === consts.objectTypes.explosion) {
            context2d.beginPath();
            context2d.arc(object.x, object.y, object.radius, 0, 2 * Math.PI);
            context2d.fillStyle = 'rgb(' + (object.hitpoints + 150) + ',' + (object.hitpoints + 100) + ',0)';
            context2d.fill();
        }
    });
};

keyHandler.addKeyMapping('ArrowLeft', {
    onDown: () => {
        if (!player) return;
        player.dx = -playerSpeed;
        sendUpdate(consts.updateTypes.movement.leftStart);
    },
    onUp: () => {
        if (!player) return;
        if (player.dx < 0) {
            player.dx = 0;
        }
        sendUpdate(consts.updateTypes.movement.leftStop);
    }
});

keyHandler.addKeyMapping('ArrowRight', {
    onDown: () => {
        if (!player) return;
        player.dx = playerSpeed;
        sendUpdate(consts.updateTypes.movement.rightStart);
    },
    onUp: () => {
        if (!player) return;
        if (player.dx > 0) {
            player.dx = 0;
        }
        sendUpdate(consts.updateTypes.movement.rightStop);
    }
});

keyHandler.addKeyMapping('ArrowUp', {
    onDown: () => {
        if (!player) return;
        player.dy = -playerSpeed;
        sendUpdate(consts.updateTypes.movement.upStart);
    },
    onUp: () => {
        if (!player) return;
        if (player.dy < 0) {
            player.dy = 0;
        }
        sendUpdate(consts.updateTypes.movement.upStop);
    }
});

keyHandler.addKeyMapping('ArrowDown', {
    onDown: () => {
        if (!player) return;
        player.dy = playerSpeed;
        sendUpdate(consts.updateTypes.movement.downStart);
    },
    onUp: () => {
        if (!player) return;
        if (player.dy > 0) {
            player.dy = 0;
        }
        sendUpdate(consts.updateTypes.movement.downStop);
    }
});

keyHandler.addKeyMapping('Space', {
    onDown: () => {
        if (!player) return;
        sendUpdate(consts.updateTypes.interaction.dropBomb);
    }
});

keyHandler.addKeyMapping('KeyR', {
    onPressed: () => {
        if (player === undefined) {
            joinGame();
        }
    }
});

const joinGame = () => {
    getJSON('/start', player => {
        uniqueId = player.uniqueId;
        globalId = player.globalId;
        if (!gameStarted) {
            gameStarted = true;
            gameLoop();
        }
    });
};

const sendUpdate = type => {
    if (frameIndex == 0) return;
    expire = Date.now() + 10000;
    postJSON('/update', { type, frameIndex, uniqueId });
};

let syncCounter = 1;
const gameLoop = () => {
    setTimeout(gameLoop, 30);
    frameIndex++;
    keyHandler.handleKeyEvents();
    if (--syncCounter === 0) {
        getJSON('/frame', frame => {
            const playerDir = player && { x: player.dx, y: player.dy }; // We have more up-to-date information so use that instead
            objects = frame.objects;
            player = objects.find(object => object.id === globalId);
            if (playerDir) {
                player.dx = playerDir.x;
                player.dy = playerDir.y;
            }
            if (objects.some(obj => obj.type === consts.objectTypes.explosion && obj.hitpoints > 50)) {
                explosionSound.play();
            }
            frameIndex = frame.frameIndex;
        });
        if (Date.now() > expire) {
            sendUpdate(consts.updateTypes.session.heartbeat);
        }
        syncCounter = 5;
    } 
    objects.forEach(object => {
        object.x += object.dx;
        object.y += object.dy;
        object.hitpoints -= object.hpReduction;
        object.hitpoints = Math.max(object.hitpoints, 0);
    });

    drawView();
};

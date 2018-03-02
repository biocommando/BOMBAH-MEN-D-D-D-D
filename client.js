const consts = module.exports;
let objects = [];
let animationIndex = 0;
const keyHandler = createKeyHandler();
const playerSpeed = consts.playerSpeed;
var sessionId;
var publicId;
var player;
let expire = Date.now() + 10000;
let gameStarted = false;
const explosionSound = createAudioPlayer('explosion');
let updateCounter = 0;

const sprites = new Image();
sprites.src = './sprites.png';
const drawView = () => {
    const context2d = document.getElementById('game-canvas').getContext('2d');
    context2d.font = '14px monospace';
    context2d.clearRect(0, 0, 600, 600);
    objects.forEach(object => {
        if (object.type === consts.objectTypes.player) {
            context2d.drawImage(sprites, 0, animationIndex % 16 < 8 ? 0 : 31, 23, 31,
                object.x - 23, object.y - 31, 23 * 2, 31 * 2);
            context2d.fillStyle = 'white';
            context2d.fillText(object.hitpoints, object.x - 15, object.y - 40);
            if (player === object) {
                context2d.fillText(`${object.name} [YOU]`, object.x - 15, object.y + 40);
            } else {
                context2d.fillText(object.name, object.x - 15, object.y + 40);
            }
        } else if (object.type === consts.objectTypes.bomb
            && (object.hitpoints > 20 || animationIndex % 2 === 0)) {
            context2d.drawImage(sprites, 0, 65, 23, 19, object.x - 23, object.y - 19, 23 * 2, 19 * 2);
            context2d.fillStyle = 'white';
            const text = object.hitpoints > 0 ? object.hitpoints : 0;
            context2d.fillText(text, object.x, object.y - 30);
        } else if (object.type === consts.objectTypes.explosion) {
            context2d.beginPath();
            const radF = object.hitpoints * 0.005 + 0.5;
            context2d.arc(object.x, object.y, object.radius * radF, 0, 2 * Math.PI);
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
    const name = getQueryParam('name');
    postJSON('./start',
        { name, oldSessionId: sessionId },
        player => {
            sessionId = player.sessionId;
            publicId = player.publicId;
            if (!gameStarted) {
                gameStarted = true;
                updateScoreBoardLoop();
                gameLoop();
            }
        }
    );
};

const updateScoreBoardLoop = () => {
    getJSON('./scores', scores => {
        const text = scores.map(record => `${record.name}: ${record.score.kills}`).join(', ');
        document.getElementById('scores').innerText = `Scores: ${text}`;
    });
    setTimeout(updateScoreBoardLoop, 1000);
};

const sendUpdate = type => {
    expire = Date.now() + consts.playerExpireMillis * 0.7;
    updateCounter++;
    postJSON('./update', { type, order: updateCounter, sessionId });
};

let syncCounter = 1;

const simulateFrame = () => {
    objects.forEach(object => {
        object.x += object.dx;
        object.y += object.dy;
        object.hitpoints -= object.hpReduction;
        //object.hitpoints = Math.max(object.hitpoints, 0);
    });
};
let playingId = 0;
const syncFrame = frame => {
    // We have more up-to-date information so use that instead
    const playerDir = player && { x: player.dx, y: player.dy };
    objects = frame.objects;
    player = objects.find(object => object.id === publicId);
    if (player && playerDir) {
        player.dx = playerDir.x;
        player.dy = playerDir.y;
    }
    const newExplosion = obj => obj.type === consts.objectTypes.explosion && obj.id !== playingId;
    if (objects.some(newExplosion)) {
        playingId = objects.find(newExplosion).id;
        explosionSound.play();
    }
};

const gameLoop = () => {
    animationIndex++;
    setTimeout(gameLoop, 30);
    keyHandler.handleKeyEvents();
    if (--syncCounter === 0) {
        getJSON('./frame', syncFrame);
        if (Date.now() > expire) {
            sendUpdate(consts.updateTypes.session.heartbeat);
        }
        syncCounter = 5;
    }
    simulateFrame();
    drawView();
};

const getQueryParam = param => {
    const found = window.location.href
        .replace(/.+\?/, '')
        .split('&')
        .map(s => s.split('='))
        .find(s => s[0] === param);
    return found && found[1];
};

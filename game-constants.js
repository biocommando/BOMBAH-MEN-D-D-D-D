module.exports = {
    playArea: {
        width: 600,
        height: 600
    },
    objectTypes: {
        player: 'player',
        bomb: 'bomb',
        explosion: 'explosion'
    },
    maxHitPoints: 100,
    updateTypes: {
        // from UI
        movement: {
            upStart: 'up',
            downStart: 'down',
            rightStart: 'right',
            leftStart: 'left',
            upStop: 'up-stop',
            downStop: 'down-stop',
            rightStop: 'right-stop',
            leftStop: 'left-stop'
        },
        interaction: {
            dropBomb: 'bomb'
        },
        session: {
            heartbeat: 'heartbeat'
        },
        // internal
        events: {
            createObject: 'create-object',
            deleteObject: 'delete-object',
            playerKilled: 'player-killed'
        }
    },
    playerSpeed: 6,
    playerReload: 50,
    hitpointReductionRates: {
        bomp: 1,
        explosion: 10
    },
    explosionRadius: 150,
    explosionDamage: 6,
    playerExpireMillis: 15000,
    frameDelay: 30,
    expirePlayersInterval: 1000
}
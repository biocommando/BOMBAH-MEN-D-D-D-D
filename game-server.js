/**
 *   API
 *   ---
 *   POST     /start
 *       {name: string, oldSessionId: string}
 *       -> {id: string}
 *   POST     /update
 *            {type: string, frameIndex: number, sessionId: string}
 *       -> {}
 *   GET      /frame
 *       -> {objects: Array, frameIndex: number}
 *   GET      /scores
 *       -> [{publicId: number, name: string, score: {kills: number}}]
 *
 *
 *   Error response:
 *   200    {error: string}
 */

const serveStatic = require('serve-static');
const connect = require('connect');
const start = require('./game-starter.js');
const updateFromUiHandler = require('./game-update-from-ui-handler');
const gameLoop = require('./game-loop');
const randomEvents = require('./random-events');

const state = {
    // Inner list of players currently playing
    players: [],
    // All game objects in existance, full state of the game
    // Safe to send to client
    objects: [],
    updates: []
};

const handleRequest = (url, method, data, res) => {
    const eq = b => url === b || url === b + '/' || url === '/' + b;
    let result = { error: 'not found' };
    // console.log(data);
    if (eq('start')) {
        const body = JSON.parse(data);
        console.log(body);
        result = start.start(state, body.name, body.oldSessionId);
    } else if (eq('update')) {
        result = updateFromUiHandler.addUpdate(state, JSON.parse(data));
        // console.log(result);
    } else if (eq('frame')) {
        result = {objects: state.objects};
    } else if (eq('scores')) {
        result = state.players.map(player => {
            return {
                publicId: player.publicId,
                name: player.name,
                score: player.score
            }
        });
    } else if (eq('state')) {
        // for debug purposes
        result = state;
    }
    res.end(JSON.stringify(result));
};

connect()
    .use(serveStatic(__dirname))
    .use('/', (req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/json' });
        const url = req.url;
        const method = req.method;
        let body = '';
        req.on('data', data => body += data);
        req.on('end', () => handleRequest(url, method, body, res));
    }).listen(3001);

gameLoop.start(state);
randomEvents.init(state);

const startGame = (onReady) => {
    getJSON('/start', data => {
        onReady(data.id);
    });
};
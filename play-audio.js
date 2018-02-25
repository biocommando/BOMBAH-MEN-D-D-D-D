function createAudioPlayer(id) {
	function playAudioElement(el)
	{
		if(el.readyState >= 4)
		el.pause();
		el.currentTime = 0;
		el.play();
	}
	var el = document.getElementById(id);
	var volume = el.getAttribute('volume');
	if(volume != undefined) el.volume = volume;
	return {play: () => playAudioElement(el)};
}

function createRandomizedAudioPlayer(ids) {
	var els = ids.map(createAudioPlayer);
	return {play: () => els[Math.floor(Math.random() * ids.length)].play()}
}

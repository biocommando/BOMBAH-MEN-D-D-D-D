function getJSON(url, onReady) {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
		   onReady(JSON.parse(xhttp.responseText));
		}
	};
	xhttp.open("GET", url, true);
	xhttp.timeout = 1000;
	xhttp.send();
}

function postJSON(url, body, onReady) {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			onReady && onReady(JSON.parse(xhttp.responseText));
		}
	};
	xhttp.open("POST", url, true);
	xhttp.timeout = 1000;
	xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	xhttp.send(JSON.stringify(body));
}

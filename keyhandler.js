function createKeyHandler() {
	var keyMapping = {};
	var oKeyHandler = {
		addKeyMapping: function (code, callbacks) {
			if (code.length && typeof code !== 'string') {
				code.forEach(c => this.addKeyMapping(c, callbacks));
				return;
			}
			keyMapping[code] = {
				callbacks,
				pressed: false,
				wasPressed: false
			};
		},
		handleKeyEvents: function () {
			for (mappingName in keyMapping) {
				var mapping = keyMapping[mappingName];
				if (mapping.pressed) {
					if (!mapping.wasPressed && mapping.callbacks.onPressed) {
						mapping.callbacks.onPressed();
					}
					if (mapping.callbacks.onDown) {
						mapping.callbacks.onDown();
					}
				} else if (mapping.wasPressed && mapping.callbacks.onUp) {
					mapping.callbacks.onUp();
				}
				mapping.wasPressed = mapping.pressed;
			}
		},
		reset: function () {
			for (mappingName in keyMapping) {
				var mapping = keyMapping[mappingName];
				mapping.pressed = false;
				mapping.wasPressed = false;
			}
		},
		clear: () => keyMapping = []
	};
	var setKey = (event, pressed) => {
		if (keyMapping[event.code] !== undefined) {
			keyMapping[event.code].pressed = pressed;
		}
	}

	document.addEventListener('keydown', event => setKey(event, true));
	document.addEventListener('keyup', event => setKey(event, false));

	return oKeyHandler;
}
(function () {
	var pressedKeys = {};

	function setKey(event, status) {
		var code = event.keyCode;
		var key;

		switch (code) {
		case 32:
			key = 'SPACE';
			break;
		case 37:
			key = 'LEFT';
			break;
		case 38:
			key = 'UP';
			break;
		case 39:
			key = 'RIGHT';
			break;
		case 40:
			key = 'DOWN';
			break;
		case 97:
			key = 'NUMPAD1';
			break;
		case 98:
			key = 'NUMPAD2';
			break;
		case 99:
			key = 'NUMPAD3';
			break;
		case 100:
			key = 'NUMPAD4';
			break;
		case 101:
			key = 'NUMPAD5';
			break;
		case 102:
			key = 'NUMPAD6';
			break;
		case 103:
			key = 'NUMPAD7';
			break;
		case 104:
			key = 'NUMPAD8';
			break;
		case 105:
			key = 'NUMPAD9';
			break;
		default:
			// Convert ASCII codes to letters
			key = String.fromCharCode(code);
		}

		pressedKeys[key] = status;
	}

	document.addEventListener('keydown', function (e) {
		e.preventDefault();
		setKey(e, true);
	});

	document.addEventListener('keyup', function (e) {
		setKey(e, false);
	});

	window.addEventListener('blur', function () {
		pressedKeys = {};
	});

	window.input = {
		isDown: function (key) {
			return pressedKeys[key.toUpperCase()];
		}
	};
})();

var Cursor = {
	x: 0,
	y: 0,

	type: 'default',
	off: false,

	returnCords: function () {
		return [Cursor.x, Cursor.y];
	},
	returnCordsOnGrid: function (size) {
		return [(Math.floor(Cursor.x / size) * size) / size, (Math.floor(Cursor.y / size) * size) / size];
	},
};

function trackCursor(event, type) {
	if (type == 'mouse') {
		var rect = c.getBoundingClientRect();
		Cursor.x = event.clientX - rect.left;
		Cursor.y = Math.floor(event.clientY - rect.top);
	} else if (type == 'touchmove') {
		if (event.touches.length == 1) {
			Cursor.x = event.targetTouches[0].pageX;
			Cursor.y = event.targetTouches[0].pageY;
		}
	} else if (type == 'touchstart') {
		if (event.touches.length == 1) {
			Cursor.x = event.changedTouches[0].pageX;
			Cursor.y = event.changedTouches[0].pageY;
		}
	}
}


function initEventHandlers() {
    // GLOBAL EVENT LISTENERS
    /* Cursor Tracking */
    c.addEventListener('mousemove', function (event) { // this  object refers to canvas object
        trackCursor(event, 'mouse');
    }, false);
    c.addEventListener('touchmove', function (event) { // this  object refers to canvas object
        event.preventDefault();
        trackCursor(event, 'touchmove');
    }, false);

    /* Click Handling */
    c.addEventListener('mousedown', function (event) {
        Cursor.pressed = true;
    }, false);
    document.addEventListener('mouseup', function (event) {
        Cursor.pressed = false;
    }, false);

    // Disable annoying default context-menu and replace with kick-ass one
    c.oncontextmenu = function () {
        // if (whatObjClick()!==null) { alert('Clicked on an Object') }
        return false;
    };

    // Disable selecting text on canvas
    c.onselectstart = function () {
        return false;
    };

    /* TouchScreen Handling */
    c.addEventListener('touchstart', function (event) {
        event.preventDefault();
        trackCursor(event, 'touchstart');
        Cursor.off = true;
        Cursor.pressed = true;
    }, false);
    c.addEventListener('touchend', function (event) {
        event.preventDefault();
        Cursor.pressed = false;
    }, false);
};

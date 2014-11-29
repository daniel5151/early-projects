function getOffsets(elem) {
	var offsetLeft = 0;
	do {
		if (!isNaN(elem.offsetLeft)) {
			offsetLeft += elem.offsetLeft;
		}
	} while (elem = elem.offsetParent);
	return offsetLeft;
}

// Track User Actions
var input = {
	cursorType: 'default',
	cursorOff: false,
	Cursor: {
		x: 0,
		y: 0,
		pressed: false,
		returnCords: function () {
			return [input.Cursor.x, input.Cursor.y];
		},
		returnCordsGrid: function (size) {
			return [(Math.floor(input.Cursor.x / size) * size) / size, (Math.floor(input.Cursor.y / size) * size) / size];
		},
	},
	trackCursor: function (event, type) {
		if (type == 'mouse') {
			var rect = canvas.getBoundingClientRect();
			input.Cursor.x = event.clientX - rect.left;
			input.Cursor.y = Math.floor(event.clientY - rect.top);
		} else if (type == 'touchmove') {
			if (event.touches.length == 1) {
				input.Cursor.x = event.targetTouches[0].pageX - getOffsets(canvas);
				input.Cursor.y = event.targetTouches[0].pageY;
			}
		} else if (type == 'touchstart') {
			if (event.touches.length == 1) {
				input.Cursor.x = event.changedTouches[0].pageX;
				input.Cursor.y = event.changedTouches[0].pageY - getOffsets(canvas);
			}
		}
	},
};

// Event Handler Shtuff
var eventHandlers = {
	initialize: function () {
		// GLOBAL EVENT LISTENERS
		/* Cursor Tracking */
		canvas.addEventListener('mousemove', function (event) { // this  object refers to canvas object
			input.trackCursor(event, 'mouse');
		}, false);
		canvas.addEventListener('touchmove', function (event) { // this  object refers to canvas object
			event.preventDefault();
			input.trackCursor(event, 'touchmove');
		}, false);



		/* Mouse Handling */
		canvas.addEventListener('mousedown', function (event) {
			input.Cursor.pressed = true;
		}, false);
		document.addEventListener('mouseup', function (event) {
			input.Cursor.pressed = false;
		}, false);

		// Disable annoying default context-menu and replace with kick-ass one
		canvas.oncontextmenu = function () {
			// if (whatObjClick()!==null) { alert('Clicked on an Object') }
			return false;
		};

		// Disable selecting text on canvas
		canvas.onselectstart = function () {
			return false;
		};

		/* TouchScreen Handling */
		canvas.addEventListener('touchstart', function (event) {
			event.preventDefault();
			input.trackCursor(event, 'touchstart');
			input.cursorOff = true;
			input.Cursor.pressed = true;
		}, false);
		canvas.addEventListener('touchend', function (event) {
			event.preventDefault();
			input.Cursor.pressed = false;
		}, false);
	}
};

$(document).keypress(function (event) {
	var keycode = (event.keyCode ? event.keyCode : event.which);
	if (keycode == '32') {
		alert('BOO!');
	}
});
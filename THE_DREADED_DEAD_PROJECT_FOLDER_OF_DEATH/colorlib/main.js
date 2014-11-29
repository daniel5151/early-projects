function getColorByHeight(height, maxHeight) {
	var heightColoring;
	var tempDistance;
	if (height>2*maxHeight/3) {
		heightColoring='rgb(255,0,0)';
	} else if (height>maxHeight/3) {
		tempDistance=Math.floor(height*255/(maxHeight/3));
		heightColoring='rgb(255,'+(255-(tempDistance % 255))+',0)';
	} else {
		tempDistance=Math.floor(height*255/(maxHeight/3));
		heightColoring='rgb('+tempDistance+',255,0)';
	}
	return heightColoring
}

var render = {};

window.onload = function () {
	render.canvasDOM = document.getElementById('canvas')
	render.ctx = render.canvasDOM.getContext('2d');
	
	initMouseHandlers(render.canvasDOM)
	
	requestAnimationFrame(update);
}

function update () {
	render.ctx.fillStyle = 'white';
	render.ctx.fillRect(0,0,render.canvasDOM.width, render.canvasDOM.height)
	
	render.ctx.beginPath();
	render.ctx.moveTo(10, 10);
	render.ctx.lineTo(input.Cursor.x, input.Cursor.y);

	render.ctx.lineWidth=10;
	render.ctx.strokeStyle='grey';
	render.ctx.stroke();

	render.ctx.lineWidth=4;
	render.ctx.strokeStyle=gradient(['rgb(0,255,0)', 'rgb(255,255,0)', 'rgb(255,0,0)'], 0, 200, lineLength(10,10,input.Cursor.x, input.Cursor.y));
	render.ctx.stroke();

	requestAnimationFrame(update);
}

function lineLength (x1,y1,x2,y2) {
	return Math.sqrt(Math.pow(x2-x1, 2)+Math.pow(y2-y1, 2));
}

function drawCircle (ctx, x,y,r,color) {
	ctx.beginPath();
	ctx.lineWidth=1;
	ctx.arc(x, y, r, 0, Math.PI * 2, false);
	ctx.closePath();
	ctx.fillStyle = color;
	ctx.fill();
	ctx.strokeStyle='black';
	ctx.stroke();
}

// INPUT LIBS
var input = { 
    Cursor:{
        x:0,
        y:0,
		isDown:false
    },
    Accelerometer:{
        ax:0,
        ay:0,
        az:0,
        cx:0,
        cy:0,
        cz:0
    }
};

function trackCursor (event, type, domElement) {
	if (type == 'mouse') {
		var rect = domElement.getBoundingClientRect();
		input.Cursor.x = event.clientX - rect.left;
		input.Cursor.y = Math.floor(event.clientY - rect.top);
	} else if (type == 'touchmove') {
		if (event.touches.length == 1) {
			input.Cursor.x = event.targetTouches[0].pageX;
			input.Cursor.y = event.targetTouches[0].pageY;
		}
	} else if (type == 'touchstart') {
		if (event.touches.length == 1) {
			input.Cursor.x = event.changedTouches[0].pageX;
			input.Cursor.y = event.changedTouches[0].pageY;
		}
	}
}

// Event Handler Shtuff
var initMouseHandlers = function (canvas) {
	// GLOBAL EVENT LISTENERS
	/* Cursor Tracking */
	canvas.addEventListener( 'mousemove', function (event) { // this  object refers to canvas object
		trackCursor(event, 'mouse', canvas);
	},false);
	canvas.addEventListener( 'touchmove', function (event) { // this  object refers to canvas object
		trackCursor(event, 'touchmove', canvas);
	},false);

	/* Accelerometer Data */
	window.ondevicemotion = function(event) {
		input.Accelerometer.ax = Math.round(event.accelerationIncludingGravity.x);
		input.Accelerometer.ay = Math.round(event.accelerationIncludingGravity.y);
		input.Accelerometer.az = Math.round(event.accelerationIncludingGravity.z);
	};

	/* Mouse Handling */
	canvas.addEventListener('mousedown', function(event) {
		input.Cursor.isDown = true;
	}, false);
	document.addEventListener('mouseup', function(event) {
		input.Cursor.isDown = false;
	}, false);

	// Disable annoying default context-menu and replace with kick-ass one
	canvas.oncontextmenu = function() {
		return false;
	};

	// Disable selecting text on canvas
	canvas.onselectstart = function () { return false; };

	/* TouchScreen Handling */
	canvas.addEventListener('touchstart', function(event) {
		trackCursor(event, 'touchstart', canvas);
		input.Cursor.isDown = true;
	}, false);
	canvas.addEventListener('touchend', function(event) {
		input.Cursor.isDown = false;
	}, false);
}
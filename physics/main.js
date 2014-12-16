// Declare global object container
var objects = {};

// Variables
var uVars = {
	debug: false,
	fps: 60,

	maxObjects: 0,

	gravity: {
		strength: 5,
		angle: 0.5 * Math.PI,
		dx: 0,
		dy: 5,
	},

	radius: 25,
	shapeColor: getRandomColor(),
	smiley: false,
	colorByHeight: false,
	colorByVelocity: false,
	showVelocityLines: false
};

// Declare global canvas
var canvas;

// Create Main Canvas
var canvasConstructor = function() {
	this.c = document.getElementById("mainCanvas");
	this.ctx = this.c.getContext("2d");
	this.resize = function() {
		this.w = document.documentElement.clientWidth;
		this.h = document.documentElement.clientHeight;
		this.c.width = this.w;
		this.c.height = this.h;
	};
};

// On Run
window.onload = function() {
	// Declare and Populate Global Canvas
	canvas = new canvasConstructor();

	// Initialize tools and selectors
	panels.initColorPicker();
	panels.initToolButtons();

	// Initialize Event Handlers
	initEventHandlers();

	// Begin
	console.log('Running...');
	
	// Initial ball
	setTimeout(function() {
		objects[0] = new shapes.Circle({
			color: uVars.shapeColor,
			x: 100,
			y: 100,
			r: 25,
			dx: randInt(0,10),
			dy: randInt(0,10),
			id: 0
		})
	}, 10);
	
	main();
};

// shim layer with setTimeout fallback
window.requestAnimFrame = (function() {
	return window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		function(callback) {
			window.setTimeout(callback, 1000 / 60);
		};
})();

var lastTime;

function main() {
	var now = Date.now();
	var dt = (now - lastTime);

	// UPDATE
	mainPhysLoop(dt)
		// RENDER
	draw.all()

	updateVars()

	lastTime = now;
	requestAnimFrame(main);
};

// Everything to do with drawing
var draw = {
	// Vars
	extraDraw: {},
	dontReDrawCanvas: false,
	backgroundGrd: function() {
		var grd = canvas.ctx.createLinearGradient(0, canvas.h, 0, 0);
		grd.addColorStop(0, "lightblue");
		grd.addColorStop(1, "white");
		return grd;
	},

	// Specialized Drawing Functions
	circle: function(x, y, r, color, selected) {
		canvas.ctx.beginPath();
		canvas.ctx.lineWidth = selected ? 3 : 1;
		canvas.ctx.arc(x, y, r, 0, Math.PI * 2, false);
		canvas.ctx.closePath();
		canvas.ctx.fillStyle = color;
		canvas.ctx.fill();
		canvas.ctx.strokeStyle = 'black';
		canvas.ctx.stroke();
	},
	writeMessage: function(message, x, y) {
		var ctx = canvas.ctx;
		canvas.ctx.font = '18pt Calibri';
		canvas.ctx.fillStyle = 'black';
		canvas.ctx.fillText(message, x, y);
	},
	velocityLine: function(x, y, dx, dy) {
		canvas.ctx.beginPath();
		canvas.ctx.moveTo(x, y);
		canvas.ctx.lineTo(x + dx, y + dy);

		canvas.ctx.lineWidth = 4;
		canvas.ctx.strokeStyle = 'black';
		canvas.ctx.stroke();

		canvas.ctx.lineWidth = 2;
		canvas.ctx.strokeStyle = getColorByVelocity(dx, dy);
		canvas.ctx.stroke();

		draw.circle(x + dx, y + dy, 5, 'black');
	},

	// Shapes
	shape: {
		circle: function(obj) {
			// self update

			// obj.smiley=uVars.smiley;
			// obj.colorByHeight=uVars.colorByHeight;
			// obj.colorByVelocity=uVars.colorByVelocity;
			obj.colorByRainbow = uVars.colorByRainbow;
			obj.showVelocityLines = uVars.showVelocityLines;

			var fillcolor;
			if (obj.colorByHeight) {
				fillcolor = getColorByHeight(obj.y);
			}
			else if (obj.colorByVelocity) {
				fillcolor = getColorByVelocity(obj.dx, obj.dy);
			}
			else if (obj.colorByRainbow) {
				fillcolor = getRandomColor();
			}
			else {
				fillcolor = obj.color;
			}

			draw.circle(obj.x, obj.y, obj.r, fillcolor, obj.selected);

			// Draw Smiley if Need Be
			if (obj.smiley) {
				// Smile
				canvas.ctx.strokeStyle = '#000000';
				canvas.ctx.lineWidth = 1;
				canvas.ctx.beginPath();
				canvas.ctx.arc(obj.x, obj.y - obj.r / 8, obj.r * 0.75, 0.2 * Math.PI, 0.8 * Math.PI, false);
				canvas.ctx.closePath();
				canvas.ctx.stroke();
				canvas.ctx.fillStyle = 'white';
				canvas.ctx.fill();

				// Left Eye
				draw.circle(obj.x - obj.r / 2, obj.y - obj.r / 4, obj.r / 8, 'white');
				draw.circle(obj.x - obj.r / 2, obj.y - obj.r / 4, obj.r / 8 / 3, 'black');

				// Right Eye
				draw.circle(obj.x + obj.r / 2, obj.y - obj.r / 4, obj.r / 8, 'white');
				draw.circle(obj.x + obj.r / 2, obj.y - obj.r / 4, obj.r / 8 / 3, 'black');
			}

			// Velocity Lines
			if (obj.showVelocityLines) {
				draw.velocityLine(obj.x, obj.y, obj.dx, obj.dy);
			}
		},
		line: function(obj) {
			canvas.ctx.beginPath();
			canvas.ctx.strokeStyle = obj.color;
			canvas.ctx.lineWidth = obj.selected ? 3 : obj.thick;
			canvas.ctx.moveTo(obj.point1.x, obj.point1.y);
			canvas.ctx.lineTo(obj.point2.x, obj.point2.y);
			canvas.ctx.closePath();
			canvas.ctx.stroke();
		}
	},

	// Common Drawing Functions
	clear: function() {
		canvas.resize();
		canvas.ctx.beginPath();
		canvas.ctx.rect(0, 0, canvas.w, canvas.h);

		canvas.ctx.fillStyle = draw.backgroundGrd();
		canvas.ctx.fill();
		canvas.ctx.lineWidth = 1;
		canvas.ctx.strokeStyle = '#000000';
		canvas.ctx.stroke();
	},
	all: function() {
		/* Trippy */
		if (!draw.dontReDrawCanvas) {
			draw.clear();
		}

		/* uVars.debug */
		if (uVars.debug) {
			draw.writeMessage('Cursor: (' + input.Cursor.x + ', ' + input.Cursor.y + ')', 10, canvas.h - 10);
		}

		/* Reverse Keys (To select things in foreground first) */
		var keys = [];
		for (var key in objects) {
			keys.unshift(key);
		}

		/* Draw All */
		for (var c = keys.length, n = 0; n < c; n++) {
			draw.shape[objects[keys[n]].type](objects[keys[n]]);
		}

		/* Execute any extra drawing functions */
		for (key in draw.extraDraw) {
			var func = draw.extraDraw[key];
			func();
		}
		draw.extraDraw = {};

		/* Cursor */
		// if (!input.cursorOff) {
		// if (input.cursorType == 'default') {
		// $('#mainCanvas').css({
		// cursor: 'none'
		// });
		// draw.circle(input.Cursor.x, input.Cursor.y, 5, 'grey');
		// }
		// if (input.cursorType == 'none') {
		// $('#mainCanvas').css({
		// cursor: 'default'
		// });
		// }
		// }
	}
};

// Physics
function phys(obj, dt) {
	// aliases, for ease of use
	var h = canvas.h;
	var w = canvas.w;

	// scalable time
	dt = dt / 75;

	if (obj.type == "circle") {
		// Gravity
		obj.dx += uVars.gravity.dx * dt;
		obj.dy += uVars.gravity.dy * dt;

		//Apply Motion
		obj.x += obj.dx * dt;
		obj.y += obj.dy * dt;

		// Collision
		if (Object.keys(objects).length > 1) {
			for (var i in objects) {
				if (objects[i].id == obj.id) {
					continue;
				}
				var distX = objects[i].x - obj.x;
				var distY = objects[i].y - obj.y;
				var dist = Math.sqrt(distX * distX + distY * distY);
				var minDist = objects[i].r + obj.r;
				if (dist < minDist) {
					var v1 = Math.sqrt(Math.pow(obj.dx, 2) + Math.pow(obj.dy, 2));
					var v2 = Math.sqrt(Math.pow(objects[i].dx, 2) + Math.pow(objects[i].dy, 2));

					var cAngle = Math.atan2(distY, distX);
					var vAngle1 = Math.atan2(obj.dy, obj.dx);
					var vAngle2 = Math.atan2(objects[i].dy, objects[i].dx);

					// console.log(cAngle/Math.PI)

					// aliases, no actual purpose aside from readability
					var m1 = obj.mass;
					var m2 = objects[i].mass;

					// These are actual textbook physics equations for perfectly elastic collision.
					obj.dx = (v1 * Math.cos(vAngle1 - cAngle) * (m1 - m2) + 2 * m2 * v2 * Math.cos(vAngle2 - cAngle)) / (m1 + m2) * Math.cos(cAngle) + v1 * Math.sin(vAngle1 - cAngle) * Math.cos(cAngle + Math.PI / 2);
					obj.dy = (v1 * Math.cos(vAngle1 - cAngle) * (m1 - m2) + 2 * m2 * v2 * Math.cos(vAngle2 - cAngle)) / (m1 + m2) * Math.sin(cAngle) + v1 * Math.sin(vAngle1 - cAngle) * Math.sin(cAngle + Math.PI / 2);
					objects[i].dx = (v2 * Math.cos(vAngle2 - cAngle) * (m2 - m1) + 2 * m1 * v1 * Math.cos(vAngle1 - cAngle)) / (m1 + m2) * Math.cos(cAngle) + v2 * Math.sin(vAngle2 - cAngle) * Math.cos(cAngle + Math.PI / 2);
					objects[i].dy = (v2 * Math.cos(vAngle2 - cAngle) * (m2 - m1) + 2 * m1 * v1 * Math.cos(vAngle1 - cAngle)) / (m1 + m2) * Math.sin(cAngle) + v2 * Math.sin(vAngle2 - cAngle) * Math.sin(cAngle + Math.PI / 2);

					// Prevents nastiness.
					var targetX = obj.x + Math.cos(cAngle) * minDist;
					var targetY = obj.y + Math.sin(cAngle) * minDist;
					var ax = (targetX - objects[i].x);
					var ay = (targetY - objects[i].y);

					// These are quasiphysics. Vestigial code left behind from a bygone era.
					// obj.dx -= ax;
					// obj.dy -= ay;
					// objects[i].dx += ax;
					// objects[i].dy += ay;

					obj.x -= ax;
					obj.y -= ay;
					//objects[i].x += ax;
					//objects[i].y += ay;

					// add a bit of "padding" to the collision, thereby making it not perfectly elastic
					obj.dx *= 0.9;
					obj.dy *= 0.9;
					objects[i].dx *= 0.9;
					objects[i].dy *= 0.9;
				}
			}

			// equations for collision with line, WIP:
			// obj.dx = v1*Math.sin(Math.PI/2 - vAngle1 - 2 (lnAngle))
			// obj.dy = v1*Math.cos(Math.PI/2 - vAngle1 - 2 (lnAngle))
		}

		//Check if Out of Bounds
		if (obj.y + obj.r > h) {
			obj.y = h - obj.r;
		}
		if (obj.y - obj.r < 0) {
			obj.y = 0 + obj.r;
		}
		if (obj.x + obj.r > w) {
			obj.x = w - obj.r;
		}
		if (obj.x - obj.r < 0) {
			obj.x = 0 + obj.r;
		}

		//Bounding Box Constraints and wall friction
		if (obj.y + obj.dy * dt + obj.r > h || obj.y + obj.dy * dt - obj.r < 0) {
			obj.dy = -obj.dy * 0.75;
			obj.dx = obj.dx * 0.99;
		}
		if (obj.x + obj.dx * dt + obj.r > w || obj.x + obj.dx * dt - obj.r < 0) {
			obj.dx = -obj.dx * 0.75;
			obj.dy = obj.dy * 0.99;
		}
	}
}

// Paused
var paused = false;

function pause() {
	paused = (paused) ? false : true;
}

function mainPhysLoop(dt) {
	if (!paused) {
		for (var key in objects) {
			if (objects[key].suspendPhysics !== true) {
				phys(objects[key], dt);
			}
		}
	} else {
		draw.extraDraw.paused = function() {
			draw.writeMessage('Paused', 0, canvas.h - 5);
		};
	}
}

// Shape Constructors
var shapes = {
	Circle: function(props) {
		// defaults
		this.type = 'circle';
		this.color = getRandomColor();
		this.id = ids;
		this.x = 100;
		this.y = 100;
		this.r = 25;
		this.dx = 0;
		this.dy = 0;
		this.density = 1; // 1 mass unit per pixelDepth by default

		this.selected = false;
		this.suspendPhysics = false;

		// customs
		for (var prop in props) {
			this[prop] = props[prop];
		}

		this.mass = Math.PI * Math.pow(this.r, 2) * this.density;

		this.smiley = uVars.smiley;
		this.colorByHeight = uVars.colorByHeight;
		this.colorByVelocity = uVars.colorByVelocity;
		this.showVelocityLines = uVars.showVelocityLines;
	},
	Line: function(props) {
		// defaults
		this.type = 'line';
		this.color = getRandomColor();
		this.thick = 2;
		this.id = ids;
		this.point1 = {
			x: 100,
			y: 100
		};
		this.point2 = {
			x: 200,
			y: 200
		};
		
		this.selected = false;

		// customs
		for (var prop in props) {
			this[prop] = props[prop];
		}
	}
};

var ids = 0;

function getNewId() {
	if (ids == uVars.maxObjects) {
		ids = 0;
	} else {
		ids += 1;
	}
	return ids;
}

// General Loop Handles
var handles = {
	mainLoopHandle: null,
	pausedHandle: null,
	toolHandle: null,
};

// Tools and Axillary tool Functions
var auxTools = {
	throwBegin: function(obj, reverse) {
		obj.suspendPhysics = true;
		tools.vars.basePos = input.Cursor;
		handles.toolHandle = setInterval(function() {
			/* Proccessing */
			if (!reverse) {
				obj.x = input.Cursor.x;
				obj.y = input.Cursor.y;
			}
			obj.dx = 0;
			obj.dy = 0;

			/* Drawing */
			draw.extraDraw.velocity = function() {
				// Velocity Line
				var ctx = canvas.ctx;
				ctx.beginPath();
				ctx.moveTo(tools.vars.basePos.x, tools.vars.basePos.y);
				ctx.lineTo(input.Cursor.x, input.Cursor.y);

				// Outline
				ctx.lineWidth = 4;
				ctx.strokeStyle = 'black';
				ctx.stroke();

				// Colouring to match Final Velocity
				var velocityColoring;
				var shotDistance = lineDistance(input.Cursor, tools.vars.basePos);
				if (shotDistance > 750) {
					velocityColoring = 'rgb(255,0,0)';
				} else if (shotDistance > 400) {
					shotDistance = Math.floor(shotDistance * 255 / 400);
					velocityColoring = 'rgb(255,' + (255 - (shotDistance % 255)) + ',0)';
				} else {
					shotDistance = Math.floor(shotDistance * 255 / 400);
					velocityColoring = 'rgb(' + shotDistance + ',255,0)';
				}

				// Inline
				ctx.lineWidth = 2;
				ctx.strokeStyle = velocityColoring;
				ctx.stroke();

				// Pointer
				if (reverse) {
					draw.circle(input.Cursor.x, input.Cursor.y, 5, 'black');
				}
				else {
					draw.circle(tools.vars.basePos.x, tools.vars.basePos.y, 5, 'black');
				}
			};
		}, 1);
	},
	throwEnd: function(obj, reverse) {
		obj.suspendPhysics = false;
		tools.vars.finalPos = input.Cursor;
		obj.dx = (reverse) ? (tools.vars.finalPos.x - tools.vars.basePos.x) / 5 : (tools.vars.basePos.x - tools.vars.finalPos.x) / 5;
		obj.dy = (reverse) ? (tools.vars.finalPos.y - tools.vars.basePos.y) / 5 : (tools.vars.basePos.y - tools.vars.finalPos.y) / 5;
		tools.vars.basePos = {};
		tools.vars.finalPos = {};
	}
};
var tools = {
	vars: {
		currToolNew: 'tool_spawn_slingshot',
		currTool: 'tool_spawn_slingshot',

		basePos: {},
		finalPos: {},
		offCentrePos: {}
	},
	
	/////////////////////////////////////////////////////
	tool_delete: {
		name: 'tool_delete',
		description: 'Delete',
		worksOn:['circle','line'],
		onStart: function(selectedObj) {
			delete objects[selectedObj.id]
		},
		onEnd: function() {
			// N/A
		},
	},
	/////////////////////////////////////////////////////
	tool_spawn: {
		name: 'tool_spawn',
		description: 'Spawn Ball',
		onStart: function() {
			handles.toolHandle = setInterval(function() {
				getNewId()
				objects[ids] = new shapes.Circle({
					color: uVars.shapeColor,
					x: input.Cursor.x,
					y: input.Cursor.y,
					r: uVars.radius
				});
			}, 50);
		},
		onEnd: function() {
			clearInterval(handles.toolHandle);
			handles.toolHandle = null;
		},
	},
	/////////////////////////////////////////////////////
	tool_spawn_slingshot: {
		name: 'tool_spawn_slingshot',
		description: 'Spawn Ball + Slingshot',
		onStart: function() {
			if (handles.toolHandle === null) { // Throw only once
				getNewId()
				objects[ids] = new shapes.Circle({
					color: uVars.shapeColor,
					x: input.Cursor.x,
					y: input.Cursor.y,
					r: uVars.radius
				});
				objects[ids].selected = true;
				auxTools.throwBegin(objects[ids], false);
			}
		},
		onEnd: function() {
			if (handles.toolHandle !== null) { // Not to throw again
				auxTools.throwEnd(objects[ids], false);
				objects[ids].selected = false;

				clearInterval(handles.toolHandle);
				handles.toolHandle = null;
			}
		}
	},
	/////////////////////////////////////////////////////
	tool_slingshot: {
		name: 'tool_slingshot',
		description: 'Slingshot',
		worksOn: ['circle'],
		onStart: function(selectedObj) {
			selectedObj.selected = true;
			if (handles.toolHandle === null) { // Throw only once
				auxTools.throwBegin(selectedObj, false);
			}
		},
		onEnd: function(selectedObj) {
			if (handles.toolHandle !== null) { // Not to throw again
				auxTools.throwEnd(selectedObj, false);
				selectedObj.selected = false;
				clearInterval(handles.toolHandle);
				handles.toolHandle = null;
			}
		}
	},
	/////////////////////////////////////////////////////
	tool_reverse_slingshot: {
		name: 'tool_reverse_slingshot',
		description: 'Reverse Slingshot',
		worksOn: ['circle'],
		onStart: function(selectedObj) {
			selectedObj.selected = true;
			if (handles.toolHandle === null) { // Throw only once
				auxTools.throwBegin(selectedObj, true);
			}
		},
		onEnd: function(selectedObj) {
			if (handles.toolHandle !== null) { // Not to throw again
				auxTools.throwEnd(selectedObj, true);
				selectedObj.selected = false;
				clearInterval(handles.toolHandle);
				handles.toolHandle = null;
			}
		}
	},
	/////////////////////////////////////////////////////
	tool_move: {
		name: 'tool_move',
		description: 'Move',
		worksOn: ['circle','line'],
		onStart: function(selectedObj) {
			if (handles.toolHandle === null) {
				selectedObj.selected = true;
				selectedObj.suspendPhysics = true;
				
				if (selectedObj.type=='circle') {
					tools.vars.offCentrePos = {
						x: input.Cursor.x - selectedObj.x,
						y: input.Cursor.y - selectedObj.y
					}
					
					handles.toolHandle = setInterval(function() {
						selectedObj.x = input.Cursor.x - tools.vars.offCentrePos.x;
						selectedObj.y = input.Cursor.y - tools.vars.offCentrePos.y;
						selectedObj.dx = 0;
						selectedObj.dy = 0;
					}, 10);
				} else if (selectedObj.type=='line') {
					var midpoint = {
						x:(selectedObj.point1.x+selectedObj.point2.x)/2,
						y:(selectedObj.point1.y+selectedObj.point2.y)/2
					}
					var midToX = (selectedObj.point1.x-selectedObj.point2.x)/2;
					var midToY = (selectedObj.point1.y-selectedObj.point2.y)/2;
					
					tools.vars.offCentrePos = {
						x: input.Cursor.x - midpoint.x,
						y: input.Cursor.y - midpoint.y
					}
					
					handles.toolHandle = setInterval(function() {
						midpoint.x = input.Cursor.x - tools.vars.offCentrePos.x;
						midpoint.y = input.Cursor.y - tools.vars.offCentrePos.y;
						
						selectedObj.point1.x = input.Cursor.x - midToX;
						selectedObj.point1.y = input.Cursor.y - midToY;
						selectedObj.point2.x = input.Cursor.x + midToX;
						selectedObj.point2.y = input.Cursor.y + midToY;
					}, 10);
				}
			}
		},
		onEnd: function(selectedObj) {
			if (handles.toolHandle !== null) {
				selectedObj.selected = false;
				selectedObj.suspendPhysics = false;
				clearInterval(handles.toolHandle);
				handles.toolHandle = null;
			}
		}
	},
	/////////////////////////////////////////////////////
	tool_drag: {
		name: 'tool_drag',
		description: 'Drag',
		worksOn: ['circle'],
		onStart: function(selectedObj) {
			if (handles.toolHandle === null) {
				selectedObj.selected = true;

				tools.vars.offCentrePos = {
					x: input.Cursor.x - selectedObj.x,
					y: input.Cursor.y - selectedObj.y
				};
				handles.toolHandle = setInterval(function() {
					/* Processing */
					tools.vars.finalPos = {
						x: input.Cursor.x - tools.vars.offCentrePos.x,
						y: input.Cursor.y - tools.vars.offCentrePos.y
					};
					selectedObj.dx = (tools.vars.finalPos.x - selectedObj.x) / 3;
					selectedObj.dy = (tools.vars.finalPos.y - selectedObj.y) / 3;

					/* Drawing */
					draw.extraDraw.drag = function() {
						// Drag Line
						var ctx = canvas.ctx;
						ctx.beginPath();
						ctx.moveTo(input.Cursor.x, input.Cursor.y);
						ctx.lineWidth = 2;
						ctx.lineTo(selectedObj.x + tools.vars.offCentrePos.x, selectedObj.y + tools.vars.offCentrePos.y);
						ctx.strokeStyle = 'red';
						ctx.stroke();
					};
				}, 1);
			}
		},
		onEnd: function(selectedObj) {
			if (handles.toolHandle !== null) {
				selectedObj.selected = false;
				clearInterval(handles.toolHandle);
				handles.toolHandle = null;
			}
		}
	},
	/////////////////////////////////////////////////////
	tool_explode: {
		name: 'tool_explode',
		description: 'Explode',
		worksOn: ['circle'],
		onStart: function(selectedObj) {
			for (var i = 2; i < randInt(7, 3); i++) {
				getNewId()
				objects[ids] = new shapes.Circle({
					color: selectedObj.color,
					x: selectedObj.x,
					y: selectedObj.y,
					r: randInt(selectedObj.r, 5),
					dx: randInt(50, -50),
					dy: randInt(50, -50)
				});

				objects[selectedObj.id] = new shapes.Circle({
					color: selectedObj.color,
					x: selectedObj.x - selectedObj.r / 2,
					y: selectedObj.y,
					r: selectedObj.r / 2,
					id: selectedObj.id,
					dx: -10
				});
			}
		},
		onEnd: function() {
			// NULL
		},
	},
	/////////////////////////////////////////////////////
	tool_spawn_line: {
		name: 'tool_spawn_line',
		description: 'Make a line - WIP',
		onStart: function() {
			if (handles.toolHandle === null) { // Throw only once
				tools.vars.basePos = input.Cursor;
				getNewId()
				objects[ids] = new shapes.Line({
					color: uVars.shapeColor,
					point1: tools.vars.basePos,
					point2: input.Cursor
				});
				objects[ids].selected = true;
				handles.toolHandle = setInterval(function() {
					objects[ids].point2 = input.Cursor;
				}, 10)
			}
		},
		onEnd: function() {
			if (handles.toolHandle !== null) { // Not to throw again
				objects[ids].selected = false;

				clearInterval(handles.toolHandle);
				handles.toolHandle = null;
			}
		}
	},
	/////////////////////////////////////////////////////
	tool_info_panel: {
		name: 'tool_info_panel',
		description: 'Info Panel',
		onStart: function(selectedObj) {
			if (handles.toolHandle === null) {
				selectedObj.selected = true;
				handles.toolHandle = setInterval(function() {
					draw.extraDraw.info = function() {
						var line = 0;
						for (var prop in selectedObj) {
							draw.writeMessage(prop + ': ' + selectedObj[prop], input.Cursor.x + 10, input.Cursor.y + line);
							line += 18;
						}
					};
				}, 1000 / uVars.fps);
			}
		},
		onEnd: function(selectedObj) {
			if (handles.toolHandle !== null) {
				selectedObj.selected = false;
				clearInterval(handles.toolHandle);
				handles.toolHandle = null;
			}
		}
	},
};

// Event Handler Shtuff
function initEventHandlers() {
	// GLOBAL EVENT LISTENERS
	/* Cursor Tracking */
	document.addEventListener('mousemove', function(event) { // this  object refers to canvas object
		input.trackCursor(event, 'mouse');
	}, false);
	document.addEventListener('touchmove', function(event) { // this  object refers to canvas object
		input.trackCursor(event, 'touchmove');
	}, false);

	/* Accelerometer Data */
	window.ondevicemotion = function(event) {
		input.Accelerometer.ax = Math.round(event.accelerationIncludingGravity.x);
		input.Accelerometer.ay = Math.round(event.accelerationIncludingGravity.y);
		input.Accelerometer.az = Math.round(event.accelerationIncludingGravity.z);
	};

	/* Mouse Handling */
	canvas.c.addEventListener('mousedown', function(event) {
		userInteract.onDown(event);
	}, false);
	document.addEventListener('mouseup', function(event) {
		userInteract.onUp(event);
	}, false);

	// Disable annoying default context-menu and replace with a kick-ass one
	canvas.c.oncontextmenu = function() {
		// if (whatObjClick()!==null) { alert('Clicked on an Object') }
		return false;
	};

	// Disable selecting text on canvas
	canvas.c.onselectstart = function() {
		return false;
	};

	/* TouchScreen Handling */
	canvas.c.addEventListener('touchstart', function(event) {
		if (!panels.inSettings || !panels.inTools) {
			event.preventDefault();
		}
		input.trackCursor(event, 'touchstart');
		input.cursorOff = true;
		userInteract.onDown(event);
	}, false);
	canvas.c.addEventListener('touchend', function(event) {
		if (!panels.inSettings || !panels.inTools) {
			event.preventDefault();
		}
		userInteract.onUp(event);
	}, false);
}

// Call tools on user interact
var userInteract = {
	onDown: function() {
		this.selectedObj = whatObjClick();
			if (tools[tools.vars.currTool].hasOwnProperty('worksOn')) {
			if (this.selectedObj !== null) {
				for (var i=0; i<tools[tools.vars.currTool].worksOn.length; i++) {
					if (tools[tools.vars.currTool].worksOn[i]==this.selectedObj.type) {
						tools[tools.vars.currTool].onStart(this.selectedObj);
					}
				}
			}
		} else {
			tools[tools.vars.currTool].onStart(this.selectedObj);
		}
	},
	onUp: function() {
		tools[tools.vars.currTool].onEnd(this.selectedObj);
	}
};

// Return what object has been clicked
function whatObjClick() {
	for (var key in objects) {
		if (checkClick(objects[key])) {
			return objects[key];
		}
	}
	return null;
}

function checkClick(obj) {
	if (obj.type == "circle") {
		// Math SUUUCKS, Let's use built in functions! WOO!
		canvas.ctx.beginPath();
		canvas.ctx.arc(obj.x, obj.y, obj.r, 0, Math.PI * 2, false);
		canvas.ctx.closePath();
		return (canvas.ctx.isPointInPath(input.Cursor.x, input.Cursor.y)) ? true : false;
	} else if (obj.type == "line") {
		// And then, unavoidable math. Yay.
		if (distanceFromLineSegment(obj.point1, obj.point2, input.Cursor) < obj.thick+5) { 
			return true;
		} else {
			return false;
		}
	}
}

function distanceFromLineSegment (point1, point2, testPoint) {
	var lineLength = lineDistance(point1, point2)
	var distStartPoint = lineDistance(input.Cursor, point1)
	var distEndPoint = lineDistance(input.Cursor, point2)
	
	if (Math.pow(distEndPoint,2) > Math.pow(distStartPoint,2) + Math.pow(lineLength,2)) {
		return distStartPoint
	} else if (Math.pow(distStartPoint,2) > Math.pow(distEndPoint,2) + Math.pow(lineLength,2)) {
		return distEndPoint
	} else {
		// Heron's formula to find "height" of triangle composed of line segment, and lines connecting
		// each end point with the cursor.
		var s = (distStartPoint+distEndPoint+lineLength)/2
		var distToLine = 2/lineLength * Math.sqrt(s*(s-distStartPoint)*(s-distEndPoint)*(s-lineLength))
		return distToLine;
	}

}

// Track User Actions
var input = {
	cursorType: 'default',
	cursorOff: false,
	Cursor: {
		x: 0,
		y: 0
	},
	Accelerometer: {
		ax: 0,
		ay: 0,
		az: 0,
		cx: 0,
		cy: 0,
		cz: 0
	},
	trackCursor: function(event, type) {
		if (type == 'mouse') {
			var rect = canvas.c.getBoundingClientRect();
			input.Cursor = {
				x: event.clientX - rect.left,
				y: Math.floor(event.clientY - rect.top)
			};
		} else {
			if (type == 'touchmove') {
				if (event.touches.length == 1) {
					input.Cursor = {
						x: event.targetTouches[0].pageX,
						y: event.targetTouches[0].pageY
					};
				}
			} else if (type == 'touchstart') {
				if (event.touches.length == 1) {
					input.Cursor = {
						x: event.changedTouches[0].pageX,
						y: event.changedTouches[0].pageY
					};
				}
			}
			var obj = canvas.c;
			if (obj.offsetParent) {
				// Every time we find a new object, we add its offsetLeft and offsetTop to curleft and curtop.
				do {
					input.Cursor.x -= obj.offsetLeft;
					input.Cursor.y -= obj.offsetTop;
				}
				// The while loop can be "while (obj = obj.offsetParent)" only, which does return null
				// when null is passed back, but that creates a warning in some editors (i.e. VS2010).
				while ((obj = obj.offsetParent) != null);
			}
		}
	},
};

// Vars and Subs to do with the side panels
var panels = {
	inSettings: false,
	inTools: false,
	getDivPositions: function() {
		if (!this.hasOwnProperty('noPushPos')) {
			this.noPushPos = [$('form').position().left,
				$('#mainCanvas').position().left,
				$('#toolbar').position().left
			];
		}
		return [$('form').position().left,
			$('#mainCanvas').position().left,
			$('#toolbar').position().left
		];
	},
	initColorPicker: function() {
		$("#colorPicker").spectrum({
			clickoutFiresChange: true,
			preferredFormat: "hex",
			showInput: true
		});
	},
	initToolButtons: function() {
		for (var tool in tools) {
			if (tool == "vars") {
				continue
			}
			$('#toolbar').append('<a href="#"><div id=' + tools[tool].name + ' class=\'toolButton\'>' + tools[tool].description + '</div></a><br>');
		}
	},
	pushPushables: function(em) {
		if (panels.inTools && Math.abs(em) == 17) {
			em += 7;
			panels.inTools = false;
		}
		else if (panels.inSettings && Math.abs(em) == 7) {
			em += 17;
			panels.inSettings = false;
		}
		$('.pushLeft').animate({
			left: "+=" + em + "em"
		}, 500);
		$('.pushRight').animate({
			right: "-=" + em + "em"
		}, 500);
	},
};

function updateVars() {
	/* Check to open toolbars */
	document.getElementById('settings').onclick = function() {
		if (!panels.inSettings) {
			panels.pushPushables(17);
			panels.inSettings = true;
		}
		else {
			panels.pushPushables(-17);
			panels.inSettings = false;
		}
	};
	document.getElementById('tools').onclick = function() {
		if (!panels.inTools) {
			panels.pushPushables(-7);
			panels.inTools = true;
		}
		else {
			panels.pushPushables(7);
			panels.inTools = false;
		}
	};

	/* Clear Screen */
	document.getElementById('clearScreen').onclick = function() {
		objects = {};
		draw.clear();
	};

	/* Settings Vars */
	document.getElementById('pause').onclick = function() {
		pause();
	};

	draw.dontReDrawCanvas = ($('#dontReDrawCanvas').prop('checked')) ? true : false;
	if (draw.dontReDrawCanvas) {
		input.cursorType = 'none';
	}
	else {
		input.cursorType = 'default';
	}

	// Colouring
	var randomColor = ($('#randomColor').prop('checked')) ? true : false;
	uVars.shapeColor = (randomColor) ? getRandomColor() : $("#colorPicker").val();
	uVars.colorByHeight = ($('#colorByHeight').prop('checked')) ? true : false;
	uVars.colorByVelocity = ($('#colorByVelocity').prop('checked')) ? true : false;
	uVars.colorByRainbow = ($('#colorByRainbow').prop('checked')) ? true : false;

	uVars.smiley = ($('#smileyFace').prop('checked')) ? true : false;
	uVars.showVelocityLines = ($('#showVelocityLines').prop('checked')) ? true : false;

	var randomRadius = ($('#randomRadius').prop('checked')) ? true : false;
	uVars.radius = (randomRadius) ? Math.floor(Math.random() * (50 - 5) + 5) : parseInt($("#radiusSlide").val(), 10);

	uVars.debug = ($('#debug').prop('checked')) ? true : false;

	var newMaxObjects = parseInt($("#maxObjSlide").val(), 10);
	if (newMaxObjects != uVars.maxObjects) {
		ids = (uVars.maxObjects >= newMaxObjects) ? newMaxObjects : uVars.maxObjects;
		uVars.maxObjects = newMaxObjects;
		for (var key in objects) {
			if (key >= uVars.maxObjects) {
				delete objects[key];
			}
		}
	}

	/* Accelerometer and Gravity */
	var accel = ($('#accel').prop('checked')) ? true : false;
	if (accel) {
		if (accelPrompt) {
			alert('You have to manually lock your screen orientation though, ok?')
			accelPrompt = false;
		}
		if (uVars.debug) {
			draw.extraDraw.accel = function() {
				draw.writeMessage(input.Accelerometer.ax + ', ' + input.Accelerometer.ay + ', ' + input.Accelerometer.az, 10, canvas.h - 80);
				draw.writeMessage(input.Accelerometer.cx + ', ' + input.Accelerometer.cy + ', ' + input.Accelerometer.cz, 10, canvas.h - 50);
			};
		}

		document.getElementById('calibrateAccel').onclick = function() {
			input.Accelerometer.cx = input.Accelerometer.ax;
			input.Accelerometer.cy = input.Accelerometer.ay;
			input.Accelerometer.cz = input.Accelerometer.az;
		};

		var sensitivity = 10;

		if (window.innerHeight > window.innerWidth) {
			uVars.gravity.dx = -(input.Accelerometer.ax - input.Accelerometer.cx) / sensitivity;
			uVars.gravity.dy = (input.Accelerometer.ay - input.Accelerometer.cy) / sensitivity;
		} else {
			uVars.gravity.dx = (input.Accelerometer.ay - input.Accelerometer.cy) / sensitivity;
			uVars.gravity.dy = (input.Accelerometer.ax - input.Accelerometer.cx) / sensitivity;
		}
	} else {
		uVars.gravity.angle = $("#gravAngleSlide").val() * Math.PI;
		uVars.gravity.strength = $("#gravSlide").val();
		uVars.gravity.dx = Math.cos(uVars.gravity.angle) * uVars.gravity.strength;
		uVars.gravity.dy = Math.sin(uVars.gravity.angle) * uVars.gravity.strength;

		accelPrompt = true;
	}

	/* Saving the Image */
	document.getElementById('savePNG').onclick = function() {
		pause();
		window.open(canvas.c.toDataURL('image/png'));
	};

	/* Tools */
	$('#toolbar').on('click', '.toolButton', function() {
		tools.vars.currToolNew = $(this).attr('id');
	});

	if (tools.vars.currToolNew !== tools.vars.currTool) {
		$('#' + tools.vars.currTool).css('background-color', 'white');
		$('#' + tools.vars.currToolNew).css('background-color', 'lightgrey');
		tools.vars.currTool = tools.vars.currToolNew;
	}
}

var accelPrompt;

$(document).keypress(function(event) {
	var keycode = (event.keyCode ? event.keyCode : event.which);
	if (keycode == '32') {
		pause();
	}
});

// $(window).blur(function(){
// pause()
// });
// $(window).focus(function(){
// pause()
// });

// UTILITY FUNCTIONS
function getRandomColor() {
	var letters = '0123456789ABCDEF'.split('');
	var color = '#';
	for (var i = 0; i < 6; i++) {
		color += letters[Math.round(Math.random() * 15)];
	}
	return color;
}

function lineDistance(point1, point2) {
	var xs = 0;
	var ys = 0;

	xs = point2.x - point1.x;
	xs = xs * xs;

	ys = point2.y - point1.y;
	ys = ys * ys;

	return Math.sqrt(xs + ys);
}

function randInt(max, min) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

getColorByHeight = function(y) {
	/* Color by Height */
	var heightColoring;
	var tempDistance;
	if (y > 2 * canvas.h / 3) {
		heightColoring = 'rgb(255,0,0)';
	} else if (y > canvas.h / 3) {
		tempDistance = Math.floor(y * 255 / (canvas.h / 3));
		heightColoring = 'rgb(255,' + (255 - (tempDistance % 255)) + ',0)';
	} else {
		tempDistance = Math.floor(y * 255 / (canvas.h / 3));
		heightColoring = 'rgb(' + tempDistance + ',255,0)';
	}
	return heightColoring;
};
getColorByVelocity = function(dx, dy) {
	/* Color by Height */
	var velocityColoring;
	var tempVelocity = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
	if (tempVelocity > 200) {
		velocityColoring = 'rgb(255,0,0)';
	} else if (tempVelocity > 100) {
		tempVelocity = Math.floor(tempVelocity * 255 / (100));
		velocityColoring = 'rgb(255,' + (255 - (tempVelocity % 255)) + ',0)';
	} else {
		tempVelocity = Math.floor(tempVelocity * 255 / (100));
		velocityColoring = 'rgb(' + tempVelocity + ',255,0)';
	}
	return velocityColoring;
};
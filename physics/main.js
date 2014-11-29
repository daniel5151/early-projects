// General Loop Handles
var handles = {
    mainLoopHandle:null,
    pausedHandle:null,
    toolHandle:null,
};

// Declare global object container
var ids = 1;
var objects = {};

// Variables
var uVars = {
    debug:false,
    fps:60,

    maxObjects:10,

    gravity:{
        strength:5,
        angle:0.5*Math.PI,
        dx:0,
        dy:5,
    },
    simSpeed:1,

    radius:25,
    shapeColor:getRandomColor(),
    smiley:false,
    colorByHeight:false,
    colorByVelocity:false,
    showVelocityLines:false
};

// Declare global canvas
var canvas={};

// Create Main Canvas
var canvasConstructor = function () {
    this.c = document.getElementById("mainCanvas");
    this.ctx = this.c.getContext("2d");
    this.resize=function(){
        this.w = document.documentElement.clientWidth;
        this.h = document.documentElement.clientHeight;
        this.c.width = this.w;
        this.c.height = this.h;
    };
};

// On Run
window.onload = function(){
    // Declare and Populate Global Canvas
    canvas = new canvasConstructor();

	// Initialize tools and selectors
    panels.initColorPicker();
	panels.initToolButtons();

    // Initialize Event Handlers
    eventHandlers.initialize();

    // Clear screen
	draw.clear();

    // Begin
	console.log('newTest');
	objects['0'] = new shapes.Circle({color:uVars.shapeColor, x:100, y:100, r:uVars.radius, dx:10, dy:5, id:0});
	
	main();
};

// shim layer with setTimeout fallback
window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function (callback) {
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
    extraDraw:{},
    dontReDrawCanvas:false,
    backgroundGrd:function(){
        var grd = canvas.ctx.createLinearGradient(0,canvas.h,0,0);
        grd.addColorStop(0,"lightblue");
        grd.addColorStop(1,"white");
        return grd;
    },

    // Specialized Drawing Functions
    circle:function (x,y,r,color) {
        var ctx=canvas.ctx;
        ctx.beginPath();
        ctx.lineWidth=1;
        ctx.arc(x, y, r, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle='black';
        ctx.stroke();
    },
    writeMessage:function (message, x, y) {
		var ctx = canvas.ctx;
        ctx.font = '18pt Calibri';
		ctx.fillStyle = 'black';
		ctx.fillText(message, x, y);
	},

    // Common Drawing Functions
    clear:function () {
		canvas.resize();
		var ctx = canvas.ctx;
		// ctx.beginPath();
		// ctx.rect(0, 0, canvas.w, canvas.h);

		// ctx.fillStyle=draw.backgroundGrd();
		// ctx.fill();
		// ctx.lineWidth = 1;
		// ctx.strokeStyle = '#000000';
		// ctx.stroke();
	},
    all:function () {
		/* Trippy */
		if (!draw.dontReDrawCanvas) { draw.clear(); }

		/* uVars.debug */
		if (uVars.debug) {draw.writeMessage('Cursor: (' + input.Cursor.x + ', ' + input.Cursor.y + ')', 10, canvas.h-10);}

		/* Reverse Keys (To select things in foreground first) */
		var keys = [];
		for (var key in objects) { keys.unshift(key); }

		/* Draw All */
		for (var c = keys.length, n = 0; n < c; n++) {
			objects[keys[n]].draw();
		}

		/* Execute any extra drawing functions */
		for (key in draw.extraDraw) {
			var func = draw.extraDraw[key];
			func();
		}
		draw.extraDraw={};

		/* Cursor */
		if (!input.cursorOff) {
			if (input.cursorType=='default') { $('#mainCanvas').css({cursor:'none'}); draw.circle(input.Cursor.x, input.Cursor.y, 5, 'grey'); }
			if (input.cursorType=='none') { $('#mainCanvas').css({cursor:'default'}); }
		}
	}
};

// Physics
function circlePhys (obj,dt) {
    var h = canvas.h;
    var w = canvas.w;
	
	dt = dt/75*uVars.simSpeed
	
    //Apply Motion
    obj.x+=obj.dx*dt;
    obj.y+=obj.dy*dt;

	// Collision
	if (true) {
	for (var i in objects) {
		var distX = objects[i].x - obj.x;
		var distY = objects[i].y - obj.y;
		var dist = Math.sqrt(distX*distX + distY*distY);
		var minDist = objects[i].r + obj.r;
		if (dist < minDist) {
			var dx1i=obj.dx
			var dy1i=obj.dy
			
			var angle = Math.atan2(distY, distX);
			var targetX = obj.x + Math.cos(angle) * minDist;
			var targetY = obj.y + Math.sin(angle) * minDist;
			var ax = (targetX - objects[i].x);
			var ay = (targetY - objects[i].y);
			
			// These are actual textbook physics equations.
			// obj.dx = (((obj.mass-objects[i].mass)/(obj.mass+objects[i].mass))*obj.dx+(2*objects[i].mass/(obj.mass+objects[i].mass))*objects[i].dx);
			// obj.dy = (((obj.mass-objects[i].mass)/(obj.mass+objects[i].mass))*obj.dy+(2*objects[i].mass/(obj.mass+objects[i].mass))*objects[i].dy);
			// objects[i].dx = (((objects[i].mass-obj.mass)/(objects[i].mass+obj.mass))*objects[i].dx+(2*obj.mass/(objects[i].mass+obj.mass))*dx1i);
			// objects[i].dy = (((objects[i].mass-obj.mass)/(objects[i].mass+obj.mass))*objects[i].dy+(2*obj.mass/(objects[i].mass+obj.mass))*dy1i);
			
			// These are quasiphysics.
			obj.dx -= ax;
			obj.dy -= ay;
			objects[i].dx += ax;
			objects[i].dy += ay;
			
			obj.x -= ax;
			obj.y -= ay;
			objects[i].x += ax;
			objects[i].y += ay;
		}
    }
	}
	
    //Check if Out of Bounds
    if (obj.y+obj.r > h) { obj.y=h-obj.r; }
    if (obj.y-obj.r < 0) { obj.y=0+obj.r; }
    if (obj.x+obj.r > w) { obj.x=w-obj.r; }
    if (obj.x-obj.r < 0) { obj.x=0+obj.r; }

    //Bounding Box Constraints and wall friction
    if (obj.y + obj.dy*dt + obj.r > h || obj.y + obj.dy*dt - obj.r < 0){ obj.dy = -obj.dy*0.5; obj.dx = obj.dx*0.95;}
    if (obj.x + obj.dx*dt + obj.r > w || obj.x + obj.dx*dt - obj.r < 0){ obj.dx = -obj.dx*0.5; obj.dy = obj.dy*0.95;}

    // Gravity
    obj.dx+=uVars.gravity.dx*dt;
    obj.dy+=uVars.gravity.dy*dt;
	
    // Store Coordinates
    obj.prevCords.push([obj.x, obj.y]);
    obj.prevCords.shift();
}

// Paused
var paused = false;
function pause () {
	paused=(paused)?false:true;
}

function mainPhysLoop (dt) {
    if (!paused) {
        for (var key in objects) {
            if (objects[key].suspendPhysics!==true) {
                circlePhys(objects[key],dt);
            }
        }
    } else {
        draw.extraDraw.paused=function () {
            draw.writeMessage('Paused', 0, canvas.h-5);
        };
    }
}

// Shape Constructors
var shapes = {
    Circle:function (props) {
		// defaults
        this.type='circle';
		this.color='grey';
		this.x=100;
		this.y=100;
		this.r=25;
		this.dx=0;
		this.dy=0;
		this.friction=0.5;
		this.prevCords=[[0,0],[1,1],[2,2]];
		this.id=0;
		this.selected=false;
		this.suspendPhysics=false;

        // customs
        for (var prop in props) {
            this[prop]=props[prop];
        }
		
		this.density = 1; // 1 mass unit per pixelDepth
		this.mass = Math.PI*Math.pow(this.r, 2)*this.density;
		
        this.smiley=uVars.smiley;
        this.colorByHeight=uVars.colorByHeight;
		this.colorByVelocity=uVars.colorByVelocity;
        this.showVelocityLines=uVars.showVelocityLines;

		this.getColorByHeight=function () {
			/* Color by Height */
			var heightColoring;
			var tempDistance;
			if (this.y>2*canvas.h/3) {
				heightColoring='rgb(255,0,0)';
			} else if (this.y>canvas.h/3) {
				tempDistance=Math.floor(this.y*255/(canvas.h/3));
				heightColoring='rgb(255,'+(255-(tempDistance % 255))+',0)';
			} else {
				tempDistance=Math.floor(this.y*255/(canvas.h/3));
				heightColoring='rgb('+tempDistance+',255,0)';
			}
			return heightColoring;
		};
		this.getColorByVelocity=function () {
			/* Color by Height */
			var velocityColoring;
			var tempVelocity=Math.sqrt(Math.pow(this.dx, 2)+Math.pow(this.dy, 2));
			if (tempVelocity>200) {
				velocityColoring='rgb(255,0,0)';
			} else if (tempVelocity>100) {
				tempVelocity=Math.floor(tempVelocity*255/(100));
				velocityColoring='rgb(255,'+(255-(tempVelocity % 255))+',0)';
			} else {
				tempVelocity=Math.floor(tempVelocity*255/(100));
				velocityColoring='rgb('+tempVelocity+',255,0)';
			}
			return velocityColoring;
		};

		this.drawVelocityLine=function () {
			canvas.ctx.beginPath();
			canvas.ctx.moveTo(this.x, this.y);
			canvas.ctx.lineTo(this.x+this.dx, this.y+this.dy);

			canvas.ctx.lineWidth=4;
			canvas.ctx.strokeStyle='black';
			canvas.ctx.stroke();

			canvas.ctx.lineWidth=2;
			canvas.ctx.strokeStyle=this.getColorByVelocity();
			canvas.ctx.stroke();

			draw.circle(this.x+this.dx, this.y+this.dy, 5, 'black');
		};

		this.draw=function () {
			// self update
			this.smiley=uVars.smiley;
			this.colorByHeight=uVars.colorByHeight;
			this.colorByVelocity=uVars.colorByVelocity;
			this.showVelocityLines=uVars.showVelocityLines;
			this.colorByRainbow=uVars.colorByRainbow;

			// Draw Circle
            canvas.ctx.beginPath();
			canvas.ctx.strokeStyle = '#000000';
            canvas.ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, false);
			canvas.ctx.closePath();

			if (this.colorByHeight) { canvas.ctx.fillStyle = this.getColorByHeight(); }
			else if (this.colorByVelocity) { canvas.ctx.fillStyle = this.getColorByVelocity(); }
			else if (this.colorByRainbow) { canvas.ctx.fillStyle = getRandomColor(); }
			else { canvas.ctx.fillStyle = this.color; }

			canvas.ctx.fill();
			canvas.ctx.lineWidth = (this.selected) ? 3 : 1;
			canvas.ctx.stroke();

			// Draw Smiley if Need Be
            if (this.smiley) {
                // Smile
                canvas.ctx.strokeStyle = '#000000';
                canvas.ctx.lineWidth = 1;
                canvas.ctx.beginPath();
                canvas.ctx.arc(this.x,this.y-this.r/8,this.r*0.75,0.2*Math.PI,0.8*Math.PI,false);
                canvas.ctx.closePath();
                canvas.ctx.stroke();
                canvas.ctx.fillStyle = 'white';
                canvas.ctx.fill();

                // Left Eye
                draw.circle(this.x-this.r/2,this.y-this.r/4,this.r/8,'white');
                draw.circle(this.x-this.r/2,this.y-this.r/4,this.r/8/3,'black');

                // Right Eye
                draw.circle(this.x+this.r/2,this.y-this.r/4,this.r/8,'white');
                draw.circle(this.x+this.r/2,this.y-this.r/4,this.r/8/3,'black');
            }

			// Velocity Lines
			if (this.showVelocityLines) { this.drawVelocityLine(); }
		};

		this.checkClick=function () {
            canvas.ctx.beginPath();
			canvas.ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, false);
			canvas.ctx.closePath();
			return (canvas.ctx.isPointInPath(input.Cursor.x, input.Cursor.y)) ? true : false;
		};

        this.returnCords=function () {
            return [this.x, this.y];
        };
	}
};

// Vars and Subs to do with the side panels
var panels = {
    inSettings:false,
    inTools:false,
    getDivPositions:function () {
        if (!this.hasOwnProperty('noPushPos')) {
            this.noPushPos=[$('form').position().left,
                            $('#mainCanvas').position().left,
                            $('#toolbar').position().left];
        }
        return [$('form').position().left,
                $('#mainCanvas').position().left,
                $('#toolbar').position().left];
    },
    initColorPicker:function () {
        $("#colorPicker").spectrum({
            clickoutFiresChange: true,
            preferredFormat: "hex",
            showInput: true
        });
    },
    initToolButtons:function () {
        for (var tool in tools) {
            $('#toolbar').append('<a href="#"><div id='+tools[tool].name+' class=\'toolButton\'>'+tools[tool].description+'</div></a><br>');
        }
    },
    pushPushables:function (em) {
        if (panels.inTools && Math.abs(em)==17) {em+=7; panels.inTools=false;}
        else if (panels.inSettings && Math.abs(em)==7) {em+=17; panels.inSettings=false;}
        $('.pushLeft').animate({left:"+=" + em + "em"},500);
		$('.pushRight').animate({right:"-=" + em + "em"},500);
    },
};

// Tools and Axillary tool Functions
var auxTools = {
    basePos:[],
    finalPos:[],
    offCentrePos:[],

    currToolNew:'tool_spawn_slingshot',
	currTool:'tool_spawnz',

    throwBegin:function (obj, reverse) {
        obj.suspendPhysics=true;
        this.basePos=[input.Cursor.x, input.Cursor.y];
        handles.toolHandle = setInterval(function () {
            /* Proccessing */
            if (!reverse) {
                obj.x=input.Cursor.x;
                obj.y=input.Cursor.y;
            }
            obj.dx = 0;
            obj.dy = 0;

            /* Drawing */
            draw.extraDraw.velocity = function () {
                // Velocity Line
                var ctx=canvas.ctx;
                ctx.beginPath();
                ctx.moveTo(auxTools.basePos[0], auxTools.basePos[1]);
                ctx.lineTo(input.Cursor.x, input.Cursor.y);

                // Outline
                ctx.lineWidth=4;
                ctx.strokeStyle='black';
                ctx.stroke();

                // Coloring to match Final Velocity
                var velocityColoring;
                var shotDistance = lineDistance([input.Cursor.x, input.Cursor.y], auxTools.basePos);
                if (shotDistance>750) {
                    velocityColoring='rgb(255,0,0)';
                } else if (shotDistance>400) {
                    shotDistance=Math.floor(shotDistance*255/400);
                    velocityColoring='rgb(255,'+(255-(shotDistance % 255))+',0)';
                } else {
                    shotDistance=Math.floor(shotDistance*255/400);
                    velocityColoring='rgb('+shotDistance+',255,0)';
                }

                // Inline
                ctx.lineWidth=2;
                ctx.strokeStyle=velocityColoring;
                ctx.stroke();

                if (!reverse) {
                    // Pointer
                    draw.circle(auxTools.basePos[0], auxTools.basePos[1], 5, 'black');
                }
            };
        }, 1);
    },
    throwEnd:function (obj, reverse) {
        obj.suspendPhysics=false;
        this.finalPos = [input.Cursor.x, input.Cursor.y];
        obj.dx=(reverse) ? (auxTools.finalPos[0]-auxTools.basePos[0])/5 : (auxTools.basePos[0]-auxTools.finalPos[0])/5;
        obj.dy=(reverse) ? (auxTools.finalPos[1]-auxTools.basePos[1])/5 : (auxTools.basePos[1]-auxTools.finalPos[1])/5;
        this.basePos=[];
        this.finalPos=[];
    },
    drag:function (obj) {
        auxTools.offCentrePos={x:input.Cursor.x-obj.x, y:input.Cursor.y-obj.y};
        handles.toolHandle = setInterval (function() {
            /* Proccessing */
            this.finalPos = [input.Cursor.x-auxTools.offCentrePos.x, input.Cursor.y-auxTools.offCentrePos.y];
            obj.dx=(this.finalPos[0]-obj.returnCords()[0])/3;
            obj.dy=(this.finalPos[1]-obj.returnCords()[1])/3;

            /* Drawing */
            draw.extraDraw.drag = function () {
                // Drag Line
                var ctx=canvas.ctx;
                ctx.beginPath();
                ctx.moveTo(input.Cursor.x, input.Cursor.y);
                ctx.lineWidth=2;
                ctx.lineTo(obj.x+auxTools.offCentrePos.x, obj.y+auxTools.offCentrePos.y);
                ctx.strokeStyle='red';
                ctx.stroke();
            };
        },1);
    }
};
var tools={
    /////////////////////////////////////////////////////
    tool_spawn:{
        name:'tool_spawn',
        description:'Spawn',
        onStart:function () {
            handles.toolHandle = setInterval (function () {
                if (ids==uVars.maxObjects) { ids=0; }
                objects[ids] = new shapes.Circle({color:uVars.shapeColor, x:input.Cursor.x, y:input.Cursor.y, r:uVars.radius, id:ids});
                ids+=1;
            }, 50);
        },
        onEnd:function () {
            clearInterval(handles.toolHandle);
            handles.toolHandle = null;
        },
    },
    /////////////////////////////////////////////////////
    tool_spawn_slingshot:{
        name:'tool_spawn_slingshot',
        description:'Spawn + Slingshot',
        onStart:function () {
            if (handles.toolHandle === null) { // Throw only once
                if (ids==uVars.maxObjects) { ids=0; }
                objects[ids] = new shapes.Circle({color:uVars.shapeColor, x:input.Cursor.x, y:input.Cursor.y, r:uVars.radius, id:ids});
                objects[ids].selected=true;
                auxTools.throwBegin(objects[ids], false);
            }
        },
        onEnd:function () {
            if (handles.toolHandle !== null) { // Not to throw again
                auxTools.throwEnd(objects[ids], false);
                objects[ids].selected=false;

                ids+=1;
                clearInterval(handles.toolHandle);
                handles.toolHandle = null;
            }
        }
    },
    /////////////////////////////////////////////////////
    tool_slingshot:{
        name:'tool_slingshot',
        description:'Slingshot',
        onStart:function (selectedObj) {
            if (selectedObj!==null) {
                selectedObj.selected=true;
                if (handles.toolHandle === null) { // Throw only once
                    auxTools.throwBegin(selectedObj, false);
                }
            }
        },
        onEnd:function (selectedObj) {
            if (handles.toolHandle !== null) { // Not to throw again
                auxTools.throwEnd(selectedObj, false);
                selectedObj.selected=false;
                clearInterval(handles.toolHandle);
                handles.toolHandle = null;
            }
        }
    },
    /////////////////////////////////////////////////////
    tool_reverse_slingshot:{
        name:'tool_reverse_slingshot',
        description:'Reverse Slingshot',
        onStart:function (selectedObj) {
            if (selectedObj!==null) {
                selectedObj.selected=true;
                if (handles.toolHandle === null) { // Throw only once
                    auxTools.throwBegin(selectedObj, true);
                }
            }
        },
        onEnd:function (selectedObj) {
            if (handles.toolHandle !== null) { // Not to throw again
                auxTools.throwEnd(selectedObj, true);
                selectedObj.selected=false;
                clearInterval(handles.toolHandle);
                handles.toolHandle = null;
            }
        }
    },
    /////////////////////////////////////////////////////
    tool_move:{
        name:'tool_move',
        description:'Move',
        onStart:function (selectedObj) {
            if (selectedObj!==null && handles.toolHandle === null) {
                selectedObj.selected=true;
                selectedObj.suspendPhysics=true;
                auxTools.offCentrePos=[input.Cursor.x-selectedObj.x, input.Cursor.y-selectedObj.y];
                handles.toolHandle = setInterval (function() {
                    selectedObj.x=input.Cursor.x-auxTools.offCentrePos[0];
                    selectedObj.y=input.Cursor.y-auxTools.offCentrePos[1];
                    selectedObj.dx=0;
                    selectedObj.dy=0;
                },1);
            }
        },
        onEnd:function (selectedObj) {
            if (handles.toolHandle !== null) {
                if (selectedObj!==null) { selectedObj.selected=false; }
                selectedObj.suspendPhysics=false;
                clearInterval(handles.toolHandle);
                handles.toolHandle = null;
            }
        }
    },
    /////////////////////////////////////////////////////
    tool_drag:{
        name:'tool_drag',
        description:'Drag',
        onStart:function (selectedObj) {
            if (selectedObj!==null && handles.toolHandle === null) {
                selectedObj.selected=true;
                auxTools.drag(selectedObj);
            }
        },
        onEnd:function (selectedObj) {
            if (handles.toolHandle !== null) {
                if (selectedObj!==null) { selectedObj.selected=false; }
                clearInterval(handles.toolHandle);
                handles.toolHandle = null;
            }
        }
    },
    /////////////////////////////////////////////////////
    tool_explode:{
        name:'tool_explode',
        description:'Explode',
        onStart:function (selectedObj) {
            if (selectedObj!==null) {
                for (var i=2; i<randInt(7,3); i++) {
					if (ids==uVars.maxObjects) { ids=0; }
					objects[ids] = new shapes.Circle({color:selectedObj.color, x:selectedObj.x, y:selectedObj.y, r:randInt(selectedObj.r, 5), id:ids, dx:randInt(50,-50), dy:randInt(50,-50)});
					ids+=1;

					objects[selectedObj.id] = new shapes.Circle({color:selectedObj.color, x:selectedObj.x-selectedObj.r/2, y:selectedObj.y, r:selectedObj.r/2, id:selectedObj.id, dx:-10});
				}
			}
        },
        onEnd:function () {
            // NULL
        },
    },
    /////////////////////////////////////////////////////
    tool_info_panel:{
        name:'tool_info_panel',
        description:'Info Panel',
        onStart:function (selectedObj) {
            if (selectedObj!==null && handles.toolHandle === null) {
                selectedObj.selected=true;
               handles.toolHandle = setInterval (function () {
                   draw.extraDraw.info=function () {
                       var line=0;
                       for (var prop in selectedObj) {
                           if (typeof(selectedObj[prop]) != 'function') {
                               draw.writeMessage(prop + ': ' + selectedObj[prop], input.Cursor.x+10, input.Cursor.y+line);
                               line+=18;
                           }
                       }
                   };
               }, 1000/uVars.fps);
            }
        },
        onEnd:function (selectedObj) {
            if (handles.toolHandle !== null) {
                if (selectedObj!==null) { selectedObj.selected=false; }
                clearInterval(handles.toolHandle);
                handles.toolHandle = null;
            }
        }
    },
};

// Track User Actions
var input = { 
    cursorType:'default',
    cursorOff:false,
    Cursor:{
        x:0,
        y:0
    },
    Accelerometer:{
        ax:0,
        ay:0,
        az:0,
        cx:0,
        cy:0,
        cz:0
    },
    trackCursor:function (event, type) {
		if (type == 'mouse') {
			var rect = canvas.c.getBoundingClientRect();
			input.Cursor = {
				x:event.clientX - rect.left,
				y:Math.floor(event.clientY - rect.top)
			};
		} else if (type == 'touchmove') {
			if (event.touches.length == 1) {
				input.Cursor = {
					x:event.targetTouches[0].pageX,
					y:event.targetTouches[0].pageY
				};
			}
		} else if (type == 'touchstart') {
			if (event.touches.length == 1) {
				input.Cursor = {
					x:event.changedTouches[0].pageX,
					y:event.changedTouches[0].pageY
				};
			}
		}
	},
};

// Event Handler Shtuff
var eventHandlers = {
    initialize:function () {
        // GLOBAL EVENT LISTENERS
        /* Cursor Tracking */
        document.addEventListener( 'mousemove', function (event) { // this  object refers to canvas object
            input.trackCursor(event, 'mouse');
        },false);
        document.addEventListener( 'touchmove', function (event) { // this  object refers to canvas object
            if (!panels.inSettings) {event.preventDefault();}
            input.trackCursor(event, 'touchmove');
        },false);

        /* Accelerometer Data */
        window.ondevicemotion = function(event) {
            input.Accelerometer.ax = Math.round(event.accelerationIncludingGravity.x);
            input.Accelerometer.ay = Math.round(event.accelerationIncludingGravity.y);
            input.Accelerometer.az = Math.round(event.accelerationIncludingGravity.z);
        };

        /* Mouse Handling */
        canvas.c.addEventListener( 'mousedown', function (event) { userInteract.onDown(event); },false);
        document.addEventListener( 'mouseup', function (event) { userInteract.onUp(event); },false);

        // Disable annoying default context-menu and replace with kick-ass one
        canvas.c.oncontextmenu = function() {
            // if (whatObjClick()!==null) { alert('Clicked on an Object') }
            return false;
        };

        // Disable selecting text on canvas
        canvas.c.onselectstart = function () { return false; };

        /* TouchScreen Handling */
        canvas.c.addEventListener('touchstart', function(event) {
            if (!panels.inSettings || !panels.inTools) {event.preventDefault();}
            input.trackCursor(event, 'touchstart');
            input.cursorOff=true;
            userInteract.onDown(event);
        }, false);
        canvas.c.addEventListener('touchend', function(event) {
            if (!panels.inSettings || !panels.inTools) {event.preventDefault();}
            userInteract.onUp(event);
        }, false);
    }
};

function updateVars () {
    /* Check to open toolbars */
    document.getElementById('settings').onclick=function (){
        if (!panels.inSettings) { panels.pushPushables(17); panels.inSettings=true;}
        else { panels.pushPushables(-17); panels.inSettings=false; }
    };
    document.getElementById('tools').onclick=function (){
        if (!panels.inTools) { panels.pushPushables(-7); panels.inTools = true; }
        else { panels.pushPushables(7); panels.inTools = false; }
    };

    /* Clear Screen */
    document.getElementById('clearScreen').onclick=function (){ objects={}; draw.clear(); };

    /* Settings Vars */
    document.getElementById('pause').onclick=function (){
        pause();
    };

    draw.dontReDrawCanvas = ($('#dontReDrawCanvas').prop('checked')) ? true : false;
    if (draw.dontReDrawCanvas) { input.cursorType='none'; }
    else { input.cursorType='default'; }

    // Coloring
    var randomColor = ($('#randomColor').prop('checked')) ? true : false;
    uVars.shapeColor=(randomColor)?getRandomColor():$( "#colorPicker" ).val();
    uVars.colorByHeight = ($('#colorByHeight').prop('checked')) ? true : false;
    uVars.colorByVelocity = ($('#colorByVelocity').prop('checked')) ? true : false;
    uVars.colorByRainbow = ($('#colorByRainbow').prop('checked')) ? true : false;

	uVars.smiley = ($('#smileyFace').prop('checked')) ? true : false;
    uVars.showVelocityLines = ($('#showVelocityLines').prop('checked')) ? true : false;

    var randomRadius = ($('#randomRadius').prop('checked')) ? true : false;
    uVars.radius = (randomRadius)?Math.floor(Math.random() * (50 - 5) + 5):parseInt($( "#radiusSlide" ).val(),10);

    uVars.debug = ($('#debug').prop('checked')) ? true : false;

    uVars.simSpeed = parseFloat($( "#simSpeedSlide" ).val());

    var newMaxObjects = parseInt($( "#maxObjSlide" ).val(),10);
    if (newMaxObjects!=uVars.maxObjects) {
        ids=(uVars.maxObjects>=newMaxObjects)?newMaxObjects:uVars.maxObjects;
        uVars.maxObjects=newMaxObjects;
        for (var key in objects) {
                if (key>=uVars.maxObjects) {
                delete objects[key];
            }
        }
    }

    /* Accelerometer and Gravity */
    var accel = ($('#accel').prop('checked')) ? true : false;
    if (accel) {
        if (uVars.debug) {
            draw.extraDraw.accel = function () {
                draw.writeMessage(input.Accelerometer.ax+', '+input.Accelerometer.ay+', '+input.Accelerometer.az, 10, canvas.h-80);
                draw.writeMessage(input.Accelerometer.cx+', '+input.Accelerometer.cy+', '+input.Accelerometer.cz, 10, canvas.h-50);
            };
        }

        document.getElementById('calibrateAccel').onclick=function () {
            input.Accelerometer.cx = input.Accelerometer.ax;
            input.Accelerometer.cy = input.Accelerometer.ay;
            input.Accelerometer.cz = input.Accelerometer.az;
        };

        var sensitivity=10;

        if(window.innerHeight > window.innerWidth){
            uVars.gravity.dx=-(input.Accelerometer.ax-input.Accelerometer.cx)/sensitivity;
            uVars.gravity.dy=(input.Accelerometer.ay-input.Accelerometer.cy)/sensitivity;
        } else {
            uVars.gravity.dx=(input.Accelerometer.ay-input.Accelerometer.cy)/sensitivity;
            uVars.gravity.dy=(input.Accelerometer.ax-input.Accelerometer.cx)/sensitivity;
        }
    } else {
        uVars.gravity.angle = $( "#gravAngleSlide" ).val()*Math.PI;
        uVars.gravity.strength = $( "#gravSlide" ).val();
        uVars.gravity.dx=Math.cos(uVars.gravity.angle)*uVars.gravity.strength;
        uVars.gravity.dy=Math.sin(uVars.gravity.angle)*uVars.gravity.strength;
    }

    /* Saving the Image */
    document.getElementById('savePNG').onclick=function (){
        pause();
        window.open(canvas.c.toDataURL('image/png'));
    };

    /* Tools */
    $('#toolbar').on('click','.toolButton', function (){
        auxTools.currToolNew=$(this).attr('id');
    });

    if (auxTools.currToolNew!==auxTools.currTool) {
        $('#'+auxTools.currTool).css('background-color','white');
        $('#'+auxTools.currToolNew).css('background-color','lightgrey');
        auxTools.currTool=auxTools.currToolNew;
    }
}

// Call tools on user interact
var userInteract = {
    onDown:function () {
        this.selectedObj=whatObjClick();
        tools[auxTools.currTool].onStart(this.selectedObj);
    },
    onUp:function () {
        tools[auxTools.currTool].onEnd(this.selectedObj);
    }
};

$(document).keypress(function(event){
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if(keycode == '32'){
        pause();
    }
});

// UTILITY FUNCTIONS
function getRandomColor() { 
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.round(Math.random() * 15)];
    }
    return color;
}
function lineDistance( point1, point2 ) {
  var xs = 0;
  var ys = 0;

  xs = point2[0] - point1[0];
  xs = xs * xs;

  ys = point2[1] - point1[1];
  ys = ys * ys;

  return Math.sqrt( xs + ys );
}

// Return what object has been clicked
function whatObjClick () {
    for (var key in objects) {
        if (objects[key].checkClick()) { return objects[key]; }
    }
    return null;
}

function randInt (max, min) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
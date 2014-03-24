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
    uVars.radius = (randomRadius)?Math.floor(Math.random() * (50 - 1) + 1):parseInt($( "#radiusSlide" ).val(),10);

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
        uVars.gravity.dx=Math.cos(uVars.gravity.angle)*uVars.gravity.strength/uVars.simSpeed;
        uVars.gravity.dy=Math.sin(uVars.gravity.angle)*uVars.gravity.strength/uVars.simSpeed;
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

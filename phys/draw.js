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
		ctx.beginPath();
		ctx.rect(0, 0, canvas.w, canvas.h);

		ctx.fillStyle=draw.backgroundGrd();
		ctx.fill();
		ctx.lineWidth = 1;
		ctx.strokeStyle = '#000000';
		ctx.stroke();
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
	},

    // Other
    splash:{
        start:function () { draw.splash.handle = setInterval(function () {
            draw.extraDraw.splashScreen = function () {
                var ctx = canvas.ctx;
                ctx.fillStyle='rgba(0, 0, 0, '+draw.splash.alphaOut+')';
                draw.splash.alphaOut-=(draw.splash.alphaOut>0.005)?0.005:0;
                ctx.font = "30px Myriad Pro, sans-serif";
                ctx.fillText("Physics Thingy",(canvas.w/2)-80,35);
                ctx.font = "18px Myriad Pro, sans-serif";
                ctx.fillText("By: Daniel Prilik",(canvas.w/2)-40,60);
            };
        },1); },
        handle:null,
        alphaOut:1,
    }
};

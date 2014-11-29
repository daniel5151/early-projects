var canvas;
var ctx;
var cSize = {
    w: 300,
    h: 300,
};

function initEventHandlers() {
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
        Cursor.pressed = true;
    }, false);
    document.addEventListener('mouseup', function (event) {
        Cursor.pressed = false;
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
        Cursor.off = true;
        Cursor.pressed = true;
    }, false);
    canvas.addEventListener('touchend', function (event) {
        event.preventDefault();
        Cursor.pressed = false;
    }, false);
};

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

var input = {
    cursorType: 'default',
    cursorOff: false,
    trackCursor: function (event, type) {
        if (type == 'mouse') {
            var rect = canvas.getBoundingClientRect();
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
    },
};

function clearScreen() {
    if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        randomSpawn = true;
    }

    ctx.fillStyle = 'rgba(161,224,231,0.01)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawMessage(x, y, message, customOptions) {
    var options = {
        font: 'calibri',
        size: 18,
        color: 'black'
    };

    for (var opt in customOptions) {
        options[opt] = customOptions[opt];
    }

    ctx.font = options.size + 'pt ' + options.font;
    ctx.fillStyle = options.color;
    ctx.fillText(message, x, y);
}

// UTILITY FUNCTIONS
function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.round(Math.random() * 15)];
    }
    return color;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function Particle(x, y, r, dx, dy, color) {
    this.x = x;
    this.y = y;
    this.r = getRandomInt(4, 10);

    this.dx = getRandomInt(-4, 4);
    this.dy = getRandomInt(-4, 4);
    while (true) {
        if (this.dx == 0 || this.dy == 0) {
            this.dx = getRandomInt(-4, 4);
            this.dy = getRandomInt(-4, 4);
            break
        } else {
            break
        }
    }

    this.color = color;

    var self = this
    this.draw = function () {
//        ctx.beginPath();
//        ctx.arc(self.x, self.y, self.r, 0, Math.PI * 2, false);
//        ctx.closePath();
//        ctx.fillStyle = self.color;
//        ctx.fill();

        ctx.fillStyle = self.color;
        ctx.fillRect(self.x, self.y, self.r, self.r)
    }
}

var maxParticles = 1000;

var particles = [];

function mainLoop() {
    clearScreen()

    if (Cursor.pressed) {
        if (particles.length < maxParticles) {
            particles.push(new Particle(Cursor.x, Cursor.y, 5, 0, 0, getRandomColor()))
            if (particles.length > maxParticles - 1) {
                particles.shift();
            }
        }
    }

    for (var i = 0; i < particles.length; i++) {
        particles[i].x += particles[i].dx;
        particles[i].y += particles[i].dy;


        particles[i].draw();

        if (particles[i].x > canvas.width || particles[i].x < 0 || particles[i].y > canvas.height || particles[i].y < 0) {
            particles.splice(i, 1);
        }
    }

    drawMessage(0, canvas.height, particles.length);
}

var randomSpawn = true;
window. onkeypress = function (event) {
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if (keycode == '32') {
        randomSpawn = (randomSpawn) ? false : true;
        particles = [];
    }
};

window.onload = function () {
    canvas = document.getElementById('mainCanvas');
    ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    clearScreen();

    initEventHandlers();

    console.log("New Test")

    setInterval(mainLoop, 1000 / 60);
    setInterval(function () {
        if (particles.length < maxParticles && randomSpawn) {
            particles.push(new Particle(getRandomInt(0, canvas.width), getRandomInt(0, canvas.height), 5, 0, 0, getRandomColor()))
            if (particles.length > maxParticles - 1) {
                particles.shift();
            }
        }
    }, 10)
};
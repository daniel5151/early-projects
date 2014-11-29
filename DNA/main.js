var c;
var ctx;

function Particle(x, size, color, id, dir) {
    this.x = x;
    this.y = -CellSize;
    this.size = size;
    this.color = color;
    this.dir = dir // true for right, false for left

    this.id = id;

    var self = this;
    this.draw = function() {
        ctx.fillStyle = self.color;
        ctx.fillRect(self.x, self.y, self.size, self.size);
    }
}

// Modify This Number for lulz
var CellSize = 10;
var backgroundColor = "rgba(255, 255, 255, 1)";

var particles = {};

var ids = 0;

function update(dt) {
    var scale = 2.5;

    // Double Helix
    particles[ids] = new Particle(c.width / scale * (scale / 2) - Math.random() * 100, CellSize, "rgb(0,0,255)", ids, true);
    ids++;
    particles[ids] = new Particle(c.width / scale * (scale / 2) + Math.random() * 100, CellSize, "rgb(0,0,0)", ids, false);
    ids++;

    // Change Pos
    for (var key in particles) {
        var particle = particles[key];

        // Update Particle Position
        var distanceToSideRight = (c.width / scale * (scale - 1) - particle.x);
        var distanceToSideLeft = (particle.x - c.width / scale);
        if (particle.dir && distanceToSideRight > distanceToSideLeft) {
            particle.x += distanceToSideLeft / scale + Math.random() * 1;
        } else if (particle.dir && distanceToSideRight < distanceToSideLeft) {
            particle.x += distanceToSideRight / scale + Math.random() * 1;
        } else if (!particle.dir && distanceToSideRight > distanceToSideLeft) {
            particle.x -= distanceToSideLeft / scale + Math.random() * 1;
        } else if (!particle.dir && distanceToSideRight < distanceToSideLeft) {
            particle.x -= distanceToSideRight / scale + Math.random() * 1;
        }

        var distance = 5
        if (distanceToSideRight < distance || distanceToSideLeft < distance) {
            particle.dir = (particle.dir) ? false : true;
            particle.x = (!particle.dir) ? c.width / scale * (scale - 1) - 6 : c.width / scale + 6
        }

        particle.y += CellSize;

        // Delete if the particle goes off the screen
        if (particle.y > c.height) {
            delete particles[particle.id];
        }
    }
}

function render(dt) {
    // Clear the Screen Partially
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, c.width, c.height);

    var count = 0;

    for (var key in particles) {
        var particle = particles[key];
        particle.draw();
        count++;
    }

    //console.log(count);
}

// shim layer with setTimeout fallback
window.requestAnimFrame = (function() {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function(callback) {
            window.setTimeout(callback, 1000 / 60);
            console.log('using setTimeout')
        };
})();

var lastTime;
var coolDown = 0;

function main() {
    var now = Date.now();
    var dt = (now - lastTime) / 1000.0;

    // UPDATE
    //if (Cursor.pressed && coolDown > 1) {
        update(dt);
    //    coolDown = 0;
    //}
    // RENDER
    render(dt);

    lastTime = now;

    coolDown += 1;

    requestAnimFrame(main);
};

function init() {
    c = document.getElementById('mainCanvas');
    ctx = c.getContext('2d');

    c.width = window.innerWidth;
    c.height = window.innerHeight;

    initEventHandlers();
    main()
}

window.onload = function() {
    console.log("Run")
    init();
};

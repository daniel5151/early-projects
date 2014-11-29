var canvas;
var ctx;

function draw_message(x, y, message, customOptions) {
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

function Circle(props) {
    // defaults
    this.type = 'circle';
    this.color = 'grey';
    this.x = 100;
    this.y = 100;
    this.r = 25;
    this.dx = 0;
    this.dy = 0;
    this.friction = 0.5;
    this.prevCords = [[0, 0], [1, 1], [2, 2]];
    this.id = 0;
    this.selected = false;
    this.suspendPhysics = false;

    // customs
    for (var prop in props) {
        this[prop] = props[prop];
    }

    this.colorByVelocity = uVars.colorByVelocity;
    this.showVelocityLines = uVars.showVelocityLines;

    this.getColorByVelocity = function () {
        /* Color by Height */
        var velocityColoring;
        var tempVelocity = Math.sqrt(Math.pow(this.dx, 2) + Math.pow(this.dy, 2));
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

    this.drawVelocityLine = function () {
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.dx * 20, this.y + this.dy * 20);

        ctx.lineWidth = 4;
        ctx.strokeStyle = 'black';
        ctx.stroke();

        ctx.lineWidth = 2;
        ctx.strokeStyle = this.getColorByVelocity();
        ctx.stroke();
    };

    this.draw = function () {
        this.colorByVelocity = uVars.colorByVelocity
        this.showVelocityLines = uVars.showVelocityLines

        // Draw Circle
        ctx.beginPath();
        ctx.strokeStyle = '#000000';
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, false);
        ctx.closePath();

        if (this.colorByVelocity) {
            ctx.fillStyle = this.getColorByVelocity();
        } else {
            ctx.fillStyle = this.color;
        }

        ctx.fill();
        ctx.lineWidth = (this.selected) ? 3 : 1;
        ctx.stroke();

        // Velocity Lines
        if (this.showVelocityLines) {
            this.drawVelocityLine();
        }
    };

    this.checkClick = function (point) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, false);
        ctx.closePath();
        return (ctx.isPointInPath(point[0], point[1])) ? true : false;
    };

    this.returnCords = function () {
        return [this.x, this.y];
    };
}

function Line(xa, ya, xb, yb) {
    this.type = 'line'

    this.xa = xa;
    this.xb = xb;
    this.ya = ya;
    this.yb = yb;

    this.slope = (yb - ya) / (xb - xa)
    this.b = yb - this.slope * xb

    this.draw = function () {
        ctx.strokeStyle = 'black'
        ctx.beginPath();
        ctx.moveTo(xa, ya);
        ctx.lineTo(xb, yb);
        ctx.stroke();
    }
}

var ids = {};

function getNewEntityId(type) {
    if (ids[type] == 100 || ids[type] == null) {
        ids[type] = 0
    }
    ids[type]++;
    return ids[type];
}

var objects = {};

// Variables
var uVars = {
    debug: false,

    maxObjects: 10,

    gravity: {
        strength: 5,
        angle: 0.5 * Math.PI,
        dx: 0,
        dy: 5,
    },
    simSpeed: 1,

    radius: 25,
    shapeColor: getRandomColor(),
    colorByVelocity: false,
    showVelocityLines: true
};

function update(dt) {
    for (var object in objects) {
        var obj = objects[object]

        if (obj.type == 'circle') {
            var h = canvas.height;
            var w = canvas.width;

            message = dt;

            //Apply Motion
            obj.x += obj.dx;
            obj.y += obj.dy;

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

            //Bounding Box Constraints
            if (obj.y + obj.dy * dt + obj.r > h || obj.y + obj.dy * dt - obj.r < 0) {
                obj.dy = -obj.dy;
            }
            if (obj.x + obj.dx * dt + obj.r > w || obj.x + obj.dx * dt - obj.r < 0) {
                obj.dx = -obj.dx;
            }

            // Gravity
            //        obj.dx+=uVars.gravity.dx*dt;
            //        obj.dy+=uVars.gravity.dy*dt;

            for (var object2 in objects) {
                var line = objects[object2]
                if (line.type == 'line') {
                    for (var X = line.xa; X <= line.xb; X += (line.xb > line.xa) ? 1 : -1) {
                        if (obj.checkClick([X, line.slope * X + line.b])) {
                            obj.x = obj.prevCords[2][0]
                            obj.y = obj.prevCords[2][1]

                            var ballSlope = obj.dy / obj.dx

                            alert(obj.dx + ' ' + obj.dy + ' ' + ballSlope)

                            var newBallSlope = (ballSlope * Math.pow(line.slope, 2) - ballSlope + 2 * line.slope) / (-(Math.pow(line.slope, 2)) + 1 + 2 * line.slope * ballSlope)

                            obj.dy = Math.cos(newBallSlope) * 5
                            obj.dx = Math.sin(newBallSlope) * 5

                            if (isNaN(obj.dy) || isNaN(obj.dx)) {
                                obj.dx = 0
                                obj.dy = 5
                            }
                            if (ballSlope === Infinity || ballSlope === -Infinity) {
                                obj.dx = (ballSlope === Infinity) ? -5 : 5;
                                obj.dy = 0
                            }

                            alert(obj.dx + ' ' + obj.dy)
                        }
                    }
                }
            }

            obj.prevCords.push([obj.x, obj.y]);
            obj.prevCords.shift();

            // Round
            obj.x = Math.round(obj.x);
            obj.y = Math.round(obj.y);
        }
    }
}

function draw_circle(x, y, r, color) {
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.arc(x, y, r, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = 'black';
    ctx.stroke();
}

var message = '';

function render(dt) {
    //clear
    //    ctx.fillStyle = 'white'//    ctx.fillRect(0, 0, canvas.width, canvas.height)

    for (var object in objects) {
        var obj = objects[object]
        obj.draw()
    }

    draw_message(100, 100, message, {
        color: 'grey'
    })
}

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
    var dt = (now - lastTime) / 1000.0;

    // UPDATE
    update(dt);
    // RENDER
    render(dt);

    lastTime = now;
    requestAnimFrame(main);
};

function init() {
    canvas = document.getElementById('mainCanvas');
    ctx = canvas.getContext('2d');

    canvas.width = 500;
    canvas.height = 500;

    initEventHandlers();

    objects[getNewEntityId()] = new Circle({
        color: uVars.shapeColor,
        x: 500,
        y: 250,
        r: uVars.radius,
        dx: -5,
        dy: 0,
        id: 0
    })
    objects[getNewEntityId()] = new Line(100, 500, 100, 0)

    main()
}

$(document).ready(function () {
    console.log("Run")
    init();
});

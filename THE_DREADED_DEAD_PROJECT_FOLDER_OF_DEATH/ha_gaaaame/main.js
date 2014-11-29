var canvas;
var ctx;

function initEventHandlers() {
    // GLOBAL EVENT LISTENERS
    /* Cursor Tracking */
    canvas.addEventListener('mousemove', function (event) { // this  object refers to canvas object
        trackCursor(event, 'mouse');
    }, false);
    canvas.addEventListener('touchmove', function (event) { // this  object refers to canvas object
        event.preventDefault();
        trackCursor(event, 'touchmove');
    }, false);

    /* Click Handling */
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
        trackCursor(event, 'touchstart');
        Cursor.off = true;
        Cursor.pressed = true;
    }, false);
    canvas.addEventListener('touchend', function (event) {
        event.preventDefault();
        Cursor.pressed = false;
    }, false);
};

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

// GAME ELEMENTS
var screenRatio = 1;
var wallWidth = 64 * screenRatio;

var keyBindings = {
    p1: {
        move: {
            up: 'w',
            down: 's',
            left: 'a',
            right: 'd'
        },
        shoot: {
            up: 'i',
            down: 'k',
            left: 'j',
            right: 'l'
        }
    },
    p2: {
        move: {
            up: 'UP',
            down: 'DOWN',
            left: 'LEFT',
            right: 'RIGHT'
        },
        shoot: {
            up: 'NUMPAD8',
            down: 'NUMPAD5',
            left: 'NUMPAD4',
            right: 'NUMPAD6'
        }
    }
};

var weapons = {
    basic: {
        type: 'shooter',
        cooldown: 0.5,
        cooldownState: 1,
        damage: 1
    }
};

function Weapon(name) {
    for (var prop in weapons[name]) {
        this[prop] = weapons[name][prop]
    }
}

function Player(x, y, player) {
    this.height = 48;
    this.width = 48;
    this.x = x;
    this.y = y;
    this.dx = 0;
    this.dy = 0;
    this.speed = 12;
    this.maxSpeed = 5;
    this.deAccelRatio = 1.25;

    this.weapon = new Weapon('basic');

    this.keyBindings = keyBindings[player]

    var self = this;
    this.update = function (dt) {
        var yMovement = false
        if (input.isDown(self.keyBindings.move.down)) {
            if (self.dy < self.maxSpeed) {
                self.dy += (self.dy < 0) ? self.speed * self.deAccelRatio * dt : self.speed * dt;
                yMovement = true;
            }
        }
        if (input.isDown(self.keyBindings.move.up)) {
            if (self.dy > -self.maxSpeed) {
                self.dy -= (self.dy > 0) ? self.speed * self.deAccelRatio * dt : self.speed * dt;
                yMovement = true;
            }
        }
        if (!yMovement) {
            if (Math.floor(self.dy) == 0 || Math.ceil(self.dy) == 0) {
                self.dy = 0
            } else if (self.dy < 0) {
                self.dy += self.speed * self.deAccelRatio * dt
            } else if (self.dy > 0) {
                self.dy -= self.speed * self.deAccelRatio * dt
            }
        }

        var xMovement = false
        if (input.isDown(self.keyBindings.move.right)) {
            if (self.dx < self.maxSpeed) {
                self.dx += (self.dx < 0) ? self.speed * self.deAccelRatio * dt : self.speed * dt;
                xMovement = true;
            }
        }
        if (input.isDown(self.keyBindings.move.left)) {
            if (self.dx > -self.maxSpeed) {
                self.dx -= (self.dx > 0) ? self.speed * self.deAccelRatio * dt : self.speed * dt;
                xMovement = true;
            }
        }
        if (!xMovement) {
            if (Math.floor(self.dx) == 0 || Math.ceil(self.dx) == 0) {
                self.dx = 0
            } else if (self.dx < 0) {
                self.dx += self.speed * self.deAccelRatio * dt
            } else if (self.dx > 0) {
                self.dx -= self.speed * self.deAccelRatio * dt
            }
        }

        self.y += self.dy;
        self.x += self.dx;

        if (self.y + self.height > canvas.height - wallWidth) {
            self.dy = 0;
            self.y = canvas.height - wallWidth - self.height
        } else if (self.y < 0 + wallWidth) {
            self.dy = 0;
            self.y = 0 + wallWidth
        }

        if (self.x + self.width > canvas.width - wallWidth) {
            self.dx = 0;
            self.x = canvas.width - wallWidth - self.width
        } else if (self.x < 0 + wallWidth) {
            self.dx = 0;
            self.x = 0 + wallWidth
        }

        self.dx = Math.round(self.dx * 100) / 100
        self.dy = Math.round(self.dy * 100) / 100
        self.x = Math.round(self.x)
        self.y = Math.round(self.y)

        var bulletDx = self.dx;
        var bulletDy = self.dy;
        var shoot = false;

        if (input.isDown(self.keyBindings.shoot.down)) {
            bulletDy = 7;
            shoot = true;
        }
        if (input.isDown(self.keyBindings.shoot.up)) {
            bulletDy = -7;
            shoot = true;
        }
        if (input.isDown(self.keyBindings.shoot.right)) {
            bulletDx = 7;
            shoot = true;
        }
        if (input.isDown(self.keyBindings.shoot.left)) {
            bulletDx = -7;
            shoot = true;
        }
        if (shoot) {
            self.weapon.cooldownState += dt;

            if (self.weapon.cooldownState > self.weapon.cooldown) {
                if (self.weapon.type = 'shooter') {
                    var bulletID = getNewEntityId('bullet');
                    bullets[bulletID] = new Bullet(bulletID, self.x + self.width / 2 - 8, self.y + self.height / 3, bulletDx, bulletDy, self.weapon.damage)
                    self.weapon.cooldownState = 0;
                }
            }
        } else {
            self.weapon.cooldownState += (self.weapon.cooldownState < 1) ? dt : 0;
        }
    }

    this.color = (player == 'p2') ? 'lightgreen' : 'lightblue';
    this.render = function (ctx) {
        ctx.fillStyle = self.color;
        ctx.fillRect(self.x, self.y, self.width, self.height)
        ctx.lineWidth = 4;
        ctx.strokeStyle = 'grey';
        ctx.strokeRect(self.x, self.y, self.width, self.height)

        //DEBUG
        var line = 1;
        for (var prop in self) {
            if (typeof (self[prop]) !== 'function') {
                if (prop == 'keyBindings') {
                    line--;
                } else if (prop == 'weapon') {
                    drawMessage(self.x + self.width + 5, self.y + line * 12, prop + ': ' + self.weapon.type, {
                        size: 12
                    });
                } else {
                    drawMessage(self.x + self.width + 5, self.y + line * 12, prop + ': ' + self[prop], {
                        size: 12
                    });
                }
                line++;
            }
        }
    }
};

var ids = {};

function getNewEntityId(type) {
    if (ids[type] == 100 || ids[type] == null) {
        ids[type] = 0
    }
    ids[type]++;
    return ids[type];
}

var bullets = {};

function Bullet(id, x, y, dx, dy, damage) {
    this.id = id;

    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;

    this.width = wallWidth / 4;
    this.height = wallWidth / 4;

    this.damage = damage;

    var self = this;
    this.update = function (dt) {
        self.y += self.dy * dt * 50;
        self.x += self.dx * dt * 50;

        if (self.y + self.height > canvas.height - wallWidth) {
            self.hit();
        } else if (self.y < 0 + wallWidth) {
            self.hit();
        }

        if (self.x + self.width > canvas.width - wallWidth) {
            self.hit();
        } else if (self.x < 0 + wallWidth) {
            self.hit();
        }

        self.dx = Math.round(self.dx * 100) / 100
        self.dy = Math.round(self.dy * 100) / 100
        self.x = Math.round(self.x)
        self.y = Math.round(self.y)
    }

    this.hit = function () {
        delete bullets[self.id]
    }

    this.render = function (ctx) {
        ctx.fillStyle = 'black';
        ctx.fillRect(this.x, this.y, this.width, this.height)
        ctx.lineWidth = 4;
        ctx.strokeStyle = 'grey';
        ctx.strokeRect(this.x, this.y, this.width, this.height)
    }
}

var enemyTypes = {
    box: {
        ai: 'stationary',
        width: 32,
        height: 32,

        health: 3,
        damageMelee: 1,
    }
}

var enemys = {};

function enemy(id, x, y, type) {
    this.id = id;
    this.x = x;
    this.y = y;

    for (var prop in enemyTypes[type]) {
        this[prop] = enemyTypes[type][prop];
    }

    var self = this
    this.update = function (dt) {
        for (var bulletID in bullets) {
            var bullet = bullets[bulletID]
            if (intersects(
                self.x, self.y, self.width, self.height,
                bullet.x, bullet.y, bullet.width, bullet.height
            )) {
                self.health -= bullet.damage;
                bullet.hit();
            }
        }

        if (this.health <= 0) {
            this.kill()
        }
    }

    this.kill = function () {
        delete enemys[self.id];
    }

    this.render = function (ctx) {
        ctx.fillStyle = 'pink';
        ctx.fillRect(this.x, this.y, this.width, this.height)
        ctx.lineWidth = 4;
        ctx.strokeStyle = 'grey';
        ctx.strokeRect(this.x, this.y, this.width, this.height)
    }
}

function randomSpawnEnemy(type) {
    var width = enemyTypes[type].width
    var height = enemyTypes[type].height
    var x = getRandomInt(wallWidth, canvas.width - wallWidth - width)
    var y = getRandomInt(wallWidth, canvas.height - wallWidth - height)

    while (true) {
        if (!intersects(x, y, width, height, player.x, player.y, player.width, player.height)) {
            var enemyID = getNewEntityId('enemy');
            enemys[enemyID] = new enemy(
                enemyID,
                x,
                y,
                type
            );
            break;
        } else {
            x = getRandomInt(wallWidth, canvas.width - wallWidth - width)
            y = getRandomInt(wallWidth, canvas.height - wallWidth - height)
        }
    }
}

function update(dt) {

    player.update(dt)
    player2.update(dt)

    for (var enemyID in enemys) {
        enemys[enemyID].update(dt);
    }

    if (Object.keys(enemys).length == 0) {
        var enemyID = 123
        enemys[enemyID] = new enemy(enemyID, getRandomInt(wallWidth, canvas.width - wallWidth - 32), getRandomInt(wallWidth, canvas.height - wallWidth - 32), 'box');
    }

    for (var bulletID in bullets) {
        bullets[bulletID].update(dt);
    }
}

function render() {
    //clear
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    renderMap(ctx);
//    ctx.lineWidth = 1;
//    ctx.strokeStyle = 'black';
//    ctx.strokeRect(wallWidth, wallWidth, canvas.width - wallWidth * 2, canvas.height - wallWidth * 2)

    player.render(ctx)
    player2.render(ctx)

    for (var enemyID in enemys) {
        enemys[enemyID].render(ctx);
    }

    for (var bulletID in bullets) {
        bullets[bulletID].render(ctx);
    }
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
    render();

    lastTime = now;
    requestAnimFrame(main);
};

var player = new Player(100, 100, 'p1')
var player2 = new Player(200, 200, 'p2')

function init() {
    canvas = document.getElementById('mainCanvas');
    ctx = canvas.getContext('2d');

    var grid = [15, 9];
    var blockSize = [wallWidth, wallWidth]

    canvas.width = grid[0] * blockSize[0];
    canvas.height = grid[1] * blockSize[1];

    initEventHandlers();
    initTileSet();
    
    randomSpawnEnemy('box');

    main()
}

$(document).ready(function () {
    console.log("Run")
    resources.load([
        'game.png'
    ]);
    resources.onReady(init);
});
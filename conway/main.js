// Global canvas vars
var canvas;
var ctx;

// Grid vars
var sizes = {
    cell: 10,
    grid: [50, 50]
};
var grid = [];

// Sim Vars
var step = false;
var stepCooldown = 0;
var generation = 0;

// Input Vars
var type_one = 1;
var type_two = 0;

var paused = true;
var random

function update(dt) {
    // Get Input
    document.getElementById('pause').onclick = function () {
        paused = (paused) ? false : true;
    }
    document.getElementById('reset').onclick = function () {
        initGrid(sizes.grid[0], sizes.grid[1]);
        generation=0;
    }
    // document.getElementById('save').onclick = function () {
        // prompt('JSONified Grid',JSON.stringify(grid));
    // }
    // document.getElementById('load').onclick = function () {
        // var newGrid = JSON.parse(prompt('Paste JSON data here:'));
		
		// grid = newGrid;
    // }
    random = ($("#random").attr('checked'));
    var speed = $("#speed").val() * 0.1;
    
    // Update grid on click
    if (Cursor.pressed) {
        var click = Cursor.returnCordsOnGrid(sizes.cell)
        try {
            grid[click[1]][click[0]] = (Cursor.rightClick) ? type_two : type_one;
        } catch (err) {
            console.log(err);
        }
    }
    
    // Check whether to update grid based on speed
    if (stepCooldown < speed) {
        step = false;
        stepCooldown += dt;
    } else {
        stepCooldown = 0;
        step = true;
    }

    if (!paused && step) {
        // Due to me being lazy and not handling cells at the edge
        // of the grid, we'll just bypass that issue by only looping through cells
        // one layer inwards, and zero'ing border cells
        for (var y = 0; y < grid.length; y++) {
            for (var x = 0; x < grid[y].length; x++) {
                if (y == 0 || y == grid.length - 1) {
                    grid[y][x] = 0;
                } else if (x == 0 || x == grid[y].length - 1) {
                    grid[y][x] = 0;
                }
            }
        }
        
        // Duplicate grid as new grid
        var newGrid = $.extend(true, [], grid);
        for (var y = 1; y < grid.length - 1; y++) {
            for (var x = 1; x < grid[y].length - 1; x++) {
                var type = grid[y][x]
                // Init count var
                var surrounding = {
                    0: 0,
                    1: 0
                };
                
                // Count surrounding
                surrounding[grid[y + 1][x + 1]] += 1;
                surrounding[grid[y + 1][x]] += 1;
                surrounding[grid[y + 1][x - 1]] += 1;
                surrounding[grid[y][x + 1]] += 1;
                surrounding[grid[y][x - 1]] += 1;
                surrounding[grid[y - 1][x + 1]] += 1;
                surrounding[grid[y - 1][x]] += 1;
                surrounding[grid[y - 1][x - 1]] += 1;
                
                // Apply Rules
                if (type == 0) {
                    if (surrounding[1] === 3) {
                        newGrid[y][x] = 1;
                    }

                    if (surrounding[2] === 3) {
                        newGrid[y][x] = 2;
                    }
                } else if (type == 1) {
                    if (surrounding[1] < 2) {
                        newGrid[y][x] = 0;
                    } else if (surrounding[1] === 3 || surrounding[1] === 2) {
                        newGrid[y][x] = 1;
                    } else if (surrounding[1] > 3) {
                        newGrid[y][x] = 0;
                    }
                }
            }
        }
        // Final updates
        grid = newGrid;
        generation++;
    }
}

function render() {
    // Clear
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid render
    for (var y = 0; y < grid.length; y++) {
        for (var x = 0; x < grid[y].length; x++) {
            var type = grid[y][x];

            switch (type) {
            case 0:
                ctx.fillStyle = 'white';
                break;
            case 1:
                ctx.fillStyle = 'black';
                break;
            }
            ctx.fillRect(x * sizes.cell, y * sizes.cell, sizes.cell, sizes.cell);
        }
    }

    // Generation update
    $('#gen').html('Generation: ' + generation);
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

function initGrid(x, y) {
    // Empty array of 0's
    for (var xs = 0; xs < x; xs++) {
        grid[xs] = Array.apply(null, new Array(y)).map(Number.prototype.valueOf, 0);
    }
    
    // Randomize it maybe?
    if (random) {
        for (var y = 1; y < grid.length - 1; y++) {
            for (var x = 1; x < grid[y].length - 1; x++) {
                grid[y][x] = getRandomInt(0, 1)
            }
        }
    }
}

function init() {
    canvas = document.getElementById('mainCanvas');
    ctx = canvas.getContext('2d');

    canvas.width = sizes.cell * sizes.grid[0]
    canvas.height = sizes.cell * sizes.grid[1]

    initEventHandlers();

    initGrid(sizes.grid[0], sizes.grid[1]);
	
	grid[20][20]=1;
	grid[20][21]=1;
	grid[20][22]=1;
	grid[19][20]=1;
	grid[18][21]=1;

    main()
}

window.onload = init;
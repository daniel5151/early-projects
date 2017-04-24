// Globals
var fps = 60;

// Declare global canvas
var canvas;
var ctx;

// Drawing
function clear() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, cellSize * gridSize, cellSize * gridSize)
}

function drawCircle(x, y, r, color, selected) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

    if (selected && loopHandles.selected == undefined) {
        //Something Fancy
    }

    ctx.lineWidth = (selected) ? 6 : 0.01;
    ctx.strokeStyle = color;
    ctx.stroke();
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

function drawGrid() {
    for (var x = 0; x < gameGrid.length; x++) {
        for (var y = 0; y < gameGrid[x].length; y++) {
            var dot = gameGrid[x][y];
            drawCircle(dot.x, dot.y, dot.r, dot.color, dot.selected);
        }
    }
}

// Game
var gameGrid;
var cellSize = 50;
var gridSize = 6;

var colors = ['rgb(173, 0, 0)', 'rgb(209, 201, 0)', 'rgb(91, 206, 91)', 'rgb(91, 207, 222)', 'rgb(62, 0, 62)'];

function Dot(drawX, drawY, gridX, gridY, color) {
    this.color = color;
    this.selected = false;
    this.r = cellSize / 2 - 13;
    this.x = drawX;
    this.y = drawY;
    this.gridX = gridX;
    this.gridY = gridY;
    this.inLine = false;

    this.returnCordsGrid = function () {
        return (this.gridX + "," + this.gridY)
    };

    this.adjacentTo = function (checkDot) {
        var adjacentTo = false;
        if ((this.gridX == checkDot.gridX + 1 && this.gridY == checkDot.gridY) ||
            (this.gridX == checkDot.gridX - 1 && this.gridY == checkDot.gridY) ||
            (this.gridX == checkDot.gridX && this.gridY == checkDot.gridY + 1) ||
            (this.gridX == checkDot.gridX && this.gridY == checkDot.gridY - 1)) {
            adjacentTo = true;
        }
        return adjacentTo
    };

    this.cleared = function () {
        for (var i = 0; i < this.gridY; i++) {
            gameGrid[this.gridX][i].y += cellSize;
            gameGrid[this.gridX][i].gridY += 1;
        }
        gameGrid[this.gridX].splice(this.gridY, 1)
        gameGrid[this.gridX].unshift(new Dot(this.x, cellSize / 2, this.gridX, 0, colors[getRandomInt(0, colors.length - 1)]));
    };

    this.isClicked = function () {
        if (lineDistance(input.Cursor.returnCords(), [this.x, this.y]) < this.r) {
            return true
        } else {
            return false
        }
    };
};

function initGrid() {
    gameGrid = new Array(gridSize);
    for (var i = 0; i < gameGrid.length; i++) {
        gameGrid[i] = new Array(gridSize);
    }

    var drawX = cellSize / 2;
    for (var x = 0; x < gameGrid.length; x++) {
        var drawY = cellSize / 2;
        for (var y = 0; y < gameGrid[x].length; y++) {
            gameGrid[x][y] = new Dot(drawX, drawY, x, y, colors[getRandomInt(0, colors.length - 1)]);
            drawY += cellSize;
        }
        drawX += cellSize;
    }
}

function getDot(gridCords) {
    return gameGrid[gridCords[0]][gridCords[1]]
}

var currDot;
var dotLine = [];

var score = 0;

function game() {
    clear();

    drawGrid();

    drawMessage(10, canvas.height - 10, input.Cursor.returnCords() + " " + input.Cursor.pressed);
    drawMessage(10, 20, input.Cursor.returnCordsGrid(cellSize))

    var isclosed = false;

    if (input.Cursor.pressed) {
        var gameGridCords = input.Cursor.returnCordsGrid(cellSize)
        if (gameGridCords[0] >= 0 && gameGridCords[1] >= 0 && gameGridCords[0] < gameGrid.length && gameGridCords[1] < gameGrid.length) {
            currDot = getDot(gameGridCords);

            // Add or Remove dots from connecting line
            if (currDot !== dotLine[dotLine.length - 1]) {
                if (currDot !== dotLine[dotLine.length - 2]) {
                    if (dotLine.length > 0) {
                        if (currDot.color == dotLine[0].color && currDot.adjacentTo(dotLine[dotLine.length - 1])) {
                            dotLine.push(currDot)
                            currDot.selected = true;
                            currDot.inLine = true;
                        }
                    } else {
                        dotLine[0] = currDot;
                        currDot.selected = true;
                        currDot.inLine = true;
                    }

                } else if (currDot == dotLine[dotLine.length - 2]) {
                    dotLine.pop().selected = false; // Pops off the latest dot, AND deselects it
                    currDot.inLine = true;
                }

            }

            // Draw Line
            ctx.beginPath();
            ctx.lineWidth = 6;

            ctx.strokeStyle = dotLine[0].color;
            ctx.moveTo(dotLine[0].x, dotLine[0].y);

            for (var i = 0; i < dotLine.length; i++) {
                //                if (i != dotLine.length - 1) {
                //                    ctx.lineTo(dotLine[i].x, dotLine[i].y)
                //                } else {
                //                    if (dotLine[i].isClicked()) {
                //                        ctx.lineTo(dotLine[i].x, dotLine[i].y)
                //                    }
                //                }
                ctx.lineTo(dotLine[i].x, dotLine[i].y)
            }

            ctx.lineTo(input.Cursor.x, input.Cursor.y)
            ctx.stroke();
        }

        //        isclosed = false;
        //        for (var i = 0; i < dotLine.length; i++) {
        //            if (dotLine.length > 1) {
        //                for (var i2 = 0; i2 < dotLine.length; i2++) {
        //                    if (i !== i2 && dotLine[i].returnCordsGrid().toString() == dotLine[i2].returnCordsGrid().toString()) {
        //                        isclosed = true;
        //                    }
        //                }
        //            }
        //        }
        //
        //        for (var x = 0; x < gameGrid.length; x++) {
        //            for (var y = 0; y < gameGrid[x].length; y++) {
        //                var dot = gameGrid[x][y];
        //
        //                if (dot.color == dotLine[0].color && isclosed) {
        //                    dot.selected = true;
        //                } else if (dot.color == dotLine[0].color && !isclosed && !dot.inLine) {
        //                    dot.selected = false;
        //                }
        //
        //            }
        //        }
    } else {
        for (var i = 0; i < dotLine.length; i++) {
            dotLine[i].selected = false;

            //            if (dotLine.length > 1) {
            //                for (var i2 = 0; i2 < dotLine.length; i2++) {
            //                    if (i !== i2 && dotLine[i].returnCordsGrid().toString() == dotLine[i2].returnCordsGrid().toString()) {
            //                        isclosed = true;
            //                    }
            //                }
            //            }

        }

        for (var i = 0; i < dotLine.length; i++) {
            //            if (isclosed) {
            //                for (var x = 0; x < gameGrid.length; x++) {
            //                    for (var y = 0; y < gameGrid[x].length; y++) {
            //                        var dot = gameGrid[x][y];
            //                        if (dot.color == dotLine[0].color) {
            //                            dot.cleared();
            //                            score += 1 // FIX THIS
            //                        }
            //                    }
            //                }
            //            }

            if (dotLine.length > 1) {
                dotLine[i].cleared();
                score += 1
            }
        }
        document.getElementById("score").innerHTML = score;
        dotLine = [];
    }
}









var loopHandles = {
    game: undefined,
    selected: undefined
};

function initLoop() {
    loopHandles.game = setInterval(game, 1000 / fps);
}

// On Run
$(document).ready(function () {
    console.log('New Test');

    canvas = document.getElementById("mainCanvas");
    canvas.width = cellSize * gridSize;
    canvas.height = cellSize * gridSize;

    document.onselectstart = function () {
        return false;
    }

    ctx = canvas.getContext("2d");

    eventHandlers.initialize();

    clear();

    initGrid();

    initLoop();
});
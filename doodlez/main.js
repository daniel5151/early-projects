var canvas;
var ctx;

var sketch = {
	grid:{
		cell_size:20,
		size:{
			x:100,
			y:100
		}
	}
};

function Branch (x, y, angle) {
	this.pos = {
		x: x,
		y: y
	};
	
	this.angle = angle;
}

function init() {
	console.log("New Test");
	
	// Initialize Canvas
	canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Get Pattern from User
	sketch.pattern = getUserPattern();
	
	// Get size of playing field
	sketch.grid.size.x = Math.floor( canvas.width / sketch.grid.cell_size )
	sketch.grid.size.y = Math.floor( canvas.height / sketch.grid.cell_size )
	
	// Place starting dot in centre with an up direction
	sketch.branches = [new Branch(Math.floor( sketch.grid.size.x / 2 ), Math.floor( sketch.grid.size.y / 2 ), Math.PI / 2)]
	
	// Begin loopz
	requestAnimationFrame(mainLoop)
}

function mainLoop() {
	// clearScreen();
	sketch.pattern.forEach(function(splits){
		// Draw the Branches for this Generation
		sketch.branches.forEach(function(branch){
			
		});
		
		// Check for branch collisions
		sketch.branches.forEach( function(branch1, index1){ 
			sketch.branches.forEach(function(branch2, index2){
				if (JSON.stringify(branch1.pos) === JSON.stringify(branch2.pos) && index1 !== index2) {
					sketch.branches.splice(index1, 1);
					sketch.branches.splice(index2, 1);
				}
			});
		});
	});
	requestAnimationFrame(mainLoop)
}

function drawLine(x1,y1,x2,y2) {
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.stroke();
}

function getUserPattern() {
	return [1,2,3,3,2];
}

// DRAWING FUNCTIONS
function clearScreen() {
    // Screen Resizing Ability
	// if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
        // canvas.width = window.innerWidth;
        // canvas.height = window.innerHeight;
    // }

    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

window.onload = init;

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
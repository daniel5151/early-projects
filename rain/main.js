var c;
var ctx;

function Particle(x, size,id){
  this.x = x;
  this.y = -CellSize;
  this.size = size;
  this.id = id;

  var self = this;
  this.draw = function () {
	ctx.fillStyle = "#000000"; 
	ctx.fillRect(self.x,self.y,self.size,self.size);
  }
}

// Modify This Number for lulz
var CellSize=5;
var backgroundColor="rgba(255, 255, 0, 0.2)";

var particles={};

var ids=0;

function update(dt) {
	// Only create as many particles as the screen width allows	
	for (var x=0; x<c.width; x+=CellSize) {
		if (Math.random()>0.9){
			particles[ids]=new Particle(x,CellSize,ids);
			ids++;
		}
	}
	
	// Change Pos
	for (var key in particles) {
		var particle = particles[key];

		particle.y+=CellSize;
		if (particle.y>c.height) {
			delete particles[particle.id];
		}
	}
}

function render(dt) {
	// Clear the Screen Partially
	ctx.fillStyle = backgroundColor;
	ctx.fillRect(0,0,c.width,c.height);	
	
	var count=0;

	for (var key in particles) {
		var particle = particles[key];
		particle.draw();
		count++;
	}

	//console.log(count);
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
    c = document.getElementById('mainCanvas');
    ctx = c.getContext('2d');

    c.width = window.innerWidth;
    c.height = window.innerHeight;

    main()
}

window.onload=function () {
    console.log("Run")
    init();
};

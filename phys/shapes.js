// Shape Constructors
var shapes = {
	Circle: function (props) {
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

		this.ctx = canvas.ctx;

		// customs
		for (var prop in props) {
			this[prop] = props[prop];
		}

		this.smiley = uVars.smiley;
		this.colorByHeight = uVars.colorByHeight;
		this.colorByVelocity = uVars.colorByVelocity;
		this.showVelocityLines = uVars.showVelocityLines;

		this.getColorByHeight = function () {
			/* Color by Height */
			var heightColoring;
			var tempDistance;
			if (this.y > 2 * canvas.h / 3) {
				heightColoring = 'rgb(255,0,0)';
			} else if (this.y > canvas.h / 3) {
				tempDistance = Math.floor(this.y * 255 / (canvas.h / 3));
				heightColoring = 'rgb(255,' + (255 - (tempDistance % 255)) + ',0)';
			} else {
				tempDistance = Math.floor(this.y * 255 / (canvas.h / 3));
				heightColoring = 'rgb(' + tempDistance + ',255,0)';
			}
			return heightColoring;
		};
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
			var ctx = canvas.ctx;
			ctx.beginPath();
			ctx.moveTo(this.x, this.y);
			ctx.lineTo(this.x + this.dx, this.y + this.dy);

			ctx.lineWidth = 4;
			ctx.strokeStyle = 'black';
			ctx.stroke();

			ctx.lineWidth = 2;
			ctx.strokeStyle = this.getColorByVelocity();
			ctx.stroke();

			draw.circle(this.x + this.dx, this.y + this.dy, 5, 'black');
		};

		this.draw = function () {
			// self update
			this.smiley = uVars.smiley;
			this.colorByHeight = uVars.colorByHeight;
			this.colorByVelocity = uVars.colorByVelocity;
			this.showVelocityLines = uVars.showVelocityLines;
			this.colorByRainbow = uVars.colorByRainbow;

			// Draw Circle
			var ctx = this.ctx;
			ctx.beginPath();
			ctx.strokeStyle = '#000000';
			ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, false);
			ctx.closePath();

			if (this.colorByHeight) {
				ctx.fillStyle = this.getColorByHeight();
			} else if (this.colorByVelocity) {
				ctx.fillStyle = this.getColorByVelocity();
			} else if (this.colorByRainbow) {
				ctx.fillStyle = getRandomColor();
			} else {
				ctx.fillStyle = this.color;
			}

			ctx.fill();
			ctx.lineWidth = (this.selected) ? 3 : 1;
			ctx.stroke();

			// Draw Smiley if Need Be
			if (this.smiley) {
				// Smile
				ctx.strokeStyle = '#000000';
				ctx.lineWidth = 1;
				ctx.beginPath();
				ctx.arc(this.x, this.y - this.r / 8, this.r * 0.75, 0.2 * Math.PI, 0.8 * Math.PI, false);
				ctx.closePath();
				ctx.stroke();
				ctx.fillStyle = 'white';
				ctx.fill();

				// Left Eye
				draw.circle(this.x - this.r / 2, this.y - this.r / 4, this.r / 8, 'white');
				draw.circle(this.x - this.r / 2, this.y - this.r / 4, this.r / 8 / 3, 'black');

				// Right Eye
				draw.circle(this.x + this.r / 2, this.y - this.r / 4, this.r / 8, 'white');
				draw.circle(this.x + this.r / 2, this.y - this.r / 4, this.r / 8 / 3, 'black');
			}

			// Velocity Lines
			if (this.showVelocityLines) {
				this.drawVelocityLine();
			}
		};

		this.checkClick = function () {
			var ctx = this.ctx;
			ctx.beginPath();
			ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, false);
			ctx.closePath();
			return (ctx.isPointInPath(input.Cursor.x, input.Cursor.y)) ? true : false;
		};

		this.returnCords = function () {
			return [this.x, this.y];
		};
	}
};
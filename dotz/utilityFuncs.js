// UTILITY FUNCTIONS
function getRandomColor() {
	var letters = '0123456789ABCDEF'.split('');
	var color = '#';
	for (var i = 0; i < 6; i++) {
		color += letters[Math.round(Math.random() * 15)];
	}
	return color;
}

function lineDistance(point1, point2) {
	var xs = 0;
	var ys = 0;

	xs = point2[0] - point1[0];
	xs = xs * xs;

	ys = point2[1] - point1[1];
	ys = ys * ys;

	return Math.sqrt(xs + ys);
}

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
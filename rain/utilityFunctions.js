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

function intersects(x1, y1, w1, h1, x2, y2, w2, h2) {
    w2 += x2;
    w1 += x1;
    if (x2 > w1 || x1 > w2) return false;
    h2 += y2;
    h1 += y1;
    if (y2 > h1 || y1 > h2) return false;
    return true;
}
// Physics
function circlePhys (obj) {		//HOLY SHITSNACKS, THIS NEEDS A REWRITE
    var simSpeed = uVars.simSpeed;
    var h = canvas.h;
    var w = canvas.w;

    //Apply Motion
    obj.x+=obj.dx/simSpeed;
    obj.y+=obj.dy/simSpeed;

    //Check if Out of Bounds
    if (obj.y+obj.r > h) { obj.y=h-obj.r; }
    if (obj.y-obj.r < 0) { obj.y=0+obj.r; }
    if (obj.x+obj.r > w) { obj.x=w-obj.r; }
    if (obj.x-obj.r < 0) { obj.x=0+obj.r; }

    //Apply Border Friction
    if (obj.prevCords[0][1] == h-obj.r && obj.prevCords[0][1]==obj.prevCords[1][1] && obj.prevCords[1][1]==obj.prevCords[2][1]) {
        if (obj.dx>0) {obj.dx-=obj.friction; if (Math.floor(Math.abs(obj.dx))===0) {obj.dx=0;}}
        else if (obj.dx<0) {obj.dx+=obj.friction; if (Math.ceil(Math.abs(obj.dx))===0) {obj.dx=0;}}
    }
    if (obj.prevCords[0][1] == 0+obj.r && obj.prevCords[0][1]==obj.prevCords[1][1] && obj.prevCords[1][1]==obj.prevCords[2][1]) {
        if (obj.dx>0) {obj.dx-=obj.friction; if (Math.floor(Math.abs(obj.dx))===0) {obj.dx=0;}}
        else if (obj.dx<0) {obj.dx+=obj.friction; if (Math.ceil(Math.abs(obj.dx))===0) {obj.dx=0;}}
    }
    if (obj.prevCords[0][0] == w-obj.r && obj.prevCords[0][0]==obj.prevCords[1][0] && obj.prevCords[1][0]==obj.prevCords[2][0]) {
        if (obj.dy>0) {obj.dy-=obj.friction; if (Math.floor(Math.abs(obj.dy))===0) {obj.dy=0;}}
        else if (obj.dy<0) {obj.dy+=obj.friction; if (Math.ceil(Math.abs(obj.dy))===0) {obj.dy=0;}}
    }
    if (obj.prevCords[0][0] == 0+obj.r && obj.prevCords[0][0]==obj.prevCords[1][0] && obj.prevCords[1][0]==obj.prevCords[2][0]) {
        if (obj.dy>0) {obj.dy-=obj.friction; if (Math.floor(Math.abs(obj.dy))===0) {obj.dy=0;}}
        else if (obj.dy<0) {obj.dy+=obj.friction; if (Math.ceil(Math.abs(obj.dy))===0) {obj.dy=0;}}
    }

    //Bounding Box Constraints
    if (obj.y + obj.dy/simSpeed + obj.r > h || obj.y + obj.dy/simSpeed - obj.r < 0){ obj.dy = -obj.dy; }
    if (obj.x + obj.dx/simSpeed + obj.r > w || obj.x + obj.dx/simSpeed - obj.r < 0){ obj.dx = -obj.dx; }

    // Gravity
    obj.dx+=uVars.gravity.dx;
    obj.dy+=uVars.gravity.dy;

    // Store Coordinates
    obj.prevCords.push([obj.x, obj.y]);
    obj.prevCords.shift();

    // Round
    obj.x=Math.ceil(obj.x);
    obj.y=Math.ceil(obj.y);
}

// Paused
var paused = false;
function pause () {
    if (!paused) {
        paused=true;
    }
    else {
        paused=false;
    }
}

function mainPhysLoop () {
    if (!paused) {
        for (var key in objects) {
            if (objects[key].suspendPhysics!==true) {
                circlePhys(objects[key]);
            }
        }
    } else {
        draw.extraDraw.paused=function () {
            draw.writeMessage('Paused', 0, canvas.h-5);
        };
    }
}

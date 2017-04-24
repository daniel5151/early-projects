function renderMap(ctx) {
    for (var y =0; y<testMap.length; y++) {
        for (var x=0; x<testMap[0].length; x++) {
            renderTile(ctx, tiles[testMap[y][x]], x, y, 4)
        }
    }
}

var testMap = []

var tileSet={};
var tiles = {};

function renderTile(ctx, tile, gridX, gridY, scale) {
    ctx.webkitImageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.drawImage(tileSet.img, 
                  tileSet.tileSize*tile.x,
                  tileSet.tileSize*tile.y,
                  tileSet.tileSize,
                  tileSet.tileSize,
                  gridX*tileSet.tileSize*scale,
                  gridY*tileSet.tileSize*scale,
                  tileSet.tileSize*scale, 
                  tileSet.tileSize*scale);
}

function initTileSet() {
    $.getJSON("lvl1.json", function(json) {
		testMap=json; // this will show the info it in firebug console
	});
	
	tileSet.img = 'game.png';
    tileSet.tileGrid = [6,4];
    tileSet.tileSize = 16;
    
    tileSet.img = resources.get(tileSet.img);
    
    var tileID=0;
    for (var y =0; y<tileSet.tileGrid[1]; y++) {
        for (var x=0; x<tileSet.tileGrid[0]; x++) {
            tiles[tileID]={
                x:x,
                y:y,
            };
            tileID++
        }
    }
}
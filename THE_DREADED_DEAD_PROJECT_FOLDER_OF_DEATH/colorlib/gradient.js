function gradient (colors, min, max, current) {
	var gradColors=[];
	
	var currPos = current/(max-min)
	
	console.log(currPos)
	
	var i = 0;
	colors.forEach (function (color) {
		gradColors[i]={};
		
		var components = color.substring(4, color.length-1).replace(/ /g, '').split(',');
		
		gradColors[i].red = components[0];
		gradColors[i].green = components[1];
		gradColors[i].blue = components[2];
		
		gradColors[i].pos = i / (colors.length-1);
		
		i++;
	});
	
	var returnColor={};
	
	var i = 0;
	var found = false;
	gradColors.forEach(function(color){
		if (found) return;
		
		if (currPos<color.pos) {
			console.log('a')
			returnColor.red=(currPos * Math.abs(gradColors[i-1].red - gradColors[i].red))+Math.min(gradColors[i-1].red, gradColors[i].red)
			returnColor.blue=(currPos * Math.abs(gradColors[i-1].blue - gradColors[i].blue))+Math.min(gradColors[i-1].blue, gradColors[i].blue)
			returnColor.green=(currPos * Math.abs(gradColors[i-1].green - gradColors[i].green))+Math.min(gradColors[i-1].green, gradColors[i].green)
		}
		
		found=true;
		
		i++;
	});
	
	returnColor.color = 'rgb('+returnColor.red+','+returnColor.green+','+returnColor.blue+')';
	
	console.log(returnColor)
	
	return returnColor.color;
}
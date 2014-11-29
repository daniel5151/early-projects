// Dev Vars
var fontsize = 8;

$(document).ready(function(){
	$('#submit').click(function(){
		$('#canvasImg').remove();
		$('#mainCanvas').remove();

		// DRAWING AND PROCESSING FUNCTIONS
		var printRow = function () {
			var args = Array.prototype.slice.call(arguments, 0);
			args.forEach(function(cell){
				if (cell==1) {
					ctx.fillStyle='#000';
					ctx.fillRect(cursor[0],cursor[1],1,1); // Pixel
					//d[0]   = 255;
					//d[1]   = 255;
					//d[2]   = 255;
					//d[3]   = 255;
					
					//ctx.putImageData( id, cursor[0],cursor[1] );
				}
				cursor[0]+=1;
			});
			cursor = [1, cursor[1]+1];
		};

		function drawAutoma(rule, rows) {
			ctx.fillStyle='#fff';
			ctx.fillRect(0,0,w,h);

			var baseRule = rule;
			var baseRows = rows;

			// Figure out binary value of rule
			rule = parseInt(rule,10).toString(2).split('');
			if (rule.length<8) {
				var i = 8-rule.length;
				while (i!==0) {
					rule.unshift('0');
					i--;
				}
			}
			rule.reverse();

			// Find out what state constitutes on or off according to a rule
			var stateRules = {};
			for (var i=0; i<=7; i++) {
				if (rule[i]==1) {
					// Get cell rule for current state
					if (i===0) {var stateRule=[0,0,0];}
					else {var stateRule = i.toString(2).split('');}

					if (stateRule.length<3) {
						var temp = new Array(3-stateRule.length+1).join('0').split('').map(parseFloat);
						stateRule = temp.concat(stateRule);
					}
					stateRules[stateRule]=1;
				}
			}

			// Initial Array
			var prevRow =
				(!random) ? // If not random
				new Array(3*rows+1).join('0').split('').map(parseFloat)	//Array filled with zeroes
				: randomArray(3*rows+1,0,1);							//Array radomly filled with one's or zeroes
			prevRow[rows+1]=1;
			printRow.apply(this, prevRow);

			//Begin loop to generate all of the rows
			while (rows>1) {
				var newRow = [];

				for (var i=0; i < prevRow.length; i++){

					var cCells = [prevRow[i-1],prevRow[i],prevRow[i+1]];

					var alive=0;
					for (var state in stateRules) {
						state=state.split(',').map(parseFloat);
						cCells=cCells.map(function(x){
							if (typeof x === 'undefined'){return prevRow[prevRow.length-1];} else {return x;}
						});

						if (arraysEqual(state, cCells)) { newRow.push(1); alive=1;}
					}
					if (alive!==1){ newRow.push(0); }
				}

				printRow.apply(this, newRow);
				prevRow=[];
				prevRow = newRow.concat();
				newRow=[];
				rows-=1;
			}

			// Writing the footnote text
			ctx.font = fontsize.toString()+"px courier";
			ctx.fillText("Rule: " + baseRule + " Rows: " + baseRows,1,baseRows+fontsize+1);

			//Add white on right border
			ctx.fillStyle = "#fff";
			for (i=0; i<=h; i++) {
				ctx.fillRect(w-1,i,1,1);
			}

			// Final Image Output
			var dataURL = c.toDataURL();
			document.getElementById('canvasImg').src = dataURL;
		}

		// DATA INPUT MANAGEMENT
		var rawFormData = $('form').serializeArray();

		var rule = (rawFormData[0].value === '') ? 90 : parseInt(rawFormData[0].value,10);
		var rows = (rawFormData[1].value === '') ? 64 : parseInt(rawFormData[1].value,10);
		var random = ($('#random').prop('checked')) ? true : false; // SerializeArray ignores unchecked checkboxes, must check manually to avoid exceptions

		var goAhead=true;
		if (rows>256){
			if(!window.confirm("WARNING: You are about to generate over 256 rows, and your browser may hang from the processing required.\nAre you sure you want to generate this many rows?")){
				goAhead=false;
			}
		}

		if (!goAhead || isNaN(rule) || isNaN(rows) || rule<0 || rule>255 || rows<1) {
			alert('Invalid Input');
		} else {
			if (!$('#mainCanvas').length) {
				$('body').append('<img id="canvasImg"> <canvas id="mainCanvas" height="' + (rows+(1+fontsize+1)) + 'px" width="' + (2*rows+5) + 'px"></canvas>');
				var c = document.getElementById("mainCanvas");
				var ctx = c.getContext("2d");
				var w = c.width;
				var h = c.height;
				var cursor = [1,1];
				
				//var id = ctx.createImageData(1,1);
				//var d  = id.data;
			}
			drawAutoma(rule, rows);
		}
	});
});

function arraysEqual(arr1, arr2) {
    if(arr1.length !== arr2.length)
        return false;
    for(var i = arr1.length; i--;) {
        if(arr1[i] !== arr2[i])
            return false;
    }

    return true;
}

function randomArray(size, min, max) {
	var nums = [];

    for (var element=0; element<size; element++) {
        nums[element] = (Math.round((max-min) * Math.random() + min));
    }

    return (nums);
}

var setup = false; //indicate if audio is set up yet

var defaultSamples = 64;

var audio = {
	ctx:0,
	microphone:false
}

function Song (buffer, samples, autoPlay, microphone) {
	this.samples = samples;
	
	if (!microphone) {
		//create a source node from the buffer
		this.src = audio.ctx.createMediaElementSource(buffer);
	} else {
		this.src = microphone;
		this.isMic = true;
	}
	
	//create a analyser node
	this.waveform = audio.ctx.createAnalyser();
    this.waveform.fftSize = samples;
	
	//connect them up into a chain
    this.src.connect(this.waveform);
	
	//link analyser to destination, completing the chain
    this.waveform.connect(audio.ctx.destination);
	
	if (autoPlay) play(this)
}

//play the loaded file
function play(song) {    
    //play immediately
    if (!song.hasOwnProperty('isMic')) audio.element.play(); // Check if it's a music file, not mic input
    setup = true;
}

//load the mp3 file
function getAudioSource() {
	/* This deals with Drag and Drop Functionality */
	var holder = document.getElementById('canvas')
	
	holder.ondragover = function () { this.className = 'hover'; return false; };
	holder.ondragend = function () { this.className = ''; return false; };
	
	holder.ondrop = function (e) {
		this.className = '';
		e.preventDefault();
		
		var file = e.dataTransfer.files[0]
		
		loading()
		
		getSong(file);
	}
	
	/* This deals with File Selection Functionality */
	var fileInput = document.getElementById('fileInput');
	fileInput.addEventListener('change', function(e) {
		var file = fileInput.files[0];
		
		loading()
		
		getSong(file);
    });
}

function getSong (file) {
	reader = new FileReader();
	if (file.type.match('audio.*')) {
		reader.onload = function (event) {			
			// Pause existing track
            if (audio.hasOwnProperty('song') && !audio.song.hasOwnProperty('isMic')) {
                audio.element.pause();
            } else if (audio.hasOwnProperty('song') && audio.song.hasOwnProperty('isMic')) {
                audio.song.src.disconnect()
            }
            
            audio.element.src = event.target.result;
            audio.element.play()
			
		};
		reader.readAsDataURL(file);
		return false;
	} else {
		alert('Invalid File Type, Only Music Files Supported')
	}
}

function loading () {
	console.log("Loading the audio...");
	// Add more substantial loading code here...
}

// Microphone Handling
function getMicrophone() {
	// Check Microphone Access
	navigator.getUserMedia = (navigator.getUserMedia ||
							  navigator.webkitGetUserMedia ||
							  navigator.mozGetUserMedia ||
							  navigator.msGetUserMedia);
	
	// If Supported
	if (navigator.getUserMedia) {
		console.log('getUserMedia supported.');
		navigator.getUserMedia (
		// constraints - only audio needed for this app
		{
			audio: true
		},
		
		
		
		// Success callback
		function(stream) {
			var src = audio.ctx.createMediaStreamSource(stream);
			
			if (audio.hasOwnProperty('song')) {
				audio.element.pause()
			}
            
			audio.song.isMic=true;
			audio.song.src=src;
            audio.song.src.connect(audio.song.waveform);
		},

		// Error callback
		function(err) {
			console.log('The following gUM error occured: ' + err);
		}
		);
	} else {
		console.log('getUserMedia not supported on your browser!');
	}
}

// GRAPHICS HANDLER
var canvas;

function setupCanvas() {
    canvas = document.getElementById('canvas');
	render3d()
}

var barObjects=[]
var overTimeBars=[]

// Temp Value, more song-dependant value assigned later on.
var subdivs=defaultSamples/2

var GridSize=256;

var renderer;
function render3d () {
	renderer = new webGlRenderer('canvas', window.innerWidth, window.innerHeight, GridSize, subdivs);
	renderer.initGfx();
	
	renderer.updateScene = function () {
		// don't do nothing 'till the audio api says it's ready
		if(!setup) return;
		
		// Let's get some waveform data! WOO!
		var waveformData = new Uint8Array(audio.song.samples);
		audio.song.waveform.getByteFrequencyData(waveformData);
		
		// Just how many bars do we need...
		var subdivs = audio.song.waveform.frequencyBinCount;
		
		// Grid Size divided by Number of bars. That *2 is to fill up the grid :)
		var barSideLength= GridSize/subdivs*2;
		
		// Get the X, Y Coordinates for corner of each square on grid
		var gridRange = Array.range(-GridSize, GridSize, barSideLength)
		
		// Get Current Bars
		for(var i=0; i<subdivs; i++) {
			var height=adjustedHeight(waveformData[i], GridSize/1.75)
			barObjects.push(new renderer.Cube(renderer.scene, {
				w:barSideLength,
				l:barSideLength,
				h:height,
				
				x:gridRange[i]+barSideLength/2, // Readjust so bars will be centered in square
				y:gridRange[0]+barSideLength/2,
				
				z:height/2+10, // Readjust so bars will be be on top of grid
				
				color:getColorByHeight(waveformData[i], 256)
			}));
		}
		
		// Add Current bars to old-bar array
		overTimeBars.push(barObjects);
		
		barObjects=[];
		
		// Update Bar Positions
		for(var time=0; time<overTimeBars.length; time++) {
			for (var bar=0; bar<overTimeBars[time].length; bar++) {
				overTimeBars[time][bar].updatePos(0,barSideLength,0);
			}
		}
		
		// Delete very old bars from Scene and Array
		if (overTimeBars.length==subdivs) {
			for (var bar=0; bar<overTimeBars[0].length; bar++) {
				overTimeBars[0][bar].remove()
			}
			overTimeBars.shift();
		}
	}
}

//Initialize
function init() {
    console.log("Initializing SoundSystem");
    try {
        audio.ctx = new webkitAudioContext(); //is there a better API for this?
        setupCanvas();
        audio.element = document.getElementById('audioNode');
        audio.song = new Song(audio.element, defaultSamples, true)
        getAudioSource();
		
		audio.element.onplay = function () {
            
            if (audio.song.hasOwnProperty('isMic')) {
                audio.song.src.disconnect()
            }
        }
    } catch(e) {
        alert('Terribly sorry! You do not seem to have webAudio support! Try this demo in Chrome!');
    }
}

window.addEventListener('load',init,false);

// UTILITY FUNCTIONS
/* Color by Height */
function getColorByHeight(height, maxHeight) {
	var heightColoring;
	var tempDistance;
	if (height>2*maxHeight/3) {
		heightColoring='rgb(255,0,0)';
	} else if (height>maxHeight/3) {
		tempDistance=Math.floor(height/(maxHeight/3)*255);
		heightColoring='rgb(255,'+(255-(tempDistance % 255))+',0)';
	} else {
		tempDistance=Math.floor(height*255/(maxHeight/3));
		heightColoring='rgb('+tempDistance+',255,0)';
	}
	return heightColoring
}

Array.range= function(a, b, step){
    var A= [];
    if(typeof a== 'number'){
        A[0]= a;
        step= step || 1;
        while(a+step<= b){
            A[A.length]= a+= step;
        }
    }
    else{
        var s= 'abcdefghijklmnopqrstuvwxyz';
        if(a=== a.toUpperCase()){
            b=b.toUpperCase();
            s= s.toUpperCase();
        }
        s= s.substring(s.indexOf(a), s.indexOf(b)+ 1);
        A= s.split('');        
    }
    return A;
}

function adjustedHeight (height, maxHeight) {
	return height/256*maxHeight;
}
var setup = false; //indicate if audio is set up yet

var defaultSamples = 256;

var audio = {
	ctx:0,
    element:null,
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

function setupCanvas(mode) {
    canvas = document.getElementById('canvas');
	render2d();
}

var renderer;

function render2d () {
	canvas.width=window.innerWidth;
	canvas.height=window.innerHeight;
	
    renderer = canvas.getContext('2d');
    requestAnimationFrame(update);
}

function update() {
	requestAnimationFrame(update);
	
	renderer.fillStyle = 'white';
	renderer.fillRect(0,0,canvas.width,canvas.height);
	
	// Holding Pattern until signal from Audio Context
	if(!setup) {
		renderer.font = '18pt sans-serif';
		renderer.fillStyle = 'black';
		renderer.fillText('Please Stand By...', 10, canvas.height/2);
		return;
	}
    
	var numBars = audio.song.waveform.frequencyBinCount;
	
	var bar_w = Math.floor(canvas.width/(numBars+1))
	var bar_h
	
	// Get Frequency Data
    var data = new Uint8Array(audio.song.samples);
    audio.song.waveform.getByteFrequencyData(data);
    
	for(var i=0; i<numBars; i++) {
		var bar_y = (256-data[i])/256*canvas.height-4;
		
		renderer.fillStyle = getColorByHeight(canvas.height-bar_y, canvas.height);
		renderer.fillRect(i*(bar_w+1),bar_y,bar_w,canvas.height-bar_y, canvas.height);
    }
    
}

//Initialize
function init() {
    console.log("Initializing SoundSystem");
    try {
        audio.ctx = new webkitAudioContext(); //is there a better API for this?
        setupCanvas('2d');
        audio.element = document.getElementById('audioNode');
        audio.song = new Song(audio.element, defaultSamples, true)
        getAudioSource();
        
        audio.element.onplay = function () {
            
            if (audio.song.hasOwnProperty('isMic')) {
                audio.song.src.disconnect()
            }
        }
    } catch(e) {
        alert(e);
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
		tempDistance=Math.floor(height*255/(maxHeight/3));
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

var SoundcloudLoader = function(player,uiUpdater) {
    var self = this;
    var client_id = "YOUR_SOUNDCLOUD_CLIENT_ID"; // to get an ID go to http://developers.soundcloud.com/
    this.sound = {};
    this.streamUrl = "";
    this.errorMessage = "";
    this.player = player;
    this.uiUpdater = uiUpdater;

    /**
     * Loads the JSON stream data object from the URL of the track (as given in the location bar of the browser when browsing Soundcloud),
     * and on success it calls the callback passed to it (for example, used to then send the stream_url to the audiosource object).
     * @param track_url
     * @param callback
     */
    this.loadStream = function(track_url, successCallback, errorCallback) {
        SC.initialize({
            client_id: client_id
        });
        SC.get('/resolve', { url: track_url }, function(sound) {
            if (sound.errors) {
                self.errorMessage = "";
                for (var i = 0; i < sound.errors.length; i++) {
                    self.errorMessage += sound.errors[i].error_message + '<br>';
                }
                self.errorMessage += 'Make sure the URL has the correct format: https://soundcloud.com/user/title-of-the-track';
                errorCallback();
            } else {

                if(sound.kind=="playlist"){
                    self.sound = sound;
                    self.streamPlaylistIndex = 0;
                    self.streamUrl = function(){
                        return sound.tracks[self.streamPlaylistIndex].stream_url + '?client_id=' + client_id;
                    }
                    successCallback();
                }else{
                    self.sound = sound;
                    self.streamUrl = function(){ return sound.stream_url + '?client_id=' + client_id; };
                    successCallback();
                }
            }
        });
    };


    this.directStream = function(direction){
        if(direction=='toggle'){
            if (this.player.paused) {
                this.player.play();
            } else {
                this.player.pause();
            }
        }
        else if(this.sound.kind=="playlist"){
            if(direction=='coasting') {
                this.streamPlaylistIndex++;
            }else if(direction=='forward') {
                if(this.streamPlaylistIndex>=this.sound.track_count-1) this.streamPlaylistIndex = 0;
                else this.streamPlaylistIndex++;
            }else{
                if(this.streamPlaylistIndex<=0) this.streamPlaylistIndex = this.sound.track_count-1;
                else this.streamPlaylistIndex--;
            }
            if(this.streamPlaylistIndex>=0 && this.streamPlaylistIndex<=this.sound.track_count-1) {
               this.player.setAttribute('src',this.streamUrl());
               this.uiUpdater.update(this);
               this.player.play();
            }
        }
    }


};
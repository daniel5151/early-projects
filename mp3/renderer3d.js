var webGlRenderer = function (canvas, canvasWidth, canvasHeight, gridSize, gridStep) {
	// GFX GlobalVars
	var camera, controls, renderer
	
	this.scene;
	
	var self = this
	
	// Init
	this.initGfx = function () {
		/* Init Scene */
		self.scene = new THREE.Scene();
		
		/* Initialize Renderer */
		var c = document.getElementById(canvas);
		renderer = new THREE.WebGLRenderer({canvas: c});
		renderer.setSize(canvasWidth, canvasHeight);
		
		// Set Background to White - Tweak if you like.
		renderer.setClearColor( 0xffffff, 1 );
		
		// lighting
		// var directionalLight = new THREE.DirectionalLight(0xffffff);
		// directionalLight.position.set(1, 1, 1).normalize();
		// self.scene.add(directionalLight);
		
		var directionalLight = new THREE.HemisphereLight(0xffffff, 0x000000);
		self.scene.add(directionalLight);
		
		/* Initialize Camera */
		camera = new THREE.PerspectiveCamera(45, canvasWidth/canvasHeight, 0.1, 10000);
		
		// Pretty Arbitrary Camera Starting Position - Tweak if you like.
		camera.position.set(500,500,500);
		camera.lookAt(new THREE.Vector3(0,0,0));
		
		/* Initialize Orbit Controls Lib */
		controls = new THREE.OrbitControls( camera, document.getElementById('canvas') );
		controls.zoomSpeed=2; // Tweakable
		
		// /* Allow for Window Resizing */
		// window.addEventListener( 'resize', function () {
			// camera.aspect = w/h;
			// camera.updateProjectionMatrix();
			// renderer.setSize( w/h );
		// }, false );
		
		/* Begin Render and Animation loop */
		setupScene();
		animate();
	}

	// Constructors
	this.Cube = function (scene,options) {
		var self = this;
		
		// options has properties:
		// w, l, h, x, y, z, color
		for (var option in options) {
			this[option]=options[option]
		}
		
		var geometry = new THREE.BoxGeometry(this.l,this.h,this.w);
		var material = new THREE.MeshLambertMaterial({color: this.color});
		
		this.mesh = new THREE.Mesh(geometry, material);
		
		this.setPos = function (x,y,z) {
			self.mesh.position.x=x;
			self.mesh.position.y=z;
			self.mesh.position.z=y;
		}
		
		scene.add(this.mesh);
		this.setPos(this.x,this.y,this.z);
		
		this.updatePos = function (x,y,z) {
			self.mesh.position.x+=x;
			self.mesh.position.y+=z;
			self.mesh.position.z+=y;
		}
		
		this.remove = function () {
			scene.remove(this.mesh)
		}
	}
	
	// This ain't my code
	function Grid (size, subdivs) {
		var geometry = new THREE.Geometry();
		var step = size/subdivs;
		
		for ( var i = - size; i <= size; i += step ) {
			geometry.vertices.push( new THREE.Vector3( - size, 0, i ) );
			geometry.vertices.push( new THREE.Vector3(   size, 0, i ) );

			geometry.vertices.push( new THREE.Vector3( i, 0, - size ) );
			geometry.vertices.push( new THREE.Vector3( i, 0,   size ) );
		}

		var material = new THREE.LineBasicMaterial( { color: 0x000000, opacity: 0.2, transparent: true } );

		var line = new THREE.Line( geometry, material );
		line.type = THREE.LinePieces;
		self.scene.add( line );
	}

	// First Run
	function setupScene () {
		new Grid (gridSize, gridStep)
	}

	// What to do to the scene each time
	this.updateScene = function () {
		// user defined
	}

	// Main animation control loop
	function animate () {
		// Loop
		requestAnimationFrame(animate);
		
		// Control Update (For Zooming Posterity)
		controls.update()
		
		// Scene Update
		self.updateScene ()
		
		// Final Results
		render()
	}

	function render () {
		renderer.render(self.scene, camera);
	};
}
// General Loop Handles
var handles = {
    mainLoopHandle: null,
    pausedHandle: null,
    toolHandle: null
};

// Declare global object container
var ids = 1;
var objects = {};

// Variables
var uVars = {
    debug: false,
    fps: 60,

    maxObjects: 10,

    gravity: {
        strength: 5,
        angle: 0.5 * Math.PI,
        dx: 0,
        dy: 5
    },
    simSpeed: 1,

    radius: 25,
    shapeColor: getRandomColor(),
    smiley: false,
    colorByHeight: false,
    colorByVelocity: false,
    showVelocityLines: false
};

// Declare global canvas
var canvas = {};

// Create Main Canvas
var canvasConstructor = function () {
    this.c = document.getElementById("mainCanvas");
    this.ctx = this.c.getContext("2d");
    this.resize = function () {
        this.w = document.documentElement.clientWidth;
        this.h = document.documentElement.clientHeight;
        this.c.width = this.w;
        this.c.height = this.h;
    };
};

// On Run
$(document).ready(function () {
    // Declare and Populate Global Canvas
    canvas = new canvasConstructor();

    // Initialize tools and selectors
    panels.initColorPicker();
    panels.initToolButtons();

    // Initialize Event Handlers
    eventHandlers.initialize();

    // Clear screen
    draw.clear();

    // Start splash screen
    draw.splash.start();
    setTimeout(function () {
        clearInterval(draw.splash.handle);
    }, 10000);

    // Begin
    console.log('newTest');
    objects['0'] = new shapes.Circle({
        color: uVars.shapeColor,
        x: 100,
        y: 100,
        r: uVars.radius,
        dx: 10,
        dy: 5,
        id: 0
    });

    function init() {
        handles.mainLoopHandle = setInterval(mainPhysLoop, 1000 / uVars.fps);
        setInterval(draw.all, 1000 / uVars.fps);
        setInterval(updateVars, 10);
    }
    init();
});
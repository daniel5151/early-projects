// Tools and Axillary tool Functions
var auxTools = {
    basePos: [],
    finalPos: [],
    offCentrePos: [],

    currToolNew: 'tool_spawn_slingshot',
    currTool: 'tool_spawnz',

    throwBegin: function (obj, reverse) {
        obj.suspendPhysics = true;
        this.basePos = [input.Cursor.x, input.Cursor.y];
        handles.toolHandle = setInterval(function () {
            /* Proccessing */
            if (!reverse) {
                obj.x = input.Cursor.x;
                obj.y = input.Cursor.y;
            }
            obj.dx = 0;
            obj.dy = 0;

            /* Drawing */
            draw.extraDraw.velocity = function () {
                // Velocity Line
                var ctx = canvas.ctx;
                ctx.beginPath();
                ctx.moveTo(auxTools.basePos[0], auxTools.basePos[1]);
                ctx.lineTo(input.Cursor.x, input.Cursor.y);

                // Outline
                ctx.lineWidth = 4;
                ctx.strokeStyle = 'black';
                ctx.stroke();

                // Coloring to match Final Velocity
                var velocityColoring;
                var shotDistance = lineDistance([input.Cursor.x, input.Cursor.y], auxTools.basePos);
                if (shotDistance > 750) {
                    velocityColoring = 'rgb(255,0,0)';
                } else if (shotDistance > 400) {
                    shotDistance = Math.floor(shotDistance * 255 / 400);
                    velocityColoring = 'rgb(255,' + (255 - (shotDistance % 255)) + ',0)';
                } else {
                    shotDistance = Math.floor(shotDistance * 255 / 400);
                    velocityColoring = 'rgb(' + shotDistance + ',255,0)';
                }

                // Inline
                ctx.lineWidth = 2;
                ctx.strokeStyle = velocityColoring;
                ctx.stroke();

                if (!reverse) {
                    // Pointer
                    draw.circle(auxTools.basePos[0], auxTools.basePos[1], 5, 'black');
                }
            };
        }, 1);
    },
    throwEnd: function (obj, reverse) {
        obj.suspendPhysics = false;
        this.finalPos = [input.Cursor.x, input.Cursor.y];
        obj.dx = (reverse) ? (auxTools.finalPos[0] - auxTools.basePos[0]) / 5 : (auxTools.basePos[0] - auxTools.finalPos[0]) / 5;
        obj.dy = (reverse) ? (auxTools.finalPos[1] - auxTools.basePos[1]) / 5 : (auxTools.basePos[1] - auxTools.finalPos[1]) / 5;
        this.basePos = [];
        this.finalPos = [];
    },
    drag: function (obj) {
        auxTools.offCentrePos = {
            x: input.Cursor.x - obj.x,
            y: input.Cursor.y - obj.y
        };
        handles.toolHandle = setInterval(function () {
            /* Proccessing */
            this.finalPos = [input.Cursor.x - auxTools.offCentrePos.x, input.Cursor.y - auxTools.offCentrePos.y];
            obj.dx = (this.finalPos[0] - obj.returnCords()[0]) / 3;
            obj.dy = (this.finalPos[1] - obj.returnCords()[1]) / 3;

            /* Drawing */
            draw.extraDraw.drag = function () {
                // Drag Line
                var ctx = canvas.ctx;
                ctx.beginPath();
                ctx.moveTo(input.Cursor.x, input.Cursor.y);
                ctx.lineWidth = 2;
                ctx.lineTo(obj.x + auxTools.offCentrePos.x, obj.y + auxTools.offCentrePos.y);
                ctx.strokeStyle = 'red';
                ctx.stroke();
            };
        }, 1);
    }
};
var tools = {
    /////////////////////////////////////////////////////
    tool_spawn: {
        name: 'tool_spawn',
        description: 'Spawn',
        onStart: function () {
            handles.toolHandle = setInterval(function () {
                if (ids == uVars.maxObjects) {
                    ids = 0;
                }
                objects[ids] = new shapes.Circle({
                    color: uVars.shapeColor,
                    x: input.Cursor.x,
                    y: input.Cursor.y,
                    r: uVars.radius,
                    id: ids
                });
                ids += 1;
            }, 50);
        },
        onEnd: function () {
            clearInterval(handles.toolHandle);
            handles.toolHandle = null;
        },
    },
    /////////////////////////////////////////////////////
    tool_spawn_slingshot: {
        name: 'tool_spawn_slingshot',
        description: 'Spawn + Slingshot',
        onStart: function () {
            if (handles.toolHandle === null) { // Throw only once
                if (ids == uVars.maxObjects) {
                    ids = 0;
                }
                objects[ids] = new shapes.Circle({
                    color: uVars.shapeColor,
                    x: input.Cursor.x,
                    y: input.Cursor.y,
                    r: uVars.radius,
                    id: ids
                });
                objects[ids].selected = true;
                auxTools.throwBegin(objects[ids], false);
            }
        },
        onEnd: function () {
            if (handles.toolHandle !== null) { // Not to throw again
                auxTools.throwEnd(objects[ids], false);
                objects[ids].selected = false;

                ids += 1;
                clearInterval(handles.toolHandle);
                handles.toolHandle = null;
            }
        }
    },
    /////////////////////////////////////////////////////
    tool_slingshot: {
        name: 'tool_slingshot',
        description: 'Slingshot',
        onStart: function (selectedObj) {
            if (selectedObj !== null) {
                selectedObj.selected = true;
                if (handles.toolHandle === null) { // Throw only once
                    auxTools.throwBegin(selectedObj, false);
                }
            }
        },
        onEnd: function (selectedObj) {
            if (handles.toolHandle !== null) { // Not to throw again
                auxTools.throwEnd(selectedObj, false);
                selectedObj.selected = false;
                clearInterval(handles.toolHandle);
                handles.toolHandle = null;
            }
        }
    },
    /////////////////////////////////////////////////////
    tool_reverse_slingshot: {
        name: 'tool_reverse_slingshot',
        description: 'Reverse Slingshot',
        onStart: function (selectedObj) {
            if (selectedObj !== null) {
                selectedObj.selected = true;
                if (handles.toolHandle === null) { // Throw only once
                    auxTools.throwBegin(selectedObj, true);
                }
            }
        },
        onEnd: function (selectedObj) {
            if (handles.toolHandle !== null) { // Not to throw again
                auxTools.throwEnd(selectedObj, true);
                selectedObj.selected = false;
                clearInterval(handles.toolHandle);
                handles.toolHandle = null;
            }
        }
    },
    /////////////////////////////////////////////////////
    tool_move: {
        name: 'tool_move',
        description: 'Move',
        onStart: function (selectedObj) {
            if (selectedObj !== null && handles.toolHandle === null) {
                selectedObj.selected = true;
                selectedObj.suspendPhysics = true;
                auxTools.offCentrePos = [input.Cursor.x - selectedObj.x, input.Cursor.y - selectedObj.y];
                handles.toolHandle = setInterval(function () {
                    selectedObj.x = input.Cursor.x - auxTools.offCentrePos[0];
                    selectedObj.y = input.Cursor.y - auxTools.offCentrePos[1];
                    selectedObj.dx = 0;
                    selectedObj.dy = 0;
                }, 1);
            }
        },
        onEnd: function (selectedObj) {
            if (handles.toolHandle !== null) {
                if (selectedObj !== null) {
                    selectedObj.selected = false;
                }
                selectedObj.suspendPhysics = false;
                clearInterval(handles.toolHandle);
                handles.toolHandle = null;
            }
        }
    },
    /////////////////////////////////////////////////////
    tool_drag: {
        name: 'tool_drag',
        description: 'Drag',
        onStart: function (selectedObj) {
            if (selectedObj !== null && handles.toolHandle === null) {
                selectedObj.selected = true;
                auxTools.drag(selectedObj);
            }
        },
        onEnd: function (selectedObj) {
            if (handles.toolHandle !== null) {
                if (selectedObj !== null) {
                    selectedObj.selected = false;
                }
                clearInterval(handles.toolHandle);
                handles.toolHandle = null;
            }
        }
    },
    /////////////////////////////////////////////////////
    tool_explode: {
        name: 'tool_explode',
        description: 'Explode',
        onStart: function (selectedObj) {
            if (selectedObj !== null) {
                if (ids == uVars.maxObjects) {
                    ids = 0;
                }
                objects[ids] = new shapes.Circle({
                    color: selectedObj.color,
                    x: selectedObj.x + selectedObj.r / 2,
                    y: selectedObj.y,
                    r: selectedObj.r / 2,
                    id: ids,
                    dx: 10
                });
                ids += 1;

                objects[selectedObj.id] = new shapes.Circle({
                    color: selectedObj.color,
                    x: selectedObj.x - selectedObj.r / 2,
                    y: selectedObj.y,
                    r: selectedObj.r / 2,
                    id: selectedObj.id,
                    dx: -10
                });
            }
        },
        onEnd: function () {
            // NULL
        },
    },
    /////////////////////////////////////////////////////
    tool_info_panel: {
        name: 'tool_info_panel',
        description: 'Info Panel',
        onStart: function (selectedObj) {
            if (selectedObj !== null && handles.toolHandle === null) {
                selectedObj.selected = true;
                handles.toolHandle = setInterval(function () {
                    draw.extraDraw.info = function () {
                        var line = 0;
                        for (var prop in selectedObj) {
                            if (typeof (selectedObj[prop]) != 'function') {
                                draw.writeMessage(prop + ': ' + selectedObj[prop], input.Cursor.x + 10, input.Cursor.y + line);
                                line += 18;
                            }
                        }
                    };
                }, 1000 / uVars.fps);
            }
        },
        onEnd: function (selectedObj) {
            if (handles.toolHandle !== null) {
                if (selectedObj !== null) {
                    selectedObj.selected = false;
                }
                clearInterval(handles.toolHandle);
                handles.toolHandle = null;
            }
        }
    },
};
// Vars and Subs to do with the side panels
var panels = {
    inSettings: false,
    inTools: false,
    getDivPositions: function () {
        if (!this.hasOwnProperty('noPushPos')) {
            this.noPushPos = [$('form').position().left,
                            $('#mainCanvas').position().left,
                            $('#toolbar').position().left];
        }
        return [$('form').position().left,
            $('#mainCanvas').position().left,
            $('#toolbar').position().left];
    },
    initColorPicker: function () {
        $("#colorPicker").spectrum({
            clickoutFiresChange: true,
            preferredFormat: "hex",
            showInput: true
        });
    },
    initToolButtons: function () {
        for (var tool in tools) {
            $('#toolbar').append('<a href="#"><div id=' + tools[tool].name + ' class=\'toolButton\'>' + tools[tool].description + '</div></a><br>');
        }
    },
    pushPushables: function (em) {
        if (panels.inTools && Math.abs(em) == 17) {
            em += 7;
            panels.inTools = false;
        } else if (panels.inSettings && Math.abs(em) == 7) {
            em += 17;
            panels.inSettings = false;
        }
        $('.pushLeft').animate({
            left: "+=" + em + "em"
        }, 500);
        $('.pushRight').animate({
            right: "-=" + em + "em"
        }, 500);
    },
};
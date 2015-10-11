$(function() {

    $.ripple({
        "header, footer": {},
        //"#cards>div": {},

        //demos
        "#demos>*": {},
        //"button": {},
        //"#demobox": {}, //scaleMode: "proportional"

        "#customRipple": [
            {
                //scaleMode: "proportional",
                scaleMode: null,
                hasCustomRipple: true
            },
            function($active, $ripple, posI, maxDiameter) {
                console.log("awd");
                if ($ripple.has("video").length)
                    $ripple.children()[0].play();
            }
        ],
        "#link": {
            maxDiameter: "40px",
            dragging: false
        },
        //"#zindex": {},
        //".wrapper": {},
        "#maxDiameter": {
            maxDiameter: "4em",
            dragging: false
                //adaptPos: true
        },
        "#proportional": {
            scaleMode: "proportional"
        },
        // "#fixed": {
        //     scaleMode: "fixed"
        // },
        //"#long": {},
        //"#inlineBlockLink": {},
        "#overflow": {
            scaleMode: 0
        },
        "#circle": {
            maxDiameter: "100%",
            scaleMode: 0
        },
        "[data-text]": {
            scaleMode: 0
        },

        //why
        "#v1": {
            scaleMode: 0
        },
        "#v2": {
            scaleMode: 0,
            adaptPos: false
        },
    });


    //remember to update "Manually controlling ripples" in readme when adding lines


    //faking mouse/touch events to make ripples:

    var isTouchDevice = //stackoverflow.com/a/4819886
        'ontouchstart' in window ||
        'onmsgesturechange' in window, //ie10
        coords = {
            pageX: $("h1").offset().left,
            pageY: $("h1").offset().top
        },
        tap = isTouchDevice ?
        jQuery.Event("touchstart", {
            originalEvent: {
                touches: [coords]
            }
        }) :
        jQuery.Event("mousedown", coords);

    for (var i = 4; i > 0; i--) {
        setTimeout(function(i) {
            $("#fadeInOverlay")
                .ripple()
                .trigger(tap)
                .ripple({ //remove user interaction
                    unbind: true
                });
        }, 200 * i, i);
    };

    //removing ripples after animation for performance
    setTimeout(function() {
            $("#fadeInOverlay").addClass('introFinished')
                .children(".legitRipple-ripple").remove();
        },
        200 * 4 + //last ripple's start time
        0.125 * 7 * 1000 + //+ last ripple's animation-duration
        100 //giving the browser a break
    );

});

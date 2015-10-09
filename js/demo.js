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

});

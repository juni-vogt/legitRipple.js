$(function() {
    var ripples = [
        [$("header")],
        [$("#cards>div"), {}],
        [$("button"), {}],
        [$("#demobox"), {
            //scaleMode: "proportional"
        }],
        [$("#customRipple"), {
            //scaleMode: "proportional",
            scaleMode: null,
            hasCustomRipple: true,
        }, function($active, $ripple, posI, maxDiameter) {
            if ($ripple.is(".material-ripple-ripple") && $ripple.has("video").length)
                $ripple.children()[0].play();
        }],
        [$("#link"), {
            maxDiameter: "40px",
            dragging: false,
        }],
        [$("#zindex"), {}],
        [$(".wrapper"), {}],
        [$("#maxDiameter"), {
            maxDiameter: "4em",
            dragging: false,
            //adaptPos: true
        }],
        [$("#proportional"), {
            scaleMode: "proportional"
        }],
        [$("#fixed"), {
            scaleMode: "fixed"
        }],
        [$("#long"), {}],
        [$("#inlineBlockLink"), {}],
        [$("#overflow"), {
            scaleMode: 0
        }],
        [$("#circle"), {
            maxDiameter: "100%",
            scaleMode: 0
        }],
        [$("[data-text]"), {
            scaleMode: 0
        }],
        [$("#v1"), {
            scaleMode: 0,
        }],
        [$("#v2"), {
            scaleMode: 0,
            adaptPos: false
        }],
        [$("footer")]
    ];

    $.each(ripples, function(i, o) {
        $(o[0]).ripple(o[1], o[2]);
    });
    /*$("h1").append($("<div/>").addClass("mask").append($("h1").html()));
    var initialTransition, hasStarted;
    $("h1").ripple({
        scaleMode: null
    }, function(el, posI, diameter) {
        $this = $("h1 .mask");

        console.log(el, posI, diameter);
        initialTransition = $this.css("transition");


        /*$this
            .css("transition", "all 0s linear 0s")
            .css("-webkit-clip-path", $this.css("-webkit-clip-path"));

        setTimeout(function() {
            $this.css("-webkit-clip-path",
                    "circle(0 at " +
                    posI[0] * 100 + "% " + posI[1] * 100 + "%)")
            .css("transition", initialTransition);


        setTimeout(function() {
            $this

        }, 200);
        }, 200);*/
    /*

            $this
                .css("transition", "all 0s linear 0s")
                .css('-webkit-clip-path', $this.css('-webkit-clip-path'));

            setTimeout(function() {
            $this.css('-webkit-clip-path',
                "circle(0px at " + posI[0] * 100 + "% " + posI[1] * 100 + "%)");
            setTimeout(function() {
                $this
                    .css("transition", initialTransition)
                    .css('-webkit-clip-path',
                        "circle("+diameter+" at " + posI[0] * 100 + "% " + posI[1] * 100 + "%)");
            }, 40);
            }, 40);

        });*/

    //$(".material").ripple({scaleMode: false});

    /* Demo */
    /*$("h1").append($("<div/>").addClass("mask").append($("h1").html()));
    $("h1").rippleHook(function(posI, diameterI) {
        $(this).children("mask").css("clip-path",
            "circle(" + diameterI * 100 + "% at " + posI[0] * 100 + "% " + posI[1] * 100 + "%)");
        console.log(diameterI, posI);
    });*/

});

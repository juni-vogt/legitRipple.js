$(function() {

    $.ripple({
        "header, footer": {},
        //"#cards>div": {},

        //demos
        "#demos-section h2~*": {},
        //"button": {},
        //"#demobox": {}, //scaleMode: "proportional"

        "#customRipple": [
            {
                //scaleMode: "proportional",
                scaleMode: null,
                hasCustomRipple: true
            },
            function($active, $ripple, posI, maxDiameter) {
                $ripple.children()[0].play(); //play video
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


    // nav

    // var html = [];
    // $("h2, h3, h4, h5").filter("[id]").each(function(index, el) {
    //  html.push(
    //      $("<a/>").attr("href", "#"+$(this).attr("id"))
    //      .text($(this).text())
    //  );
    // });
    //removed for SEO

    $("nav a").on("click", function(e) {
        e.preventDefault();
        $("html, body").stop().animate({
            scrollTop: $($(this).attr("href")).offset().top - 15
        }, '500');
    });

    var $navLinks = $("nav a"),
        $headings = $("h2, h3, h4");

    $(window).scroll(function(event) {
        var visible = [];
        $headings.each(function(index, el) {
            if ($(this)[0].getBoundingClientRect().top < $(window).height() /
                (visible.length != $headings.length - 1 ? 2 : 1)
                //elements count as visible when they are in the upper 50%
                //of the viewport, except for the last one, which only has
                //to "touch" the viewport
            ) visible.push($(this));
        });

        if (visible.length) {
            $navLinks.filter(".selected").removeClass('selected');
            $navLinks.filter("[href='#" + visible[visible.length - 1].attr("id") + "']")
                .addClass("selected");
        }
    });
});

(function($) {

	$.fn.ripple = function(passedOptions, hook) {

		passedOptions = passedOptions || {};

		var calledOn = this,
			options,

			$active,
			initalPos,
			mousemoved,
			activeDimensions,
			$ripple,
			initialTransition,

			contextMenuOpen,

			theCorrectAmountOfTimeout = 20, //it's correct.


			touch = function(e) {
				console.log("touch", [e.pageX, e.pageY]);
				options = {}; //reset options
				mousemoved = 0; //reset drag amount

				//get vars for ripple size, position calculation and maxDiameter
				//default option
				activeDimensions = [$active.outerWidth(), $active.outerHeight()];

				setOptions();

				//start ripple effect
				initalPos = [e.pageX, e.pageY];

				$ripple = $('<span/>');

				if (options.hasCustomRipple)
					$active.clone()
					.children('.legitRipple-custom').last()
					.removeClass('legitRipple-custom')
					.appendTo($ripple);

				$ripple.addClass('legitRipple-ripple').appendTo($active);


				positionAndScale(initalPos[0], initalPos[1], false);

				//slowing the first (=width) transition until mouseup
				initialTransition = $ripple.css("transition"); //for reset later
				var transitionDurs = $ripple.css("transition-duration").split(",");

				$ripple
					.css("transition-duration", [parseFloat(transitionDurs) * 7 + "s"]
						.concat(transitionDurs.slice(1)).join(","))
					.css("width", options.maxDiameter);
			},

			drag = function(e) {
				var scale;
				mousemoved++;
				//this needs to be here because it's used in positionAndScale to
				//determine if the element has been dragged

				if (options.scaleMode == "proportional") {
					//should try to avoid drag slow down during mousedown when
					//there's no intention of dragging

					var s = Math.pow(mousemoved, mousemoved / 100 * 5);
					//scaling could in fact be faster than the transition after
					//mouseup exponential to amount moved after pressing on button
					//maxScale =
					// 1+(parseFloat(options.maxDiameter) / 100) -
					// parseInt($ripple.css("width")) /
					// parseInt($active.css("width"));

					scale = s > 40 ? 40 : s; //no huge values

				} else if (options.scaleMode == "fixed") {
					var //xDistance = Math.sqrt(Math.pow(e.pageX - initalPos[0], 2)),
						yDistance = Math.sqrt(Math.pow(e.pageY - initalPos[1], 2));
					//console.log(xDistance, yDistance);

					if ( /*(xDistance > 50 ||*/ yDistance > 6 /*)*/ ) {
						release(); //might be slower than scale effect
						return; //end function
					}
				}

				positionAndScale(e.pageX, e.pageY, scale);
			},

			release = function() {
				console.log("release");
				/*
				tl;dr: this approach is very specific and doesn't scale to
				transitions we don't know anything about

				If the goal is to be able to change the speed of a linear css
				transition between two values of the same unit, this code fits
				very nicely and is the most lightweight and peformant solution
				because we know the transition we're working with. However, it
				doesn't translate for use with transitions we don't know about.
				If you want to change the speed of animations and have a scaling
				solution with support for easings other than linear, or
				different units so that transitions can be changed freely,
				you'll need to use css animations, plugins similar to transit.js
				or jQuery animations. */

				/*var widthUntilNow =
				  parseFloat(options.maxDiameter) /
				  (slowedWidthTD / ((new Date() - dragStartTime) / 1000));*/
				/* transitionEndValue / (transition duration / time transition ran for) */

				//widthUntilNow = widthUntilNow <= parseFloat(options.maxDiameter) ?
				//  widthUntilNow + options.maxDiameter.match(/\D+$/) /* add unit */ :
				//  options.maxDiameter;
				//console.log(widthUntilNow);

				//transition again from width already animated until mouseup

				//console.log($ripple.css("width", widthUntilNow));

				//stop transition at current state

				//console.log(initialTransition);

				$ripple
					.css("transition", "all 0s linear 0s")
					.css('width', $ripple.css('width'))
					.css("transition", initialTransition);

				setTimeout(function() { //js is weird…
					$ripple
						.css("width", options.maxDiameter)
						.css("opacity", "0");
				}, theCorrectAmountOfTimeout);
				//TODO: do this nicer

				//remove ripples when done
				$ripple.on('transitionend webkitTransitionEnd oTransitionEnd', function() {
					if ($(this).data("firstTransitionEnded")) {
						$(this).off().remove(); //remove redundant elements
					} else {
						$(this).data("firstTransitionEnded", true);
					}
				});

				$active = null;
			},


			positionAndScale = function(clickX, clickY, scale) {

				/*var adaptDragging = options.dragging || mousemoved === 0;
				console.log(adaptDragging, options.dragging, mousemoved);
				//positions need to be set on mousedown
				if (!options.dragging) {
				console.log("is", mousemoved);
				console.log(activeDimensions);
					activeDimensions = [
						parseFloat(options.maxDiameter),
						parseFloat(options.maxDiameter)
					];
				console.log(activeDimensions, options.maxDiameter);
				}*/
				var pos = [],
					adaptPos = [],

					//calculate ALL the things
					//default x-coords are always calculated - even though
					//that might be redundant - for markup convenience c:
					posI = [
						((clickX - $active.offset().left) / activeDimensions[0]), ((clickY - $active.offset()
							.top) / activeDimensions[1])
					],
					distanceFromMiddleI = [
						0.5 - posI[0], // middle: 0, left and right: 0.5
						0.5 - posI[1]
					],
					activeDimensionsRelToMaxDiameter = [
						(100 / parseFloat(options.maxDiameter)), (100 / parseFloat(options.maxDiameter)) *
						(activeDimensions[1] / activeDimensions[0]),
					],
					circleRelDistanceFromMiddleI = [
						distanceFromMiddleI[0] * activeDimensionsRelToMaxDiameter[0],
						distanceFromMiddleI[1] * activeDimensionsRelToMaxDiameter[1]
					];
				//TODO: do this with vectors


				var adaptDragging = options.dragging || mousemoved === 0;
				//positions need to be set on mousedown

				if (adaptDragging && $active.css("display") == "inline") { // options.adaptPos?
					//fix for inline elements (stackoverflow.com/questions/995838)

					var before = $('<span/>').text("Hi!").css("font-size", 0).prependTo($active),
						leftInlineOffset = before.offset().left;
					before.remove();
					pos[0] = clickX - leftInlineOffset + "px";
					console.log(clickX, leftInlineOffset, pos[0]);

					//Relative values for xpos don't work because, when resized,
					//inline elements can have bigger left than right offsets.
					//Firefox also shows wrong y-coords in that case.
					//See also: https://jsbin.com/wotuge/edit

					//console.log("leftInlineOffset", leftInlineOffset, inlineXpx);

				} else if (options.adaptPos) {
					adaptPos = [
						circleRelDistanceFromMiddleI[0] * 100 + "%",
						circleRelDistanceFromMiddleI[1] * 100 + "%"
					];
				}

				//run hook before position/transform change
				if (hook) //typeof hook == "function"
					hook($active, $ripple, posI, parseFloat(options.maxDiameter)/100);

				if (adaptDragging) {
					pos = [
						pos[0] || posI[0] * 100 + "%",
						posI[1] * 100 + "%"
					];
					$ripple
						.css("left", pos[0])
						.css("top", pos[1])
				}

				//position can't be done with translate3d because we need
				//an origin from which the width can transition which can't be
				//achieved with transform, so we use "top" and "left" instead
				$ripple.css(
					"transform",
					//using translate3d because it's hardware accelerated and browser
					//support is similar to that of transitions
					"translate3d(-50%, -50%, 0)" +
					(options.adaptPos ?
						"translate3d(" + adaptPos[0] + ", " + adaptPos[1] + ", 0)" : "") +
					(scale ? "scale(" + scale + ")" : "") //could be undefined
				);
			},

			setOptions = function() {

				var defaults = {
					//these are functions to be only processed when needed
					//todo: find a better way
					dragging: function() {
						return true;
					},
					adaptPos: function() { //depends on dragging
						return options.dragging;
					},
					maxDiameter: function() { //depends on adaptPos
						return Math.sqrt(
								Math.pow(activeDimensions[0], 2) +
								Math.pow(activeDimensions[1], 2)
							) /
							$active.outerWidth() *
							(options.adaptPos ? 100 : 200) + 1 + "%"; //+1 for rounding
					},
					//formula for the smallest enclosing circle of a rectancle
					scaleMode: function() {
						return "fixed";
					},
					hasCustomRipple: function() {
						return false;
					}
				};


				$.each(defaults, function(name, defaultValue) {
					options[name] = passedOptions.hasOwnProperty(name) ?
						passedOptions[name] : defaultValue();
				});

				//console.log("options before interdependencies", options);
				//option interdependencies
				//options.maxDiameter = getAttr("isCircle") ? "100%" : options.maxDiameter;
				//options.adaptPos = getAttr("maxDiameter") ? false : options.adaptPos;
				//options.scaleMode = getAttr("maxDiameter") ? false : options.scaleMode;
				//if the maxDiameter option is not default, position won't be adapted

				console.log("passed options:", passedOptions);
				console.log("rendered options:", options);
			};


		$(function() { //possibly redundant

			initTouchHandlers(); //make touch handlers work

			calledOn.addClass("legitRipple"); //add class for css

			//fixes webkit bug with inline elements by updating the property
			//TODO: be more specific
			var il = calledOn.filter(function(index) {
					return $(this).css("display") === "inline";
				})
				.css("display", "inline-block");
			setTimeout(function() {
				il.css("display", "inline").css("display", "");
			}, 0);


			//wrap void elements
			/* (should be done manually and thus consciously)
	        var voidElements = [
	            'AREA', 'BASE', 'BR', 'COL', 'EMBED', 'HR', 'IMG', 'INPUT',
	            'KEYGEN', 'LINK', 'MENUITEM', 'META', 'PARAM', 'SOURCE',
	            'TRACK', 'WBR', 'BASEFONT', 'BGSOUND', 'FRAME', 'ISINDEX'
	        ];

	        calledOn.each(function(i, o) {
	            //$(o).addClass("legitRipple");
	            if (~$.inArray($(this).prop('tagName').toUpperCase(), voidElements))
	                $(o).wrap('<div class="legitRipple-wrapper">');
	        });
			*/
		});

		calledOn.mousedown(function(e) {
			$active = $(this);
			touch(e);
		});
		$(document).mousemove(function(e) {
			if ($active) drag(e);
		});
		$(document).mouseup(function(e) {
			if ($active && e.which == 1) release();
		});
		$(window).scroll(function() {
			if ($active) release();
		});

		//disable image dragging because it would interfere with ripple effect
		calledOn /*.filter("img")*/ .on('dragstart', function(e) {
			e.preventDefault();
		});

	};

	//converting touch handlers to mouse events
	//ross.posterous.com/2008/08/19/iphone-touch-events-in-javascript
	//TODO: should I move these out of the plugin?
	function touchHandler(event) {
		var touch = event.changedTouches[0],

			simulatedEvent = document.createEvent("MouseEvent");
		simulatedEvent.initMouseEvent({
				touchstart: "mousedown",
				touchmove: "mousemove",
				touchend: "mouseup"
			}[event.type], true, true, window, 1,
			touch.screenX, touch.screenY,
			touch.clientX, touch.clientY, false,
			false, false, false, 0, null);

		touch.target.dispatchEvent(simulatedEvent);
		event.preventDefault();
	}

	function initTouchHandlers() {
		document.addEventListener("touchstart", touchHandler, true);
		document.addEventListener("touchmove", touchHandler, true);
		document.addEventListener("touchend", touchHandler, true);
		document.addEventListener("touchcancel", touchHandler, true);
	}

}(jQuery));

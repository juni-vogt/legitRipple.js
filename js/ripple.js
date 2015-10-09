(function($) {

	$.fn.ripple = function(passedOptions, callback) {

		var options,

			$active,
			activeDimensions,
			initialTransition,
			$ripple,

			mousedownCoords,
			mousemoved,

			//contextMenuOpen,

			theCorrectAmountOfTimeout = 20; //it's correct.

		this.off("mousedown.ripple touchstart.ripple dragstart.ripple")
			//if .ripple() is called on the same element twice, remove old event
			//handlers and use new options
			.on("mousedown.ripple touchstart.ripple", function(e) {
				$active = $(this);

				$active.addClass("legitRipple"); //add class for css

				if (e.type == "touchstart") {
					e.pageX = e.originalEvent.touches[0].pageX
					e.pageY = e.originalEvent.touches[0].pageY
				}

				touch(e.pageX, e.pageY);
			})
			.on('dragstart.ripple', function(e) {
				//disable native dragging on ripple elements by default
				if (!options.allowDragging)
					e.preventDefault();
			});

		$(document)
			.on("mousemove", function(e) {
				if ($active) drag(e.pageX, e.pageY);
			})
			.on("mouseup", function(e) {
				if ($active && e.which == 1) release();
			});

		$(window).on("scroll", function() {
			console.log("awd");
			if ($active) release();
		});

		var touch = function(x, y) {
				options = {}; //reset options
				mousemoved = 0; //reset drag amount

				//get vars for ripple size, position calculation and maxDiameter
				//default option
				activeDimensions = [$active.outerWidth(), $active.outerHeight()];

				setOptions();

				//start ripple effect
				mousedownCoords = [x, y];

				$ripple = $('<span/>');

				if (options.hasCustomRipple)
					$active.clone()
					.children('.legitRipple-custom').last()
					.removeClass('legitRipple-custom')
					.appendTo($ripple);

				$ripple.addClass('legitRipple-ripple').appendTo($active);


				positionAndScale(x, y, false);

				//slowing the first (=width) transition until mouseup
				initialTransition = $ripple.css("transition"); //for reset later
				var transitionDurs = $ripple.css("transition-duration").split(",");

				$ripple
					.css("transition-duration", [parseFloat(transitionDurs) * 7 + "s"]
						.concat(transitionDurs.slice(1)).join(","))
					.css("width", options.maxDiameter);
			},

			drag = function(x, y) {
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
					if (Math.abs(y - mousedownCoords[1]) > 6) {
						release(); //might be slower than scale effect
						return; //end function
					}
				}

				positionAndScale(x, y, scale);
			},

			release = function() {
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

			setOptions = function() {

				var defaults = {
					//some of these are functions, either for their values to be
					//only processed when needed or because they have
					//interdependencies with other options and thus need to
					//check them when being set.

					dragging: true,
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
					scaleMode: "fixed",
					hasCustomRipple: false,
					allowDragging: false
				};

				passedOptions = passedOptions || {};

				$.each(defaults, function(name, defaultVal) {
					options[name] = passedOptions.hasOwnProperty(name) ?
						passedOptions[name] :
						typeof defaultVal == "function" ?
						defaultVal() :
						defaultVal;
				});

				// console.log("passed options:", passedOptions);
				// console.log("rendered options:", options);
			},

			positionAndScale = function(clickX, clickY, scale) {

				var pos = [],

					//calculate ALL the things
					//for markup convenience, default x-coords are always
					//calculated - even though that might be redundant c:
					posI = [
						((clickX - $active.offset().left) / activeDimensions[0]),
						((clickY - $active.offset().top) / activeDimensions[1])
					],
					distanceFromMiddleI = [
						0.5 - posI[0], // middle: 0, left and right: 0.5
						0.5 - posI[1]
					],
					activeDimensionsRelToMaxDiameter = [
						(100 / parseFloat(options.maxDiameter)),
						(100 / parseFloat(options.maxDiameter)) *
						(activeDimensions[1] / activeDimensions[0]),
					],
					circleRelDistanceFromMiddleI = [
						distanceFromMiddleI[0] * activeDimensionsRelToMaxDiameter[0],
						distanceFromMiddleI[1] * activeDimensionsRelToMaxDiameter[1]
					];
				//TODO: do this with vectors


				var shouldChangePos = options.dragging || mousemoved === 0;
				//positions need to be set on mousedown

				if (shouldChangePos && $active.css("display") == "inline") {
					//fix for inline elements (stackoverflow.com/questions/995838)

					var before = $('<span/>')
						.text("Hi!")
						.css("font-size", 0)
						.prependTo($active),

						leftInlineOffset = before.offset().left;

					before.remove();

					pos[0] = clickX - leftInlineOffset + "px";
					//console.log(clickX, leftInlineOffset, pos[0]);

					//Relative values for xpos don't work because, when resized,
					//inline elements can have bigger left than right offsets.
					//Firefox also shows wrong y-coords in that case.
					//See also: https://jsbin.com/wotuge/edit

					//console.log("leftInlineOffset", leftInlineOffset, inlineXpx);
				}

				if (shouldChangePos) {
					pos = [
						pos[0] || posI[0] * 100 + "%",
						posI[1] * 100 + "%"
					];
					$ripple
						.css("left", pos[0])
						.css("top", pos[1]);
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
						"translate3d(" +
						circleRelDistanceFromMiddleI[0] * 100 + "%, " +
						circleRelDistanceFromMiddleI[1] * 100 + "%" +
						", 0)" : "") +
					(scale ? "scale(" + scale + ")" : "") //could be undefined
				);

				//run callback after css change
				if (callback) //typeof callback == "function"
					callback($active, $ripple, posI, parseFloat(options.maxDiameter) / 100);
			};

		return this;
	};

	$.ripple = function(dataObj) {
		$.each(dataObj, function(selector, optionsAndCallback) {

			$(selector).ripple(
				//optionsAndCallback could either be
				//an array containing an object for options and a callback
				//function or
				//an object for options
				optionsAndCallback[0] || optionsAndCallback,
				optionsAndCallback[1] //undefined if not an array
			)
		});
	};

	//this is my first jQuery plugin, so please be harsh :)

}(jQuery));

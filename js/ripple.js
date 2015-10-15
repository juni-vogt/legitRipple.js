(function($) {

	$.fn.ripple = function(passedOptions, callback) {

		var options,

			$active,
			activeDimensions,
			$ripple,

			mousedownCoords,
			mousemoved;

		var isTouchDevice = //stackoverflow.com/a/4819886
			'ontouchstart' in window ||
			'onmsgesturechange' in window, //ie10
			filterEvents = function(touch, mouse) {
				//touch events or mouse events - there can only be one!
				return (isTouchDevice ? "touch" + touch : "mouse" + mouse) + ".ripple"
			},
			fingers = function(e) {
				//returns how many fingers are on the screen or 0 for mouse
				return isTouchDevice ? e.originalEvent.touches.length : 0;
			},
			touchConvert = function(e) {
				//returns coordinates of touch or mouse events
				if (isTouchDevice) e = e.originalEvent.touches[0];
				return [e.pageX, e.pageY];
			};


		this.off(".ripple")
			//if .ripple() is called on the same element twice, remove old event
			//handlers and use new options
			.data("unbound", true);
		//there's no way to unbind the $(document) events because they are
		//neither specific to the ripple elements nor identifyable through a
		//namespace. Thus, the only way to stop them from working is by having
		//them work conditionally and access some global object to tell them
		//whether they should work or not. Binding data to the $active element
		//seems to be the nicest way :/


		if (passedOptions && passedOptions.unbind)
			return this; //dont rebind

		this.addClass("legitRipple") //only adds if not added 👍
			.removeData("unbound")
			.on(filterEvents("start", "down"), function(e) {
				if (fingers(e) <= 1) {
					$active = $(this);
					touch(touchConvert(e));
				}
			})
			.on('dragstart.ripple', function(e) {
				//disable native dragging on ripple elements by default
				if (!options.allowDragging)
					e.preventDefault();
			});

		$(document)
			.on(filterEvents("move", "move"), function(e) {
				if ($active &&
					!$active.data("unbound") &&
					fingers(e) <= 1)
					drag(touchConvert(e));

			})
			.on(filterEvents("end", "up"), function(e) {
				if ($active &&
					!$active.data("unbound") &&
					!fingers(e)) //if no fingers remaining
					release();
			})
			.on('contextmenu.ripple', function(e) {
				//workaround for webkit
				//unlike gecko, webkit doesn't trigger mouseup when opening the
				//context menu, which wouldn't trigger release()
				if ('WebkitAppearance' in document.documentElement.style) //is webkit
					$(document).trigger('mouseup.ripple');
			});

		$(window).on("scroll.ripple blur.ripple", function() {
			//blur for tab switching on chrome mobile
			if ($active && !$active.data("unbound"))
				release();
		});

		var touch = function(coords) {
				options = {}; //reset options
				mousemoved = 0; //reset drag amount

				//get vars for ripple size, position calculation and maxDiameter
				//default option
				activeDimensions = [$active.outerWidth(), $active.outerHeight()];

				setOptions();

				//start ripple effect
				mousedownCoords = coords;

				$ripple = $('<span/>');

				if (options.hasCustomRipple)
					$active.clone()
					.children('.legitRipple-custom').last()
					.removeClass('legitRipple-custom')
					.appendTo($ripple);

				$ripple.addClass('legitRipple-ripple').appendTo($active);


				positionAndScale(coords, false);

				//slowing the first (=width) transition until mouseup
				var transitionDurs = $ripple.css("transition-duration").split(",");

				$ripple
					.css("transition-duration", [parseFloat(transitionDurs) * 5.5 + "s"]
						.concat(transitionDurs.slice(1)).join(","))
					.css("width", options.maxDiameter);
			},

			drag = function(coords) {
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
					if (Math.abs(coords[1] - mousedownCoords[1]) > 6) {
						release(); //might be slower than scale effect
						return; //end function
					}
				}

				positionAndScale(coords, scale);
			},

			release = function() {
				/*
				this approach to changing transition speed is very specific to
				the plugin's use case because it's only works with linear
				easing. If for a more scaling solution, try css animations,
				plugins similar to transit.js or jQuery animations.
				*/

				$ripple
					//pausing transition
					.css('width', $ripple.css('width'))
					.css("transition", "none") //there can't be custom transitions :(

					//starting transition again with original (shorter) duration
					.css("transition", "") //removes overwriting transition property
					.css('width', $ripple.css('width'))
					.css("width", options.maxDiameter)
					.css("opacity", "0");

				$active = null; //allows to only trigger release() once

				//remove ripples when both width and opacity transitions ended
				$ripple.on('transitionend webkitTransitionEnd oTransitionEnd', function() {
					if ($(this).data("firstEnded")) {
						$(this).off().remove();
					} else {
						$(this).data("firstEnded", true);
					}
				});
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

			positionAndScale = function(coords, scale) {

				var pos = [],

					//calculate ALL the things
					//for markup convenience, default x-coords are always
					//calculated - even though that might be redundant c:
					posI = [
						((coords[0] - $active.offset().left) / activeDimensions[0]),
						((coords[1] - $active.offset().top) / activeDimensions[1])
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

					pos = [
						coords[0] - leftInlineOffset + "px",
						coords[1] - $active.offset().top + "px"
					];

					//Using absolute values because relative ones are buggy.
					//Relative values for xpos don't work because, when resized,
					//inline elements can have bigger left than right offsets.
					//Gecko and webkit also treat relative values for ypos
					//differently as webkit takes 100% as the height of one line
					//while gecko takes 100% as the height of the whole element.
					//See also: https://jsbin.com/wotuge/edit
				}

				if (shouldChangePos) {
					pos = [
						pos[0] || posI[0] * 100 + "%",
						pos[1] || posI[1] * 100 + "%"
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

	$.ripple.destroy = function() {
		$(".legitRipple").removeClass("legitRipple")
			.add(window).add(document).off('.ripple');
		$(".legitRipple-ripple").remove();
		$active = null;
	};

	//this is my first jQuery plugin, so please be harsh :)

}(jQuery));

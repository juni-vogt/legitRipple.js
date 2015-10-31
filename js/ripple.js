(function($) {

	$.fn.ripple = function(passedOptions) {

		//apply plugin to each element it's called on individually
		if (this.length > 1)
			return this.each(function(index, el) {
				$(el).ripple(passedOptions);
			});


		// Events

		this.off(".ripple")
			//if .ripple() is called on the same element twice, remove old event
			//handlers and use new options
			.data("unbound", true);
		//there's no way to unbind the $(document) events specific to the ripple,
		//which should overwritten, because they are neither specific to the
		//ripple elements nor identifyable through a namespace. Thus, the only
		//way to stop them from working is by having them work conditionally and
		//access some global object to tell them whether they should work or
		//not. Binding data to the $active element seems to be the nicest way :/


		if (passedOptions && passedOptions.unbind)
			return this; //end here, dont rebind events

		var $active, //ripple container
			$ripple, //ripple element

			initEventID, //unique identifier of the touch event which triggered the ripple

			isTouchEvent = function(e) {
				return !!e.type.match(/^touch/);
				//return e.type.startsWith("touch");
				//return e.originalEvent.constructor.name == "TouchEvent";
			},
			getCoords = function(e, id) {
				//returns array with coordinates of either touch or mouse events
				if (isTouchEvent(e))
					e = getTouchEventByID(e.originalEvent.touches, id);
				return [e.pageX, e.pageY];
			},
			getTouchEventByID = function(touchEvents, id) {
				//filter touch events array by identifier
				//returns touch event or undefined
				return $.makeArray(touchEvents).filter(function(o, i) {
					return o.identifier == id;
				})[0]; //[0] -> there can only be one
			},

			eventsToBlock = 0,
			shouldBeBlocked = function(e) {

				if (e.type == "touchstart")
					eventsToBlock = 3;
				if (e.type == "scroll")
					eventsToBlock = 0;

				var shouldBlock = eventsToBlock && !isTouchEvent(e);

				if (shouldBlock) eventsToBlock--;

				// if (shouldBlock)
				// 	console.log("blocked", e.type, eventsToBlock);

				return !shouldBlock;
			};

		/*
		Touch events simulate mouse events on two occasions:
		touchstart, [no touchmove], touchend > mousemove, mousedown, mouseup
		touchstart, [hold] > mousemove, mousedown, contextmenu
		However, we want to prevent that.
		Introducing: eventsToBlock, an integer that controls whether events
		should be blocked or not. *audience cheers*
		And here comes the good part, when the ripple effect starts it is
		set to 3 and afterwards decreased by 1 for every of the three next
		events! Thus, we can keep track of the simulated mouse events caused
		by touch events and prevent them from interfering with our plugin,
		without interfering with the event handling of other plugins!
		*someone faints*
		And there's one more thing…
		shouldBeBlocked() is a function that does all of this seamlessly and
		appropriately to the context it's called in!
		*audience goes comepletely nuts*
		*/

		this.addClass("legitRipple") //only adds if not added 👍
			.removeData("unbound")
			.on("mousedown.ripple touchstart.ripple", function(e) {
				if (shouldBeBlocked(e) &&
					//shouldBeBlocked always needs to be tested so it needs to
					//be first
					!$active) {
					$active = $(this);

					initEventID = isTouchEvent(e) ?
						e.originalEvent.changedTouches[0].identifier :
						//using only the first changed touch because there can't
						//be multiple ripples in the same element
						-1; //mouse events don't have identifiers

					touch(getCoords(e, initEventID));
				}
			})
			.on('dragstart.ripple', function(e) {
				//disable native dragging on ripple elements by default
				//cuz its annoying
				if (!options.allowDragging)
					e.preventDefault();
			});

		$(document)
			.on("mousemove.ripple touchmove.ripple", function(e) {
				if (shouldBeBlocked(e) &&
					$active && !$active.data("unbound") &&
					(isTouchEvent(e) ?
						getTouchEventByID(e.originalEvent.changedTouches, initEventID) : //if ripple init event changed
						!~initEventID)) //if init event was mouse event
					drag(getCoords(e, initEventID));
			})
			.on("mouseup.ripple touchend.ripple touchcancel.ripple", function(e) {
				if (shouldBeBlocked(e) &&
					$active && !$active.data("unbound") &&
					(isTouchEvent(e) ?
						getTouchEventByID(e.originalEvent.changedTouches, initEventID) :
						!~initEventID))
					release();
			})
			.on('contextmenu.ripple', function(e) {
				shouldBeBlocked(e);
			});

		$(window).on("scroll.ripple", function(e) {
			shouldBeBlocked(e);
			if ($active && !$active.data("unbound")) release();
		});


		var options,
			activeDimensions,
			mousedownCoords,
			mousemoved,

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
					allowDragging: false,
					callback: null
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


			//ripple behaviour functions

			touch = function(coords) {
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
						(activeDimensions[1] / activeDimensions[0])
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
				if (options.callback) //typeof callback == "function"
					options.callback($active, $ripple, posI, options.maxDiameter);
			};

		return this;
	};

	$.ripple = function(dataObj) {
		$.each(dataObj, function(selector, options) {
			$(selector).ripple(options);
		});
	};

	$.ripple.destroy = function() {
		$(".legitRipple").removeClass("legitRipple")
			.add(window).add(document).off('.ripple');
		$(".legitRipple-ripple").remove();
		//TODO: $active = null;
	};

	//this is my first jQuery plugin, so please be harsh ;)

}(jQuery));

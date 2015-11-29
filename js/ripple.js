(function($) {

	$.fn.ripple = function(passedOptions) {

		//apply plugin to each element it's called on individually
		if (this.length > 1)
			return this.each(function(i, el) {
				$(el).ripple(passedOptions);
			});

		passedOptions = passedOptions || {};


		// Event handling

		// unbind old event handlers if already existant

		this.off('.ripple')
			.data('unbound', true);
		// there's no way to unbind the $(document) events specific to the
		// ripple, which should be overwritten, because they are neither specific to the
		// ripple elements nor identifyable through a namespace. Thus, the only
		// way to stop them from working is by having them work conditionally and
		// access some globally available object to tell them whether they should work or
		// not. Binding data to the $container element seems to be the nicest way :/

		if (passedOptions.unbind)
			return this; //end here, dont rebind events


		// binding new events

		var dragging = function() {
			return $container && !$container.data('unbound');
		};

		this.addClass('legitRipple') // only adds if not added 👍
			.removeData('unbound')
			// using custom events
			.on('tap.ripple', function(e) {
				if (!dragging()) {
					$container = $(this);

					touch(e.coords);
				}
			})
			.on('dragstart.ripple', function(e) {
				// disable native dragging on ripple elements by default
				// cuz its annoying
				if (!options.allowDragging)
					e.preventDefault();
			});

		$(document)
			.on('move.ripple', function(e) {
				if (dragging())
					drag(e.coords);
			})
			.on('end.ripple', function() {
				if (dragging())
					release();
			})

		$(window).on('scroll.ripple', function(e) {
			if (dragging())
				release();
		});


		/*
		Touch event handling

			Touch events simulate mouse events on two occasions:
			touchstart, [no touchmove], touchend => mousemove, mousedown, mouseup
			touchstart, [hold] => mousemove, mousedown, contextmenu
			However, we don't want the fake events to trigger the ripple.
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

		var initEventID, //unique identifier of the touch event which triggered the ripple

			isTouchEvent = function(e) {
				return !!e.type.match(/^touch/);
				//return e.type.startsWith('touch');
				//return e.originalEvent.constructor.name == 'TouchEvent';
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

				if (e.type == 'touchstart')
					eventsToBlock = 3;
				if (e.type == 'scroll')
					eventsToBlock = 0;

				var shouldBlock = eventsToBlock && !isTouchEvent(e);

				if (shouldBlock) eventsToBlock--;

				// if (shouldBlock)
				// 	console.log('blocked', e.type, eventsToBlock);

				return !shouldBlock;
			},

			// tap delay
			$lastTapTarget,
			lastTapEvent,
			tapTimeout;

		this.on('mousedown.ripple touchstart.ripple', function(e) {
			if (shouldBeBlocked(e)) {

				initEventID = isTouchEvent(e) ?
					e.originalEvent.changedTouches[0].identifier :
					// using only the first changed touch because there
					// can't be multiple ripples in the same element
					-1; // mouse events don't have identifiers

				$lastTapTarget = $(this);
				lastTapEvent = $.Event('tap', {
					coords: getCoords(e, initEventID)
				});

				if (~initEventID) // is touch event
				// tapping is delayed a bit to enable scrolling past ripple
				// elements without triggering a ripple
					tapTimeout = setTimeout(function() {
					$lastTapTarget.trigger(lastTapEvent);
					tapTimeout = null;
				}, options.touchDelay);
				else
					$lastTapTarget.trigger(lastTapEvent);
			}
		});


		$(document)
			.on('mousemove.ripple touchmove.ripple ' +
				'mouseup.ripple touchend.ripple touchcancel.ripple',
				function(e) {

					var isMove = e.type.match(/move/);

					if (tapTimeout && !isMove) {
						// trigger ripple on touchend/-cancel if it had already
						// been cueued
						clearTimeout(tapTimeout);
						tapTimeout = null;
						// clearTimeout doesn't make the timeout's value falsey
						$lastTapTarget.trigger(lastTapEvent);
					}


					if (shouldBeBlocked(e) &&
						(isTouchEvent(e) ?
							// if ripple init event changed
							getTouchEventByID(
								e.originalEvent.changedTouches,
								initEventID
							) :
							// if init event was mouse event
							!~initEventID
						))
						$(this).trigger(isMove ?
							$.Event('move', {
								coords: getCoords(e, initEventID)
							}) :
							'end'
						);
				})
			.on('contextmenu.ripple', function(e) {
				shouldBeBlocked(e);
			})
			.on('touchmove', function() {
				clearTimeout(tapTimeout);
				tapTimeout = null;
			});


		var $container, // ripple container element
			$ripple, // ripple element

			options = {},
			containerDimensions,
			mousedownCoords,
			mousemoved = 0,

			setOptions = function() {

				var defaults = {
					// some of these are functions, either for their values to be
					// only processed when needed or because they have
					// interdependencies with other options and thus need to
					// check them when being set.

					fixedPos: null,
					dragging: function() { // depends on fixedPos
						return !options.fixedPos;
					},
					adaptPos: function() { // depends on dragging
						return options.dragging;
					},
					maxDiameter: function() { // depends on adaptPos
						return Math.sqrt(
								Math.pow(containerDimensions[0], 2) +
								Math.pow(containerDimensions[1], 2)
							) /
							$container.outerWidth() *
							Math.ceil(options.adaptPos ? 100 : 200) + '%';
						// formula for the smallest enclosing circle of a
						// rectancle
					},
					scaleMode: 'fixed',
					template: null,
					allowDragging: false,
					touchDelay: 100,
					callback: null
				};

				// extend options with passed options
				$.each(defaults, function(name, defaultVal) {
					options[name] = name in passedOptions ?
						passedOptions[name] :
						typeof defaultVal == 'function' ?
						defaultVal() :
						defaultVal;
				});
			},


			// ripple behaviour functions

			touch = function(coords) {
				//get vars for ripple size, position calculation and maxDiameter
				//default option
				containerDimensions = [
					$container.outerWidth(), $container.outerHeight()
				];

				setOptions();

				mousedownCoords = coords;


				// make ripple element

				$ripple = $('<span/>').addClass('legitRipple-ripple');

				if (options.template)
					$ripple.append(
						(typeof options.template === 'object' ?
							options.template :
							$container.children('.legitRipple-template')
							.last())
						.clone()
						.removeClass('legitRipple-template')
					).addClass('legitRipple-custom');

				$ripple.appendTo($container);


				positionAndScale(coords, false);

				//slowing the width transition until mouseup
				var transitionDurs =
					$ripple.css('transition-duration').split(','),
					newTransitionDur = [
						parseFloat(transitionDurs[0]) * 5.5 + 's' // slow first
					]
					.concat(transitionDurs.slice(1)).join(',');

				$ripple
					.css('transition-duration', newTransitionDur)
					.css('width', options.maxDiameter);

				//remove ripples when both width and opacity transitions ended
				$ripple.on('transitionend webkitTransitionEnd oTransitionEnd', function() {
					if ($(this).data('oneEnded'))
						$(this).off().remove();
					else
						$(this).data('oneEnded', true);
				});
			},

			drag = function(coords) {
				var scale;
				mousemoved++;
				// this needs to be here because it's used in positionAndScale
				// to determine if the element has been dragged

				if (options.scaleMode === 'proportional') {
					// should try to avoid drag slow down during mousedown when
					// there's no intention of dragging

					var newScale = Math.pow(mousemoved, mousemoved / 100 * .6);
					// exponential to amount moved after pressing on button.
					// scaling could in fact be faster than the transition after
					// mouseup.
					scale = newScale > 40 ? 40 : newScale; // no huge values

				} else if (options.scaleMode == 'fixed') {
					if (Math.abs(coords[1] - mousedownCoords[1]) > 6) {
						release();
						return; //end function
					}
				}

				positionAndScale(coords, scale);
			},

			release = function() {
				/*
				this approach to changing transition speed is very specific to
				the plugin's use case because it's only works with linear
				easing. For a more scaling solution, try css animations,
				plugins similar to transit.js or jQuery animations.
				*/

				$ripple
				// stopping old transition
					.css('width', $ripple.css('width'))
					.css('transition', 'none')
					// removes slow transition duration
					// there can't be custom transitions :(
					// starting transition again with original (shorter) duration
					.css('transition', '')
					//removes overwriting transition property
					.css('width', $ripple.css('width'))
					.css('width', options.maxDiameter)
					.css('opacity', '0');

				//reset temporary variables
				$container = null; //allows to only trigger release() once
				mousemoved = 0;
			},

			positionAndScale = function(coords, scale) {

				var pos = [],

					// calculate ALL the things
					// for markup convenience, default x-coords are always
					// calculated - even though that might be redundant c:
					posI = options.fixedPos === true ? [.5, .5] : [
						(options.fixedPos ?
							options.fixedPos[0] :
							coords[0] - $container.offset().left) /
							containerDimensions[0],
						(options.fixedPos ?
							options.fixedPos[1] :
							coords[1] - $container.offset().top) /
							containerDimensions[1]
					],
					distanceFromMiddleI = [
						0.5 - posI[0], // middle: 0, left and right: 0.5
						0.5 - posI[1]
					],
					containerDimensionsRelToMaxDiameter = [
						(100 / parseFloat(options.maxDiameter)),
						(100 / parseFloat(options.maxDiameter)) *
						(containerDimensions[1] / containerDimensions[0])
					],
					circleRelDistanceFromMiddleI = [
						distanceFromMiddleI[0] * containerDimensionsRelToMaxDiameter[0],
						distanceFromMiddleI[1] * containerDimensionsRelToMaxDiameter[1]
					];
				//TODO: do this with vectors

				// positions need to be set on mousedown
				var shouldChangePos = options.dragging || mousemoved === 0;

				if (shouldChangePos && $container.css('display') == 'inline') {
					// fix for inline elements (stackoverflow.com/questions/995838)

					var before = $('<span/>')
						.text('Hi!')
						.css('font-size', 0)
						.prependTo($container),

						leftInlineOffset = before.offset().left;

					before.remove();

					pos = [
						coords[0] - leftInlineOffset + 'px',
						coords[1] - $container.offset().top + 'px'
					];

					// Using absolute values because relative ones are buggy.
					// Relative values for xpos don't work because, when
					// resized, inline elements can have bigger left than right
					// offsets. Gecko and webkit also treat relative values for
					// ypos differently as webkit takes 100% as the height of
					// one line while gecko takes 100% as the height of the
					// whole element.
					// See also: https://jsbin.com/wotuge/edit
				}


				// position can't be done with translate3d because we need
				// an origin from which the width can transition which can't be
				// achieved with transform, so we use 'top' and 'left' instead

				if (shouldChangePos) {
					$ripple
						.css('left', pos[0] || posI[0] * 100 + '%')
						.css('top', pos[1] || posI[1] * 100 + '%');
				}

				$ripple.css(
					'transform',
					// using translate3d because it's hardware accelerated and
					// browser support is similar to that of transitions
					'translate3d(-50%, -50%, 0)' +
					(options.adaptPos ?
						'translate3d(' +
						circleRelDistanceFromMiddleI[0] * 100 + '%, ' +
						circleRelDistanceFromMiddleI[1] * 100 + '%' +
						', 0)' : '') +
					(scale ? 'scale(' + scale + ')' : '') // could be undefined
					// pixelated scaling :/
				);

				// run callback after css change
				if (options.callback)
					options.callback($container, $ripple, posI, options.maxDiameter);
			};

		return this;
	};


	$.ripple = function(dataObj) {
		$.each(dataObj, function(selector, options) {
			$(selector).ripple(options);
		});
	};

	$.ripple.destroy = function() {
		$('.legitRipple').removeClass('legitRipple')
			.add(window).add(document).off('.ripple');
		$('.legitRipple-ripple').remove();
		//TODO: $container = null;
	};

	// This is my first jQuery plugin, so please be harsh ;)

}(jQuery));

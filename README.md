# legitRipple.js
A lightweight, CSS based jQuery plugin for material-design ripple effects.<br>
<br>
<img src="https://raw.githubusercontent.com/matthias-vogt/legitRipple.js/gh-pages/demo-media/demo.gif" alt="Demo" height="90">
<br>
Demo: https://matthias-vogt.github.io/legitRipple.js/


## Usage
The plugin depends on [jQuery](https://jquery.com/), so make sure you have that loaded. Afterwards, you can use it like this:
```javascript
//ripple with default options
$(".some, .elements").ripple();
```
```javascript
//ripple with custom options
$(".elements").ripple({
  scaleMode: false,
  maxDiameter: "100%"
});
```

You can also use alternative syntax if you have a lot of ripple elements with different options.
```javascript
$.ripple({
  ".material": {},
  ".material.circle": {maxDiameter: "100%"},
  ".callback": {
    hasCustomRipple: true
    callback: function($container, $ripple, posI, maxDiameter) {
      //is called whenever the ripple's css properties change
    }
  }
});
```


### Options
| Option            | Description                                                                                                                                                                                                                                                                                | Expected Input                                     | Default   |
|-------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------|-----------|
| `maxDiameter`     | Sets a ripple max-width. `adaptPos: true` requires this to be in %; can be any unit with `adaptPos: false`. 100% for circles.                                                                                                                                                              | Number with unit as `String` ("100%" or "3.125em") | `false`   |
| `dragging`        | Whether the ripple should be able to be dragged                                                                                                                                                                                                                                            | `Boolean`                                          | `true`    |
| `adaptPos`        | Whether to take the mouse position relative to the ripple-container's dimensions into account when positioning the ripple. Note: [more info on "adaptPos"](#why-another-ripple-plugin)                                                                                                     | `Boolean`                                          | `true`    |
| `scaleMode`       | How to scale the ripple while dragging:<br><br>`"proportional"`: Proportional to the amount it was dragged. Will probably become much bigger than its container.<br><br>`"fixed"`: Don't scale and release ripple while dragging upwards.<br><br>falsey values: Don't scale while dragging | `String` or falsey value                           | `"fixed"` |
| `hasCustomRipple` | If using a [custom ripple element](#custom-elements).                                                                                                                                                                                                                                      | `Boolean`                                          | `false`   |
| `allowDragging`   | HTML5 dragging is disabled on ripple elements by default for nicer interaction.                                                                                                                                                                                                            | `Boolean`                                          | `false`   |
| `unbind`          | When set, unbinds all of the ripple's event handlers (see [Destroying, unbinding and overwriting](#destroying-unbinding-and-overwriting))                                                                                                                                                                                       | `Boolean`                                          | `false`   |
| `callback`        | A function to be called each time the ripple element's style property changes                                                                                                                                                                                                              | `function`                                         | `null`    |
#### Coming soon
| Option               | Description                                                       | Expected Input                             | Default |
|----------------------|-------------------------------------------------------------------|--------------------------------------------|---------|
| `rippleOnHover`      | Whether to use the ripple as a hover effect                       | Boolean                                    | `false` |
| `destinationElement` | An element other than the clicked one the ripple should travel to | jQuery Element Object or selector `String` | `null`  |


### Destroying, unbinding and overwriting
Ripples can be overwritten as you'd expect:
```javascript
$(".ripple").ripple();
$(".ripple.noScale").ripple({scaleMode: 0});
//.ripple has default options
//.ripple.noScale has default options and {scaleMode: 0}

$(".foo, .bar, .baz").ripple({scaleMode: 0});
$(".bar").ripple({dragging: false});
//.foo and .baz have default options and {scaleMode: 0}
//.bar has default options and {dragging: false}
```

You can also unbind event handlers from ripples or destroy all ripples.
```javascript
$(".ripple").ripple({unbind: true});
//removes all event handlers from a ripple element.
//if you call it during a ripple animation, the animation
//will still complete

$.ripple.destroy();
//stops any ripple animations in their tracks and removes any
//plugin created elements, classes and event bindings.
//calling .ripple() will still work
```


### Custom ripples
#### Custom CSS
Ripples can be targeted using the `.legitRipple-ripple` class, their containers using `.legitRipple`. CSS selectors for ripples shouldn't be order-specific to target all ripples since there can be multiple ripples active in an element at once. For example, `.legitRipple-ripple:first-of-type` wouldn't target all possible ripples.
```css
.container .legitRipple-ripple {
    background: yellow;
    /* You can change the transition properties too!
       Just don't try and change the easing. */
    transition-duration: .15s, .9s; /*width, opacity*/
}
```

#### Custom elements
You can even use custom elements for the ripple by setting the `hasCustomRipple` option to true and adding the following markup to your HTML:
```html
<div>
    Container Element
    <div class="legitRipple-custom">Your custom element</div>
</div>
```
How the code will look after a ripple is triggered:
```html
<div class="legitRipple">
    Container Element
    <div class="legitRipple-custom">Your custom element</div>
    <span class="legitRipple-ripple">
        <div>Your custom element</div>
    </span>
</div>
```

The custom element is used as a template and will be hidden by CSS on load. When a ripple is triggered, the custom element will be `.clone()`'d, the `legitRipple-custom` class removed and wrapped in a `<span/>` with a `legitRipple-ripple` class before being appended to the ripple container.

By default, when using custom ripple elements, each direct child of `.legitRipple-ripple` will be scaled up to cover the entire ripple container, like:

```css
.legitRipple-custom ~ .legitRipple-ripple > * {
  position: absolute;
  top: 50%;
  left: 50%;
  min-width: 100%;
  min-height: 100%;
  transform: translate(-50%, -50%);
}
```


#### Manually controlling ripples
Since ripple elements will only be removed on `transitionend`, adding ```css opacity: 1 !important;``` to their CSS will keep them alive forever.
If you want to remove these ripples later, just change the CSS via jQuery like:
```javascript
$(".ripple-element>.legitRipple-ripple").css("opacity", "0 !important");
```

Moreover, you can manually trigger ripples [like in the demo](https://github.com/matthias-vogt/legitRipple.js/blob/gh-pages/js/demo.js#L68-94) by faking mousedown/touchstart events and do some [crazy stuff](http://codepen.io/matze/pen/PPJxyr) with it.


### Callback
For the callback option, you can pass a function which is called everytime the ripple's style attribute changes.
```javascript
$(".elements").ripple({callback: function($container, $ripple, posI, maxDiameter) {
    /* $container: The ripple container element
       $ripple: The ripple element
       posI: An array with two indices (0 <= i <= 1) for the
            x- and y-position of the ripple relative to the parent
       maxDiameter: A string with the max-width of the ripple
            element with unit ("120%", "10em", …)
     */
}});
```


## Touch support
The plugin has full touch support. You can even use multi-touch for multiple ripples in different elements at the same time.


## Why another ripple plugin?
There are *[a lot](https://github.com/search?l=JavaScript&q=material+ripple&type=Repositories&utf8=%E2%9C%9)* of javascript ripple plugins out there but I noticed that none of them replicate the ripple on android exactly. Which is not surprising since it's not documented in [google's Material Design spec](https://www.google.com/design/spec/animation/responsive-interaction.html) either.

On android, the ripple itself doesn't spread in all directions equally as fast. It's positioned relative to the touch position as the touch position is positioned relative to the ripple's container.

![Reference 1](https://raw.githubusercontent.com/matthias-vogt/legitRipple.js/gh-pages/demo-media/reference-1.gif)
![Reference 2](https://raw.githubusercontent.com/matthias-vogt/legitRipple.js/gh-pages/demo-media/reference-2.gif)
<br>*App courtesy of [Music](https://play.google.com/store/apps/details?id=com.sonyericsson.music) and [Phonograph Music Player](https://play.google.com/store/apps/details?id=com.kabouzeid.gramophone)*

This effect, however, hadn't been replicated in any plugins yet, so I decided to make one.

Adding to the incentive was that those I've seen don't slow the ripple spread on mousedown and speed it up again on mouseup or don't have, what in this plugin is called the `"fixed"` `scaleMode` implemented correctly.

This plugin is probably also the only one with customizable ripples and working with inline elements.

You could maybe say that it's a bit overkill for this simple effect but that's your call to decide ;)


## Browser support
This uses CSS3 transitions, so [browser support](http://caniuse.com/#feat=css-transitions) is ie10+.
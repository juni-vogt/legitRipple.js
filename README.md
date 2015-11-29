# legitRipple.js
A jQuery plugin for legit Material-Design ripple effects.<br>
<br>
<img src="https://raw.githubusercontent.com/matthias-vogt/legitRipple.js/gh-pages/demo-media/demo.gif" alt="Demo" height="90">
<br>
Demo: https://matthias-vogt.github.io/legitRipple.js/

* **Lightweight**: <2kb gzipped
* **Configurable**: Lots of options, custom HTML, custom CSS (custom transition durations)
* **CSS based**: Smooth CSS transitions
* **Legit**: Nice interaction, Glorious multi-touch

## Usage
legitRipple.js depends on [jQuery](https://jquery.com/), so make sure you have that loaded. When the DOM is ready, you can use it like this:
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
  ".customHTML": {template: $("<p/>").text("Custom ripple content!")},
  ".callback": {
    callback: function($container, $ripple, posI, maxDiameter) {
      //is called whenever the ripple's css properties change
    }
  }
});
```

You can't apply the ripple effect on [`void elements`](//www.w3.org/TR/html-markup/syntax.html#void-element) (those that can't have child elements; `<img>`, `<input>, …). However, you can simply wrap them and apply the effect to the wrapper element.

### Install
```html
<link href="stylesheet" type="text/css" href="ripple.min.css">
<script src="jquery.min.js"></script>
<script src="ripple.min.js"></script>
```
For better loading performance, I'd recommend loading the script as non-critical content (by putting the `<script>` and `<style>` tags at the end of the body tag).

Install and update easily using [bower](http://bower.io):
```sh
bower install --save legitripple
```

### Options
| Option            | Description                                                                                                                                                                                                                                                                                | Expected Input                                                         | Default   |
|-------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------|-----------|
| `maxDiameter`     | Gives the ripple a max-width. `adaptPos: true` requires this to be in %; can be any unit with `adaptPos: false`. 100% for circles.                                                                                                                                                              | Number with unit as `String` ("100%" or "3.125em")                     | `false`   |
| `dragging`        | Whether the ripple should be able to be dragged.                                                                                                                                                                                                                                            | `Boolean`                                                              | `true`    |
| `adaptPos`        | Whether to take the mouse position relative to the ripple-container's dimensions into account when positioning the ripple. Note: [more info on "adaptPos"](#motivation)                                                                                                     | `Boolean`                                                              | `true`    |
| `scaleMode`       | How to scale the ripple while dragging:<br><br>`"proportional"`: Proportional to the amount it was dragged. Will probably become much bigger than its container.<br><br>`"fixed"`: Don't scale and release ripple while dragging upwards.<br><br>falsey values: Don't scale while dragging | `String` or falsey value                                               | `"fixed"` |
| `template` | Set the HTML content of ripples. See: [custom ripple element](#custom-elements).                                                                                                                                                                                                                                      | `NodeList`, Element or `true` when the template is in the HTML markup                                                              | `null`   |
| `fixedPos`        | Gives the ripple a fixed position in the parent.                                                                                                                                                                                                                                           | `true` for centered position or `Array` with x- and y-coordinates relative to the parent's offset (e.g. [20, 40] = x: 20px, y: 40px) | `false`   |
| `allowDragging`   | HTML5 dragging is disabled on ripple elements by default for nicer interaction.                                                                                                                                                                                                            | `Boolean`                                                              | `false`   |
| `unbind`          | When set, unbinds all of the ripple's event handlers. Doesn't remove any elements or classes. (see [Destroying, unbinding and overwriting](#destroying-unbinding-and-overwriting))                                                                                                                                                  | `Boolean`                                                              | `false`   |
| `touchDelay`      | Time to delay triggering of ripples on touch devices (e.g. to enable scrolling past ripple elements without triggering ripples)                                                                                                                                                                                                               | Time in ms as `number`                                                             | `100`    |
| `callback`        | A function to be called each time the ripple element's style property changes                                                                                                                                                                                                              | `function`                                                             | `null`    |

#### Coming soon
| Option               | Description                                                       | Expected Input                             | Default |
|----------------------|-------------------------------------------------------------------|--------------------------------------------|---------|
| `rippleOnHover`      | Whether to use the ripple as a hover effect                       | Boolean                                    | `false` |
| `destination` | An element other than the clicked one the ripple should travel to | `NodeList`, Element or selector `String`  or `Array` of coordinates in px | `null`  |


### Destroying, unbinding and overwriting
Ripples can be overwritten as you'd expect:
```javascript
$(".ripple").ripple();
$(".ripple.noScale").ripple({scaleMode: 0});
//.ripple has default options
//.ripple.noScale has default options and {scaleMode: 0}

$(".ripple.noScale").ripple({scaleMode: 0});
$(".ripple").ripple();
//.ripple and ripple.noScale have default options
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
Ripples can be targeted using the `.legitRipple-ripple` class, their containers using `.legitRipple`. CSS selectors for ripples shouldn't be order-specific to target all ripples since there can be multiple ripples active in an element at once.
```css
.container .legitRipple-ripple {
    background: yellow;
    /* You can change the transition properties too!
       Just don't try and change the width transition's easing. */
    transition-duration: .15s, .9s; /*width, opacity*/
}
```

#### Custom elements
You can even use custom elements for ripples by setting the `template` option with an Element or `NodeList` as the value, like `template: $("<p/>").text("Look, ma, I'm custom!")`.

Alternatively, you can set the `template` option to `true` and add the following markup to your HTML:
```html
<div>
    Container Element
    <div class="legitRipple-template">Your custom element</div>
</div>
```
How the code will look when a ripple is triggered:
```html
<div class="legitRipple">
    Container Element
    <div class="legitRipple-template">Your custom element</div>
    <span class="legitRipple-ripple legitRipple-custom">
        <div>Your custom element</div>
    </span>
</div>
```

The custom element is used as a template and will be hidden by CSS on load. When a ripple is triggered, the custom element will be `.clone()`'d, the `legitRipple-template` class removed and wrapped in a `<span/>` with a `legitRipple-ripple` class before being appended to the ripple container.

By default, when using custom ripple elements, each direct child of `.legitRipple-ripple` will be scaled up to cover the entire ripple container, like:

```css
.legitRipple-custom > * {
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

Moreover, you can manually trigger ripples [like in the demo](https://github.com/matthias-vogt/legitRipple.js/blob/gh-pages/js/demo.js#L69-L82) by faking mousedown/touchstart events and do some [crazy stuff](http://codepen.io/matze/pen/PPJxyr) with it.


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
legitRipple.js has full touch support. You can even use multi-touch for multiple ripples in different elements at the same time.


## Motivation
On Android, ripples don't spread in all directions equally as fast. They're positioned relative to the touch position as the touch position is positioned relative to the ripple's container.

![Reference 1](https://raw.githubusercontent.com/matthias-vogt/legitRipple.js/gh-pages/demo-media/reference-1.gif)
![Reference 2](https://raw.githubusercontent.com/matthias-vogt/legitRipple.js/gh-pages/demo-media/reference-2.gif)
<br>*App courtesies of [Music](https://play.google.com/store/apps/details?id=com.sonyericsson.music) and [Phonograph Music Player](https://play.google.com/store/apps/details?id=com.kabouzeid.gramophone)*

There are *[a lot](https://github.com/search?l=JavaScript&q=material+ripple&type=Repositories)* of similar plugins out there but this effect, hadn't been replicated in any of them AFAIK (which is not surprising since it's not documented in [Google's Material Design spec](https://www.google.com/design/spec/animation/responsive-interaction.html) either), so I decided to make my own.

Adding to the incentive was that the plugins I saw don't slow the ripple spread on mousedown and speed it up again on mouseup or don't have dragging or touch support implemented correctly.

legitRipple.js is probably also the only one which works with inline elements and has ripples with customizable HTML.

Maybe it's a bit overkill for this simple effect but that's your call to decide ;)


## Browser support
This uses CSS3 transitions, so [browser support](http://caniuse.com/#feat=css-transitions) is ie10+.
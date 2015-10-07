# legitRipple.js

A lightweight, CSS based jQuery plugin for material-design ripple effects.

##Usage

The plugin depends on [jQuery](https://jquery.com/), so make sure you have that loaded. Afterwards, you can use it like this:
```javascript
$(".some, .elements").ripple(); //ripple with default options
```
```javascript
$(".elements").ripple({ maxDiameter: "100%" }); //ripple with custom options
```
```javascript
//ripple with custom options and callback
$(".elements").ripple({options}, function($container, $ripple, posI, maxDiameter) {
    //is called everytime the ripple's css property changes
});
```

##Options
| Option               | Description                                                                                                                                             | Default   |
|----------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|-----------|
| `maxDiameter`        | Sets a ripple max-width. { adaptPos: true } requires this to be in % for correct rendering; can be any unit for use without adaptPos. 100% for circles. | `false`   |
| `dragging`           | Whether the ripple should be able to be dragged                                                                                                         | `true`    |
| `adaptPos`           | Whether to transform the ripple according to dragging coordinates. Note: more info on "adaptPos" at "Why another ripple plugin?""                       | `true`    |
| `scaleMode`          | How to scale the ripple when dragging:<br><br>`"proportional"`: Proportional to the amount it was dragged. Will probably become much bigger than its container.<br><br>`"fixed"`: Don't scale and release ripple when dragging upwards.<br><br>falsey values: Don't scale                                                                                                                   | `"fixed"` |
| `hasCustomRipple`    | If using a custom ripple element.                                                                                                                       | `false`   |

###Coming soon
| Option               | Description                                                                                                                                             | Default   |
|----------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|-----------|
| `rippleOnHover`      | Whether to use the ripple as a hover effect                                                                                                             | `false`   |
| `destinationElement` | An element other than the clicked one the ripple should travel to                                                                                       | `null`    |

##Custom ripples

###Custom CSS

Ripples can be targeted using the `.legitRipple-ripple` class, containers using `.legitRipple` CSS selectors for ripples shouldn't be order-specific to target all ripples because there can be multiple ripples active at once. For example, `.legitRipple-custom:first-of-type` wouldn't target all ripples.
```css
.container .legitRipple-ripple {
    background: yellow;
}
```

###Custom elements

You can customize ripples by setting the `hasCustomRipple` option to true and adding the following markup to your HTML:
```html
<div>
    Container Element
    <div class="legitRipple-custom">Your custom element</div>
</div>
```
How the code will look after a ripple is triggered:
```html
<div>
    Container Element
    <div class="legitRipple-custom someclass">Your custom element</div>
    <span class="legitRipple-ripple">
        <div class="someclass">Your custom element</div>
    </span>
</div>
```

The custom element is used as a template and will be hidden via CSS on load. It'll be `.clone()'d` and wrapped in a `<span/>` via jQuery on demand.

Each direct child of `.legitRipple-custom` will be scaled up to cover the ripple element, like:

```css
.legitRipple .legitRipple-custom > * {
  position: absolute;
  top: 50%;
  left: 50%;
  min-width: 100%;
  min-height: 100%;
  transform: translate(-50%, -50%);
}
```

##Callback

There's a callback which is called everytime the ripple's style attribute changes.
```javascript
$(".elements").ripple({options}, function($container, $ripple, posI, maxDiameter) {
    /* $container: The ripple container element
       $ripple: The ripple element
       posI: An array with two indices (0 <= i <= 1) for the
            x- and y-position of the ripple in the parent
       maxDiameterI: An index (0 <= i < ∞) of the max-width
            of the ripple element relative to the container's width
     */
});
```

##Why another ripple plugin?

There are *[a lot](https://github.com/search?l=JavaScript&q=material+ripple&type=Repositories&utf8=%E2%9C%9)* of javascript ripple plugins out there but I noticed that none of them replicate the ripple on android exactly. Which is not surprising since it's not documented in google's design spec either.

On android, the ripple itself doesn't spread in all directions equally as fast, it is positioned relative to the touch position as the touch position is positioned relative to the ripple's container.

This effect however hadn't been replicated in any plugins yet, so I decided to make one.

Adding to the incentive was that most of them don't slow the ripple spread on mousedown and speed it up again on mouseup or don't have what is called the `"fixed"` `scaleMode` in this plugin implemented correctly

This plugin is probably also the only one with customizable ripples and that works with inline elements.

You could maybe say that it's an unnecessarily perfectionist approach to this simple effect but that's your call to decide ;)

##Browser support
This uses CSS3 transitions, so [browser support](http://caniuse.com/#feat=css-transitions) is ie10+
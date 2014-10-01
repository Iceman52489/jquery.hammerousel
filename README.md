# jQuery.Hammerousel (For HammerJS)

Vertical/Horizontal touch-enabled carousel for HammerJS v1.1

## Requirements

- jQuery v1.9.1
- jQuery Migrate v1.2.1
- jQuery UI v1.10.3
- HammerJS v2.0.4
- jQuery Hammer v2.0

## Usage

###HTML

_Assets_:
```html
<link rel="stylesheet" type="text/css" href="css/jquery.hammerousel.css">

<script src="js/jquery-1.9.1.min.js"></script>
<script src="js/jquery-migrate-1.2.1.min.js"></script>
<script src="js/jquery-ui-1.10.3.min.js"></script>
<script src="js/hammer.min.js"></script>
<script src="js/jquery.hammerousel.js"></script>
<script src="js/modernizr.js"></script>
```

_Markup_:
```html
<div class="hammerousel">
	<ul>
		<li></li>
		<li></li>
		<li></li>
		<li></li>
	</ul>
</div>
```

###Javascript

_Init_:
```javascript
$(function() {
    var $hammerousel = $('.hammerousel').hammerousel(<options>);
});
```

_Options_:
```javascript
{
    horizontal: {
        enabled: true,
        threshold: .5
    },

    vertical: {
        enabled: true,
        threshold: 0
    }
}
```

_Methods_:

Example:
```javascript
    $hammerousel.hammerousel('on', param1, param2, etc);
```

####.hammerousel('on', selector, callback, distance)
Bind a live event to Hammerousel using a custom event parameter
#####Parameters
**selector**: `string`

**callback**: `function`

**distance**: `number`

**Returns:** Event Name

####.hammerousel('one', selector, callback, distance)
Bind an event that will only trigger once per element per event type
#####Parameters
**selector**: `string`

**callback**: `function`

**distance**: `number`

**Returns:** Event Name

_Events_:
ShowPane::After
```javascript
$('.hammerousel').on('Hammerousel::beforeShowPane', function(event, type));
```
ShowPane::Before 
```javascript
$('.hammerousel').on('Hammerousel::afterShowPane', function(event, type));
```
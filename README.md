# jQuery.Hammerousel (For HammerJS)

Vertical/Horizontal touch-enabled carousel for HammerJS v1.1

## Requirements

- jQuery v1.9.1
- jQuery Migrate v1.2.1
- jQuery UI v1.10.3
- HammerJS v1.1.3
- jQuery Hammer v1.1.3

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
    $('#<list-id>').hammerousel(<options>);
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
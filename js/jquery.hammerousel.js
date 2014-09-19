/*************************************************************
	~ jQuery.hammerousel ~
		Vertical/Horizontal touch-enabled carousel
	-----------------------------------------------
	Author:     Kevin Chiu (Mocha Development)
	Version:    1.0.0 (September 19, 2014)

	Options:    $().hammerousel({
					
				})
*************************************************************/
(function($) {
	$.widget('B3T4.hammerousel', {
		/*---------------------------*/
		/*--- Hammerousel Options ---*/
		/*---------------------------*/
		options: {
			horizontal: {
				enabled: true,
				threshold: .25
			},

			vertical: {
				enabled: true,
				threshold: 0
			}
		},

		_create: function() {
			// Setting up options
			var self = this,
				element = $(self.element),
				options = self.options;

			$(window).on('resize orientationchange', function() {
				self._setDimensions();
			});

			self._setDimensions();console.log(self);
		},

		_setDimensions: function() {
			var self = this,
				element = $(self.element),
				carousel = element.find('> ul'),
				panes = carousel.find('> li'),
				options = self.options,

				widths = {
					pane: element.width(),
					carousel: element.width() * panes.length
				};

			panes.width(widths.pane);
			carousel.width(widths.carousel);
		},

		/*-------------------*/
		/*--- Set Options ---*/
		/*-------------------*/
		_setOption: function(key, value) {
			// Set widget options
			$.Widget.prototype._setOption.apply(this,arguments)
		},

		/*----------------------*/
		/*--- Destroy Widget ---*/
		/*----------------------*/
		destroy: function() {
			// Use the destroy method to reverse everything your plugin has applied
			$.Widget.prototype.destroy.call(this);
		}
	});
})(jQuery);
/**
 * super simple carousel
 * animation between panes happens with css transitions
 *//*
function Carousel(element) {
	var pane_width = 0;
	var pane_count = panes.length;
	var current_pane = 0;

	/**
	 * show pane by index
	 *//*
	this.showPane = function(index, animate) {
		// between the bounds
		index = Math.max(0, Math.min(index, pane_count - 1));
		current_pane = index;
		var offset = -((100 / pane_count) * current_pane);
		setContainerOffset(offset, animate);
	};

	function setContainerOffset(percent, animate) {
		container.removeClass("animate");

		if (animate) {
			container.addClass("animate");
		}

		if (Modernizr.csstransforms3d) {
			container.css("transform", "translate3d(" + percent + "%,0,0) scale3d(1,1,1)");
		} else if (Modernizr.csstransforms) {
			container.css("transform", "translate(" + percent + "%,0)");
		} else {
			var px = ((pane_width * pane_count) / 100) * percent;
			container.css("left", px + "px");
		}
	}

	this.next = function() {
		return this.showPane(current_pane + 1, true);
	};

	this.prev = function() {
		return this.showPane(current_pane - 1, true);
	};

	function handleHammer(ev) {
		// disable browser scrolling
		ev.gesture.preventDefault();

		switch (ev.type) {
			case 'dragright':
			case 'dragleft':
				// stick to the finger
				var pane_offset = -(100 / pane_count) * current_pane;
				var drag_offset = ((100 / pane_width) * ev.gesture.deltaX) / pane_count;

				// slow down at the first and last pane
				if ((current_pane == 0 && ev.gesture.direction == "right") ||
					(current_pane == pane_count - 1 && ev.gesture.direction == "left")) {
					drag_offset *= .4;
				}

				setContainerOffset(drag_offset + pane_offset);

				break;
			case 'swipeleft':
				self.next();
				ev.gesture.stopDetect();

				break;
			case 'swiperight':
				self.prev();
				ev.gesture.stopDetect();

				break;
			case 'release':
				// more then 50% moved, navigate
				if (Math.abs(ev.gesture.deltaX) > pane_width / 2) {
					if (ev.gesture.direction == 'right') {
						self.prev();
					} else {
						self.next();
					}
				} else {
					self.showPane(current_pane, true);
				}

				break;
		}
	}

	new Hammer(element[0], {
		drag_lock_to_axis: true
	}).on("release dragleft dragright swipeleft swiperight", handleHammer);

	var initialOffset = 0;

	element
		.find('li > div')
		.each(function() {
			new Hammer(this, {
				preventDefault: true
			}).on("dragstart", function(ev) {console.log('initial '+$(this).offset().top);
				initialOffset = $(this).offset().top;
			}).on("dragdown dragup", function(ev) {
				// stick to the finger
				var container = $(this),
					pane = container.parent(),
					direction = ev.gesture.direction,
					scrollDirection = (direction == 'down') ? 'up' : 'down',
					dragOffset = (scrollDirection == 'down') ? -ev.gesture.distance : ev.gesture.distance,
					newOffset = initialOffset + dragOffset,
					minThreshold = 0,
					maxThreshold = container.height() - pane.height();

				switch(scrollDirection) {
					case 'up':
						if(-newOffset <= 0) {
							container.css("top", minThreshold);
							return;
						}

//                                  newOffset = Math.max(0, newOffset);

						break;
					case 'down':
						if(-newOffset >= maxThreshold) {
							container.css("top", -maxThreshold);
							return;
						}

//                                  newOffset = Math.min(container.height()-pane.height(), newOffset);

						break;
				}

				container.css("top", newOffset);
			});
		});
}

var carousel = new Carousel("#carousel");

carousel.init();
*/
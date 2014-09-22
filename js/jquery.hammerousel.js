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
				threshold: .5
			},

			vertical: {
				enabled: true,
				threshold: 0
			}
		},

		/*---------------------*/
		/*--- Initial Setup ---*/
		/*---------------------*/
		_create: function() {
			// Setting up options
			var self = this,
				element = $(self.element),
				options = self.options,
				data = self.data = {
					hammer: {},
					x: options.horizontal,
					y: options.vertical
				};

			if($.type(data.x.threshold) == 'string')
				data.x.threshold = (data.x.threshold.search(/%/) > -1) ? parseInt(data.x.threshold) / 100 :  parseInt(data.x.threshold);
			if($.type(data.y.threshold) == 'string')
				data.y.threshold = (data.y.threshold.search(/%/) > -1) ? parseInt(data.y.threshold) / 100 :  parseInt(data.y.threshold);

			$(window).on('resize orientationchange', function() {
				self._setDimensions();
			});

			self._setDimensions();
			self._bindHammer();
		},

		_setDimensions: function() {
			var self = this,
				element = $(self.element),
				carousel = element.find('> ul'),
				panes = carousel.find('> li'),
				options = self.options,
				data = self.data;

			// Set instance variables
			data.active = 0;
			data.intPanes = panes.length;
			data.offsets = {};
			data.widths = {
				pane: element.width(),
				carousel: element.width() * panes.length
			};

			// Set pane and carousel dimensions
			panes.width(data.widths.pane);
			carousel.width(data.widths.carousel);
		},

		_bindHammer: function() {
			var self = this,
				element = $(self.element),
				options = self.options,
				data = self.data;

			data.hammer.options = { dragLockToAxis: true };
			data.hammer.events = ['release'];

			// Set options for horizontal features
			if(data.x.enabled) {
//				data.hammer.options.dragBlockVertical = true;
				data.hammer.events.push('dragleft','dragright','swiperight');
			}

			// Set options for vertical features
			if(data.y.enabled) {
//				data.hammer.options.dragBlockHorizontal = true;
				data.hammer.events.push('dragleft','dragright','swiperight');
			}

			data.hammer.instance = element.hammer(data.hammer.options);
			data.hammer.instance.on(data.hammer.events.join(' '), self._handleHammerousel);
		},

		/*-----------------------*/
		/*--- Private Methods ---*/
		/*-----------------------*/
		showPane: function(paneIndex, animate) {
			var self = this,
				data = self.data,
				offset = 0;

			// Pane Bounds
			paneIndex = Math.max( 0, Math.min(paneIndex, data.intPanes - 1) );

			// Set panel states
			data.active = paneIndex;
			offset = -((100 / data.intPanes) * data.active);

			self._setContainerOffset(offset, animate);
		},

		next: function() {
			var self = this,
				data = self.data;

			return self.showPane(data.active + 1, true);
		},

		prev: function() {
			var self = this,
				data = self.data;

			return self.showPane(data.active - 1, true);
		},

		/*-----------------------*/
		/*--- Private Methods ---*/
		/*-----------------------*/
		_handleHammerousel: function(event) {
			// disable browser scrolling
			event.gesture.preventDefault();

			var self = $(this).data('B3T4Hammerousel'),
				element = $(self.element),
				carousel = element.find('> ul'),
				panes = carousel.find('> li'),
				data = self.data,
				threshold;

			switch (event.type) {
				case 'dragright':
				case 'dragleft':
					// Bind to finger
					data.offsets.pane = -(100 / data.intPanes) * data.active;
					data.offsets.drag = ((100 / data.widths.pane) * event.gesture.deltaX) / data.intPanes;

					// Animation timing on :first and :last panes
					if((data.active == 0 && event.gesture.direction == 'right') ||
						(data.active == (data.intPanes - 1) && event.gesture.direction == 'left')) {
						data.offsets.drag *= .4;
					}

					self._setContainerOffset(data.offsets.drag + data.offsets.pane);

					break;
				case 'swipeleft':
					self.next();
					event.gesture.stopDetect();

					break;
				case 'swiperight':
					self.prev();
					event.gesture.stopDetect();

					break;
				case 'release':
					threshold = (event.gesture.direction.search(/left|right/) > -1) ? data.x.threshold : data.y.threshold;

					// If drag distance is more than drag distance, then move to the next pane
					if( Math.abs(event.gesture.deltaX) > (data.widths.pane * threshold) ) {
						(event.gesture.direction == 'right') ?  self.prev() : self.next();
					} else {
						self.showPane(data.active, true);
					}

					break;
			}
		},

		_setContainerOffset: function(percent, animate) {
			var self = this,
				element = $(self.element),
				carousel = element.find('> ul'),
				panes = carousel.find('> li'),
				data = self.data,
				x = 0;

			animate ?
				carousel.addClass('animate') :
				carousel.removeClass('animate');

			if(Modernizr.csstransforms3d) {
				carousel.css('transform', 'translate3d(' + percent + '%,0,0) scale3d(1,1,1)');
			} else if(Modernizr.csstransforms) {
				container.css('transform', 'translate(' + percent + '%,0)');
			} else {
				x = ( (data.widths.pane * data.intPanes) / 100 ) * percent;
				carousel.css('left', x);
			}
		},

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
/*
element
	.find('li > div')
	.each(function() {
		new Hammer(this, {
			preventDefault: true
		}).on('dragstart', function(ev) {
			initialOffset = $(this).offset().top;
		}).on('dragdown dragup', function(ev) {
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
						container.css('top', minThreshold);
						return;
					}

					break;
				case 'down':
					if(-newOffset >= maxThreshold) {
						container.css('top', -maxThreshold);
						return;
					}

					break;
			}

			container.css('top', newOffset);
		});
	});
*/
/*************************************************************
	~ jQuery.hammerousel ~
		Vertical/Horizontal touch-enabled carousel
	-----------------------------------------------
	Author: 	Kevin Chiu (Mocha Development)
	Version: 	1.2 (September 29, 2014)
				1.1 (September 23, 2014)
				1.0 (September 19, 2014)

	Options: 	$().hammerousel({
					
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
					triggers: [],
					x: options.horizontal,
					y: options.vertical
				};

			element.find('ul > li').each(function() {
				var $li = $(this),
					html = $li.html();

				$li.html(
					'<div class="hammerousel-pane">' +
						'<div class="hammerousel-pane-inner">' + html + '</div>' +
					'</div>'
				);

				data.triggers.push({});
			});

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
				paneWrappers = carousel.find('.hammerousel-pane'),
				options = self.options,
				data = self.data;

			// Set instance variables
			data.active = 0;
			data.intPanes = panes.length;
			data.offsets = {};
			data.widths = {
				pane: $(window).width(),
				carousel: element.width() * panes.length
			};

			// Set pane and carousel dimensions
			panes.width(data.widths.pane);
			carousel.width(data.widths.carousel);

			paneWrappers.height($(window).height());
		},

		_getScrollWidth: function() {
			var body = $('body'),
				outerWrapper = $('<div></div>)'),
				innerWrapper = $('<p></p>)'),

				outerWidth,
				innerWidth;

			innerWrapper.css({
				width: 200,
				height: 200
			});

			outerWrapper.css({
				position: "absolute",
				overflow: "hidden",
				visibility: "hidden",
				top: 0,
				left: 0,
				width: 200,
				height: 150
			});

			outerWrapper.append(
				innerWrapper
			).appendTo('body');

			innerWrapper.css('overflow', 'scroll');

			outerWidth = outerWrapper.width();
			innerWidth = innerWrapper.width();

			outerWrapper.remove();

			return (outerWidth - innerWidth);
		},

		_bindHammer: function() {
			var self = this,
				element = $(self.element),
				options = self.options,
				data = self.data;

			data.hammer.events = ['release', 'dragstart'];
			data.hammer.options = {
				dragLockToAxis: true,
				dragBlockVertical: true,
				dragBlockHorizontal: true
			};

			data.y.transform = { x: 0, y: 0 };
			data.x.transform = { x: 0, y: 0 };

			// Set options for horizontal features
			if(data.x.enabled) {
				data.hammer.events.push('dragleft','dragright','swipeleft','swiperight');
			}

			// Set options for vertical features
			if(data.y.enabled) {
				data.hammer.events.push('dragup','dragdown','swipeup','swipedown');
			}

			data.hammer.instance = element.hammer(data.hammer.options);
			data.hammer.instance.on(
				data.hammer.events.join(' '),
				self._handleHammerousel
			);
		},

		/*-----------------------*/
		/*--- Private Methods ---*/
		/*-----------------------*/
		showPane: function(event, paneIndex, animate) {
			var self = this,
				element = $(self.element),
				data = self.data,
				offset = 0,
				type = (paneIndex > 0) ? 'next' : 'prev',
				isSwitch = (data.active != paneIndex);

			// Pane Bounds
			paneIndex = Math.max( 0, Math.min(paneIndex, data.intPanes - 1) );

			// Set panel states
			data.active = paneIndex;
			offset = -((100 / data.intPanes) * data.active);

			if(isSwitch) {
				element.triggerHandler( 'hammerousel::beforeShowPane', [type, data.active] );
			}

			self._setContainerX(event, offset, animate);

			if(isSwitch) {
				element.triggerHandler('hammerousel::afterShowPane', [type, data.active] );
			}
		},

		next: function(event) {
			var self = this,
				data = self.data;

			return self.showPane(event, data.active + 1, true);
		},

		prev: function(event) {
			var self = this,
				data = self.data;

			return self.showPane(event, data.active - 1, true);
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
				panes = carousel.find('.hammerousel-pane'),
				data = self.data,
				isHorizontal = (event.gesture.direction.search(/left|right/) > -1),
				threshold;

			switch (event.type) {
				// Horizontal Events
				case 'dragright':
				case 'dragleft':
					// Bind to finger
					data.offsets.pane = -(100 / data.intPanes) * data.active;
					data.offsets.drag = ((100 / data.widths.pane) * event.gesture.deltaX) / data.intPanes;

					// Animation timing on :first and :last panes
					if((data.active == 0 && event.gesture.direction == 'right') || (data.active == (data.intPanes - 1) && event.gesture.direction == 'left')) {
						data.offsets.drag *= .4;
					}

					self._setContainerX(event, data.offsets.drag + data.offsets.pane);

					break;
				case 'swipeleft':
					event.gesture.preventDefault();
					self.next();
					event.gesture.stopDetect();
					break;
				case 'swiperight':
					event.gesture.preventDefault();
					self.prev();
					event.gesture.stopDetect();

					break;
				// Vertical Events
				case 'dragup':
				case 'dragdown':
					if(data.y.threshold) {
						data.offsets.pane = -(100 / data.intPanes) * data.active;
						data.offsets.drag = ((100 / data.widths.pane) * event.gesture.deltaX) / data.intPanes;

						// Animation timing on :first and :last panes
						if((data.active == 0 && event.gesture.direction == 'up') || (data.active == (data.intPanes - 1) && event.gesture.direction == 'down')) {
							data.offsets.drag *= .4;
						}

						self._setContainerY(data.offsets.drag + data.offsets.pane);
					} else {
						data.offsets.drag = event.gesture.deltaY;
						self._setContainerY(event, data.offsets.drag);
					}
				case 'swipeup':
				case 'swipedown':
					break;
				// Default Events
				case 'dragstart':
					data.y.transform.y = carousel.find('.hammerousel-pane:eq(' + data.active + ')').scrollTop();
				case 'release':
					threshold = isHorizontal ? data.x.threshold : data.y.threshold;

					// If drag distance is more than drag distance, then move to the next pane
					if(isHorizontal) {
						if( Math.abs(event.gesture.deltaX) > (data.widths.pane * threshold) ) {
							(event.gesture.direction == 'right') ?  self.prev(event) : self.next(event);
						} else {
							self.showPane(event, data.active, true);
						}
					} else {
						self.showPane(event, data.active, true);
					}

					break;
			}
		},

		_setContainerX: function(event, percent, animate) {
			var self = this,
				element = $(self.element),
				carousel = element.find('> ul'),
				data = self.data,
				x = 0;

			animate ?
				carousel.addClass('animate') :
				carousel.removeClass('animate');

			if(Modernizr.csstransforms3d) {
				carousel.css('transform', 'translate3d(' + percent + '%,0,0) scale3d(1,1,1)');
			} else if(Modernizr.csstransforms) {
				carousel.css('transform', 'translate(' + percent + '%,0)');
			} else {
				x = ( (data.widths.pane * data.intPanes) / 100 ) * percent;
				carousel.css('left', x);
			}
		},

		_setContainerY: function(event, percent, animate) {
			var self = this,
				element = $(self.element),
				data = self.data,
				carousel = element.find('.hammerousel-pane:eq(' + data.active + ')'),
				wrapper = carousel.find('.hammerousel-pane-inner'),
				y = 0;

			if(wrapper.length && carousel.height() < wrapper.height()) {
				if(data.y.threshold) {
					// With panel locking set
					animate ?
						carousel.addClass('animate') :
						carousel.removeClass('animate');

					if(Modernizr.csstransforms3d) {
						carousel.css('transform', 'translate3d(0,' + percent + '%,0) scale3d(1,1,1)');
					} else if(Modernizr.csstransforms) {
						carousel.css('transform', 'translate(0,' + percent + '%)');
					} else {
						y = ( (data.widths.pane * data.intPanes) / 100 ) * percent;
						carousel.css('top', y);
					}
				} else {
					// Without panel locking set
					var direction = event.gesture.direction,
						scrollDirection = (direction == 'down') ? 'up' : 'down',
						dragOffset = -event.gesture.deltaY,
						newOffset = (data.y.transform.y + dragOffset),
						minThreshold = 0,
						maxThreshold = wrapper.height() - carousel.height();

					carousel.scrollTop(newOffset);
				}
			}

			self._handleTriggers();
		},

		_setOption: function(key, value) {
			// Set widget options
			$.Widget.prototype._setOption.apply(this,arguments);
		},

		_createTrigger: function(selector, callback, distance) {
			var self = this,
				carousel = $(self.element),
				panes = carousel.find('.hammerousel-pane'),
				data = self.data,
				options = {
					selector: selector || null,
					callback: callback || null,
					distance: distance || 0,
					index: []
				},

				intIndex = 0,
				intPane = 0,
				isError = false;

			// Error Exceptions
			if( !(options.selector && (typeof options.selector == 'string')) ) {
				isError = true;
				$.error('[Function] On -> Invalid "selector" <string> parameter!');
			}

			if( !(options.callback && (typeof options.callback == 'function')) ) {
				isError = true;
				$.error('[Function] On -> Invalid "callback" <function> parameter!');
			}

			if( !(typeof options.distance == 'number') ) {
				isError = true;
				$.error('[Function] On -> Invalid "distance" <number> parameter!');
			}

			if(isError) {
				return;
			}

			options.handle = 'hammerousel::' + options.selector;

			panes.each(function(intPane, pane) {
				if( $(pane).find(selector).length ) {
					options.index.push(intPane);
				}
			});

			// Store event trigger information into Hammerousel data storage
			for(intIndex = 0; intIndex < options.index.length; intIndex++) {
				intPane = options.index[intIndex];

				data.triggers[intPane][options.handle] = {
					handle: options.handle,
					selector: options.selector,
					distance: options.distance,
					trigger: options.callback
				};
			}

			return options.handle;
		},

		_handleTriggers: function() {
			var self = this,
				element = $(self.element),
				data = self.data,
				pane = element.find('.hammerousel-pane:eq(' + data.active + ')'),
				triggers = data.triggers[data.active];

			for(handle in triggers) {
				var trigger = triggers[handle],
					paneElement = pane.find(trigger.selector),
					scrollMin = paneElement.offset().top - trigger.distance,
					scrollMax = scrollMin + paneElement.height() + trigger.distance,
					scrollOffset = pane.scrollTop();

				if(scrollMin <= scrollOffset && scrollOffset <= scrollMax) {
					var isInit = ( !paneElement.hasClass('hammerousel-is-visible') && !paneElement.hasClass('hammerousel-not-visible') );
					// Trigger the callback if element is scrolled into view
					if(paneElement.hasClass('hammerousel-not-visible') || isInit) {
						element.triggerHandler(handle);
					}

					paneElement
						.removeClass('hammerousel-not-visible')
						.addClass('hammerousel-is-visible');
				} else {
					paneElement
						.removeClass('hammerousel-is-visible')
						.addClass('hammerousel-not-visible');
				}
			}
		},

		/*----------------------*/
		/*--- Public Methods ---*/
		/*----------------------*/
		on: function(selector, callback, distance) {
			var self = this,
				element = $(self.element),
				data = self.data,
				handle = self._createTrigger(selector, callback, distance),
				eventTrigger = data.triggers[handle];

			element.on(handle, callback);

			return handle;
		},

		one: function(selector, callback, distance) {
			var self = this,
				element = $(self.element),
				data = self.data,
				handle = self._createTrigger(selector, callback, distance),
				eventTrigger = data.triggers[handle];

			element.one(handle, callback);

			return handle;
		},

		destroy: function() {
			// Use the destroy method to reverse everything your plugin has applied
			$.Widget.prototype.destroy.call(this);
		}
	});
})(jQuery);
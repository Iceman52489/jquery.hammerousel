/*************************************************************
	~ jQuery.hammerousel ~
		Vertical/Horizontal touch-enabled carousel
	-----------------------------------------------
	Author: 	Kevin Chiu (Mocha Development)
	Version: 	2.0 (October 1, 2014)
				1.2 (September 29, 2014)
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

			data.heights = {
				pane: $(window).height()
			};

			// Set pane and carousel dimensions
			carousel.width(data.widths.carousel);

			data.widths.pane += self._getScrollWidth();
			data.heights.pane += self._getScrollWidth();

			panes.each(function() {
				var pane = $(this),
					deltaWidth,
					deltaHeight;

				pane.width(data.widths.pane);
				pane.height(data.heights.pane);

				// Re-adjust width because other browsers treat width without margin/padding/bordering (Firefox treats it as one)
				deltaWidth = pane.outerWidth(true) - data.widths.pane;
				deltaHeight = pane.outerHeight(true) - data.heights.pane;

				if(deltaWidth > 0) {
					data.widths.pane -= deltaWidth;
					pane.width(data.widths.pane);
				}

				if(deltaHeight > 0) {
					data.heights.pane -= deltaHeight;
					pane.height(data.heights.pane);
				}
			});

			paneWrappers.height($(window).height());
		},

		_getScrollWidth: function() {
			var wrapper = $(
					'<div style="width:50px;height:50px;overflow:hidden;position:absolute;top:-200px;left:-200px;">' +
						'<div style="height:100px;"></div>' +
					'</div>'
				),

				outerWidth,
				innerWidth;

			wrapper.appendTo('body');
			
			outerWidth = $('div', wrapper).innerWidth();

			wrapper.css('overflow-y', 'scroll');

			innerWidth = $('div', wrapper).innerWidth();

			wrapper.remove();

			return (outerWidth - innerWidth);
		},

		_bindHammer: function() {
			var self = this,
				element = $(self.element),
				options = self.options,
				data = self.data;

			data.hammer.events = ['panend', 'panstart'];
			data.hammer.options = {
				dragLockToAxis: true,
				dragBlockVertical: true,
				dragBlockHorizontal: true
			};

			data.y.transform = { x: 0, y: 0 };
			data.x.transform = { x: 0, y: 0 };

			// Set options for horizontal features
			if(data.x.enabled) {
				data.hammer.events.push('panleft','panright'/*,'swipeleft','swiperight'*/);
			}

			// Set options for vertical features
			if(data.y.enabled) {
//				data.hammer.events.push('panup','pandown','swipeup','swipedown');
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
			event.preventDefault;

			var self = $(this).data('B3T4Hammerousel'),
				element = $(self.element),
				carousel = element.find('> ul'),
				panes = carousel.find('.hammerousel-pane'),
				data = self.data,
				isHorizontal = (event.gesture.direction == Hammer.DIRECTION_LEFT || event.gesture.direction == Hammer.DIRECTION_RIGHT),
				threshold;

			switch (event.type) {
				// Horizontal Events
				case 'panright':
				case 'panleft':
					// Bind to finger
					data.offsets.pane = -(100 / data.intPanes) * data.active;
					data.offsets.drag = ((100 / data.widths.pane) * event.gesture.deltaX) / data.intPanes;

					// Animation timing on :first and :last panes
					if((data.active == 0 && event.gesture.direction == Hammer.DIRECTION_RIGHT) || (data.active == (data.intPanes - 1) && event.gesture.direction == Hammer.DIRECTION_LEFT)) {
						data.offsets.drag *= .4;
					}

					self._setContainerX(event, data.offsets.drag + data.offsets.pane);

					break;
				case 'swipeleft':
					self.next();
					event.gesture.stopDetect();
					break;
				case 'swiperight':
					self.prev();
					event.gesture.stopDetect();
					break;
				// Vertical Events
				case 'panup':
				case 'pandown':
					break;
				case 'swipeup':
				case 'swipedown':
					break;
				// Default Events
				case 'panstart':
					data.y.transform.y = carousel.find('.hammerousel-pane:eq(' + data.active + ')').scrollTop();
					break;
				case 'panend':
					self.showPane(event, data.active, true);
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
						scrollDirection = (direction == Hammer.DIRECTION_DOWN) ? 'up' : 'down',
						dragOffset = -event.gesture.deltaY,
						newOffset = (data.y.transform.y + dragOffset),
						minThreshold = 0,
						maxThreshold = wrapper.height() - carousel.height();

					carousel.scrollTop(newOffset);
				}
			}

//			self._handleTriggers();
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

			return options;
		},
/*
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
*/
		/*----------------------*/
		/*--- Public Methods ---*/
		/*----------------------*/
		on: function(selector, callback, distance) {
			var self = this,
				element = $(self.element),
				data = self.data,
				eventData = self._createTrigger(selector, callback, distance),
				intIndex;

			element.on(eventData.handle, eventData.callback);

			for(intIndex = 0; intIndex < eventData.index.length; intIndex++) {
				$('.hammerousel-pane:eq(' + eventData.index[intIndex] + ')').on('scroll', function() {
					var pane = $(this),
						intPane = $('.hammerousel-pane').index(pane),
						trigger = data.triggers[intPane][eventData.handle],
						
						paneElement = pane.find(trigger.selector),
						scrollMin = paneElement.offset().top - trigger.distance,
						scrollMax = scrollMin + paneElement.height() + trigger.distance,
						scrollOffset = pane.scrollTop();

					if(scrollMin <= scrollOffset && scrollOffset <= scrollMax) {
						var isInit = ( !paneElement.hasClass('hammerousel-is-visible') && !paneElement.hasClass('hammerousel-not-visible') );
						// Trigger the callback if element is scrolled into view
						if(paneElement.hasClass('hammerousel-not-visible') || isInit) {
							element.triggerHandler(eventData.handle);
						}

						paneElement
							.removeClass('hammerousel-not-visible')
							.addClass('hammerousel-is-visible');
					} else {
						paneElement
							.removeClass('hammerousel-is-visible')
							.addClass('hammerousel-not-visible');
					}
				});
			}

			return eventData.handle;
		},

		one: function(selector, callback, distance) {
			var self = this,
				element = $(self.element),
				data = self.data,
				eventData = self._createTrigger(selector, callback, distance),
				intIndex;

			element.on(eventData.handle, eventData.callback);

			for(intIndex = 0; intIndex < eventData.index.length; intIndex++) {
				$('.hammerousel-pane:eq(' + eventData.index[intIndex] + ')').one('scroll', function() {
					var pane = $(this),
						intPane = $('.hammerousel-pane').index(pane),
						trigger = data.triggers[intPane][eventData.handle],
						
						paneElement = pane.find(trigger.selector),
						scrollMin = paneElement.offset().top - trigger.distance,
						scrollMax = scrollMin + paneElement.height() + trigger.distance,
						scrollOffset = pane.scrollTop();

					if(scrollMin <= scrollOffset && scrollOffset <= scrollMax) {
						var isInit = ( !paneElement.hasClass('hammerousel-is-visible') && !paneElement.hasClass('hammerousel-not-visible') );
						// Trigger the callback if element is scrolled into view
						if(paneElement.hasClass('hammerousel-not-visible') || isInit) {
							element.triggerHandler(eventData.handle);
						}

						paneElement
							.removeClass('hammerousel-not-visible')
							.addClass('hammerousel-is-visible');
					} else {
						paneElement
							.removeClass('hammerousel-is-visible')
							.addClass('hammerousel-not-visible');
					}
				});
			}

			return eventData.handle;
		},

		destroy: function() {
			// Use the destroy method to reverse everything your plugin has applied
			$.Widget.prototype.destroy.call(this);
		}
	});
})(jQuery);
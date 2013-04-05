 /*
 * jQuery Mobile Framework : plugin to provide a dialogs Widget. ver2
 * Copyright (c) JTSage
 * CC 3.0 Attribution.  May be relicensed without permission/notifcation.
 * https://github.com/jtsage/jquery-mobile-popupwrapper
 */
 
(function($, undefined ) {
  $.widget( "mobile.popupwrapper", $.mobile.widget, {
	options: {
		version: '1.3.0-2013040500', // jQueryMobile-YrMoDaySerial
		displayMode: 'blank', // or 'button'
		popupTheme: false,
		popupOverlayTheme: false,
		padContent: false,
		buttonMode: 'button',
		transition: 'pop',
		clickEvent: 'click',
		positionTo: 'window',
		
		// These are button only options
		headerText: false,
		headerTheme: 'a',
		headerMinWidth: false,
		subTitle: false,
		buttonDefaultTheme: 'b',
		
		// These options are used in all modes
		closeButton: false, // or left, or right
		closeButtonTheme: 'a',
		dismissible: true,
		
		// One of these needs set
		content: false,
		buttons: {},
		
		// Gotta love some callbacks!
		callbackOpen: false,
		callbackOpenArgs: [],
		callbackClose: false,
		callbackCloseArgs: []
	},
	_create: function () {
		var self = this,
			o = this.options,
			basePop = $('<div data-role="popup"></div>'), gennyPop, funcs = {},
			gennyPage = $('<div data-role="page"></div>');
			
		self.internalID = new Date().getTime();
		
		if ( o.popupTheme !== false ) { basePop.attr('data-theme', o.popupTheme); }
		if ( o.popupOverlay !== false ) { basePop.attr('data-overlay-theme', o.popupOverlay); }
		if ( o.padContent !== false ) { basePop.attr('class', 'ui-content'); }
		
		// Jackass trap.
		if ( o.dismissible === false && o.closeButton === false ) { o.dismissible = true; }
		
		if ( o.displayMode === 'blank' ) {
			// BLANK mode
			if ( o.closeButton === "left" ) {
				o.content = '<a href="#" data-rel="back" data-role="button" data-theme="'+o.closeButtonTheme+'" data-icon="delete" data-iconpos="notext" class="ui-btn-left">Close</a>' + o.content;
			}
			if ( o.closeButton === "right" ) {
				o.content = '<a href="#" data-rel="back" data-role="button" data-theme="'+o.closeButtonTheme+'" data-icon="delete" data-iconpos="notext" class="ui-btn-right">Close</a>' + o.content;
			}
		} else {
			// BUTTON mode basics
			if ( o.closeButton === "left" ) {
				o.content = '<a href="#" data-rel="back" data-role="button" data-theme="'+o.closeButtonTheme+'" data-icon="delete" data-iconpos="notext" class="ui-btn-left">Close</a>';
			}
			if ( o.closeButton === "right" ) {
				o.content = '<a href="#" data-rel="back" data-role="button" data-theme="'+o.closeButtonTheme+'" data-icon="delete" data-iconpos="notext" class="ui-btn-right">Close</a>';
			}
			if ( o.headerText !== false ) {
				o.content = o.content + '<div data-role="header" data-theme="' + o.headerTheme + '"' +
					((o.headerMinWidth !== false) ? ' style="min-width: ' + o.headerMinWidth + '"' : '') +
					"><h1>" + o.headerText + "</h1></div>";
			}
			o.content = o.content + '<div data-role="content">';
			
			if ( o.subTitle !== false && o.buttonMode !== 'list' ) {
				o.content = o.content + '<p>' + o.subTitle + '</p>';
			}
			o.content = o.content + '<div class="popupbuttonshere"></div></div>';
		}
		
		// The rationale behind this: Things do not always generate properly
		// if they aren't on a page.  So, I made a page, I generated everything,
		// then I pluck it back off there and drop it in the popup.  And of 
		// course clean up the leavings.
		$(o.content).appendTo(gennyPage);//.trigger('create');
		gennyPage.appendTo('body').page().trigger('create');
		basePop.append(gennyPage.children());
		gennyPage.remove();
		basePop.appendTo($('.active-page'));
		
		if ( o.displayMode === 'button' ) {
			if ( o.buttonMode === 'list' ) {
				self._makeListButtons(basePop);
			} else {
				self._makeButtonButtons(basePop);
			}
		}
		
		if ( !$.isFunction(o.callbackOpen) ) { 
			// It's either this, or yet another temporary object.  return true probably
			// costs less.
			funcs.open = function () { return true; } 
		} else {
			funcs.open = function () { o.callbackOpen.apply(self, o.callbackOpenArgs); }
		}
		
		// If you want this to work more than once, this is required.  Really.  Not kidding.
		//
		// (Ok, so if you *really* want to reuse - and you don't - I assure you, you don't
		//  you *could* move all of this shit to the open method, and then you'd need to 
		//  both create the dialog as shown in the all demos, *and* call open.  It's a terrible
		//  idea.  And frankly, if you can do that, you really ought to be just writing your 
		//  own custom wrapper.  Or, heaven forbid, do some shit on the server.
		funcs.clean = function () { basePop.remove(); self.destroy(); }
		
		if ( !$.isFunction(o.callbackClose) ) {
			funcs.close = funcs.clean;
		} else {
			funcs.close = function () { o.callbackClose.apply(self, o.callbackCloseArgs); funcs.clean.apply(self); };
		}
			
		basePop.popup({'transition':o.transition, 'dismissible': o.dismissible, 'positionTo':o.positionTo, 'afterclose': funcs.close, 'afteropen': funcs.open});
		basePop.popup('open');
		
		console.debug(gennyPage[0]);
		console.debug(basePop[0]);
	},
	_makeButtonButtons: function (basePop) {
		var self = this,
			o = self.options,
			thisNode = basePop.find('.popupbuttonshere');
		
		self.butObj = [];
		
		$.each(o.buttons, function(name, props) {
			props = $.isFunction( props ) ? { click: props } : props;
			props = $.extend({
				text   : name,
				id     : name + self.internalID,
				theme  : o.buttonDefaultTheme,
				icon   : 'check',
				iconpos: 'left',
				corners: 'true',
				shadow : 'true',
				args   : [],
				close  : true
			}, props);
			
			self.butObj.push($("<a href='#'>"+props.text+"</a>")
				.appendTo(thisNode)
				.attr('id', props.id)
				.buttonMarkup({
					theme  : props.theme,
					icon   : props.icon,
					iconpos: props.iconpos,
					corners: props.corners,
					shadow : props.shadow
				}).unbind("vclick click")
				.bind(o.clickEvent, function() {
					var returnValue = props.click.apply(self, $.merge(arguments, props.args));
					if ( returnValue !== false && props.close === true ) {
						basePop.popup('close');
					}
				})
			);
		});
	},
	_makeListButtons: function (basePop) {
		var self = this,
			o = self.options,
			thisParentNode = basePop.find('.popupbuttonshere'),
			thisNode = $('<ul data-role="listview"></ul>'),
			gennyPage = $('<div data-role="page"><div id="tempcontent" data-role="content"></div></div>');
		
		self.butObj = [];
		
		if ( o.subTitle !== false ) {
			$("<li data-role='list-divider'>"+o.subTitle+"</li>").appendTo(thisNode)
		}
		
		$.each(o.buttons, function(name, props) {
			props = $.isFunction( props ) ? { click: props } : props;
			props = $.extend({
				text   : name,
				id     : name + self.internalID,
				icon   : 'check',
				args   : [],
				close  : true
			}, props);
			
			self.butObj.push($("<li id='"+props.id+"' data-icon='"+props.icon+"'><a href='#'>"+props.text+"</a></li>")
				.appendTo(thisNode)
				.bind(o.clickEvent, function() {
					var returnValue = props.click.apply(self, $.merge(arguments, props.args));
					if ( returnValue !== false && props.close === true ) {
						basePop.popup('close');
					}
				})
			);
		});
		
		thisNode.appendTo(gennyPage.find('#tempcontent'));
		gennyPage.appendTo('body').page().trigger('create');
		thisParentNode.append(gennyPage.find('#tempcontent').children());
		gennyPage.remove();
	}
  });
})( jQuery );

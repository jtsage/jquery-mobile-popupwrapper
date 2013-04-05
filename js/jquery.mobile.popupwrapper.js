 /*
 * jQuery Mobile Framework : plugin to provide a dialogs Widget. ver2
 * Copyright (c) JTSage
 * CC 3.0 Attribution.  May be relicensed without permission/notifcation.
 * https://github.com/jtsage/jquery-mobile-simpledialog
 */
 
(function($, undefined ) {
  $.widget( "mobile.popupwrapper", $.mobile.widget, {
	options: {
		version: '0.0.9-2013040500', // jQueryMobile-YrMoDaySerial
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
		buttonDefaultTheme: 'b',
		
		// These options are used in all modes
		closeButton: false, // or left, or right
		dismissable: true,
		
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
			
		if ( o.popupTheme !== false ) { basePop.attr('data-theme', o.popupTheme); }
		if ( o.popupOverlay !== false ) { basePop.attr('data-overlay-theme', o.popupOverlay); }
		if ( o.padContent !== false ) { basePop.attr('class', 'ui-content'); }
		
		if ( o.mode = 'blank' ) {
			$(o.content).appendTo(gennyPage).trigger('create');
		}
		
		// The rationale behind this: Things do not always generate properly
		// if they aren't on a page.  So, I made a page, I generated everything,
		// then I pluck it back off there and drop it in the popup.  And of 
		// course clean up the leavings.
		gennyPage.appendTo('body').page().trigger('create');
		basePop.append(gennyPage.children());
		gennyPage.remove();
		basePop.appendTo($('.active-page'));
			
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
			
		basePop.popup({'transition':o.transition, 'positionTo':o.positionTo, 'afterclose': funcs.close, 'afteropen': funcs.open});
		basePop.popup('open');
		
		console.debug(gennyPage[0]);
		console.debug(basePop[0]);
		
		
		
		
		/*
		
		
		if ( o.headerText !== false || o.headerClose !== false ) {
			self.sdHeader = $('<div style="margin-bottom: 4px;" class="ui-header ui-bar-'+o.themeHeader+'"></div>');
			if ( o.headerClose === true ) {
				$("<a class='ui-btn-left' rel='close' href='#'>Close</a>").appendTo(self.sdHeader).buttonMarkup({ theme  : o.themeHeader, icon   : 'delete', iconpos: 'notext', corners: true, shadow : true });
			}
			$('<h1 class="ui-title">'+((o.headerText !== false)?o.headerText:'')+'</h1>').appendTo(self.sdHeader);
			self.sdHeader.appendTo(self.sdIntContent);
		}
		

		} else if ( o.mode === 'button' ) {
			self._makeButtons().appendTo(self.sdIntContent);
		}
		
		self.sdIntContent.appendTo(self.displayAnchor.parent());
		
		self.dialogPage.appendTo( $.mobile.pageContainer )
			.page().css('minHeight', '0px').css('zIndex', o.zindex);
			
		*/
	},
	_makeButtons: function () {
		var self = this,
			o = self.options,
			buttonHTML = $('<div></div>'),
			pickerInput = $("<div class='ui-simpledialog-controls'><input class='ui-simpledialog-input ui-input-text ui-shadow-inset ui-corner-all ui-body-"+o.themeInput+"' type='"+((o.buttonPassword===true)?"password":"text")+"' value='"+((o.buttonInputDefault!==false)?o.buttonInputDefault.replace( '"', "&#34;" ).replace( "'", "&#39;" ):"")+"' name='pickin' /></div>"),
			pickerChoice = $("<div>", { "class":'ui-simpledialog-controls' });
			
		
		if ( o.buttonPrompt !== false ) {
			self.buttonPromptText = $("<p class='ui-simpledialog-subtitle'>"+o.buttonPrompt+"</p>").appendTo(buttonHTML);
		}
		
		if ( o.buttonInput !== false ) {
			$.mobile.sdLastInput = "";
			pickerInput.appendTo(buttonHTML);
			pickerInput.find('input').bind('change', function () {
				$.mobile.sdLastInput = pickerInput.find('input').first().val();
				self.thisInput = pickerInput.find('input').first().val();
			});
		}
		
		pickerChoice.appendTo(buttonHTML);
		
		self.butObj = [];
		
		$.each(o.buttons, function(name, props) {
			props = $.isFunction( props ) ? { click: props } : props;
			props = $.extend({
				text   : name,
				id     : name + self.internalID,
				theme  : o.themeButtonDefault,
				icon   : 'check',
				iconpos: 'left',
				corners: 'true',
				shadow : 'true',
				args   : [],
				close  : true
			}, props);
			
			self.butObj.push($("<a href='#'>"+name+"</a>")
				.appendTo(pickerChoice)
				.attr('id', props.id)
				.buttonMarkup({
					theme  : props.theme,
					icon   : props.icon,
					iconpos: props.iconpos,
					corners: props.corners,
					shadow : props.shadow
				}).unbind("vclick click")
				.bind(o.clickEvent, function() {
					if ( o.buttonInput ) { self.sdIntContent.find('input [name=pickin]').trigger('change'); }
					var returnValue = props.click.apply(self, $.merge(arguments, props.args));
					if ( returnValue !== false && props.close === true ) {
						self.close();
					}
				})
			);
		});
		
		return buttonHTML;
	},
	
	open: function() {
		var self = this,
			o = this.options,
			coords = this._getCoords(this);
		
		self.sdAllContent.find('.ui-btn-active').removeClass('ui-btn-active');
		self.sdIntContent.delegate('[rel=close]', o.clickEvent, function (e) { e.preventDefault(); self.close(); });
		
		if ( ( o.dialogAllow === true && coords.width < 400 ) || o.dialogForce ) {
			self.isDialog = true;
			
			if ( o.mode === 'blank' ) { // Custom selects do not play well with dialog mode - so, we turn them off.
				self.sdIntContent.find('select').each(function () {
					$(this).jqmData('nativeMenu', true);
				});
			}
			
			self.displayAnchor.parent().unbind("pagehide.remove");
			self.sdAllContent.append(self.sdIntContent);
			self.sdAllContent.trigger('create');
			if ( o.headerText !== false ) {
				self.sdHeader.find('h1').appendTo(self.dialogPage.find('[data-role=header]'));
				self.sdIntContent.find('.ui-header').empty().removeClass();
			}
			if ( o.headerClose === true ) {
				self.dialogPage.find('.ui-header a').bind('click', function () {
					setTimeout("$.mobile.sdCurrentDialog.destroy();", 1000);
				});
			} else {
				self.dialogPage.find('.ui-header a').remove();
			}
			
			self.sdIntContent.removeClass().css({'top': 'auto', 'width': 'auto', 'left': 'auto', 'marginLeft': 'auto', 'marginRight': 'auto', 'zIndex': o.zindex});
			$.mobile.changePage(self.dialogPage, {'transition': (o.animate === true) ? o.transition : 'none'});
		} else {
			self.isDialog = false;
			self.selects = [];
			
			if ( o.fullScreen === false ) {
				if ( o.showModal === true && o.animate === true ) { self.screen.fadeIn('slow'); }
				else { self.screen.removeClass('ui-simpledialog-hidden'); }
			}
			
			self.sdIntContent.addClass('ui-overlay-shadow in').css('zIndex', o.zindex).trigger('create');
			
			if ( o.fullScreen === true && ( coords.width < 400 || o.fullScreenForce === true ) ) {
				self.sdIntContent.removeClass('ui-simpledialog-container').css({'border': 'none', 'position': 'absolute', 'top': coords.fullTop, 'left': coords.fullLeft, 'height': coords.high, 'width': coords.width, 'maxWidth': coords.width }).removeClass('ui-simpledialog-hidden');
			} else {
				self.sdIntContent.css({'position': 'absolute', 'top': coords.winTop, 'left': coords.winLeft}).removeClass('ui-simpledialog-hidden');
			}
			
			$(document).bind('orientationchange.simpledialog', {widget:self}, function(e) { self._orientChange(e); });
			if ( o.resizeListener === true ) {
				$(window).bind('resize.simpledialog', {widget:self}, function (e) { self._orientChange(e); });
			}
		}
		if ( $.isFunction(o.callbackOpen) ) {
			o.callbackOpen.apply(self, o.callbackOpenArgs);
		}
	}
  });
})( jQuery );

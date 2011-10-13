/** jQuery filePicker plugin
 * 
 * This is a jQuery plugin that turns any element into a button that opens up the file picker. The file picker pops up underneath the
 * button (or whatever) and opens up a directory tree. When you select a file, it runs the onClick method which by default will open a 
 * confirm dialog (this can be disabled). Upon confirming that this is the file you want, it runs the onSelect method which must be
 * supplied by the user.
 * 
 * @author Jan Hartigan
 * @version 1.0.0 (2011-10-13)
 */

(function($){
	
	//the current element being worked on by the filepicker
	var currentElement;
	
	//an array in which we will store all instances of our filePicker object
	var filePickers = [];
	
	//create the filePicker object and define the constructor
	function filePicker(element, options) {
		this.init(element, options);
	}
	
	//extend the filePicker object to include all of its properties and methods
	filePicker.prototype = {
		
		/* the jQuery object representing the clickable element
		 * jQueryObj
		 */
		$element: null,
		
		/* the jQuery object representing the filepicker
		 * jQueryObj
		 */
		$filepicker: null,
		
		/* this bool tells the destroy method whether or not the document's onclick already has a handler attached for this object 
		 * bool
		 */
		destroyCallbackSet: false,
		
		/* Directory separator to be used when parsing and creating paths
		 * string
		 */
		directorySeparator: '/',

		
		/* This is the original scaffold that will be used to build the filepicker
		 * string
		 */
		scaffold: 	'<div class="fp-file-picker">' +
						'<div class="fp-grad-top"></div>' +
						'<div class="fp-grad-bottom"></div>' +
						'<div class="fp-pre-loader">Loading...</div>' +
						'<div class="fp-list-container"></div>' +
					'</div>',
		
		/* The settings object
		 * object
		 */
		settings: {
			
			/* If set to true, clicking a file opens a prompt
			 * bool
			 */
			confirmSelection	: false,
			
			/* If set to true, selecting a file closes the filePicker
			 * bool
			 */
			closeOnSelectFile	: true,
			
			/* The question posed to the user for the confirm
			 * string
			 */
			confirmText			: "Are you sure you want to select this file?",
			
			/* Whether to align the filepicker to the left or the right edge of the clickable element
			 * string
			 */
			horizontalAlign		: 'right',
			
			/* The distance (in pixels) between the bottom edge of the clickable element and the top of the filePicker
			 * int
			 */
			topSpacing			: 0,
			
			/* The width of the filePicker
			 * int
			 */
			width				: 400,
			
			/* The height of the filePicker
			 * int
			 */
			height				: 300,
			
			/* The color (as a CSS color string) of the indentation for nested items
			 * string
			 */
			nestedFolderPaddingColor: '#333',
			
			/* The depth (in pixels) for every layer of nesting
			 * int
			 */
			nestDepth			: 15,
			
			/* Whether or not to fade the filepicker in (if set to false, it just shows it without a fade)
			 * bool
			 */
			fadeIn				: true,
			
			/* Number of milliseconds to fade the filePicker in (if fadeIn is set to true)
			 * int
			 */
			fadeInTime			: 120,
			
			/* Whether or not to fade the filepicker out (if set to false, it just hides it without a fade)
			 * bool
			 */
			fadeOut				: true,
			
			/* Number of milliseconds to fade the filePicker out (if fadeOut is set to true)
			 * int
			 */
			fadeOutTime			: 60,
			
			/* The URI to be used in loading a directory. This URI will be sent a directory as a string and should return a json object
			 * string
			 */
			dataSource			: '',
			
			/* The XHR method...POST, GET, PUT, DELETE
			 * string
			 */
			requestMethod		: 'POST',
			
			/* Base directory to be used as the highest-level directory that the user cannot go above
			 * string
			 */
			baseDirectory		: '',
			
			/* If this is set to true, the filepicker will close when you click outside of it. otherwise, you have to close it using the
			 * close button inside the filepicker or you have to call the closeFilePicker method
			 * bool
			 */
			closeOnOutsideClick	: true,
			
			/* Determines whether or not the root folder shows at the top level
			 * bool
			 */
			showRootFolder		: true,
			
			/* The function to run before the filePicker is created when the clickable element is clicked
			 * function
			 */
			onPreOpen			: null,
			
			/* The function to run after the filePicker is created when the clickable element is clicked
			 * function
			 */
			onPostOpen			: null,
			
			/* The function to run before the filePicker is destroyed
			 * function
			 */
			onPreClose			: null,
			
			/* The function to run after the filePicker is destroyed
			 * function
			 */
			onPostClose			: null,
			
			/**
			 * The beforeSelectFolder function runs after a file is selected
			 * 
			 * @param object	data => contains the information about the selected file
			 */
			beforeSelectFile	: function(data) {},
			
			/**
			 * The afterSelectFolder function runs after a file is selected
			 * 
			 * @param object	data => contains the information about the selected file
			 */
			afterSelectFile		: function(data) {},
			
			/**
			 * The beforeSelectFolder function runs after a file is selected
			 * 
			 * @param object	data => contains the information about the selected directory
			 */
			beforeSelectFolder	: function(data) {},
			
			/**
			 * The afterSelectFolder function runs after a file is selected
			 * 
			 * @param object	data => contains the information about the selected directory
			 */
			afterSelectFolder	: function(data) {}
		},
		
		/**
		 * The init function
		 * 
		 * @param DOMElement	element
		 * @param object		options
		 */
		init: function(element, options) {
			var self = this;
			
			//if settings options were supplied, overwrite those default settings
			if (options)
				$.extend(this.settings, options);
			
			//convert the element into jQuery object and set it equal to the $element property
			this.$element = $(element);
			
			//determine the directory separator
			if (this.settings.baseDirectory.indexOf('/') > -1)
				this.directorySeparator = '/';
			else
				this.directorySeparator = '\\';
			
			//set up the click handler for the element
			this.$element.click(function() {
				self.createFilePicker();
			});
		},
		
		/**
		 * Handles the filePicker creation process, including running the pre- and post-hooks
		 */
		createFilePicker: function() {
			var self = this;
			
			//check if the filepicker already exists
			if (this.$filepicker && this.$filepicker.is(':visible'))
				return false;
			
			//first run the onPreOpen function
			if (typeof this.settings.onPreOpen == 'function') 
				this.settings.onPreOpen();
			
			//now build the filePicker
			this.buildFilePickerScaffold();
			
			//set up the click handlers for items
			this.$filepicker.delegate('.fp-item', 'click', function() {
				self.itemClicked(this);
			});
			
			//set up the close handlers
			if (this.settings.closeOnOutsideClick) {
				//close the filepicker when the user clicks anywhere outside the filepicker area
				if (!this.destroyCallbackSet) {
					$(document).click(function(e) {
						var $clicked = $(e.target);
						
						if ($clicked[0] == self.$element[0] || $clicked[0] == self.$filepicker[0]) 
							return;
						
						if ($clicked.closest('.fp-file-picker').length > 0) 
							return;
						
						self.destroy();
					});
					
					this.destroyCallbackSet = true;
				}
			}
			$(document).bind('keydown', function(e) {
				if (e.keyCode === 27) {
					$(document).unbind('keydown');
					self.destroy();
				}
			})
			
			//load the original directory path
			this.loadDirectoryPath('', this.$filepicker.find('.top-level-item'));
			
			//lastly run the onPostOpen function
			if (typeof this.settings.onPostOpen == 'function') 
				this.settings.onPostOpen();
		},
		
		/**
		 * Builds the outer scaffold of the file picker including setting its place on the screen
		 */
		buildFilePickerScaffold: function() {
			var $scaffold = $(this.scaffold),
				right = 0,
				left = 0,
				top = 0,
				offset = this.$element.offset(),
				$container = null;
			
			$scaffold.prependTo('body');
			
			//first do the easy calculation...where to line up the y
			top = offset.top
				+ this.$element.height() 
				+ parseInt(this.$element.css('padding-top')) 
				+ parseInt(this.$element.css('padding-bottom'))
				+ parseInt(this.$element.css('border-top-width'))
				+ parseInt(this.$element.css('border-bottom-width'))
				+ this.settings.topSpacing;
			
			//then figure out the x based on the horizontal alignment option
			if (this.settings.horizontalAlign == 'right') {
				right = offset.left
					+ this.$element.width()
					+ parseInt(this.$element.css('padding-left')) 
					+ parseInt(this.$element.css('padding-right'))
					+ parseInt(this.$element.css('border-left-width'))
					+ parseInt(this.$element.css('border-right-width'));
				
				$scaffold.css({right: $('body').width() - right, top: top, width:this.settings.width, height:this.settings.height});
			} else {
				left = offset.left;
				$scaffold.css({left: left, top: top, width:this.settings.width, height:this.settings.height});
			}
			
			$('.fp-pre-loader', $scaffold).css('padding-top', this.settings.height/2+'px');
			
			//handle the css stuff for the outer list container
			$container = $('.fp-list-container', $scaffold);
			$container.css({
				width:this.settings.width, 
				height:this.settings.height
			});
			
			if (this.settings.showRootFolder) {
				$container.append('<div class="top-level-item fp-directory-item fp-item">' + this.settings.baseDirectory + '</div>');
			}
			
			if (this.settings.fadeIn)
				this.$filepicker = $scaffold.fadeIn(this.settings.fadeInTime);
			else
				this.$filepicker = $scaffold.show();
		},
		
		/**
		 * Loads the supplied directory path
		 * 
		 * @param string	dir => directory to load
		 * @param jQueryObj	item => item clicked after which to put the new UL
		 */
		loadDirectoryPath: function(dir, $item) {
			var self = this,
				data = {
					baseDirectory: this.settings.baseDirectory,
					dir: dir
				};
			
			$.ajax({
				type	: $.trim(this.settings.requestMethod.toUpperCase()),
				url		: $.trim(this.settings.dataSource),
				data	: data,
				dataType: 'json',
				success	: function(ret) {
					var itemList = '';
					
					if (ret.success) {
						itemList = self.buildItemList(ret.contents, dir);
						
						$item.after(itemList);
						self.$filepicker.find('.fp-pre-loader').hide();
					} else
						alert(ret.error);
				}
			});
		},
		
		/**
		 * Clears the contents of an open directory (i.e. closes the folder)
		 * 
		 * @param jQueryObj		$item
		 */
		clearDirectoryList: function($item) {
			$item.siblings().remove();
		},
		
		/**
		 * Builds an item list from a supplied array
		 * 
		 * @param Array		items
		 * @param String	dir => to determine how much left border to give the list
		 * 
		 * @return string	'<ul class="fp-list"><...LIs...></ul>'
		 */
		buildItemList: function(items, dir) {
			var self = this,
				directories = '',
				files = '',
				ulStyle = 'border-left: 15px solid ' + this.settings.nestedFolderPaddingColor;
			
			if (items.length) {
				$.each(items, function(ind, el) {
					var typeClass = 'fp-item',
						path = el.path.indexOf(self.settings.baseDirectory) === 0 ? el.path.replace(self.settings.baseDirectory,'') : el.path;
						commonInputs = 	'<input type="hidden" name="type" value="' + el.type + '" />' +
										'<input type="hidden" name="name" value="' + el.name+ '" />' +
										'<input type="hidden" name="path" value="' + path+ '" />';
					
					if (el.type == 'file') {
						//check to see what type of thing it is so that we can add an appropriate icon to the item
						switch(el.fileType) {
							case 'image': typeClass += ' fp-image-item'; break;
							default: typeClass += ' fp-file-item'; break;
						}
						
						files += 	'<li>' +
										'<div class="' + typeClass + '">' +
											commonInputs +
											'<input type="hidden" name="fileType" value="' + el.fileType + '" />' +
											el.name +
										'</div>' +
									'</li>';
					} else if (el.type == 'dir') {
						typeClass += ' fp-directory-item';
						
						directories +=	'<li>' +
											'<div class="' + typeClass + '">' +
												commonInputs +
												el.name +
											'</div>' +
										'</li>';
					}
				});
				
				return '<ul class="fp-list" style="' + ulStyle + '">' + directories + files + '</ul>';
			} else {
				return '<div class="fp-no-contents">There are no contents in this directory</div>';
			}
		},
		
		/**
		 * Handles when a file is clicked
		 * 
		 * @param DOMElement	element
		 */
		itemClicked: function(element) {
			var $item = $(element),
				path = $item.find('input[name=path]').val(),
				data = {
					type	: $item.find('input[name=type]').val(),
					name	: $item.find('input[name=name]').val(),
					path	: this.settings.baseDirectory + path
				};
			
			if (data.type === 'file') {
				data.fileType = $item.find('input[name=fileType]').val();
				
				this.settings.beforeSelectFile.call(this.$element, data);
				
				//for now just do a simple prompt, eventually give more options like a drop down thing that shows the image
				if (this.settings.confirmSelection) {
					var conf = confirm(this.settings.confirmText);
					
					if (!conf)
						return false;
				}
				
				this.settings.afterSelectFile.call(this.$element, data);
				
				if (this.settings.closeOnSelectFile)
					this.destroy();
			} else if (data.type === 'dir') {
				data.folderState = $item.siblings().length > 0 ? 'closed' : 'open';
				
				this.settings.beforeSelectFolder.call(this.$element, data);
				
				if (data.folderState == 'open')
					this.loadDirectoryPath(path, $item);
				else
					this.clearDirectoryList($item);
				
				this.settings.afterSelectFolder.call(this.$element, data);
			}
		},
		
		/**
		 * Destroys the filePicker object by calling the private method outside of this class
		 */
		destroy: function() {
			var self = this;
			
			function commitDestroy() {
				self.$filepicker.undelegate('.fp-list > li', 'click');
				
				self.$filepicker.remove();
				destroyFilePicker(self);
			}
			
			if (this.settings.fadeOut) {
				this.$filepicker.fadeOut(this.settings.fadeOutTime, function() {
					commitDestroy();
				});
			} else {
				self.$filepicker.hide();
				commitDestroy();
			}
		}
	};
	
	/**
	 * This method iterates over the filePickers array and checks if the selected element is in the DOM
	 * If it isn't, it removes the filePicker object from the array
	 */
	function cleanFilePickers() {
		$.each(filePickers, function(ind, el) {
			if (!el.$filepicker.is(':visible')) {
				filePickers.splice(ind, 1);
			}
		});
	}
	
	/**
	 * Checks if the clicked element already has a filepicker open
	 * 
	 * @param DOMObj	element
	 * 
	 * @return bool
	 */
	function checkIfActive(element) {
		var result = false,
			$element = $(element);
		
		$.each(filePickers, function(ind, el) {
			if (el.$element[0] == $element[0]) {
				result = true;
				return false;
			}
		});
		
		return result;
	}
	
	/**
	 * Destroys the provided filePicker object
	 * 
	 * @param filePickerObject
	 */
	function destroyFilePicker(fp) {
		$.each(filePickers, function(ind, el) {
			if (fp.$element == el.$element) {
				filePickers.splice(ind, 1);
				return false;
			}
		});
	}
	
	//extend the jQuery object 
	$.fn.filePicker = function(options) {
		return this.each(function() {
			if ( (this != currentElement) && !checkIfActive(this)) {
				currentElement = this;
				filePickers.push(new filePicker(this, options));
				currentElement = '';
			}
		});
	};
})(jQuery);
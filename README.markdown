# filepicker

filepicker is a jQuery plugin that lets you convert any element into a clickable directory tree manager. When you click the element, a directory tree will show up hovered beneath the clicked element. This directory tree allows you to open up subdirectories or select any file at any level in the tree. Selecting a file calls a user-supplied callback function where you can do with the file information anything you like.

<hr />

## example

Let's say you have a text input called 'item_image' that looks like this:

<img src="https://github.com/janhartigan/filepicker/raw/master/example/filepicker_example_empty.png" />

It doesn't have to be a text input...it could be anything like a button or a div. If you run this code:

<pre>
$('#item_image').filePicker({
	dataSource	: '/admin/getdirectory',
	baseDirectory	: '/images',
	afterSelectFile : function(data) {
		console.log(data);
	}
});
</pre>

Your text input 'item_image' will be a filepicker. So how does it get the directory information? The keys are the dataSource and baseDirectory properties of the options object. This is how the filepicker plugin knows where to look on your server for the directory and file data. In order for the filepicker to work properly, your server needs to return JSON data in this format from the server if the operation succeeded:

<pre>
{
	/* A boolean to determine if the directory call has succeeded or not
	 *
	 * bool
	 */
	'success' : true,
	
	/* This is an array of items in a directory. Each array spot is an object with the following properties
	 *
	 * array
	 */
	'contents': [
		{
			/* The name of the file or directory
			 *
			 * string
			 */
			'name'		: 'whatever.png',
			
			/* The full path with a leading slash starting at your base directory
			 *
			 * string
			 */
			'path'		: '/images/whatever.png',
			
			/* The size of the file as an integer (false if it's a directory)
			 *
			 * int / false (if directory)
			 */
			'size'		: 4000,
			
			/* Whether this is a file or a directory. The two types are 'file' and 'dir'
			 *
			 * string
			 */
			'type'		: 'file',
			
			/* If this is a file, this will say what type of file it is, or it will be boolean false if it is a directory
			 *
			 * string / false (if directory)
			 */
			'fileType'	: 'image',
			
			/* The date as a string that you want associated with this item (creation date or modified date). Can be any
			 * JavaScript-readable string that can be passed into the Date() constructor. 
			 *
			 * string
			 */
			'date'		: '2010-12-12 15:45:00'
		},
		{ ... } //more contents objects for the rest of the contents of the directory
	]
}
</pre>

If the operation failed, filepicker expects this JSON result:

<pre>
{
	/* A boolean to determine if the directory call has succeeded or not
	 *
	 * bool
	 */
	'success' 	: false,
	
	/* The error that has been given for the failure
	 *
	 * string
	 */
	'error'		: 'error string describing the error'
}
</pre>

<em>Note: If you're curious how you might generate this sort of data in PHP code, see the file in the "example" directory called "example.php".</em>

So now that you're (hopefully) getting the data back from your server correctly, the filepicker will process the information and you should get something like this:

<img src="https://github.com/janhartigan/filepicker/raw/master/example/filepicker_example_clicked.png" />

In this view, clicking a file will fire the beforeSelectFile and afterSelectFile callback functions. Clicking a directory (or folder) will fire the beforeSelectFolder and afterSelectFolder callback functions. Each of these get passed a data object with information about the selected item. Selecting a directory allows you to dig deeper into the directory tree which looks like this:

<img src="https://github.com/janhartigan/filepicker/raw/master/example/filepicker_example_clicked_deeper.png" />

While selecting an open directory closes that directory.

You can do anything with the data passed into the callback functions. For example, I replace the text of the input with the full directory path of the clicked item and (if it's an image) I put a preview of the image directly below the input box. This ends up looking like this:

<img src="https://github.com/janhartigan/filepicker/raw/master/example/filepicker_example_selected_display.png" />

## options

These are the settings and callback functions available for the plugin:

<pre>
{	
	/* If set to true, clicking a file opens a prompt
	 * bool
	 */
	confirmSelection	: true,
	
	/* If set to true, selecting a file closes the filePicker
	 * bool
	 */
	closeOnSelectFile	: true,
	
	/* The question posed to the user for the confirm
	 * string
	 */
	confirmText			: "Are you sure you want to select this file?",
	
	/*
	 * Whether to align the filepicker to the left or the right edge of the clickable element
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
	
	/* The URI to be used in loading a directory. This URI will be sent a directory as a string and should return a 
	 * json object 
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
	
	/* If this is set to true, the filepicker will close when you click outside of it. otherwise, you have to close it 
	 * using the close button inside the filepicker or you have to call the closeFilePicker method
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
}
</pre>
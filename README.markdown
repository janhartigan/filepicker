# filepicker

filepicker is a jQuery plugin that lets you convert any element into a clickable directory tree manager. When you click the element, a directory tree will show up hovered beneath the clicked element. This directory tree allows you to open up subdirectories or select any file at any level in the tree. Selecting a file calls a user-supplied callback function where you can do with the file information anything you like.

<hr />

## example

Let's say you have a text input called 'item_image' that looks like this:

<img src="https://github.com/janhartigan/filepicker/raw/master/example/filepicker_example_empty.png" />

Now if you run this code:

<pre>
$('#item_image').filePicker({
	dataSource	: '/admin/getdirectory',
	baseDirectory	: '/images',
	afterSelectFile : function(data) {
		console.log(data);
	}
});
</pre>

Your text input 'item_image' will now be a filepicker. The keys here are the dataSource and baseDirectory properties of the options object. This is how the filepicker plugin knows where to look on your server for the directory and file data. In order for the filepicker to work properly, your server needs to return JSON data in this format from the server if the operation succeeded:

<pre>
{
	'success' : true,
	'contents': [ //an array
		{
			'name'		: 'whatever.png', //the file or directory name
			'path'		: '/images/whatever.png', //the full path of the file or directory
			'size'		: 4000, //the file size as an integer
			'type'		: 'file', //'file' if it's a file, 'dir' if it's a directory
			'fileType'	: 'image', //the exact type of file (see accepted filetypes section)...false if it's a dir
			'date'		: '2010-12-12 15:45:00' //any javascript-readable time string that can be passed into the Date() constructor
		},
		{ ... } //more contents objects for the rest of the contents of the directory
	]
}
</pre>

If the operation failed, filepicker expects this JSON result:

<pre>
{
	'success' 	: false,
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
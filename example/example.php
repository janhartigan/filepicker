<?php
/**
 * Gets all contents of a directory
 * 
 * @param string	directory (at base)
 * 
 * @return array('success' ? 'contents' => array of file info : 'error')
 */
function getDirectoryContents($folder = '')
{
	//strip the leading '/' if it exists
	$folder = (strpos($folder, '/') === 0 ? substr($folder, 1) : $folder);
	
	$directory = FCPATH.$folder;
	$scan = scandir($directory);
	$contents_array = array();
	
	if ($scan)
	{
		foreach ($scan as $file)
		{
			if ($file == '.' || $file == '..')
				continue;
			
			$filepath = $directory.DIRECTORY_SEPARATOR.$file;
			$path = DIRECTORY_SEPARATOR.$folder.DIRECTORY_SEPARATOR.$file;
			$type = @filetype($filepath);
			
			if (!$type)
				continue;
					
			$contents_array[] = array(
									'name'=>$file,
									'path'=>$path, 
									'size'=>ceil(filesize($filepath)/1000), 
									'type'=>$type,
									'fileType'=>getFileType($filepath), //this calls the below function
									'date'=>date('Y-m-d H:i:s', filemtime($filepath)));
		}
		
		return array('success'=>true, 'contents'=>$contents_array);
	}
	else
		return array('success'=>false, 'error'=>"This directory does not exist");
}
	
/**
 * Attempts to get a file's type returning "file" if it can't be recognized
 * 
 * @param string	filepath
 * @param bool		exclude_folders
 * 
 * @return mixed	file_type (string) or false
 */
function getFileType($filepath)
{
	if (!is_file($filepath) || filetype($filepath) != 'file')
		return false;
	
	$exif = exif_imagetype($filepath);
	$type = '';
	
	switch($exif) {
		case IMAGETYPE_GIF:
		case IMAGETYPE_JPEG:
		case IMAGETYPE_PNG:
		case IMAGETYPE_BMP:
		case IMAGETYPE_WBMP: $type = 'image'; break;
		case IMAGETYPE_SWF: $type = 'flash'; break;
		case IMAGETYPE_PSD: $type = 'photoshop'; break;
		default: $type = 'file'; break;
	}
	
	return $type;
}
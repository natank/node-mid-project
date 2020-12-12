/**
 * uploadTopicFiles
 * This middleware takes care of uploading a single file
 * Uses 'formidable' library and expect enctype="multipar/form-data" in the client side.
 * Server side error checking
 * Check if file exist
 * Determine filePath
 * Determine File name
 *
 * Output the following
 *      req.fileExist,
 *      req.filePath,
 *      req.fileName,
 *      req.files,
 *      req.fields
 *
 * the next route handler is responsible to move the file to its server position.
 *
 *  *
 */
const currentTime = require('../../util/currentTime');
const s3 = require('../../util/aws-s3');
async function uploadTopicFiles(req, res, next) {
	req.fileExist = req.files.fileurl.size > 0;
	try {
		let imageName = req.files.fileurl.name;
		const tempFilePath = req.files.fileurl.path;
		imageName = `${currentTime()}${imageName}`;
		const imageDir = 'images';
		const imagePath = `${imageDir}/${imageName}`;

		const data = await s3.uploadFile(tempFilePath, imagePath);
		req.body.imageUrl = data.Location;
		next();
	} catch (err) {
		next(err);
	}
}

module.exports = uploadTopicFiles;

var express = require('express');
var router = express.Router();
var fs = require('fs');
var multer = require('multer');
var upload = multer({dest: 'uploads/'});
/**
 * Create's the file in the database
 */
router.post('/', upload.single('file'), function (req, res, next) {
	console.log(req.body);
	console.log(req.file);
	var newUpload = {
		name: req.body.name,
		created: Date.now(),
		file: req.file
	};
	Upload.create(newUpload, function (err, next) {
			if (err) {
			next(err);
			} else {
			res.send(newUpload);
		}
	});
});
module.exports = router;
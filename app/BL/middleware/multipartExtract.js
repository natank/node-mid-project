const formidable = require('formidable');

module.exports = async (req, res, next) => {
  if (req.get('content-type') && req.get('content-type').includes('multipart')) {
    await new Promise((resolve, reject) => {
      const form = new formidable.IncomingForm();
      form.parse(req, function (err, fields, files) {
        req.files = files;
        req.body._csrf = fields._csrf ? fields._csrf : req.body._csrf;
        req.body = { ...req.body, ...fields };
        resolve()
      })
    })
  }
  next();
}
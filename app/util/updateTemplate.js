module.exports = function updateTemplate(res, data, routePath) {
    fs.writeFileSync(path.resolve(__dirname, '../params.json'), data);
    res.redirect(routePath)
  }
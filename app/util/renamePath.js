const fs = require('fs');
module.exports = async function renamePath(oldPath, newPath) {
    await new Promise((resolve, reject) => {
      fs.rename(oldPath, newPath, function (err) {
        if (err) reject(err);
        else resolve()
      })
    })
  }
  
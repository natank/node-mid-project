module.exports = function getCurrentTime() {
    let currentTime = new Date()
      .toISOString()
      .replace(/\-/g, '')
      .replace(/\:/g, '')
    return currentTime;
  }
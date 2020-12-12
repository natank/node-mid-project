const mongoose = require('mongoose');


/* connect */
let _db;

let _dbURI = process.env.DB_URI;

async function mongoConnect() {
  try {
    await mongoose.connect(_dbURI, { useNewUrlParser: true });
    console.log("connected")

    _db = mongoose.connection;
    _db.on('error', console.error.bind(console, 'connection error:'));
    _db.once('open', () => {
      console.log("We're connected!!!")
    })
  } catch (err) {
    console.log(`Mongodb failed to connect:\n${err}`)
  }

}

const getDb = () => {
  if (_db) {
    return _db;
  }
  throw 'No database found!';
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
exports.dbURI = _dbURI;
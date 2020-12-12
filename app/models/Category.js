const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const categorySchema = new Schema({
  title: {
    type: String,
    required: true
  },
  createdBy: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  featured: {
    type: Boolean,
    default: false
  }

})

module.exports = mongoose.model('Category', categorySchema);
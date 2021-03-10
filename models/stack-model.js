const mongoose = require('mongoose');

const stackSchema = new mongoose.Schema({
  stackName: String,
  userId: String
});

module.exports = new mongoose.model('Stack', stackSchema);

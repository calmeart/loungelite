const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: String,
  body: String,
  date: Date,
  userIdNumber: String,
  userNickName: String,
  status: String,
  stack: String,
  action: {
    likes: Number,
    dislikes: Number,
    comments: Array
  }
});

module.exports = new mongoose.model('Post', postSchema);

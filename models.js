const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const findOrCreate = require('mongoose-findorcreate');

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  facebookId: String,
  googleId: String,
  action: {
    likedPosts: Array,
    dislikedPosts: Array,
    commentedPosts: Array
  }


});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model('User', userSchema);

const postSchema = new mongoose.Schema({
  title: String,
  body: String,
  date: Date,
  userIdNumber: String,
  userNickName: String,
  status: String,
  action: {
    likes: Number,
    dislikes: Number,
    comments: Array
  }
});

const Post = new mongoose.model('Post', postSchema);

module.exports = {
  User,
  Post
}

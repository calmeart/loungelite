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

module.exports = new mongoose.model('User', userSchema);

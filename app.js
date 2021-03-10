require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const session = require('express-session');
const passport = require('passport');
const {
  formatDate
} = require('./format-date.js');

const flash = require('connect-flash');

const User = require('./models/user-model');
const Post = require('./models/post-model');
const Stack = require('./models/stack-model');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

require('./models/connection')();
require('./middleware/auth-strategy')();
require('./routes/auth-routes')(app);

// PROFILE PAGE FUNCTIONS

app.route("/users/:userid")
  .get((req, res) => {
    if (req.user) {
      Post.find({
        userIdNumber: req.user._id
      }).sort({
        date: "desc"
      }).exec(function(err, foundPosts) {
        if (err) return res.send(err);
        const timeAgoArray = [];
        foundPosts.forEach(item => {
          timeAgoArray.push(formatDate(item.date));
        })
        res.render('profile', {
          userProfile: req.user,
          foundPosts,
          timeAgoArray
        });
      })
    } else {
      req.flash("error", "You need to login to view this page");
      res.redirect("/");
    }
  });



// LOUNGE FUNCTIONS

app.route("/lounge")
  .get((req, res) => {
    if (req.user) {
      Post.find({
        status: "Public"
      }).sort({
        date: "desc"
      }).exec(function(err, foundPosts) {
        if (err) return res.send(err);
        const timeAgoArray = [];
        foundPosts.forEach(item => {
          timeAgoArray.push(formatDate(item.date));
        })
        res.render('lounge', {
          userProfile: req.user,
          foundPosts,
          timeAgoArray
        });
      })
    } else {
      req.flash("error", "You need to login to view this page");
      res.redirect("/");
    }
  })
  .post((req, res) => {
    const temp = new Post({
      title: req.body.postTitle,
      body: req.body.postBody,
      date: new Date(),
      userIdNumber: req.user._id,
      userNickName: req.user.username,
      status: req.body.postVisibility,
      action: {
        likes: 0,
        dislikes: 0,
        comments: []
      }
    });
    temp.save(function(err) {
      if (!err) {
        res.redirect('/users/' + req.user._id);
      }
    });
  });

app.route("/lounge/:postid")
  .post((req, res) => {
    Post.findById(req.params.postid, function(err, foundPost) {
      if (err) return console.log(err);
      User.findById(req.user._id, function(err, foundUser) {
        if (err) return console.log(err);
        // if (req.body.submitLike) {
        //   foundPost.action.likes = foundPost.action.likes + 1;
        //   foundUser.action.likedPosts.push(req.params.postid);
        // }
        // if (req.body.submitDislike) {
        //   foundPost.action.dislikes = foundPost.action.dislikes + 1;
        //   foundUser.action.dislikedPosts.push(req.params.postid);
        // }
        if (req.body.submitComment) {
          foundPost.action.comments.push({
            userIdNumber: req.user._id,
            userNickName: req.user.username,
            comment: req.body.postComment
          });
          foundUser.action.commentedPosts.push(req.params.postid);
        }
        foundPost.save();
        foundUser.save();
        res.redirect("/lounge");
      });
    });
  });

  // ABOUT PAGE

  app.route("/about")
    .get((req, res) => {
      if (req.user) {
        res.render('about', {
          userProfile: req.user
        });
      } else {
        req.flash("error", "You need to login to view this page");
        res.redirect("/");
      }
    });

app.listen(process.env.PORT, function() {
  console.log("Server is running on port: " + process.env.PORT);
});

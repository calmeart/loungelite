const express = require('express');
const router = express.Router();
const User = require('../models/user-model');
const Post = require('../models/post-model');
const Stack = require('../models/stack-model');
const {formatDate} = require('../format-date.js');
const stackRoutes = require('./stack-routes');

router.use('/:userId/stacks', stackRoutes);

router.route("/")
  .get((req, res) => {
    if (req.user) {
      res.redirect("/users/" + req.user._id)
    } else {
      req.flash("error", "You need to login to view this page");
      res.redirect("/");
    }
  })

router.route("/:userId")
  .get(async (req, res) => {
    if (req.user) {
      const timeAgoArray = [];
      const foundUser = await User.findById(req.params.userId);
      let foundPosts;
      if (req.user._id == req.params.userId) {
        foundPosts = await Post.find({userIdNumber: req.params.userId}).sort({date: "desc"});
      } else {
        foundPosts = await Post.find({userIdNumber: req.params.userId, status: "Public"}).sort({date: "desc"});
      }
      const foundStacks = await Stack.find({userId: req.params.userId});
      foundPosts.forEach(item => {
        timeAgoArray.push(formatDate(item.date));
      });
      res.render('profile', {
        userProfile: foundUser,
        clientData: req.user,
        foundPosts,
        foundStacks,
        timeAgoArray
      });
    } else {
      req.flash("error", "You need to login to view this page");
      res.redirect("/");
    }
  });

module.exports = router;

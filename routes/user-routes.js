const express = require('express');
const router = express.Router();
const User = require('../models/user-model');
const Post = require('../models/post-model');
const Stack = require('../models/stack-model');
const {formatDate} = require('../format-date.js');
const stackRoutes = require('./stack-routes');

router.use('/:userid/stacks', stackRoutes);

router.route("/:userid")
  .get(async (req, res) => {
    if (req.user) {
      const timeAgoArray = [];
      const foundPosts = await Post.find({userIdNumber: req.user._id}).sort({date: "desc"});
      const foundStacks = await Stack.find({userId: req.user._id});
      foundPosts.forEach(item => {
        timeAgoArray.push(formatDate(item.date));
      });
      res.render('profile', {
        userProfile: req.user,
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

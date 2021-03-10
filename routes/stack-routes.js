const express = require('express');
const router = express.Router({mergeParams: true});
const Post = require('../models/post-model');
const Stack = require('../models/stack-model');
const {formatDate} = require('../format-date.js');

router.route("/")
  .post(async (req, res) => {
    const tempStack = new Stack({
      stackName: req.body.newStack,
      userId: req.user._id
    });
    await tempStack.save();
    res.redirect('/users/' + req.user._id);
  });

router.route("/:stackname")
  .get(async (req, res) => {
    if (req.user) {
      const timeAgoArray = [];
      const foundPosts = await Post.find({userIdNumber: req.params.userid, stack: req.params.stackname}).sort({date: "desc"});
      const foundStacks = await Stack.find({userId: req.params.userid});
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
  })

module.exports = router;

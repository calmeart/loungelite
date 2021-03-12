const express = require('express');
const router = express.Router();
const User = require('../models/user-model');
const Post = require('../models/post-model');
const Stack = require('../models/stack-model');
const {
  formatDate
} = require('../format-date.js');

router.route("/edit")
  .post(async (req, res) => {
    if (req.body.editPost == "") {
      return res.redirect("/posts/" + req.body.postId)
    }
    if (req.body.deletePost == "")
      await Post.findByIdAndDelete(req.body.postId)
    res.redirect('/users/' + req.user._id)
  })

router.route("/update")
  .post(async (req, res) => {
    const temp = {
      title: req.body.postTitle,
      body: req.body.postBody,
      date: new Date(),
      status: req.body.postVisibility,
      stack: req.body.postStack,
    };
    await Post.findByIdAndUpdate(req.body.postId, { $set: temp});
    res.redirect('/users/' + req.user._id);
  })

router.route("/:postId")
  .get(async (req, res) => {
    const foundPost = await Post.findById(req.params.postId);
    const foundStacks = await Stack.find({
      userId: req.user._id
    })
    res.render('post', {
      foundPost,
      foundStacks,
      clientData: req.user
    });
  })

module.exports = router;

const express = require('express');
const router = express.Router();
const User = require('../models/user-model');
const Post = require('../models/post-model');
const Stack = require('../models/stack-model');
const {formatDate} = require('../format-date.js');

router.route("/edit")
  .post(async (req, res) => {
    if(req.body.editPost == "") {
      return res.redirect("/posts/" + req.body.postId)
    }
    if (req.body.deletePost == "")
      await Post.findByIdAndDelete(req.body.postId)
      res.redirect('/users/' + req.user._id)
  })

router.route("/:postId")
  .get(async (req, res) => {
    const foundPost = await Post.findById(req.params.postId);
    res.render('post', {foundPost});
  })

module.exports = router;

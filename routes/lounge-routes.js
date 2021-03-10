const express = require('express');
const router = express.Router();
const User = require('../models/user-model');
const Post = require('../models/post-model');
const Stack = require('../models/stack-model');
const {formatDate} = require('../format-date.js');

router.route("/")
  .get((req, res) => {
    if (req.user) {
      Post.find({status: "Public"}).sort({date: "desc"}).exec(function(err, foundPosts) {
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
      stack: req.body.postStack,
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

router.route("/:postid")
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

module.exports = router;

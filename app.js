require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const session = require('express-session');
const passport = require('passport');
const models = require('./models.js');
const {
  formatDate
} = require('./format-date.js');
const FacebookStrategy = require('passport-facebook').Strategy
const GoogleStrategy = require('passport-google-oauth20').Strategy
const flash = require('connect-flash');

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

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}, function(err) {
  if (err) return console.log(err);
  console.log("Database connection is established.");
})

const {
  User,
  Post
} = models;
passport.use(User.createStrategy());
passport.serializeUser(function(user, done) {
  done(null, user.id);
});
passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "https://loungelite.herokuapp.com/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({
      facebookId: profile.id,
      username: profile.displayName
    }, function(err, user) {
      return cb(err, user);
    });
  }
));

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://loungelite.herokuapp.com/auth/google/dlogator"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({
      googleId: profile.id,
      username: profile.displayName
    }, function(err, user) {
      return cb(err, user);
    });
  }
));

app.get('/auth/facebook', passport.authenticate('facebook'));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', {
    failureRedirect: '/'
  }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/users/' + req.user._id);
  });

app.get('/auth/google', passport.authenticate('google', {
  scope: ['profile']
}));

app.get('/auth/google/dlogator',
  passport.authenticate('google', {
    failureRedirect: '/'
  }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/users/' + req.user._id);
  });

// HOME PAGE FUNCTIONS //

app.route("/")
  .get((req, res) => {
    res.render('home', {
      messages: req.flash('error')
    });
  });

app.route("/register")
  .get((req, res) => {
    res.render("register", {
      messages: req.flash('error')
    });
  })
  .post((req, res) => {
    const {
      username,
      password,
      confirmPassword
    } = req.body;
    if (password != confirmPassword) {
      req.flash("error", "Confirmation password didn't match");
      return res.redirect("/register");
    }
    User.register(new User({
      username
    }), password, function(err, user) {
      if (err) {
        req.flash("error", err.message)
        return res.redirect("/register");
      }
      passport.authenticate('local')(req, res, function() {
        res.redirect("/users/" + req.user._id);
      });
    });
  });

app.route("/login")
  .post(passport.authenticate('local', {
    failureRedirect: '/',
    failureFlash: true
  }), (req, res) => {
    res.redirect("/users/" + req.user._id);
  });

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

app.route("/logout")
  .get((req, res) => {
    req.logout();
    res.redirect('/');
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

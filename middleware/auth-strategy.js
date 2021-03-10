const passport = require('passport');
const User = require('../models/user-model');
const FacebookStrategy = require('passport-facebook').Strategy
const GoogleStrategy = require('passport-google-oauth20').Strategy

module.exports = () => {
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
};

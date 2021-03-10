const passport = require('passport');

module.exports = (app) => {
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


  app.route("/logout")
    .get((req, res) => {
      req.logout();
      res.redirect('/');
    });

};

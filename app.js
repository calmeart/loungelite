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

const userRoutes = require('./routes/user-routes');
const loungeRoutes = require('./routes/lounge-routes');

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

app.use('/users', userRoutes);
app.use('/lounge', loungeRoutes);

app.listen(process.env.PORT, function() {
  console.log("Server is running on port: " + process.env.PORT);
});

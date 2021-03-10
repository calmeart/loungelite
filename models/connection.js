const mongoose = require('mongoose');

module.exports = () => {
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }, function(err) {
    if (err) return console.log(err);
    console.log("Database connection is established.");
  })
};

const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');
var LocalStrategy = require('passport-local').Strategy;



function validateEmail(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

passport.use(new LocalStrategy(
  function (username, password, done) {
    var searchObj = validateEmail(username) ? {
      email: username.trim()
    } : {
      username: username.trim()
    };
    console.log(searchObj)
    User.findOne(searchObj, function (err, user) {
      if (err) {
        console.log('err' ,err)
        return done(err);
      }
      if (!user) {
        return done(null, false);
      }
      if (!user.verifyPassword(password)) {

        return done(null, false);
      }
      // console.log({password, rest})
      return done(null, user);
    });
  }
));
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});
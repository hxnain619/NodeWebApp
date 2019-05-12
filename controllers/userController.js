const mongoose = require('mongoose');
const User = require('../models/User');

function validateEmail(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}


exports.signup = (req, res, next) => {
  var username = req.body.username.trim()
  var email = req.body.email.trim()
  var password = req.body.password.trim()
  if(username == '') {
    req.flash('error', 'Username can\'t be empty!')
    return res.status(500).redirect('back')
  }
  if(email == '') {
    req.flash('error', 'Email can\'t be empty!')
    return res.status(500).redirect('back')
  }
  if(password == '') {
    req.flash('error', 'Password can\'t be empty!')
    return res.status(500).redirect('back')
  }
  if(!validateEmail(email)) {
    req.flash('error', 'Provide a valid email!')
    return res.status(500).redirect('back')
  }
  const user = new User({
    username: username,
    password: password,
    email: email,
  });
  user.save(function (err, user) {
    if (err) {
      if (err.code = '11000') {
        req.flash('error', "This User exists")
        return res.status(500).redirect('back')
      }
      return res.status(500).render('error', {
        error: err
      })
    } else {
      console.log(req.body)
      next();
      // return res.render('index', {
      //   user: user
      // })
    }
  })
  // next(); // pass to authController.login
};
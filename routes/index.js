var express = require('express');
var router = express.Router();
var passport = require('passport');
var authController = require('../controllers/authController')
var userController = require('../controllers/userController')
var indexController = require('../controllers/indexController')
var eventController = require('../controllers/eventController');
var storyController = require('../controllers/storyController');

/* GET home page. */
router.get('/',
  eventController.loadEvent,
  indexController.index
);

router.get('/bone',
  indexController.bone
);
router.get('/login',
  indexController.login
)


router.get('/logout',
  authController.logout
)

router.get('/user',
  function (req, res) {
    if (req.isAuthenticated()) {
      return res.json({
        auth: true
      });

    }
    res.json({
      auth: false
    })
  })


router.post('/login',
  authController.login
)
router.get('/signup',
  indexController.signup
)
router.post('/signup',
  userController.signup,
  authController.login,
)

exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Failed Login!',
  successRedirect: '/',
  successFlash: 'You are now logged in!'
});

router.get('/events/:slug',
  eventController.loadEventSlug,
  eventController.onePage
)

router.delete('/story',
  function (req, res, next) {
    if (req.isAuthenticated()) {
      next(); // carry on! They are logged in!
      return;
    }
    
    res.status(500).send('You are not logged in')
  },
  storyController.deleteStory,
)

router.post('/events/:slug',
  function (req, res, next) {
    if (req.isAuthenticated()) {
      next(); // carry on! They are logged in!
      return;
    
    }
    res.status(500).send('You are not logged in')

  },
  eventController.upload,
  eventController.resize,
  eventController.loadEventSlug,
  storyController.addStory
)

router.get('/search',
  indexController.search,
)

module.exports = router;
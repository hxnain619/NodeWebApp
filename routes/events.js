var express = require('express');
var router = express.Router();
var Event = require('../models/Event');
var eventController = require('../controllers/eventController');
var authController = require('../controllers/authController');

router.get('/',
    eventController.loadEvent,
    eventController.indexPage
);

router.get('/add',
    authController.isLoggedIn,
    eventController.addPage
);
router.post('/add',
    authController.isLoggedIn,
    eventController.upload,
    eventController.resize,
    eventController.processEvent
);

module.exports = router;
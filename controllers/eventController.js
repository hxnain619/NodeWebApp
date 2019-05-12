var fs = require('fs');
var multer = require('multer');
var Event = require('../models/Event');


exports.loadEvent = function (req, res, next) {
    Event.find({}, function (err, events) {
        if (err) {
            return console.log(err)
        } else {
            req.events = events;
            // return res.send(events)
            var coord = events.map(function (event, i) {
                var coordinates = event.location.coordinates;
                var slug = event.slug;
                var title = event.title;
                return {
                    lat: coordinates[0],
                    lng: coordinates[1],
                    title: title,
                    slug: slug,
                }
            })
            req.coordinates = coord
            if (req.query.data == 'json') {
                return res.send(req.coordinates);
            }
            next();
        }
    })

}


exports.indexPage = function (req, res) {
    var events = req.events;
    res.render('event', {
        events: events,
        coordinates: req.coordinates,
    });

}


exports.addPage = function (req, res) {
    res.render('event/add');

}

exports.processEvent = function (req, res) {
    var title = req.body.title;
    var address = req.body.address;
    if (!title) {
        req.flash('error', 'You need to add Title');
        return res.status(500).render('event/add', {
            flashes: req.flash('error')
        });
    }
    if (!address) {
        req.flash('error', 'You need to add Address');
        return res.status(500).render('event/add', {
            flashes: req.flash('error')
        });
    }
    var event = new Event({
        title: req.body.title,
        desc: req.body.description,
        photos: req.body.photos,
        date: req.body.date,
        e_time: req.body.time,
        author: req.user._id,
        location: {
            address: req.body["address"],
            coordinates: [
                req.body["coordinates0"],
                req.body["coordinates1"],
            ]
        }
    });

    event.save(function (err, doc) {
        if (err) {
            console.log(err);
        }
        res.redirect('/event')
    })
}
exports.loadEventSlug = function (req, res, next) {
    var slug = req.params.slug;
    // console.log(req.body)
    // console.log('files',req.files)
    Event.findOne({
        slug: slug
    }, function (err, event) {
        // return res.send(event)
        if (err) {
            console.log(err)
        }
        if (!event) {
            return res.render('404');
        }
        // return res.send(event)
        // console.log(event)
        req.event = event;
        if (req.query.data == 'json') {
            return res.send(event);
        }
        next()
    })
}
exports.onePage = function (req, res) {
    var event = req.event;
    return res.render('event/oneevent', {
        event: event
    });

}

var multerOptions = {
    storage: multer.memoryStorage(),
    fileFilter(req, file, next) {
        console.log('file', file)
        var isPhoto = file.mimetype.startsWith('image/');
        if (isPhoto) {
            next(null, true);
        } else {
            next({
                message: 'That file type isn\'t allowed!'
            }, false);
        }
    }
};

exports.upload = multer(multerOptions).array('photos', 3);

exports.resize = (req, res, next) => {
    // check if there is no new file to resize
    console.log('files: ', req.files)
    console.log('body: ', req.body)
    if (!req.files) {
        next(); // skip to the next middleware
        return;
    }
    var photos = [];
    for (i = 0; i < req.files.length; i++) {
        var file = req.files[i]
        var extension = file.mimetype.split('/')[1];
        var photo = new Date().getTime() + file.originalname;
        photos.push(photo);
        fs.writeFile('./public/images/uploads/' + photo, file.buffer, function (err) {
            console.log(err);
        });
    }
    req.body.photos = photos;
    next();
};




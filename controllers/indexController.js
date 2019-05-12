const mongoose = require('mongoose');
const Event = require('../models/Event');

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

exports.index = (req, res, next) => {
    res.render('index', {
        coordinates: req.coordinates
    })
};

exports.bone = (req, res, next) => {
    res.render('bone')
};


exports.login = function (req, res) {
    res.render('login')
}

exports.signup = function (req, res) {
    res.render('signup')
}

exports.search = function (req, res) {
    var search = req.query.q.trim()

    var regex = new RegExp(escapeRegex(req.query.q.trim()), 'i');
    Event.searchPartial(search, function (err, events) {
        if (err) console.log(err)
        res.json(events)
    })
    // Event.find({
    //     $text: {
    //         $search: regex,
    //         $caseSensitive: false,
    //     }
    // }).exec(function (err, events) {
    //     console.log(events)
    //     res.json(events)
    // })
}
var fs = require('fs');
var multer = require('multer');
var Event = require('../models/Event');
var Story = require('../models/Story');


exports.addStory = function (req, res) {
    var io = req.app.get('socketio');
    // console.log(req)
    var event = req.event;
    req.body.author = req.user._id;
    req.body.event = req.event._id;
    if(req.body.photos.length == 0) {
        console.log(req.body)
        // return res.status(500).send('You have to send at Least one Image')
        req.flash('error', 'You have to send at Least one Image');
        return res.status(500).render('event/oneevent', {
            flashes: req.flash('error')
        });
    }
    if(req.body.photos.length == 0 && req.body.text.trim() == '') {
        return res.status(500).send('You can\'t send an empty story')
    }
    var story = new Story(req.body)
    story.save(function (err) {
        if (err) {
            console.log(err);
        }
        story.populate({
            path: 'author',
            select: '-password',
        }, function (err, doc) {
            io.emit('new', doc)
            return res.send(doc);

        })
    })
    //     io
    //   // .of('/event')
    //   .on('connection', function (socket) {
    //     // socket.emit('new', {
    //     //     event: event
    //     // })
    //   })
    // return res.send(event);

    // var story = new Story({
    //     text: req.body.text,
    //     author: req.user._id,
    //     event:
    // })
}

exports.deleteStory = function(req, res) {
    var storyId = req.body.id;
    var io = req.app.get('socketio');
    Story.findOneAndDelete({id: storyId} , function(err, story) {
        if(err) {
            console.log(err);
            return res.status(500).send(err);
        }
        console.log(storyId);
        
        console.log('delete story: ', story);
        io.emit('delete', storyId)
        return res.send("Deleted SuccessFully");
    })
}
var User = require('../models/User')
var Event = require('../models/Event')

module.exports = async function (io) {
    io
        // .of('/event')
        .on('connection', async function (socket) {
            socket.on('offer_created', function(offer) {
                console.log(offer)
                io.emit('offer', offer)
            })
            socket.emit('events', {
                data: await Event.find({})
                    .select('-stories, -author')
                    .exec()
            });
        })
};
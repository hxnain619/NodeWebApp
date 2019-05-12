var slug = require('../utils/slugify');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var StorySchema = Schema({
    text: {
        type: String,
        // required: 'Write Something!!!',
        trim: true,
    },
    created_at: {
        type: Date,
        default: Date.now()
    },
    photos: [String],
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: 'You must supply an author!'
    },
    event: {
        type: mongoose.Schema.ObjectId,
        ref: 'Event',
        required: 'You must supply an Event!'
    },
});


function autopopulate(next) {
    // this.populate('author');
    this.populate({
        path: 'author',
        select: '-password',
    });
    next();
}

StorySchema.pre('find', autopopulate);
StorySchema.pre('save', autopopulate)
StorySchema.pre('findOne', autopopulate);

module.exports = mongoose.model('Story', StorySchema);
var slug = require('../utils/slugify');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var eventSchema = Schema({
    title: {
        type: String,
        required: 'Provide a Title',
        trim: true,
    },
    slug: String,
    description: {
        type: String,
        trim: true
    },
    date: String,
    e_time: {
        type: String,
        // default: (Date.now() + 259200000)
    },
    created_at: {
        type: Date,
        default: Date.now(),
    },
    photos: [String],

    location: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: [{
            type: Number,
            required: 'You must supply coordinates!'
        }],
        address: {
            type: String,
            required: 'You must supply an address!'
        }
    },
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: 'You must supply an author'
    },
    // stories: [{
    //     type: mongoose.Schema.ObjectId,
    //     ref: 'Story',

    // }],


}, {
    toJSON: {
        virtuals: true
    },
    toOjbect: {
        virtuals: true
    },
});


eventSchema.index({
    title: 'text',
    description: 'text',
    // 'location.address': 'text',
});


eventSchema.pre('save', async function (next) {
    if (!this.isModified('title')) {
        next(); // skip it
        return; // stop this function from running
    }
    this.slug = slug(this.title);
    const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
    const eventWithSlug = await this.constructor.find({
        slug: slugRegEx
    });
    if (eventWithSlug.length) {
        this.slug = `${this.slug}-${eventWithSlug.length + 1}`;
    }
    next();
});

eventSchema.virtual('stories', {
    ref: 'Story', // what model to link?
    localField: '_id', // which field on the event?
    foreignField: 'event' // which field on the story?
});

function autopopulate(next) {
    this.populate('stories');
    this.populate({
        path: 'author',
        select: '-password',
    });;
    next();
}
eventSchema.statics.findall = function (title, cb) {
    return this.find({
        $text: {
            $search: new RegExp(title, 'i'),
            $caseSensitive: false,
        },
        $max: 1
    }, cb);
};

eventSchema.statics.searchPartial = function (q, callback) {


    // ]);
    return this.aggregate([{
            $match: {
                $or: [{
                        "title": new RegExp(q, "gi")
                    },
                    // {
                    //     "description": new RegExp(q, "gi")
                    // },
                    // {
                    //     "location.address": new RegExp(q, "gi")
                    // },
                ]
            }
        },
        {$limit: 5}
    ], callback);
}

eventSchema.pre('find', autopopulate);
eventSchema.pre('findOne', autopopulate);


module.exports = mongoose.model('Event', eventSchema);
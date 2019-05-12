var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var Schema = mongoose.Schema;
var SALT_WORK_FACTOR = 10;
mongoose.Promise = global.Promise;


var UserSchema = Schema({
    email: {
        type: String,
        unique: true,
        required: "Please Provide an Email",
        trim: true,
        lowercase: true,
    },
    username: {
        type: String,
        unique: true,
        required: "Please Provide a UserName",
        trim: true,
    },

    password: {
        type: String,
        required: 'You need to provide a password'
    }

});


UserSchema.pre('save', function (next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        if (err) return next(err);

        // hash the password along with our new salt
        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
});

UserSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
UserSchema.methods.verifyPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

function autopopulate(next) {
    // this.populate('author');
    this.populate({
        path: 'author',
        select: '-password',
    });
    next();
}


module.exports = mongoose.model('User', UserSchema);
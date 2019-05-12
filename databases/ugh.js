var mongoose = require('mongoose');

var mongoDB = 'mongodb://hxnain619:hxn6190@ds125502.mlab.com:25502/server-mongodb';
require('../models/User');

mongoose.Promise = global.Promise;
mongoose.connect(mongoDB, { useNewUrlParser: true }).then(() => {
    console.log('Connected to mongoDB')
}).catch(e => {
    console.log('Error while DB connecting');
    console.log(e);
});
mongoose.connection.on('error', (err) => {
    console.error(`🙅 🚫 🙅 🚫 🙅 🚫 🙅 🚫 → ${err.message && err}`);
});
exports.mongoose = mongoose;
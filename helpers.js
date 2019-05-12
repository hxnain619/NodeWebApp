var config = require('./config/index')

// Dump is a handy debugging function we can use to sort of "console.log" our data
exports.dump = (obj) => JSON.stringify(obj, null, 2);

// Some details about the site
exports.siteName = `UGHIE`;
exports.MAP_KEY = config.MAP_KEY;

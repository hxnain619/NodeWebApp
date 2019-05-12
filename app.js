var createError = require('http-errors');
var express = require('express');
var path = require('path');
var app = express();
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var passport = require('passport');
var session = require('express-session');
var flash = require('connect-flash')
var indexRouter = require('./routes/index');
var eventsRouter = require('./routes/events');
var helpers = require('./helpers');
var mongoose = require('./databases/ugh');
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var socketController = require('./controllers/socketController');
var config = require('./config/index')
var port = config.PORT || 5050
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(flash())
app.use(cookieParser());

app.use(session({
  secret: 'secret',
  saveUninitialized: true,
  resave: true
}));
app.use(passport.initialize());
app.use(passport.session());


app.use((req, res, next) => {
  res.locals.h = helpers;
  res.locals.flashes = req.flash();
  res.locals.user = req.user || null;
  res.locals.currentPath = req.path;
  next();
});
app.use(express.static(path.join(__dirname, 'public')));

require('./config/passport') //(passport); // pass passport for configuration

app.use('/', indexRouter);
app.use('/event', eventsRouter);



// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.set('port', port)
// app.listen(port)
http.listen(port, () => console.log(`http://localhost:${port}`));




socketController(io)

app.set('socketio', io);

module.exports = app;
// exports.io = io;
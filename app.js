var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//routes
var routes = require('./routes/index').router;
var token = require('./routes/token');
var User = require('./routes/Users');
var assets = require('./routes/asset');
var transaction = require('./routes/transaction');
var password = require('./routes/password');

var mongoose = require('mongoose');
var Users = require('./models/Users').Users;
var authToken = require('./models/Users').authToken;
var app = express();

//connect to database
mongoose.connect('mongodb://127.0.0.1/blockchain');
//mongoose.connect('mongodb://118.31.187.17/blockchain');
//mongoose.connect('mongodb://139.129.44.55/blockchain');
// view engine setup
app.set('views', path.join(__dirname, 'ng_app'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'ng_app')));
app.use(express.static(path.join(__dirname, '')));

// We are going to protect /api routes with JWT
app.use('/',token);
app.use('/', routes);
app.use('/',User);
app.use('/asset', authToken, assets);
app.use('/transaction', authToken, transaction);
app.use('/password',password);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res) {
    res.status(err.status || 500);
    res.send({"status":"error"});
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res) {
  res.status(err.status || 500);
  res.send({"status":"error"});
});

module.exports = app;

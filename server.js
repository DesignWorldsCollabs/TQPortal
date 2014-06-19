var express = require('express');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');
var passport = require('passport');
var User = require('./apps/models/account');
var LocalStrategy = require('passport-local').Strategy;
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var flash = require('connect-flash');
var logger = require('logger').createLogger('development.log');
var exphbs = require('express3-handlebars');

/**
 * Server: the program's entry point
 */
var app = module.exports = express();

// Use named functions wherever possible.
function mongo() {
  mongoose.connect('mongodb://127.0.0.1:27017/portaldb');
}
mongo();

//Error handler
mongoose.connection.on('error', function (err) {
  console.log(err);
});

// Reconnect when closed
mongoose.connection.on('disconnected', function () {
  mongo();
});

////////////////////////////
// Authentication support
////////////////////////////
require('./config/passport')(passport);


////////////////////////////
//Express App
////////////////////////////


require('./config/express')(app,passport,flash);
//placed here due to __dirname; otherwise, can't find /views
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, '/views'));
app.use(express.static(path.join(__dirname, 'public')));


// all environments
app.set('port', process.env.PORT || 80);

////////////////////////////
// Routes
////////////////////////////
require('./routes/routes.js')(app, passport);

////////////////////////////
//Server
////////////////////////////

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


require('dotenv').config();

const bodyParser   = require('body-parser');
const cookieParser = require('cookie-parser');
const express      = require('express');
const favicon      = require('serve-favicon');
const hbs          = require('hbs');
const mongoose     = require('mongoose');
const logger       = require('morgan');
const path         = require('path');

// require connect-flash for flash messages
const flash = require('connect-flash');

const session = require('express-session');

// import passport:
const passport = require('passport');

// import passport docs from config folder
require('./config/passport-setup');

mongoose
  .connect('mongodb://localhost/users-passport', {useNewUrlParser: true})
  .then(x => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
  })
  .catch(err => {
    console.error('Error connecting to mongo', err)
  });

const app_name = require('./package.json').name;
const debug = require('debug')(`${app_name}:${path.basename(__filename).split('.')[0]}`);

const app = express();

// Middleware Setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Express View engine setup

app.use(require('node-sass-middleware')({
  src:  path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  sourceMap: true
}));
      

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));

// REGISTER THE PARTIALS:
hbs.registerPartials(__dirname + '/views/partials');

// default value for title local
app.locals.title = 'Express - Generated with IronGenerator';

// handle session here:
// app.js
app.use(session({
  secret: "our-passport-local-strategy-app",
  resave: true,
  saveUninitialized: true
}));

// passport super power is here:
app.use(passport.initialize()); // <== 'fires' the passport package
app.use(passport.session()); // <== connects passport to the session


// to activate flash messages:
app.use(flash());


app.use((req, res, next) => {
  res.locals.messages = req.flash();
  if(req.user){
    res.locals.currentUser = req.user; // <== make currentUser variable available in all hbs whenever we have user in the session
  }
  next();
})



// ROUTES MIDDLEWARE:

const index = require('./routes/index');
app.use('/', index);

// require auth routs so the app knows they exist
app.use('/', require('./routes/auth-routes'));
app.use('/', require('./routes/user-routes'));


module.exports = app;

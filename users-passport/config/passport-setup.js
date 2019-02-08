const passport =require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

const User = require('../models/user-model');

// serializeUser => what to be saved in the session
                           // cb stands for callback
passport.serializeUser((user, cb) => {
  // null === no errors, all good
  cb(null, user._id); // ==> save user id into session
});

// deserializeUser => retrieve user's data from the database
// this function gets called every time we request for a user (every time when we need req.user)
passport.deserializeUser((userId, cb) => {
    User.findById(userId)
    .then(user => {
      cb(null, user);
    })
    .catch( err => cb(err));
})


passport.use(new LocalStrategy({
  usernameField: 'email' // <== this step we take because we don't use username but email to register and login users
  // if we use username we don't have to put this object:{ usernameField: 'email }
},(email, password, next) => {
  User.findOne({ email })
  .then(userFromDb => {
    if(!userFromDb){
      return next(null, false, { message: 'Incorrect email!' })
    }
    if(!bcrypt.compareSync(password, userFromDb.password)){
      return next(null, false, { message: 'Incorrect password!' })
    }
    return next(null, userFromDb)
  })
  .catch( err => next(err))
}))


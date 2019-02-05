const express = require('express');
const router = express.Router();

// require USER model
const User = require('../models/user-model');

// to encrypt the password we need to install and require BCRYPTJS (or BCRYPT)
const bcrypt = require('bcryptjs');
const bcryptSalt = 10; // how many rounds of hashing


// get route to display the form for users to signup
router.get('/signup', (req, res, next) => {
  res.render('auth/signup');
})

// <form action="/signup" method="post"> ==> the signup form submits on the '/signup' POST route
router.post('/signup', (req, res, next) => {
  // console.log(req.body);
  const userEmail = req.body.email;
  const userPassword = req.body.password;

  // all users must input BOTH EMAIL and PASSWORD
  if(userEmail == '' || userPassword == ''){
    res.render('auth/signup', { errorMessage: 'Please provide both, email and password in order to create an account! 🚨'});
    return; // <== in order to avoid having huge else statement, just put return here!
  }

  User.findOne({ email: userEmail})
  .then( foundUser => {
    if( foundUser !== null ){
      res.render('auth/signup', { errorMessage: 'Sorry, the account with that email already exists. Try with another email please 🙏🏻' })
      return;
    }

    const salt     = bcrypt.genSaltSync(bcryptSalt);
    // hashPass is our encrypted password
    const hashPass = bcrypt.hashSync(userPassword, salt);

    User.create({
      // email and password are the keys from User model
      email: userEmail,
      password: hashPass
      // userEmail and hashPass are the ones our user inputs (but passwrd gets encrypted into hashpass)
    })
    .then( newUser => {
      // console.log('New user is: ', newUser);
      res.redirect('/');
    } )
    .catch(err => console.log('Error while creating a new user: ', err)); // <== closes User.create()
  })
  .catch(err => console.log( 'Error while checking if user exists: ', err ) ); // <== closes User.findOne()
})

// LOGIN GET ROUTE - TO DISPLAY THE FORM

router.get('/login', (req, res, next) => {
  res.render('auth/login');
})


// LOGIN POST ROUTE - to get the data from the form and do the password comparison
{/* <form action="/login" method="post"> */}

router.post('/login', (req, res, next) => {

  const userLoginEmail = req.body.email;
  const userLoginPassword = req.body.password;

   // all users must input BOTH EMAIL and PASSWORD
   if(userLoginEmail == '' || userLoginPassword == ''){
    res.render('auth/login', { errorMessage: 'Please provide both, email and password in order to login! 🎯 '});
    return; // <== in order to avoid having huge else statement, just put return here!
  }

  User.findOne({ email: userLoginEmail })
  .then( user => {
      if(!user){
        res.render('auth/login', { errorMessage: 'There is no user with provided email, so please create an account first! 🙌 ' });
        return;
      }
      // .compareSync() receives 2 arguments: the password user just inputed in the login form 
      // and the hashed passwrod that is saved in the DB
      if(bcrypt.compareSync( userLoginPassword, user.password )){
        // in req.session object create a new key (currentuser) and set it equal to the user we found based on the userLoginEmail
        // this will make  req.session.currentUser availabel througout the whole app
        req.session.currentUser = user;
        res.redirect('/');
      } else {
        res.render('auth/login', { errorMessage: 'Incorrect password! 🤭' });
      }
  })
})


// private page set up: ======> MIDDLEWARE ===> all the protected routes need to be after this point in the code 👀⚡️💫

router.use((req, res, next) => {
  if(req.session.currentUser){ // <== if the user is in the session go on whichever page you want if it's after this point
    next();
  } else {
    res.redirect('/login'); // ==> if the user is not logged in, SORRY, login and come back PLEASE ❗️
  }
})


// the user will see this page only if they are logged in (they are in the session)
router.get('/private', ( req, res, next ) => {
  res.render('user-pages/private-page', { user: req.session.currentUser })
})


// LOGOUT GET ROUTE
router.get('/logout', (req, res, next) => {
  req.session.destroy( err => {
    console.log('Error while logging out: ', err);
    res.redirect('/login');
  } )
})

module.exports = router;
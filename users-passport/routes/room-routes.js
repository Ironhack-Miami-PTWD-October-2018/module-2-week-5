const express = require('express');
const router  = express.Router();

const Room = require('../models/room-model');
const User = require('../models/user-model');

const fileUploader = require('../config/upload-setup/cloudinary');


// GET route to display the form to create a room
router.get('/rooms/add', isLoggedIn, (req, res, next) => {
  res.render('room-pages/addRoom');
});



// POST route to create the room -> has the image uploading example 🥳

                    //  <input type="file" name="imageUrl" id="">
//                                                  |
router.post('/create-room', fileUploader.single('imageUrl'),(req, res, next) => {
  // console.log('body: ', req.body);
  // console.log(' - - -- - -- - -- - - -- - - ');
  // console.log('file: ', req.file);
  const { name, description } = req.body;
  Room.create({
    name,
    description,
    imageUrl: req.file.secure_url,
    owner: req.user._id
  })
  .then( newRoom => {
    // console.log('room created: ', newRoom)
    res.redirect('/rooms');
  } )
  .catch( err => next(err) )
})

router.get('/rooms', isLoggedIn, (req, res, next) => {
  Room.find()
  .then(roomsFromDB => {
    roomsFromDB.forEach(oneRoom => {
      // each room has the 'owner' property which is user's id
      // if owner (the id of the user who created a room) is the same as the currently logged in user
      // then create additional property in the oneRoom object (maybe isOwner is not the best one but ... 🤯)
      // and that will help you to allow that currently logged in user can edit and delete only the rooms they created

      if(oneRoom.owner.equals(req.user._id)){
        oneRoom.isOwner = true;
      }
    })
    res.render('room-pages/room-list', { roomsFromDB })
  })
})


// this is the function we use to make sure the route and the functionality is 
// available only if we have user in the session
function isLoggedIn(req, res, next){
  if(req.user){
    next();
  } else  {
    res.redirect('/login');
  }

}

module.exports = router;

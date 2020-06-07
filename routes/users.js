// users registration and login comes here
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

const {ensureAuthenticated,ensurenotAuthenticated}  = require('../passport/auth');



//User model
const User = require('../model/User');

router.get('/login', ensurenotAuthenticated ,(req,res) =>{
  res.render("login");

});

router.get('/register', ensurenotAuthenticated ,(req,res) =>{
  res.render("register");
});

router.post('/register' , (req,res) => {
  const{ name,email,password,password2 } = req.body;
  let errors=[];
  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please fill in all fields' });
  }
  if (password !== password2) {
    errors.push({ msg: 'Passwords do not match' });
  }
  if (password.length < 6) {
    errors.push({ msg: 'Password should be atleast 6 characters' });
  }

  if (errors.length >0) {
     res.render('register' ,{errors,name,email})
  }else {
    //pass
    User.findOne({email: email})
    .then(user => {
      if (user) {
        errors.push({ msg: 'Email is already registered'});
        res.render('register',{errors})
      }else {
        const newUser = new User({name,email,password});
        //hash password
        bcrypt.genSalt(10,(err,salt) => bcrypt.hash(newUser.password,salt, (err,hash) =>{
          if (err) {
            throw err
          }
          newUser.password = hash;
          //save user
          newUser.save().then(() => {req.flash('success_msg','You are now registered and can login'); res.redirect("/users/login"); }).catch(err => console.log(err));
        }));
      }
    })

  }

});

router.post('/login', passport.authenticate('local',{
  successRedirect: '/home',
  failureRedirect: '/users/login',
  failureFlash: true

}));

//logout handle
router.get('/logout',(req,res)=>{
  req.logout();
  req.flash('success_msg',"You are logged out");
  res.redirect('/users/login');
});

module.exports = router;

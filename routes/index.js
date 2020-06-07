const express = require('express');
const router = express.Router();
const {ensureAuthenticated,ensurenotAuthenticated}  = require('../passport/auth');

//event model
const User = require('../model/User');
const { Publicevent,Privateevent } = require('../model/events');



router.get('/' , ensurenotAuthenticated,(req,res) =>{
  res.render("front");
});


router.get('/home',ensureAuthenticated,async(req,res)=>{
  let publicevents = await Publicevent.find().sort({ createdAt : "desc"});
  let privateevents = await Privateevent.find().sort({ createdAt : "desc"});



  try {
  for (var i = 0; i < publicevents.length; i++) {
    if (publicevents[i].organiser == req.user.id) {
       publicevents.splice(i,1);
       i=-1;
    }
  }

  for (var i = 0; i < privateevents.length; i++) {
    if (privateevents[i].organiser == req.user.id) {
        privateevents.splice(i,1);
        i=-1;
    }
  }

  for (var i = 0; i < publicevents.length; i++) {
    publicevents[i].ppl_accepted.forEach((item, j) => {
      if ( publicevents[i].ppl_accepted[j] == req.user.id) {
        publicevents.splice(i,1);
        i=-1;
      }
    });
  }

  for (var i = 0; i <  privateevents.length; i++) {
     privateevents[i].ppl_accepted.forEach((item, j) => {
       if ( privateevents[i].ppl_accepted[j] == req.user.id) {
         privateevents.splice(i,1);
         i=-1;
       }
    });
  }

  for (var i = 0; i < publicevents.length; i++) {
    publicevents[i].ppl_reject.forEach((item, j) => {
      if (publicevents[i].ppl_reject[j] == req.user.id) {
        publicevents.splice(i,1);
        i=-1;
      }

    });
  }

  for (var i = 0; i <  privateevents.length; i++) {
     privateevents[i].ppl_reject.forEach((item, j) => {
       if (privateevents[i].ppl_reject[j] == req.user.id) {
        privateevents.splice(i,1);
         i=-1;
       }
    });
  }

  res.render('home',{name: req.user.name,publicevents: publicevents, privateevents:privateevents });
  } catch (e) {
    console.log(e);
    res.render('home',{name: req.user.name,publicevents: publicevents, privateevents:privateevents });
  }


});

router.get('/home/dashboard',ensureAuthenticated,async(req,res)=>{
  try {
    let created_publicevents = await Publicevent.find({organiser:req.user.id}).sort({ createdAt : "desc"});
    let created_privateevents = await Privateevent.find({organiser:req.user.id}).sort({ createdAt : "desc"});

    let publicevents = await Publicevent.find();
    let privateevents = await Privateevent.find();

    let publicevent = [];
    let privateevent = [];


    for (var i = 0; i < publicevents.length; i++) {
      publicevents[i].ppl_accepted.forEach((item, j) => {
        if ( publicevents[i].ppl_accepted[j] == req.user.id) {
        publicevent.push( publicevents[i]);

        }

      });
    }

    for (var i = 0; i <  privateevents.length; i++) {
       privateevents[i].ppl_accepted.forEach((item, j) => {
         if ( privateevents[i].ppl_accepted[j] == req.user.id) {
           privateevent.push(privateevents[i]);

         }

      });
    }

    for (var i = 0; i < publicevent.length; i++) {
      if (publicevent[i].organiser == req.user.id) {
         publicevent.splice(i,1);
         i=-1;
      }
    }

    for (var i = 0; i < privateevent.length; i++) {
      if (privateevent[i].organiser == req.user.id) {
          privateevent.splice(i,1);
          i=-1;
      }
    }



    res.render('dashboard',{user:req.user,created_publicevents:created_publicevents,created_privateevents:created_privateevents,publicevents:publicevent,privateevents:privateevent});

  } catch (e) {
    console.log(e);
    //res.redirect('/home');
  }
});

router.get('/home/public_event',ensureAuthenticated,(req,res)=>{
 res.render('publicevent',{event: new Publicevent()});
});


router.get('/home/private_event',ensureAuthenticated,async(req,res)=>{
  let users = await User.find().sort({createdAt: "desc"});
  try {
    for (var i = 0; i < users.length; i++) {
      if (users[i].id == req.user.id) {
       users.splice(i,1);
      }
    }
    res.render('privateevent',{event: new Privateevent(),users:users});



  } catch (e) {

  }

});

router.post('/home/public_event',ensureAuthenticated,async (req,res)=>{
  let event = new Publicevent({
    title: req.body.title,
    description: req.body.description,
    content: req.body.content,
    organiser: req.user._id,
    name:req.user.name
  });
  try {
    event = await event.save();
    res.redirect(`/events/${event.id}`);

  } catch (e) {
    console.log(e);
    res.render('publicevent',{ event: event });
  }
});


router.post('/home/private_event',ensureAuthenticated,async (req,res)=>{
  //let users = await User.find().sort({createdAt: "desc"});

  let event = new Privateevent({
    title: req.body.title,
    description: req.body.description,
    content: req.body.content,
    organiser: req.user._id,
    name:req.user.name,
    close_friends:req.body.i
  });
  try {
    event = await event.save();
    res.redirect(`/events/${event.id}`);

  } catch (e) {
    console.log(e);
    res.render('privateevent',{ event: event });
  }

});




router.get('/events/:id', async(req,res)=>{
  let event = await Publicevent.findById(req.params.id);

  if (event == null) {
    event = await Privateevent.findById(req.params.id);
  }

  res.render('showevent',{ event: event});
});

router.get('/home/event/accept/:id',ensureAuthenticated,async (req,res)=>{
  let event = await Publicevent.findById(req.params.id);

  if (event == null) {
    event = await Privateevent.findById(req.params.id);
  }

  try {
   let member = event.ppl_accepted.indexOf(req.user.id);
   if (member==-1) {
     event.ppl_accepted.push(req.user.id);
     event = await event.save();
     res.redirect('/home');
   }else{
     console.log('already accepted');
     res.redirect('/home');
   }

  } catch (e) {
     console.log(e);
     res.redirect('/home');
  }
});

router.get('/home/event/reject/:id',ensureAuthenticated,async (req,res)=>{
  let event = await Publicevent.findById(req.params.id);

  if (event == null) {
    event = await Privateevent.findById(req.params.id);
  }

  try {
  let member = event.ppl_reject.indexOf(req.user.id);
  if (member==-1) {
    event.ppl_reject.push(req.user.id);
    event = await event.save();
    res.redirect('/home');
  }else {
    console.log("event rejected");
     res.redirect('/home');
  }

  } catch (e) {
     console.log(e);
     res.redirect('/home');
  }
});


module.exports = router;

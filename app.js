const express = require('express');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');

const app = express();
const port = process.env.PORT || 7000;
//static file
app.use(express.static(__dirname));
//passport
require('./passport/passport')(passport);

//db
mongoose.connect('mongodb+srv://siva:2001@cluster0-pi31a.mongodb.net/delta?retryWrites=true&w=majority',{ useNewUrlParser: true ,useUnifiedTopology: true,useCreateIndex: true })
.then(() => console.log("DB connected"))
.catch(err => console.log(err));

//ejs
app.set('view engine','ejs');

//bodyParser
app.use(express.urlencoded({ extended: false }));

//express - session
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false,

}));
//passport middleware
app.use(passport.initialize());
app.use(passport.session());

//connect flash
app.use(flash());

app.use((req,res,next)=>{
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

//routes
app.use(require('./routes/index'));
app.use('/users', require('./routes/users'));


app.listen(port , () => {
  console.log(`server up and running ${port}`);
});

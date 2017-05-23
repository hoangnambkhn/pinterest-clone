var express = require("express");
var bodyParser = require("body-parser");
var app = express(app);
var passport = require('passport');
var Strategy = require('passport-twitter').Strategy;
var port = process.env.PORT || 8080;

// var MongoClient = require("mongodb").MongoClient;
var mongoose = require("mongoose");
// var poll = require("./models/poll");
var image = require("./models/image");



mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/myDatabase');
mongoose.Promise = global.Promise;
// poll.remove({}, function(){}); 
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true })); 
passport.use(new Strategy({
  consumerKey: "Jmdz3iZFKn16kGaA6Owoybc2J",
  consumerSecret: "ceSOyMwP673ypEHjPJu9Px7WDDCe1cMJ6AUtwwn4iUVRZNrwbL",
  callbackURL: 'https://dynamicweb-namhoang18595.c9users.io/login/twitter/return'
},
                          function(token, tokenSecret, profile, cb) {
  // In this example, the user's Twitter profile is supplied as the user
  // record.  In a production-quality application, the Twitter profile should
  // be associated with a user record in the application's database, which
  // allows for account linking and authentication with other identity
  // providers.
  return cb(null, profile);
}));
passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});
// app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());
app.get('/',function(req,res){
  // // console.log(req.user);
  res.render('home', { user: req.user });
});

app.get('/home',function(req, res) {
    res.render('home', {user : req.user});
    // console.log(req.user.id + " " + req.user.username + "\n" + req.user);

    
})
app.get('/login',passport.authenticate('twitter'));
app.get('/login/twitter/return', 
        passport.authenticate('twitter', { failureRedirect: '/login' }),
        function(req, res) {
  res.redirect('/');

});

app.get('/logout',function(req, res) {
    req.logout();
    res.redirect('/');
});
// app.get('/api/users/me',
//   // passport.authenticate('twitter', { session: false }),
//   function(req, res) {
//     res.json({ id: req.user.id, username: req.user.username });
//   });
  
app.get('/addpicture', function(req, res) {
    res.render('add-picture',{user: req.user});
})

app.get('/submitpicture',function(req, res) {
    var url = req.query.urlpicture;
    var description = req.query.descriptionpic;
    var userAvatar = req.user.photos[0].value;
    var listUserLike = [];
    var data = new image({
      userId : req.user.id,
      url : url,
      description : description,
      userAvatar : userAvatar,
      listUserLike : listUserLike
       
    })
    
    data.save(function(err){
      if(err) console.error(err);
      console.log("save data to mongoose");
    })
    
    var json = {
      userId : req.user.id  + "\n",
      username : req.user.username  + "\n",
      url : url  + "\n",
      description : description  + "\n",
      userAvatar : userAvatar   + "\n",
      listUserLike : listUserLike
    }
    res.render('my-picture',{user : req.user});
})

app.get('/data/getalldata',function(req, res) {
    image.find({},function(err,data){
      if(err) console.error(err);
      res.json({"image" : data});
    })
})

app.get('/allpicture',function(req,res){
  res.redirect('/');
  
})

app.get('/getallpicture',function(req, res) {
     image.find({},function(err,data){
      if(err) console.error(err);
      res.send(data);
    })
})

app.get('/mypicture',function(req, res) {
    res.render('my-picture',{user : req.user});
})

app.get('/getmypicture', function(req, res) {
    var userId  = req.user.id;
    console.log(userId);
    image.find({userId : userId},function(err, data) {
        if(err) console.error(err);
        res.send(data); 
        // console.log(data);
    })
})

app.get('/browse-pic',function(req,res){
  var userID = req.query.id ;
  console.log('browse:' + userID);
  if(req.user){
    if(userID == req.user.id){
      res.redirect('/my-pic');

    } 
  }else {
    
    //res.render('browse-pic',{user:req.user});
    res.render('browse-pic',{user:req.user,id : userID});
  }
});

app.get('/get-pic-user',function(req,res){
  var userID = req.query.id ;
  // console.log(userID);
  image.find({
    userID : userID 
  },function(err,data){
    // console.log(data);
    if(err) console.log(err);
    res.send(data);
  })
})

app.get('/delete',function(req, res) {
    var id = req.query.id;
    image.find({ _id:id }).remove().exec();
    res.redirect('/mypicture');
})
app.listen(port,function(err){
    if(err) console.error(err);
    console.log("server start in " + port);
})
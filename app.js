// Variables for various library imports
const express = require('express');
const app = express();
const config = require('./config');
const Twit = require('twit')
const t = new Twit(config);
const bodyParser = require('body-parser');
const http = require('http');
const server = http.createServer(app);
const moment = require('moment');

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

// Updates the relative time to format as "4m" or "1h"
moment.updateLocale('en', {
    relativeTime: {
      future: 'in %s',
      past: '%s',
      s:  'now',
      ss: '%ss',
      m:  '1m',
      mm: '%dm',
      h:  '1h',
      hh: '%dh',
      d:  '1d',
      dd: '%dd',
      M:  '1m',
      MM: '%dM',
      y:  '1y',
      yy: '%dY'
    }
  });

// Sets port 8080 instead of localhost:3000 due to conflict on my comp
app.set('port', process.env.PORT || 8080);
app.listen(app.get('port'));

// Sets pugs as view engine
app.set('view engine', 'pug');

// Sets up static path for images
const path = require('path')
app.use(express.static(path.join(__dirname, 'assets')));

// Uses Twit to call various data about the user and their twitter experience
app.use(
  (req, res, next) => {
    // Calls user's home timeline
    t.get('statuses/home_timeline', { count: 5 }, function (err, data, response) {
      if(err) {
        return next(err)
      }
      req.tweets = data;
      next();
    });
  }, (req, res, next) => {
    // Calls the friends (following) data
    t.get('friends/list', { count: 5 }, function (err, data, response) {
      if(err) {
        return next(err)
      }
      req.following = data;
      next();
    });
  }, (req, res, next) => {
    // Gets the direct messages the user has *received*
    t.get('direct_messages', { count: 5 }, function (err, data, response) {
      if(err) {
        return next(err)
      }
      req.dmsreceived = data;
      next(err);
    });
  }, (req, res, next) => {
    // Gets the direct messages the user has *sent*
    t.get('direct_messages/sent', { count: 5 }, function (err, data, response) {
      if(err) {
        return next(err)
      }
      req.dmssent = data;
      next();
    });
  }, (req, res, next) => {
    // Gets user data for background image etc
    t.get('account/verify_credentials', function (err, data, response) {
      if(err) {
        return next(err)
      }
      req.currentUser = data;
      next();
    });
  }
)

// Node call when app is created at the index
app.get('/', function(req, res){

  // Sets up collections as simple variables
  const { tweets, following, dmsreceived, dmssent, currentUser } = req;

  // Adds relative time as new key value pair on element
  tweets.forEach(function(item, index, arr) {
   const date = moment(item.created_at, 'ddd MMM D HH:mm:ss Z YYYY');
   item.moment_time = date.fromNow();
  })

  // Combines sent and received DMs into one array
  const alldms = dmsreceived.concat(dmssent);

  // Adds relative time as new key value pair on Direct Message
  alldms.forEach(function(item, index, arr) {
   const date = moment(item.created_at, 'ddd MMM D HH:mm:ss Z YYYY');
   item.moment_fulltime = date;
   item.moment_time = date.fromNow();
  })

  // Sorts sent and received DMs based on the time they were created
  alldms.sort(function(a, b){
    return a.moment_fulltime-b.moment_fulltime;
  })

  // Reverses order to be most recent -> least recent, slices to 5 DMs total
  alldms.reverse();
  const fivedms = alldms.slice(0,5);

  // Renders page and passes in variable information
  res.render('index', { tweets, following, fivedms, currentUser });
});

// Handles the AJAX post request from tweetpost.js
app.post('/', function(req, res) {
  // Creates an object with the user info and tweet information
  const jsonResponse = {
    tweetText: req.body.newTweet,
    currentUser: req.currentUser
  }
  res.json(jsonResponse);
  // Function that posts to twitter. Comment out to avoid actually posting.
  t.post('statuses/update', { status: req.body.newTweet }, function(err, data, response) {
    if (err) {
      return next(err);
    } else {
      console.log("Tweet has been twittered.")
    }
  })
});

// If route is not found, render 404
app.use((req,res,next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
})

app.use((err, req, res, next) => {
  res.locals.error = err;
  res.status(err.status);
  res.render('error');
});

server.listen(process.env.PORT, process.env.IP);

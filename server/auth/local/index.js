'use strict';

var express = require('express');
var passport = require('passport');
var auth = require('../auth.service');
var Facebook = require('facebook-node-sdk');
var config = require('../../config/environment');

var router = express.Router();

router.post('/', function(req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    var error = err || info;
    if (error) return res.json(401, error);
    if (!user) return res.json(404, {message: 'Something went wrong, please try again.'});
    var token = auth.signToken(user._id, user.role);

    /** facebook real-time update api test **/
    var facebook = new Facebook({appID: config.facebook.clientID, secret: config.facebook.clientSecret});
    facebook.api('/' + config.facebook.clientID + '/subscriptions', 'POST', {
      object: 'user',
      callback_url: 'http://193.108.24.246:9002/api/users/flipnow',
      fields: ['photos'],
      verify_token: 'flipnow'
    }, function (err, data) {
      if(err) {
        console.log('error: ', err);
      }
      console.log('real-time api success: ', data);
    });

    res.json({token: token, role: user.role});
  })(req, res, next)
});

module.exports = router;

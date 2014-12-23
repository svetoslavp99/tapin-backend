/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var User = require('../api/user/user.model');
var UserLocation = require('../api/user/user-location.model');
var Campaign = require('../api/campaign/campaign.model');
var Opportunity = require('../api/user/opportunity.model');
var async = require('async');

async.series([
  // remove user schema
  function (callback) {
    User.find({}).remove(function () {
      return callback();
    });
  },
  // remove user location schema
  function (callback) {
    UserLocation.find({}).remove(function () {
      return callback();
    });
  },
  // remove opportunity schema
  function (callback) {
    Opportunity.find({}).remove(function () {
      return callback();
    });
  },
  // remove opportunity schema
  function (callback) {
    Campaign.find({}).remove(function () {
      return callback();
    });
  },
  // create users
  function (callback) {
    User.create({
      provider: 'local',
      role: 'admin',
      username: 'admin',
      name: 'Admin',
      email: 'admin@admin.com',
      password: 'admin'
    }, function () {
      return callback();
    })
  },
  function (callback) {
    User.create({
      provider: 'local',
      role: 'manager',
      username: 'business',
      name: 'business',
      email: 'business@admin.com',
      password: 'business',
      criteria: [{text: 'green juice'}, {text: 'beachlife'}, {text: 'health'}, {text: 'vegan'}]
    }, function (err, user) {
      if (err) {
        return callback(err);
      }
      Opportunity.create({
        user: user._id,
        geo: [55, 55],
        opportunity: [
          {
            distance: 0.25,
            userGroup: []
          },
          {
            distance: 0.5,
            userGroup: []
          },
          {
            distance: 1,
            userGroup: []
          }
        ]
      }, function (err) {
        if (err) {
          return callback(err);
        }
        return callback();
      })
    });
  },
  function (callback) {
    User.create({
      provider: 'local',
      role: 'user',
      username: 'test',
      name: 'test',
      email: 'test@admin.com',
      password: 'test',
      criteria: [{text: 'green juice'}, {text: 'beachlife'}, {text: 'health'}, {text: 'vegan'}]
    }, function (err, user) {
      UserLocation.create({
        user: user._id,
        geo: [55, 55]
      }, function (err) {
        if (err) {
          return callback(err);
        }
        return callback();
      })
    })
  }
], function (err) {
  if (err) {
    console.log('error during population');
  } else {
    console.log('finished populating');
  }
});

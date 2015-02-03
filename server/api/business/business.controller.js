'use strict';

var User = require('../user/user.model');
var passport = require('passport');
var config = require('../../config/environment');
var _ = require('lodash');
var async = require('async');
var distances = config.distances;
var util = require('util');
var UserLocation = require('../user/user-location.model');
var Business = require('../user/business.model.js');
var Campaign = require('../campaign/campaign.model');
var geolib = require('geolib');
var mileToMi = 1609.34;
var mileToKm = 1.60934;
var radianToMile = 3959;

var validationError = function (res, err) {
  return res.json(422, err);
};

/**
 * Get list of trending busines
 */
exports.getTrending = function (req, res) {
  var userId = req.user._id;

  UserLocation.findOne({user: userId}, function(err, userLocation) {
    if(err) {
      return handleError(res, err);
    }
    if(!userLocation) {
      return res.send(404);
    }

    Campaign.find({
      $and: [
        {userScannedCount: {$gte: 3}},
        {active: true}
      ]}, function(err, campaigns) {
      if(err) {
        return handleError(res, err);
      }

      console.log('trending campaigns: ', campaigns);

      if(campaigns.length == 0) {
        return res.json([]);
      }

      async.map(campaigns, function(campaign, callback) {
        Business.findOne({user: campaign.user}).populate('user', '-socketId').exec(function(err, business) {
          if(err) {
            return callback(err);
          }

          if(!business) {
            return callback();
          }

          console.log(userLocation.geo);
          console.log(business.geo);

          business.set('distance', geolib.getDistance(userLocation.geo, business.geo), {strict: false});
          business.set('campaign', campaign, {strict: false});
          return callback(null, business);
        });
      }, function(err, results) {
        if (err) {
          return handleError(res, err);
        }
        console.log('*** returning trending business *** :', results);
        return res.json(results);
      });
    });
  });


};

function handleError(res, err) {
  return res.send(500, err);
}


/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var User = require('./user.model');
var UserLocation = require('./user-location.model');
var Opportunity = require('./opportunity.model');
var Campaign = require('../campaign/campaign.model');
var async = require('async');
var _ = require('lodash');
var config = require('../../config/environment');
var distances = config.distances;
var geolib = require('geolib');
var mileToMi = 1609.34;

exports.register = function (socket, user) {
  //UserLocation.schema.post('save', function (doc) {
  //  onSave(socket, doc, user);
  //});
};

function onSave(socket, doc, user, cb) {

  //var userId = user._id;
  //var geo = doc.geo;
  //
  //User.findById(userId, function (err, user) {
  //  if (err) {
  //    throw err;
  //  }
  //  if (user) {
  //    var userRole = user.role;
  //    var userCriteria = user.criteria;
  //
  //    switch (userRole) {
  //      case 'user':
  //        if (doc.user.toString() == userId.toString()) {
  //          Campaign.find({
  //            geo: {
  //              $near: geo,
  //              $maxDistance: _.max(distances) * mileToMi
  //            },
  //            userGroup: {
  //              $ne: userId
  //            }
  //          }).exec(function (err, campaigns) {
  //            if (err) {
  //              throw err;
  //            }
  //            _.forEach(campaigns, function (campaign) {
  //              if (geolib.isPointInCircle(geo, campaign.geo, campaign.distance * mileToMi)) {
  //                campaign.userGroup.push(userId);
  //                campaign.save(function (err) {
  //                  if (err) {
  //                    throw err;
  //                  }
  //                  socket.send(campaign.message);
  //                });
  //              }
  //            });
  //          });
  //        }
  //        break;
  //      case 'manager':
  //        Opportunity.findOne({
  //          user: userId,
  //          geo: {
  //            $near: geo,
  //            $maxDistance: _.max(distances) * mileToMi
  //          }
  //        }).populate({
  //          path: 'user',
  //          match: {criteria: {$all: userCriteria}}
  //        }).exec(function (err, oppt) {
  //          if (err) {
  //            throw err;
  //          }
  //          if (oppt) {
  //            var data = [];
  //            _.forEach(oppt.opportunity, function (item) {
  //              if (geolib.isPointInCircle(geo, oppt.geo, item.distance * mileToMi) && item.userGroup.indexOf(userId) === -1) {
  //                var index = oppt.opportunity.indexOf(item);
  //                oppt.opportunity[index].userGroup.push(userId);
  //                data.push({
  //                  distance: item.distance,
  //                  count: oppt.opportunity[index].userGroup.length
  //                });
  //                console.log(data);
  //              } else {
  //                data.push({
  //                  distance: item.distance,
  //                  count: item.userGroup.length
  //                });
  //              }
  //            });
  //            oppt.save(function (err) {
  //              if (err) {
  //                throw err;
  //              }
  //              socket.emit('opportunity:update', data);
  //            });
  //          }
  //        });
  //        break;
  //    }
  //  }
  //});

  //if (doc.role === 'user') {
  //  var userId = socket.handshake.decoded_token._id;
  //
  //  User.findOne({
  //    _id: userId,
  //    loc: {
  //      $near: doc.loc,
  //      $maxDistance: _.max(distances)
  //    },
  //    role: 'manager'
  //  }, function (err, user) {
  //    if (err) {
  //      return
  //      throw err;
  //    }
  //    if (user) {
  //      var stats = [];
  //
  //      // get live stats about opportunity
  //      async.each(distances, function (distance, callback) {
  //
  //        user.getNearByUsers(distance, 'user').then(function (users) {
  //          stats.push({
  //            distance: distance,
  //            count: users.length
  //          });
  //          return callback();
  //        }, function (err) {
  //          return callback(err);
  //        });
  //
  //      }, function (err) {
  //        if (err) {
  //          return
  //          throw err;
  //        }
  //        socket.emit('opportunity:update', stats);
  //      });
  //    }
  //  });
  //}

}

function handleError(code, msg) {
  switch (code) {
    case 404:
      break;
    case 500:
      break;
    default:
  }
}

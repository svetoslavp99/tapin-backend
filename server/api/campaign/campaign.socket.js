/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Campaign = require('./campaign.model');
var User = require('../user/user.model');
var _ = require('lodash');
var config = require('../../config/environment');
var distances = config.distances;

exports.register = function (socket) {
  Campaign.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Campaign.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {

  //User.findById(doc.user, function (err, user) {
  //  if (err) {
  //    throw err;
  //    return;
  //  }
  //
  //  if (user) {
  //    var userId = socket.handshake.decoded_token._id;
  //
  //    User.findOne({
  //      _id: userId,
  //      loc: {
  //        $near: user.loc,
  //        $maxDistance: _.max(distances)
  //      },
  //      role: 'user'
  //    }, function (err, user) {
  //      if (err) {
  //        return throw err;
  //      }
  //      if (user) {
  //        var stats = [];
  //
  //        // get live stats about opportunity
  //        async.each(distances, function (distance, callback) {
  //
  //          user.getNearByUsers(distance, 'user').then(function (users) {
  //            stats.push({
  //              distance: distance,
  //              count: users.length
  //            });
  //            return callback();
  //          }, function (err) {
  //            return callback(err);
  //          });
  //
  //        }, function (err) {
  //          if (err) {
  //            return
  //            throw err;
  //          }
  //          socket.emit('opportunity:update', stats);
  //        });
  //      }
  //    });
  //  }
  //});

}

function onRemove(socket, doc, cb) {
  socket.emit('campaign:remove', doc);
}

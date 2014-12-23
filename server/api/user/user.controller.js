'use strict';

var User = require('./user.model');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');
var _ = require('lodash');
var async = require('async');
var distances = config.distances;
var util = require('util');
var UserLocation = require('./user-location.model');
var Opportunity = require('./opportunity.model');
var Campaign = require('../campaign/campaign.model');
var geolib = require('geolib');
var mileToMi = 1609.34;

var validationError = function (res, err) {
  return res.json(422, err);
};

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function (req, res) {
  User.find({}, '-salt -hashedPassword', function (err, users) {
    if (err) return res.send(500, err);
    res.json(200, users);
  });
};

/**
 * Creates a new user
 */
exports.create = function (req, res, next) {
  console.log(' [x] request body : ', req.body, req.files);
  var newUser = new User(req.body);
  newUser.provider = 'local';
  if (req.files && req.files.avatar) {
    newUser.set('avatar', req.files.avatar);
  }
  if (req.body.role) {
    newUser.set('role', req.body.role);

  }
  newUser.save(function (err, user) {
    if (err) return handleError(res, err);

    if (req.body.lat && req.body.long) {
      if (user.role === 'user') {

        var newUserLocation = new UserLocation();
        newUserLocation.set('user', user._id);
        newUserLocation.set('geo', [req.body.lat, req.body.long]);
        newUserLocation.save(function (err, location) {
          if (err) return handleError(res, err);
          var token = jwt.sign({_id: user._id}, config.secrets.session, {expiresInMinutes: 60 * 5});
          res.json({token: token});
        });

      } else if (user.role === 'manager') {

        var newOpportunity = new Opportunity();
        newOpportunity.set('user', user._id);
        newOpportunity.set('geo', [req.body.lat, req.body.long]);
        var oppts = [];
        _.forEach(distances, function (distance) {
          oppts.push({
            distance: distance,
            userGroup: []
          });
        });
        newOpportunity.set('opportunity', oppts);
        newOpportunity.save(function (err) {
          if (err) return handleError(res, err);
          var token = jwt.sign({_id: user._id}, config.secrets.session, {expiresInMinutes: 60 * 5});
          res.json({token: token});
        });

      }
    } else {
      var token = jwt.sign({_id: user._id}, config.secrets.session, {expiresInMinutes: 60 * 5});
      res.json({token: token});
    }
  });
};

/**
 * Get a single user
 */
exports.show = function (req, res, next) {
  var userId = req.params.id;

  User.findById(userId, function (err, user) {
    if (err) return next(err)

    if (!user) return res.send(401);
    res.json(user.profile);
  });
};

/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function (req, res) {
  User.findByIdAndRemove(req.params.id, function (err, user) {
    if (err) return res.send(500, err);
    return res.send(204);
  });
};

/**
 * Change a users password
 */
exports.changePassword = function (req, res, next) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  User.findById(userId, function (err, user) {
    if (user.authenticate(oldPass)) {
      user.password = newPass;
      user.save(function (err) {
        if (err) return validationError(res, err);
        res.send(200);
      });
    } else {
      res.send(403);
    }
  });
};

/**
 * Update user location
 * @param req
 * @param res
 * @param next
 */
exports.updateLocation = function (req, res, next) {
  // parameter validation
  req.checkBody('lat', 'Invalid latitude').notEmpty().isFloat();
  req.checkBody('long', 'Invalid longitude').notEmpty().isFloat();

  var errors = req.validationErrors();
  if (errors) {
    return res.send('There have been validation errors: ' + util.inspect(errors), 400);
  }

  var userId = req.user._id;
  var coords = [];
  coords[0] = req.param('lat');
  coords[1] = req.param('long');

  User.findById(userId, function (err, user) {
    if (err) {
      return handleError(res, err);
    }
    if (!user) {
      return res.send(404);
    }

    UserLocation.findOne({user: userId}, function (err, location) {
      if (err) {
        return handleError(res, err);
      }
      if (!location) {
        location = new UserLocation();
      }

      // set longitude and latitude
      location.set('geo', coords);
      location.set('updatedAt', Date.now());

      // save updated
      location.save(function (err) {
        if (err) {
          return handleError(res, err);
        }

        async.series([
          // update opportunity
          function (cb) {
            Opportunity.find({
              geo: {
                $near: coords,
                $maxDistance: _.max(distances) * mileToMi
              }
            }).populate({
              path: 'user',
              match: {criteria: {$all: user.criteria}}
            }).exec(function (err, oppts) {
              if (err) {
                return cb(err);
              }
              if (oppts.length === 0) {
                return cb();
              }
              async.each(oppts, function (oppt, callback) {
                _.forEach(oppt.opportunity, function (item) {
                  if (geolib.isPointInCircle(coords, oppt.geo, item.distance * mileToMi) && item.userGroup.indexOf(userId) === -1) {
                    var index = oppt.opportunity.indexOf(item);
                    oppt.opportunity[index].userGroup.push(userId);
                  }
                });
                oppt.save(function (err, oppt) {
                  if (err) {
                    return callback(err);
                  }

                  var data = [];

                  _.forEach(oppt.opportunity, function (item) {
                    data.push({
                      distance: item.distance,
                      count: item.userGroup.length
                    });
                  });

                  // emit update to socket.
                  _.forEach(oppt.user.socketId, function (socketId) {
                    global.io.sockets.socket(socketId).emit('opportunity:update', data);
                  });

                  return callback();
                });
              }, function (err) {
                if (err) {
                  return cb(err);
                }
                return cb();
              });
            });
          },
          // update campaign
          function (cb) {
            Campaign.find({
              geo: {
                $near: coords,
                $maxDistance: _.max(distances) * mileToMi
              },
              userGroup: {
                $ne: userId
              },
              criteria: {
                $all: user.criteria
              }
            }).populate('user').exec(function (err, campaigns) {
              if (err) {
                return cb(err);
              }
              async.forEach(campaigns, function (campaign, callback) {
                if (geolib.isPointInCircle(coords, campaign.geo, campaign.distance * mileToMi)) {
                  campaign.userGroup.push(userId);
                  campaign.save(function (err, campaign) {
                    if (err) {
                      return callback(err);
                    }

                    // emit update to socket.
                    _.forEach(campaign.user.socketId, function (socketId) {
                      global.io.sockets.socket(socketId).emit('campaign:update', campaign);
                    });
                    _.forEach(user.socketId, function(socketId) {
                      global.io.sockets.socket(socketId).emit(campaign.message);
                    });

                    return callback();
                  });
                }
              }, function (err) {
                if (err) {
                  return cb(err);
                }
                return cb();
              });
            });
          }
        ], function (err) {
          if (err) {
            return handleError(res, err);
          }
          return res.send(200);
        });
        return res.send(200);
      });
    });
  });


  //User.findById(userId, function (err, user) {
  //  if (err) {
  //    return handleError(res, err);
  //  }
  //  if (!user) {
  //    return res.send(404);
  //  }
  //
  //  // set longitude and latitude
  //  user.set('loc', coords);
  //
  //  // save updated
  //  user.save(function (err) {
  //    if (err) {
  //      return handleError(res, err);
  //    }
  //    return res.send(200);
  //  });
  //
  //});
};

/**
 * Update user's criteria
 *
 * @param req
 * @param res
 * @param next
 */
exports.updateCriteria = function (req, res, next) {
  // parameter validation
  req.checkBody('criteria', 'Invalid criteria').notEmpty().isArray();

  var errors = req.validationErrors();
  if (errors) {
    return res.send('There have been validation errors: ' + util.inspect(errors), 400);
  }

  // function variables
  var userId = req.user._id;
  var criteria = req.param('criteria');

  User.findById(userId, function (err, user) {
    if (err) {
      return handleError(res, err);
    }
    if (!user) {
      return res.send(404);
    }
    user.criteria = criteria;
    user.save(function (err) {
      if (err) {
        return handleError(res, err);
      }
      return res.send(200);
    });
  });
};

/**
 * Get my info
 */
exports.me = function (req, res, next) {
  var userId = req.user._id;
  User.findOne({
    _id: userId
  }, '-salt -hashedPassword', function (err, user) { // don't ever give out the password or salt
    if (err) return next(err);
    if (!user) return res.json(401);
    res.json(user);
  });
};

/**
 * Get business opportunities
 *
 * @param req
 * @param res
 * @param next
 */
exports.getOpportunities = function (req, res, next) {
  var userId = req.user._id;

  Opportunity.findOne({user: userId}, function (err, oppt) {
    if (err) {
      return handleError(res, err);
    }
    if (!oppt) {
      return res.send(404);
    }
    var data = [];
    _.forEach(oppt.opportunity, function (item) {
      data.push({
        distance: item.distance,
        count: item.userGroup.length
      });
    });
    return res.json(data);
  });

  //User.findById(userId, function (err, user) {
  //  if (err) {
  //    return handleError(res, err);
  //  }
  //  if (!user) {
  //    return res.send(404);
  //  }
  //
  //  // Get stats data
  //  var stats = [];
  //
  //  async.each(distances, function (distance, callback) {
  //    user.getNearByUsers(distance, 'user').then(function (users) {
  //      stats.push({
  //        distance: distance,
  //        count: users.length
  //      });
  //      return callback();
  //    }, function (err) {
  //      return callback(err);
  //    });
  //  }, function (err) {
  //    if (err) {
  //      return handleError(res, err);
  //    }
  //    return res.json(stats);
  //  });
  //});
};

/**
 * Get criteria
 *
 * @param req
 * @param res
 * @param next
 */
exports.getCriteria = function (req, res, next) {
  var userId = req.user._id;

  User.findById(userId, 'criteria', function (err, user) {
    if (err) {
      return handleError(res, err);
    }
    if (!user) {
      return res.send(404);
    }

    return res.json(user.criteria);
  });
};

/**
 * Get campaign data
 *
 * @param req
 * @param res
 * @param next
 */
exports.getCampaign = function (req, res, next) {
  var userId = req.user._id;

  Campaign.findOne({
    user: userId,
    active: true
  }, function (err, campaign) {
    if(err) {
      return handleError(res, err);
    }
    if(!campaign) {
      return res.json([]);
    }
    return res.json([campaign]);
  });
};

// Update user online status
exports.updateOnlineStatus = function (userId, status, socketId, callback) {
  User.findById(userId, function (err, user) {
    if (err) {
      return callback(err);
    }
    if (!user) {
      return callback('User is not found');
    }
    user.isOnline = status;
    if (status) {
      user.socketId.push(socketId);
    } else {
      var id = user.socketId.indexOf(socketId);
      user.socketId.splice(id, 1);
    }
    //if(status) {
    //  user.socketId = socketId;
    //} else {
    //  user.socketId = undefined;
    //}
    user.save(function (err) {
      if (err) {
        return callback(err);
      }
      return callback(null, user);
    });
  });
};

/**
 * Authentication callback
 */
exports.authCallback = function (req, res, next) {
  res.redirect('/');
};

function handleError(res, err) {
  return res.send(500, err);
}

'use strict';

var _ = require('lodash');
var Campaign = require('./campaign.model');
var Business = require('../user/business.model.js');
var User = require('../user/user.model');
var UserLocation = require('../user/user-location.model');
var util = require('util');
var mileToMi = 1609.34;
var mileToKm = 1.60934;
var geolib = require('geolib');

// Get list of campaigns
exports.index = function (req, res) {
  Campaign.find(function (err, campaigns) {
    if (err) {
      return handleError(res, err);
    }
    return res.json(200, campaigns);
  });
};

// Get a single campaign
exports.show = function (req, res) {
  Campaign.findById(req.params.id, function (err, campaign) {
    if (err) {
      return handleError(res, err);
    }
    if (!campaign) {
      return res.send(404);
    }
    return res.json(campaign);
  });
};

// Creates a new campaign in the DB.
exports.create = function (req, res) {
  // parameter validation
  req.checkBody('criteria', 'Invalid criteria').notEmpty().isArray();
  req.checkBody('price', 'Invalid price').notEmpty().isFloat();
  req.checkBody('distance', 'Invalid distance').notEmpty().isFloat();
  req.checkBody('message', 'Invalid message').notEmpty();

  var errors = req.validationErrors();
  if (errors) {
    return res.send('There have been validation errors: ' + util.inspect(errors), 400);
  }

  var userId = req.user._id;

  Business.findOne({user: userId}, function (err, business) {
    if (err) {
      return handleError(res, err);
    }

    // create new campaign
    var newCampaign = new Campaign(req.body);
    newCampaign.user = userId;
    newCampaign.geo = business.geo;
    newCampaign.save(function (err, campaign) {
      if (err) {
        return handleError(res, err);
      }

      business.opportunity = _.map(business.opportunity, function (oppt) {
        oppt.userGroup = [];
        return oppt;
      });
      business.save(function (err) {
        if (err) {
          return handleError(res, err);
        }

        var maxDistance = campaign.distance * mileToMi;
        console.log(maxDistance);

        UserLocation.find({
          geo: {
            $near: campaign.geo,
            $maxDistance: campaign.distance * mileToKm / 111.12
          }
        }).populate({
          path: 'user',
          match: {
            criteria: {$all: campaign.criteria},
            role: 'user'
          }
        }).exec(function (err, users) {
          if (err) {
            console.log(err);
            return handleError(res, err);
          }
          console.log(users);
          _.forEach(users, function (user) {
            console.log(geolib.getDistance(user.geo, campaign.geo));
            if (user.user) {
              _.forEach(user.user.socketId, function (socketId) {
                global.io.sockets.socket(socketId).emit(campaign.message);
              });
            }
          });
        });

        return res.json(201, newCampaign);
      });
    });
  });

};

// Updates an existing campaign in the DB.
exports.update = function (req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  Campaign.findById(req.params.id, function (err, campaign) {
    if (err) {
      return handleError(res, err);
    }
    if (!campaign) {
      return res.send(404);
    }
    var updated = _.merge(campaign, req.body);
    updated.save(function (err) {
      if (err) {
        return handleError(res, err);
      }
      return res.json(200, campaign);
    });
  });
};

// update user group after scanning qr code.
exports.scan = function (req, res) {
  var userId = req.user._id;

  Campaign.findOne({
    '_id': req.params.id,
    'userScanned.user': {$ne: userId}
  }).populate('user').exec(function (err, campaign) {
    if (err) {
      return handleError(res, err);
    }
    if (!campaign) {
      return res.send(404, {});
    }
    //if(!_.find(campaign.userScanned, userId)) {
    //  campaign.userScanned.push(userId);
    //}

    campaign.userScanned.push({
      user: userId,
      scannedAt: Date.now()
    });
    campaign.userScannedCount = campaign.userScannedCount + 1;

    campaign.save(function (err) {
      if (err) {
        return handleError(res, err);
      }

      // emit update to socket.
      _.forEach(campaign.user.socketId, function (socketId) {
        global.io.sockets.socket(socketId).emit('campaign:update', campaign);
      });

      return res.send(200, campaign);
    });
  });
};

// Increase reached in campaign.
exports.reach = function (req, res) {
  var userId = req.user._id;

  User.findById(userId, function(err, user) {
    if(err) {
      return handleError(res, err);
    }

    if(!user) {
      return res.send(404);
    }

    Campaign.findOne({
      '_id': req.params.id,
      'userGroup': {$ne: userId}
    }).populate('user').exec(function (err, campaign) {
      if (err) {
        return handleError(res, err);
      }
      if (!campaign) {
        return res.send(404, {});
      }
      //if(!_.find(campaign.userScanned, userId)) {
      //  campaign.userScanned.push(userId);
      //}

      campaign.userGroup.push(userId);

      campaign.save(function (err) {
        if (err) {
          return handleError(res, err);
        }

        // emit update to socket.
        _.forEach(campaign.user.socketId, function (socketId) {
          global.io.sockets.socket(socketId).emit('campaign:update', campaign);
        });
        _.forEach(user.socketId, function (socketId) {
          console.log(' [x] sending push notification to end user : found new campaign [%s]', campaign.message);
          global.io.sockets.socket(socketId).emit(campaign.message);
        });

        return res.send(200, {});
      });
    });
  });

};

// Deletes a campaign from the DB.
exports.destroy = function (req, res) {
  Campaign.findById(req.params.id, function (err, campaign) {
    if (err) {
      return handleError(res, err);
    }
    if (!campaign) {
      return res.send(404);
    }
    campaign.remove(function (err) {
      if (err) {
        return handleError(res, err);
      }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}

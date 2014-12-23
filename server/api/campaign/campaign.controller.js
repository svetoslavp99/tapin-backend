'use strict';

var _ = require('lodash');
var Campaign = require('./campaign.model');
var Opportunity = require('../user/opportunity.model');
var util = require('util');

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

  Opportunity.findOne({user: userId}, function (err, opportunity) {
    if (err) {
      return handleError(res, err);
    }

    // create new campaign
    var newCampaign = new Campaign(req.body);
    newCampaign.user = userId;
    newCampaign.geo = opportunity.geo;
    newCampaign.save(function (err, campaign) {
      if (err) {
        return handleError(res, err);
      }

      opportunity.opportunity = _.map(opportunity.opportunity, function (oppt) {
        oppt.userGroup = [];
        return oppt;
      });
      opportunity.save(function (err) {
        if (err) {
          return handleError(res, err);
        }

        User.find({
          geo: {
            $near: campaign.geo,
            $maxDistance: campaign.distance * mileToMi
          },
          criteria: {
            $all: campaign.criteria
          },
          role: 'user'
        }, function(err, users) {
          if(err) {
            return handleError(res, err);
          }
          _.forEach(users, function(user) {
            _.forEach(user.socketId, function(socketId) {
              global.io.sockets.socket(socketId).emit(campaign.message);
            });
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
'use strict';

var express = require('express');
var controller = require('./user.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.hasRole('admin'), controller.index);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.get('/me', auth.isAuthenticated(), controller.me);
router.get('/me/opportunities', auth.isAuthenticated(), controller.getOpportunities);
router.get('/:id/criteria', auth.isAuthenticated(), controller.getCriteria);
router.get('/:id/campaign', auth.isAuthenticated(), controller.getCampaign);
router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);
router.put('/:id/location', auth.isAuthenticated(), controller.updateLocation);
router.put('/:id/criteria', auth.isAuthenticated(), controller.updateCriteria);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/', controller.create);

module.exports = router;

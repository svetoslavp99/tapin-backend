'use strict';

var express = require('express');
var controller = require('./business.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/trending', auth.isAuthenticated(), controller.getTrending);

module.exports = router;

'use strict';

var express = require('express');
var passport = require('passport');
var auth = require('../auth.service');

var router = express.Router();

router
  .get('/', passport.authenticate('facebook', {
    scope: ['user_about_me',
      'user_actions.books',
      'user_actions.fitness',
      'user_actions.music',
      'user_actions.news',
      'user_actions.video',
      'user_activities',
      'user_birthday',
      'user_education_history',
      'user_events',
      'user_friends',
      'user_games_activity',
      'user_groups',
      'user_hometown',
      'user_interests',
      'user_likes',
      'user_location',
      'user_photos',
      'user_relationship_details',
      'user_relationships',
      'user_religion_politics',
      'user_status',
      'user_tagged_places',
      'user_videos',
      'user_website',
      'user_work_history',
      'ads_management',
      'ads_read',
      'email',
      'manage_pages',
      'publish_actions',
      'read_friendlists',
      'read_insights',
      'read_mailbox',
      'read_page_mailboxes',
      'read_stream',
      'rsvp_event'
    ],
    failureRedirect: '/signup',
    session: false
  }))

  .get('/callback', passport.authenticate('facebook', {
    failureRedirect: '/signup',
    session: false
  }));

module.exports = router;

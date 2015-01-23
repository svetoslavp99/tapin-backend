'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var UserLocationSchema = new Schema({
  user: {type: Schema.ObjectId, ref: 'User'},
  geo: {
    type: [Number],
    index: '2d'
  },
  updatedAt: {type: Date, default: Date.now()}
});

module.exports = mongoose.model('UserLocation', UserLocationSchema);

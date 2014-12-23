'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var OpportunitySchema = new Schema({
  user: {type: Schema.ObjectId, ref: 'User'},
  geo: {
    type: [Number],
    index: '2d'
  },
  opportunity: [{
    distance: Number,
    userGroup: [{
      type: Schema.ObjectId,
      ref: 'User'
    }]
  }],
  updatedAt: {type: Date, default: Date.now()}
});

module.exports = mongoose.model('Opportunity', OpportunitySchema);

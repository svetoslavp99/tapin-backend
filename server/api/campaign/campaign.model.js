'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var CampaignSchema = new Schema({
  criteria: [{
    text: String,
    _id: false
  }],
  distance: Number,
  message: String,
  price: Number,
  limit: {type: Number, default: 30},
  user: {type: Schema.ObjectId, ref: 'User'},
  createdAt: {type: Date, default: Date.now()},
  available: {type: Number},
  userGroup: [{type: Schema.ObjectId, ref: 'User'}],
  geo: {
    type: [Number],
    index: '2d'
  },
  active: {type: Boolean, default: true}
});

/**
 * Pre-save hook
 */
CampaignSchema
  .pre('save', function (next) {
    if (!this.isNew) return next();

    this.constructor.count({
      user: this.user,
      active: true
    }, function (err, count) {
      if (err) {
        throw err;
      }
      if (count >= 1) {
        next(new Error('Current campaign has not finished yet !'));
      } else {
        next();
      }
    })
  });

module.exports = mongoose.model('Campaign', CampaignSchema);

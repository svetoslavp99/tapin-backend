'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

function toLower (v) {
  return v.toLowerCase();
}

var BusinessSchema = new Schema({
  user: {type: Schema.ObjectId, ref: 'User'},
  businessName: {type: String},
  website: String,
  contact: String,
  phone: String,
  address: String,
  businessType: {type: String, lowercase: true},
  businessCategory: [String],
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

//BusinessSchema
//  .path('businessCategory')
//  .set(function (value) {
//    if(Array.isArray(value)) {
//      this.businessCategory = value.map(function(item) {
//        item = item.toLowerCase();
//        return item;
//      })
//    }
//  });

module.exports = mongoose.model('Business', BusinessSchema);

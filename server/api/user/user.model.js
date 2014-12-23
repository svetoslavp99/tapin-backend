'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');
var authTypes = ['github', 'twitter', 'facebook', 'google'];
var roleTypes = ['admin', 'user', 'manager'];
var thumbnailPluginLib = require('mongoose-thumbnail');
var thumbnailPlugin = thumbnailPluginLib.thumbnailPlugin;
var path = require('path');
var when = require('when');
var defer = when.defer;
var _ = require('async');

var UserSchema = new Schema({
  username: String,
  name: String,
  email: {type: String, lowercase: true},
  role: {
    type: String,
    default: 'user'
  },
  hashedPassword: String,
  provider: String,
  salt: String,
  facebook: {},
  twitter: {},
  google: {},
  github: {},
  avatar: {},
  criteria: [{
    text: String,
    _id: false
  }],
  isOnline: Boolean,
  socketId: [String]
});

//var uploads_base = path.join(__dirname, "../../uploads");
//UserSchema.plugin(thumbnailPlugin, {
//  name: "avatar",
//  inline: false,
//  save: true,
//  upload_to: path.join(uploads_base, "photos"),
//  relative_to: uploads_base
//});

/**
 * Virtuals
 */
UserSchema
  .virtual('password')
  .set(function (password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashedPassword = this.encryptPassword(password);
  })
  .get(function () {
    return this._password;
  });

// Public profile information
UserSchema
  .virtual('profile')
  .get(function () {
    return {
      'name': this.name,
      'role': this.role
    };
  });

// Non-sensitive info we'll be putting in the token
UserSchema
  .virtual('token')
  .get(function () {
    return {
      '_id': this._id,
      'role': this.role
    };
  });

/**
 * Validations
 */

// Validate empty email
//UserSchema
//  .path('email')
//  .validate(function (email) {
//    if (authTypes.indexOf(this.provider) !== -1) return true;
//    return email.length;
//  }, 'Email cannot be blank');

// Validate empty password
UserSchema
  .path('hashedPassword')
  .validate(function (hashedPassword) {
    if (authTypes.indexOf(this.provider) !== -1) return true;
    return hashedPassword.length;
  }, 'Password cannot be blank');

// Validate email is not taken
UserSchema
  .path('email')
  .validate(function (value, respond) {
    var self = this;
    this.constructor.findOne({email: value}, function (err, user) {
      if (err) throw err;
      if (user) {
        if (self.id === user.id) return respond(true);
        return respond(false);
      }
      respond(true);
    });
  }, 'The specified email address is already in use.');

// Validate username is not taken
UserSchema
  .path('username')
  .validate(function (value, respond) {
    var self = this;
    this.constructor.findOne({username: value}, function (err, user) {
      if (err) throw err;
      if (user) {
        if (self.id === user.id) return respond(true);
        return respond(false);
      }
      respond(true);
    });
  }, 'The specified username is already in use.');

// Validate role value is correct format
UserSchema
  .path('role')
  .validate(function (value, respond) {
    var self = this;
    if (roleTypes.indexOf(value.toString()) !== -1) {
      return respond(true);
    } else {
      return respond(false);
    }
  }, 'The specified role type is not correct.');

var validatePresenceOf = function (value) {
  return value && value.length;
};

/**
 * Pre-save hook
 */
UserSchema
  .pre('save', function (next) {
    if (!this.isNew) return next();

    if (!validatePresenceOf(this.hashedPassword) && authTypes.indexOf(this.provider) === -1)
      next(new Error('Invalid password'));
    else
      next();
  });

/**
 * Methods
 */
UserSchema.methods = {
  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */
  authenticate: function (plainText) {
    return this.encryptPassword(plainText) === this.hashedPassword;
  },

  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */
  makeSalt: function () {
    return crypto.randomBytes(16).toString('base64');
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */
  encryptPassword: function (password) {
    if (!password || !this.salt) return '';
    var salt = new Buffer(this.salt, 'base64');
    return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
  },

  /**
   * find users within distance around him measured by distance and role
   *
   * @param distance
   * @param role
   * @returns {*}
   */
  getNearByUsers: function (distance, role) {
    var self = this;
    var deferred = defer();

    this.constructor.find({
      loc: {
        $near: self.loc,
        $maxDistance: distance * 1609.34
      },
      role: role
    }).exec(function (err, users) {
      if (err) {
        deferred.reject(err);
      }
      if (!users) {
        deferred.resolve([]);
      }
      deferred.resolve(users);
    });

    return deferred.promise;
  }
};

module.exports = mongoose.model('User', UserSchema);

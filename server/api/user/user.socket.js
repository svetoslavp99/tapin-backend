/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var User = require('./user.model');

exports.register = function(socket) {
};

function handleError(code, msg) {
  switch(code) {
    case 404:
          break;
    case 500:
          break;
    default:

  }
}

'use strict';

angular.module('tapinApp')
  .factory('Campaign', function ($resource) {
    return $resource('/api/campaigns/:id/:controller', {
        id: '@_id'
      },
      {
        get: {
          method: 'GET'
        },
        save: {
          method: 'POST'
        }
      });
  });

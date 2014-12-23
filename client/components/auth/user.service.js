'use strict';

angular.module('tapinApp')
  .factory('User', function ($resource) {
    return $resource('/api/users/:id/:controller', {
      id: '@_id'
    },
    {
      changePassword: {
        method: 'PUT',
        params: {
          controller:'password'
        }
      },
      get: {
        method: 'GET',
        params: {
          id:'me'
        }
      },
      getOpportunities: {
        method: 'GET',
        isArray: true,
        params: {
          id: 'me',
          controller: 'opportunities'
        }
      },
      getCriteria: {
        method: 'GET',
        isArray: true,
        params: {
          id: 'me',
          controller: 'criteria'
        }
      },
      getCampaign: {
        method: 'GET',
        isArray: true,
        params: {
          id: 'me',
          controller: 'campaign'
        }
      }
	  });
  });

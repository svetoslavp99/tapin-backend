'use strict';

angular.module('tapinApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('main', {
        url: '/',
        templateUrl: 'app/main/main.html',
        controller: 'MainCtrl',
        resolve: {
          opportunities: function(User) {
            return User.getOpportunities().$promise;
          },
          criteria: function(User) {
            return User.getCriteria().$promise;
          },
          campaign: function(User) {
            return User.getCampaign().$promise;
          }
        },
        authenticate: true
      });
  });

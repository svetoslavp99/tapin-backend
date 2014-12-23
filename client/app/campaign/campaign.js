'use strict';

angular.module('tapinApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('campaign', {
        url: '/campaign',
        templateUrl: 'app/campaign/campaign.html',
        controller: 'CampaignCtrl',
        resolve: {
          criteria: function(User) {
            return User.getCriteria().$promise;
          },
          opportunities: function(User) {
            return User.getOpportunities().$promise;
          },
          campaign: function(User) {
            return User.getCampaign().$promise;
          }
        }
      });
  });

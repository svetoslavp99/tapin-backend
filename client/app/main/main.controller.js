'use strict';

angular.module('tapinApp')
  .controller('MainCtrl', function ($scope, $http, socket, opportunities, criteria, lodash, campaign) {
    $scope.awesomeThings = [];
    $scope.opportunities = opportunities;
    $scope.criteria = criteria;
    $scope.campaign = campaign[0] || null;
    $scope.currentOppt = {
      count: 0
    };

    /**
     * Initialize function
     */
    $scope.init = function() {
      // attach socket
      socket.socket.on('opportunity:update', function(data) {
        $scope.opportunities = data;
        $scope.opportunities.forEach(function(item) {
          if(item.distance == $scope.currentOppt.distance) {
            $scope.currentOppt = item;
          }
        });
      });
      socket.socket.on('campaign:update', function(data) {
        $scope.campaign = data;
      });

      if($scope.opportunities.length > 0) {
        $scope.currentOppt = $scope.opportunities[0];
      }
    };

    $scope.$on('$destroy', function () {
      socket.socket.removeAllListeners('opportunities:update');
    });

    $scope.updateOpportunity = function (oppt) {
      $scope.opptCount = oppt.count;
    };

    $scope.showCriteria = function (value) {
      return lodash.pluck(value, 'text').join(', ');
    };

    $scope.isCampaignStarted = function () {
      return campaign.length == 1;
    }

    $scope.init();
  });

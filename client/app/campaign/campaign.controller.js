'use strict';

angular.module('tapinApp')
  .controller('CampaignCtrl', function ($scope, opportunities, criteria, Campaign, $state, campaign) {
    $scope.form = {
      price: 18,
      criteria: criteria,
      limit: 30
    };
    $scope.opportunities = opportunities;
    $scope.criteria = criteria;
    $scope.campaign = campaign[0] || null;
    $scope.error = '';
    $scope.step = 1;

    var originalForm = angular.copy($scope.form);

    $scope.save = function() {
      $scope.error = '';
      if($scope.canSubmit()) {
        console.log($scope.form.opportunity);
        $scope.form.available = $scope.form.opportunity.count;
        $scope.form.distance= $scope.form.opportunity.distance;
        $scope.form.userGroup = [];
        Campaign.save($scope.form, function (data) {
          $scope.step = 2;
          $scope.campaign = data;
          $scope.qr_img = "https://api.qrserver.com/v1/create-qr-code/?size=150*150&data=" + data._id;
        }, function(err) {
          console.log(err);
          if(err) {
            $scope.error = err.statusText;
          }
        });
      }
    };

    $scope.closeAlert = function() {
      $scope.error = '';
    };

    $scope.isCampaignStarted = function() {
      return campaign.length == 1;
    }

    $scope.canSubmit = function (form) {
      return $scope.form_campaign.$valid && !angular.equals($scope.form, originalForm);
    };

    var init = function() {
      if(campaign.length != 0) {
        $scope.error = 'Current campaign has not finished yet. You can not create a new campaign at the moment.';
      }
    };

    init();
  });

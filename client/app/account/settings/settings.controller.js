'use strict';

angular.module('tapinApp')
  .controller('SettingsCtrl', function ($scope, User, Auth, socket, user) {
    $scope.user = {
      businessName: user.business.businessName,
      website: user.business.website,
      contact: user.business.contact,
      phone: user.business.phone,
      address: user.business.address,
      lat: user.business.geo[0],
      long: user.business.geo[1],
      businessCategory: user.business.businessCategory,
      criteria: user.criteria
    };
    console.log(user);
    $scope.errors = {};
    $scope.businessCategories = ['Food', 'Drink', 'Health', 'Lifestyle', 'Shopping', 'Entertainment'];
    $scope.businessTypes = ['Store-front', 'Online'];
    $scope.checkbox = {};

    $scope.user.businessType = _.find($scope.businessTypes, function(type) {
      return type.toLowerCase() === user.business.businessType;
    });
    $scope.user.businessCategory.forEach(function(category) {
      $scope.checkbox[category] = true;
    });

    console.log($scope.user);

    $scope.update = function(form) {
      console.log($scope.user.businessCategory);
      $scope.submitted = true;
      if(form.$valid) {
        User.update($scope.user, function(data) {
          $scope.message = 'User information successfully changed.';
        }, function(err) {
          form.password.$setValidity('mongoose', false);
          $scope.errors.other = 'Incorrect password';
          $scope.message = '';
        });
      }
		};

    $scope.updateBusinessCategory = function(businessCategory, value) {
      if(value) {
        if ( $scope.user.businessCategory.length >= 3 ) {
          $scope.checkbox[businessCategory] = false;
        } else {
          $scope.user.businessCategory.push(businessCategory);
        }
      } else {
        $scope.user.businessCategory.splice($scope.user.businessCategory.indexOf(businessCategory), 1);
      }
    }
  });

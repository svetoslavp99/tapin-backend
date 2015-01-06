'use strict';

angular.module('tapinApp')
  .controller('SignupCtrl', function ($scope, Auth, $location, $window) {
    $scope.user = {
      businessCategory: [],
      role: 'manager',
      criteria: [{text: 'green juice'}, {text: 'beachlife'}, {text: 'health'}, {text: 'vegan'}]
    };
    $scope.errors = {};
    $scope.businessCategories = ['Food', 'Drink', 'Health', 'Lifestyle', 'Shopping', 'Entertainment'];
    $scope.businessTypes = ['Store-front', 'Online'];

    $scope.register = function(form) {
      $scope.submitted = true;

      if(form.$valid) {
        Auth.createUser($scope.user)
        .then( function() {
          // Account created, redirect to home
          $location.path('/');
        })
        .catch( function(err) {
          err = err.data;
          $scope.errors = {};

          // Update validity of form fields that match the mongoose errors
          angular.forEach(err.errors, function(error, field) {
            form[field].$setValidity('mongoose', false);
            $scope.errors[field] = error.message;
          });
        });
      }
    };

    $scope.loginOauth = function(provider) {
      $window.location.href = '/auth/' + provider;
    };

    $scope.updateBusinessCategory = function(businessCategory, value) {
      if(value) {
        $scope.user.businessCategory.push(businessCategory);
      } else {
        $scope.user.businessCategory.splice($scope.user.businessCategory.indexOf(businessCategory), 1);
      }
    }
  });

'use strict';

describe('Controller: CampaignCtrl', function () {

  // load the controller's module
  beforeEach(module('tapinApp'));

  var CampaignCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    CampaignCtrl = $controller('CampaignCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});

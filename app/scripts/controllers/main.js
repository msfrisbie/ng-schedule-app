'use strict';

/**
 * @ngdoc function
 * @name ngscheduleApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the ngscheduleApp
 */
angular.module('ngscheduleApp')
  .controller('MainCtrl', function ($scope) {

    $scope.configData = {
      // -1: invalid
      // 0: available
      // 1+: valid
      groups: [
        {
          blockClass: "blarg"
        }
      ],
      days: 7,
      // minutes
      minTime: 60*7,
      maxTime: 60*8,
      clickable: false,
      // minutes
      granularity: 30,
      minBlockSize: 60
    }

    $scope.eventData = [
    	{
    		start: null,
        end: null,
        group: 0,
        locked: true
    	}
    ]
  });

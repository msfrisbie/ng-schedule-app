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
    
    // moment start of week plus offsets?

    $scope.eventData = [
    	{
    		start: null,
        end: null,
        status: 1,
        locked: true
    	}
    ]

    $scope.exampleConfig = {

      // should user have to know how to use moment.js?
      // css default classes

      horizontal: true,
      days: 7,
      startDate: null,
      timezone: null, // ??? this doesn't make any sense
      clickable: false,
      minBlockSize: null, // duration
      maxBlockSize: null, // duration
      // list of css classes
      fillClasses: [
        'btn-primary',
        'btn-success',
        'btn-info',
        'btn-warning',
        'btn-danger'
      ],
      startBuffer: null, // duration
      endBuffer: null // duration
    }

    $scope.configData1 = {
      horizontal: true,
      // -1: invalid
      // 0: available
      // 1+: valid,
      fillClasses: [
        'btn-primary',
        'btn-success',
        'btn-info',
        'btn-warning',
        'btn-danger'
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

    $scope.configData2 = {
      horizontal: false,
      days: 5,
      fillClasses: [
        'btn-primary',
        'btn-success',
        'btn-info',
        'btn-warning',
        'btn-danger'
      ]
    };

  });

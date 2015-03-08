angular.module('ngSchedule', [])
.directive('schedule', function() {
	return {
    // restrict: 'E',
    replace: true,
    scope: {
      events: '=ngModel'
    },
    controller: function() {

    },
    link: function(scope, el, attrs, ctrl) {

      console.log(scope.events)

      scope.jake = Array(24)

      scope.days = [
        {
          blocks: [
            {
              length: 10,
              status: 1
            },
            {
              length: 1,
              status: 0
            },            
            {
              length: 1,
              status: 0
            },            
            {
              length: 1,
              status: 0
            },            
            {
              length: 1,
              status: 0
            },            
            {
              length: 1,
              status: 0
            },
            {
              length: 5,
              status: 1
            },
            {
              length: 1,
              status: 0
            },
            {
              length: 3,
              status: 1
            },
          ]
        },
        {
          blocks: [
            {
              length: 8,
              status: 1
            },
            {
              length: 1,
              status: 0
            },
            {
              length: 1,
              status: 0
            },
            {
              length: 1,
              status: 0
            },
            {
              length: 1,
              status: 0
            },
            {
              length: 10,
              status: 1
            },
            {
              length: 1,
              status: 0
            },
            {
              length: 1,
              status: 0
            },
          ]
        },
      ]

    },
    // TODO: change this to template strings when finished
    templateUrl: 'scripts/ng-schedule.html'
  };
})
// .factory()
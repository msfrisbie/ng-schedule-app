angular.module('ngSchedule', [])
.directive('schedule', function() {

  function Day(granularity) {

    this.head = new Block(0);
    this.tail = new Block(0);

    this.head.next = this.tail;
    this.tail.prev = this.head;

    for (var i=0; i<granularity; ++i) {
      
      var current = new Block(1, 0);

      var tmp = this.tail.prev;

      tmp.next = current;
      current.prev = tmp;
      current.next = this.tail;
      this.tail.prev = current;

    }

    // for presentation
    this.serialize = function() {
      var retArr = []
        , ptr = this.head.next;

      while (ptr !== null) {
        if (angular.isDefined(ptr.status)) {
          retArr.push(ptr);
        }
        ptr = ptr.next;
      }
      
      this.blocks = retArr;
    }

    this.serialize();

    this.getBlockAtIndex = function(idx) {

      var current = this.head.next;

      var total = 0;

      while (true) {
        total += current.length;

        if (idx < total) {
          current.selectionOffset = idx - current.start();
          return current;
        }

        current = current.next;
      }
    }
  }

  function Block(length, status) {

    var self = this;

    this.destructible = true;

    this.prev = null;
    this.next = null;

    this.length = length;
    this.status = status;

    this.selectionOffset = null;

    this.start = function() {
      var total = 0
        , ptr = self;

      while (ptr.prev !== null) {
        total += ptr.prev.length;
        ptr = ptr.prev;
      }

      return total;
    }

    this.end = function() {
      return self.start() + self.length - 1;
    }

    this.clickIdx = function() {
      return self.start() + self.selectionOffset;
    }

    this.detach = function() {

      var next = this.next
      var prev = this.prev

      prev.next = next
      next.prev = prev

      this.next = null;
      this.prev = null;

      // returns itself for deletion
      return this;
    }

    this.remove = function() {
      while (this.length > 1) {
        this.retractLeft()
      }
      this.status = 0;
      this.selectionOffset = null;
    }

    this.insertBefore = function(block) {
      var prev = this.prev;

      prev.next = block;
      block.next = this;
      this.prev = block;
      block.prev = prev;

    }

    this.available = function() {
      return this.status === 0;
    }

    this.extend = function(targetBlock) {
      if (targetBlock.available()) {
        delete targetBlock.detach();
        ++this.length;
        return true;
      } else {
        return false;
      }
    }

    this.extendRight = function() {
      return this.extend(this.next);
    }

    this.extendLeft = function() {
      return this.extend(this.prev);
    }

    this.retract = function(targetBlock) {
      if (this.length > 1) {
        var b = new Block(1, 0);
        targetBlock.insertBefore(b);
        --this.length;
        return true;
      } else {
        return false;
      }
    }

    this.retractRight = function() {
      return this.retract(this.next);
    }

    this.retractLeft = function() {
      return this.retract(this);
    }

    this.shift = function(targetBlock) {
      if (this.length > 0 && targetBlock.length > 0 && targetBlock.status === 0) {
        if (this.prev === targetBlock) {
          var farLeft = targetBlock.prev
            , farRight = this.next
            , newNearLeft = this
            , newNearRight = targetBlock;
        } else if (this.next === targetBlock && targetBlock.status === 0) {
          var farLeft = this.prev
            , farRight = targetBlock.next
            , newNearLeft = targetBlock
            , newNearRight = this;
        } else {
          console.log('shouldnt get here!')
        }

        farLeft.next = newNearLeft;
        newNearLeft.prev = farLeft;
        newNearLeft.next = newNearRight;
        newNearRight.prev = newNearLeft;
        newNearRight.next = farRight;
        farRight.prev = newNearRight;
        
        return true;
      } else {
        return false;
      }
    }

    this.shiftRight = function() {
      return this.shift(this.next)
    }

    this.shiftLeft = function() {
      return this.shift(this.prev)
    }

  }

	return {
    replace: true,
    scope: {
      events: '=ngModel',
      configData: '='
    },
    controller: function() {

    },
    link: function(scope, el, attrs, ctrl) {

      scope.eData = []

      // scope.$watch('eData', function() {
      //   scope.eData = scope.eData.slice(0, 25)
      // }, true)

      scope.selectedBlock = null;
      // 0 no direction
      // -1 left
      // 1 right
      var adjustDirection = 0
        , clickTargetIdx = -1
        , justCreated = false
        , fillClassIdx = 1;

      scope.fillClasses = [
        'schedule-block-available',
        'btn-primary',
        'btn-success',
        'btn-info',
        'btn-warning',
        'btn-danger'
      ]

      scope.selectClass = function(idx) {
        fillClassIdx = idx;
      }

      scope.select = function(dayIdx, event) {
        clickTargetIdx = scope.getIdx(dayIdx, event);
        scope.selectedBlock = scope.days[dayIdx].getBlockAtIndex(clickTargetIdx);
      }

      scope.touchSelect = function(dayIdx, event) {
        scope.$apply(function() {
          scope.select(dayIdx, event)
        })
      }

      scope.release = function() {
        scope.selectedBlock = null;
        adjustDirection = 0;
        justCreated = false;
        clickTargetIdx = -1;
      }

      scope.getIdx = function(dayIdx, event) {
        
        if (scope.configData.horizontal) {
          var tr = $('.block-row')[dayIdx]
            , xOffset = $(tr).offset().left
            , totalWidth = tr.offsetWidth
            , eventX = event.pageX;

          return Math.floor(24 * (eventX-xOffset) / (totalWidth));
        } else {
          var table = $('.block-col')[dayIdx]
            , yOffset = $(table).offset().top
            , totalHeight = table.offsetHeight
            , eventY = event.pageY;

          return Math.floor(24 * (eventY-yOffset) / (totalHeight));
        }
      }

      scope.createIfAvailable = function(dayIdx, block) {
        if (block.available()) {
          block.status = fillClassIdx;
          justCreated = true;
          scope.selectedBlock = block;
          scope.days[dayIdx].serialize();
        }
      }

      scope.touchCreateIfAvailable = function(dayIdx, block) {
        scope.$apply(function() {
          scope.createIfAvailable(dayIdx, block)
        })
      }

      scope.remove = function(dayIdx, block, $event) {
        block.remove();
        $event.stopPropagation();
        scope.days[dayIdx].serialize();
      }

      scope.getCount = function(num) {
        return new Array(num);
      }

      scope.trackTouchMove = function(dayIdx, event) {
        scope.eData.splice(0, 0, ['touchmove', event])
        scope.eData.splice(25)

        scope.$apply(function() {
          scope.trackMove(dayIdx, event)
        })
      }

      scope.trackMove = function(dayIdx, event) {

        scope.eData.splice(0, 0, ['move', event])
        scope.eData.splice(25)

        var timeIdx = scope.getIdx(dayIdx, event);

        if (justCreated) {
          if (timeIdx > scope.selectedBlock.end()) {
            adjustDirection = 1;
          } else if (timeIdx < scope.selectedBlock.start()) {
            adjustDirection = -1;
          }
        }

        if (scope.selectedBlock !== null) {
          if (adjustDirection < 0) {
            // moving the left bumper
            if (timeIdx > scope.selectedBlock.start()) {
              // shrinking in from the left
              while (timeIdx > scope.selectedBlock.start()) {
                var result = scope.selectedBlock.retractLeft();
                if (!result)
                  break;
              }
              scope.days[dayIdx].serialize();
            } else if(timeIdx < scope.selectedBlock.end()) {
              // expanding out to the left
              while (timeIdx < scope.selectedBlock.start()) {
                var result = scope.selectedBlock.extendLeft();
                if (!result)
                  break;
              }
              scope.days[dayIdx].serialize();
            }
          } else if (adjustDirection > 0) {
            // moving the right bumper
            if (timeIdx > scope.selectedBlock.end()) {
              // expanding out to the right
              while (timeIdx > scope.selectedBlock.end()) {
                var result = scope.selectedBlock.extendRight();
                if (!result)
                  break;
              }
              scope.days[dayIdx].serialize();

            } else if (timeIdx < scope.selectedBlock.end()) {
              // shrinking in from the right
              while (timeIdx < scope.selectedBlock.end()) {
                var result = scope.selectedBlock.retractRight();
                if (!result)
                  break;
              }
              scope.days[dayIdx].serialize();
            }
          } else if (adjustDirection === 0) {

            if (timeIdx < scope.selectedBlock.clickIdx()) {
              while (timeIdx < scope.selectedBlock.clickIdx()) {
                var result = scope.selectedBlock.shiftLeft();
                if (!result)
                  break;
              }
              scope.days[dayIdx].serialize();
            } else if (timeIdx > scope.selectedBlock.clickIdx()) {
              while (timeIdx > scope.selectedBlock.clickIdx()) {
                var result = scope.selectedBlock.shiftRight();
                if (!result)
                  break;
              }
              scope.days[dayIdx].serialize();
            }
          }
        }
      }

      scope.adjustBefore = function(block) {
        scope.selectedBlock = block;
        adjustDirection = -1;
      }

      scope.touchAdjustBefore = function(block) {
        scope.$apply(function() {
          scope.adjustBefore(block)
        })
      }

      scope.adjustAfter = function(block) {
        scope.selectedBlock = block;
        adjustDirection = 1;
      }

      scope.touchAdjustAfter = function(block) {
        scope.$apply(function() {
          scope.adjustAfter(block)
        })
      }

      scope.blockTargets = Array(24);

      scope.days = []

      for (var i=0; i<3; ++i) {
        var day = new Day(24);

        scope.days.push(day);
      }
    },
    // TODO: change this to template strings when finished
    templateUrl: 'ng-schedule.tpl.html'
  };
})

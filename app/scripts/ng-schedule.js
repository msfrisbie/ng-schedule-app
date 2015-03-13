angular.module('ngSchedule', [])
.directive('schedule', function() {

  function Day(granularity) {

    this.head = new Block(0);
    this.tail = new Block(0);

    this.head.next = this.tail;
    this.tail.prev = this.head;

    this.blocks;

    for (var i=0; i<granularity; ++i) {
      
      var current = new Block(1, 0);

      var tmp = this.tail.prev;

      tmp.next = current;
      current.prev = tmp;
      current.next = this.tail;
      this.tail.prev = current;

    }

    // for presentation
    // THIS GETS CALLED A MILLION FUCKING TIMES
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
      console.log(self.selectionOffset)
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
      events: '=ngModel'
    },
    controller: function() {

    },
    link: function(scope, el, attrs, ctrl) {

      scope.selectedBlock = null;
      // 0 no direction
      // -1 left
      // 1 right
      var adjustDirection = 0
        , clickTargetIdx = -1
        , justCreated = false;

      scope.fillClasses = [
        'schedule-block-available',
        'schedule-block-filled-primary',
        'schedule-block-filled-success',
        'schedule-block-filled-info',
        'schedule-block-filled-warning',
        'schedule-block-filled-danger'
      ]

      scope.select = function(dayIdx, event) {
        clickTargetIdx = scope.getIdx(dayIdx, event);
        scope.selectedBlock = scope.days[dayIdx].getBlockAtIndex(clickTargetIdx);
      }

      scope.release = function() {
        scope.selectedBlock = null;
        adjustDirection = 0;
        justCreated = false;
        clickTargetIdx = -1;
      }

      scope.getIdx = function(dayIdx, event) {
        var tr = $('.block-row')[dayIdx]
          , xOffset = $(tr).offset().left
          , totalWidth = tr.offsetWidth
          , eventX = event.pageX;

        return Math.floor(24 * (eventX-xOffset) / (totalWidth));
      }

      scope.createIfAvailable = function(dayIdx, block) {
        if (block.available()) {
          block.status = 1;
          justCreated = true;
          scope.selectedBlock = block;
          scope.days[dayIdx].serialize();
        }
      }

      scope.remove = function(dayIdx, block, $event) {
        block.remove();
        $event.stopPropagation();
        scope.days[dayIdx].serialize();
      }

      scope.trackMove = function(dayIdx, event) {

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
                console.log(timeIdx , scope.selectedBlock.clickIdx())
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

      scope.adjustLeft = function(block) {
        scope.selectedBlock = block;
        adjustDirection = -1;
      }

      scope.adjustRight = function(block) {
        scope.selectedBlock = block;
        adjustDirection = 1;
      }

      scope.blockTargets = Array(24)

      scope.days = []

      for (var i=0; i<3; ++i) {
        var day = new Day(24);

        scope.days.push(day);
      }
    },
    // TODO: change this to template strings when finished
    templateUrl: 'scripts/ng-schedule.html'
  };
})

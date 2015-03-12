angular.module('ngSchedule', [])
.directive('schedule', function() {

  function Day(granularity) {

    // -1 invalid
    // 0 open
    // 1+ status
    this.head = new Block(0);
    this.tail = new Block(0);

    this.head.next = this.tail;
    this.tail.prev = this.head;

    // var selectedBlockIdx = null
    //   , selectedRightSlider = false
    //   , selectedLeftSlider = false;

    for (var i=0; i<granularity; ++i) {
      
      var current = new Block(1, 0)

      // if (this.head === null && this.tail === null) {
      //   this.head = current;
      //   this.tail = current;
      // } else {

      var tmp = this.tail.prev

      tmp.next = current
      current.prev = tmp
      current.next = this.tail
      this.tail.prev = current

      // this.tail.prev = current
      // current.prev = this.tail
      // this.tail = current
      // }
    }

    // for presentation
    // THIS GETS CALLED A MILLION FUCKING TIMES
    this.serialize = function() {
      var retArr = []
        , ptr = this.head.next;

      while (ptr !== null) {
        if (angular.isDefined(ptr.status)) {
          retArr.push(ptr)
        }
        ptr = ptr.next;
      }
      
      return retArr;
    }

    // can only replace an unoccupied block
    this.addBlock = function(idx, length, status) {
      this.getBlockAtIndex(idx).status = status;
    }

    // this.modifySelectedBlock = function(idx) {
    //   if (selectedBlockIdx) {
    //     var block = this.getBlockAtIndex(idx)

    //     if (selectedRightSlider) {
    //       var delta = block.setRightEndpoint(idx)
    //       for (var i=0; i<delta; ++i) {
    //         this.blocks.splice(block.end, 0, new Block())
    //       }
    //     }

    //     if (selectedLeftSlider) {
    //       var delta = block.setLeftEndpoint(idx)
    //     }
    //   }
    // }

    this.getBlockAtIndex = function(idx) {

      var current = this.head.next;

      var total = 0;

      while (true) {
        total += current.length;

        if (idx < total)
          return current;

        current = current.next;
      }
    }
  }

  function Block(length, status) {

    var self = this;

    this.prev = null;
    this.next = null;

    this.length = length;
    this.status = status;

    // this.day = day;
    
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

    this.detach = function() {
      // console.log(this)

      // this.prev.next = this.next
      // this.next.prev = this.prev

      var next = this.next
      var prev = this.prev
      prev.next = next
      next.prev = prev

      this.next = null;
      this.prev = null;

      // console.log(this)

      // returns itself for deletion
      return this;
    }

    this.insertBefore = function(block) {
      var prev = this.prev;
      // var next = this.next;

      prev.next = block;
      block.next = this;
      this.prev = block;
      block.prev = prev;

    }

    this.available = function() {
      return this.status === 0;
    }

    this.extendRight = function() {
      if (this.next.available()) {
        delete this.next.detach()
        ++this.length;
        return true;
      } else {
        return false;
      }
    }

    this.extendLeft = function() {
      if (this.prev.available()) {
        delete this.prev.detach()
        ++this.length;
        return true;
      } else {
        return false;
      }
    }

    this.retractRight = function() {
      if (this.length > 1) {
        var b = new Block(1, 0);
       this.next.insertBefore(b)
        --this.length;
        return true;
      } else {
        return false;
      }
    }

    this.retractLeft = function() {
      if (this.length > 1) {
        var b = new Block(1, 0);
        this.insertBefore(b)
        --this.length;
        return true;
      } else {
        return false;
      }
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

      // var selectedDayIdx = null
      //   , selectedBlockIdx = null;

      var selectedBlock = null
      // 0 no direction
      // -1 left
      // 1 right
        , adjustDirection = 0;

      // scope.alterBlock = function(dayIdx, blockIdx) {

      // }

      scope.select = function(dayIdx, event) {
        var idx = scope.getIdx(dayIdx, event)

        selectedBlock = scope.days[dayIdx].getBlockAtIndex(idx)

        // console.log(selectedBlock)

        // console.log(selectedBlock)
      }

      scope.release = function() {
        selectedBlock = null;
        adjustDirection = 0;
      }

      scope.getIdx = function(dayIdx, event) {
        var tr = $('.block-row')[dayIdx]
          , xOffset = $(tr).offset().left
          , totalWidth = tr.offsetWidth
          , eventX = event.pageX;

        // console.log(xOffset, totalWidth, eventX, Math.floor(24 * (eventX-xOffset) / (totalWidth)))        
      
        return Math.floor(24 * (eventX-xOffset) / (totalWidth));
      }

      scope.trackMove = function(dayIdx, event) {

        var timeIdx = scope.getIdx(dayIdx, event)

        if (selectedBlock !== null) {
          if (adjustDirection < 0) {

            // moving the left bumper

            if (timeIdx > selectedBlock.start()) {

              // shrinking in from the left
              console.log('shrink in from left')

              while (timeIdx > selectedBlock.start()) {
                var result = selectedBlock.retractLeft()
                if (!result)
                  break;
              }
            } else if(timeIdx < selectedBlock.end()) {

              // expanding out to the left
              console.log('expand out to left')


              while (timeIdx < selectedBlock.start()) {
                var result = selectedBlock.extendLeft()
                if (!result)
                  break;
              }

            }

          } else if (adjustDirection > 0) {

            // moving the right bumper

            if (timeIdx > selectedBlock.end()) {

              // expanding out to the right
              console.log('expand out to right')

              while (timeIdx > selectedBlock.end()) {
                var result = selectedBlock.extendRight()
                if (!result)
                  break;
              }

            } else if (timeIdx < selectedBlock.end()) {

              // shrinking in from the right
              console.log('shrink in from right', timeIdx, selectedBlock.end())

              while (timeIdx < selectedBlock.end()) {
                var result = selectedBlock.retractRight()
                if (!result)
                  break;
              }
            }
          }
        }
      }

      scope.adjustLeft = function(block) {
        selectedBlock = block;
        adjustDirection = -1;
      }

      scope.adjustRight = function(block) {
        selectedBlock = block;
        adjustDirection = 1;
      }

      scope.logIt = function(dayIdx, event) {
        // console.log(arguments)
        // console.log(arguments[0].layerX)

        // var tr = $('.block-row')[dayIdx]
        
        // var xOffset = $(tr).offset().left
        //   , totalWidth = tr.offsetWidth
        //   , eventX = event.pageX;

        // console.log(xOffset, totalWidth, eventX, Math.floor(24 * (eventX-xOffset) / (totalWidth)))

        // console.log('offset', tr[dayIdx].offset())

        // var idx = arguments[0]
        // var e = arguments[1]

        // console.log(idx, e.offset())
        // console.log($('table.display-blocks > tr'))
      }

      scope.blockTargets = Array(24)

      scope.days = []

      var day = new Day(24);

      scope.days.push(day);

      // scope.days = [
      //   {
      //     blocks: [
      //       {
      //         length: 10,
      //         status: 1
      //       },
      //       {
      //         length: 1,
      //         status: 0
      //       },            
      //       {
      //         length: 1,
      //         status: 0
      //       },            
      //       {
      //         length: 1,
      //         status: 0
      //       },            
      //       {
      //         length: 1,
      //         status: 0
      //       },            
      //       {
      //         length: 1,
      //         status: 0
      //       },
      //       {
      //         length: 5,
      //         status: 1
      //       },
      //       {
      //         length: 1,
      //         status: 0
      //       },
      //       {
      //         length: 3,
      //         status: 1
      //       },
      //     ]
      //   },
      //   {
      //     blocks: [
      //       {
      //         length: 8,
      //         status: 1
      //       },
      //       {
      //         length: 1,
      //         status: 0
      //       },
      //       {
      //         length: 1,
      //         status: 0
      //       },
      //       {
      //         length: 1,
      //         status: 0
      //       },
      //       {
      //         length: 1,
      //         status: 0
      //       },
      //       {
      //         length: 10,
      //         status: 1
      //       },
      //       {
      //         length: 1,
      //         status: 0
      //       },
      //       {
      //         length: 1,
      //         status: 0
      //       },
      //     ]
      //   },
      // ]

    },
    // TODO: change this to template strings when finished
    templateUrl: 'scripts/ng-schedule.html'
  };
})
// .factory()
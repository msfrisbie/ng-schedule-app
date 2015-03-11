angular.module('ngSchedule', [])
.directive('schedule', function() {

  function Day(granularity) {

    // this.head = null;

    // this.blocks = [];
    this.head = null;
    this.tail = null;

    // var selectedBlockIdx = null
    //   , selectedRightSlider = false
    //   , selectedLeftSlider = false;

    for (var i=0; i<granularity; ++i) {
      
      var current = new Block(0, 1)


      if (!this.head)
        this.head = current

      if (!this.tail) {
        this.tail = current
      } else {
        this.tail.next = current
        this.tail = current
      }

      // this.tail.next = current

      // this.tail = current


      // this.blocks.push(current)

        // , ptr = head;

      // if (head) {
      //   head.next = current;
      //   current.prev = head
      // }


      // if (blocks.length > 0) {
      //   var last = blocks[blocks.length-1]
      //   current.prev = last;
      //   last.next = current;
      // }
      
      // this.blocks.push(current)
    }

    // for presentation
    this.serialize = function() {
      var retArr = []
        , ptr = this.head;


      console.log(this.head.next)
      
      while (ptr !== null) {
        retArr.push(ptr)
        ptr = ptr.next;
      }
      
      console.log(retArr, {a:1})

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

      var current = head;

      var total = 0;

      while (true) {
        total += current.length;

        if (idx < total)
          return current;

        current = current.next;
        // if (current.next)
        //   current = head.next;
        // else
        //   break;
      }

      // for (var i=0; i<this.blocks.length; ++i) {
      //   if (this.blocks[i].start <= idx && this.blocks[i].end >= idx) {
      //     return this.blocks[i];
      //   }
      // }
    }
  }



  function Block(status, length) {

    // this.blockRange = null;
    this.prev = null;
    this.next = null;
    this.length = length;

    // // end as an idx is not included in the covered range
    this.status = status;
    
    this.start = function() {
      var total = 0
        , ptr = this;

      while (ptr.prev !== null) {
        total += ptr.prev.length;
        ptr = ptr.prev;
      }

      return total;
    }

    this.end = function() {
      return this.start() + this.length;
    }

    this.extendRight = function() {
      if (this.next !== null && this.next.status > 0) {
        this.next = this.next.next;
        delete this.next.prev;
        this.next.prev = this;
        ++this.length;
      }
    }

    this.extendLeft = function() {
      if (this.prev !== null && this.prev.status > 0) {
        this.prev = this.prev.prev;
        delete this.prev.next;
        this.prev.next = this;
        ++this.length;
      }
    }

    this.retractRight = function() {
      if (this.length > 1) {
        var b = new Block(0, 1);
        if (this.next !== null) {
          this.next.prev = b;
        }
        this.next = b;
        --this.length;
      }
    }

    this.retractLeft = function() {
      if (this.length > 1) {
        var b = new Block(0, 1);
        if (this.prev !== null) {
          this.prev.next = b;
        }
        this.prev = b;
        --this.length;
      }
    }

    // this.extend = function() {

    // }

    // this.containsIdx = function(idx) {
    //   return this.start <= idx && this.end >= idx;
    // }

    // this.setRightEndpoint = function(idx) {
    //   var oldLength = this.length
    //   this.length = this.end - idx + 1
    //   this.end = this.start + this.length
    //   return oldLength - this.length
    // }

    // this.setLeftEndpoint = function(idx) {
    //   var oldLength = this.length
    //   this.length = idx - this.start + 1
    //   this.start = idx 
    //   return oldLength - this.length
    // }
  }

	return {
    // restrict: 'E',
    replace: true,
    scope: {
      events: '=ngModel'
    },
    controller: function() {

    },
    link: function(scope, el, attrs, ctrl) {

      // console.log(scope.events)

      var selectedDayIdx = null
        , selectedBlockIdx = null;

      scope.alterBlock = function(dayIdx, blockIdx) {

      }

      scope.select = function(dayIdx, blockIdx) {
        selectedDayIdx = dayIdx;
        selectedBlockIdx = blockIdx;
      }

      scope.release = function() {
        selectedDayIdx = null;
        selectedBlockIdx = null;
      }

      // scope.logBlock = function(dayIdx, blockIdx) { 
      //   var total = 0;

      //   console.log('indices', dayIdx, blockIdx)

      //   for (var i=0; i<scope.days[dayIdx].blocks.length; i++) {
      //     total += scope.days[dayIdx].blocks[i].length
      //     if (total > blockIdx) {
      //       console.log( scope.days[dayIdx].blocks[i] )
      //       break
      //     }
      //   }
      // }

      // scope.select = function(dayIdx, blockIdx) {
      //   selectedDayIdx = dayIdx;
      //   selectedBlockIdx = blockIdx;
      // }

      // scope.release = function() {
      //   selectedDayIdx = undefined;
      //   selectedBlockIdx = undefined;
      // }

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
angular.module('niceandsimpleDatepicker').directive('niceandsimpleDatepickerScroll', function (moment, $document, $timeout) {
  return {
    restrict: 'E',

    templateUrl: "/src/niceandsimpleDatepicker/directives/scroll/template.html",

    scope: {},

    bindToController: {
      date: '='
    },

    controllerAs: 'datepickerScrollCtrl',

    controller: function () {

      this.monthListLength = 48
      this.updateMonthIndex = 18

      this.selectDate = (date) => {
        this.date = date
      }

      this.getMonthsList = (visibleDate) => {
        visibleDate = visibleDate.startOf('month') || moment().startOf('month')

        var months = []

        for(var i = 0; i < this.monthListLength; i++) {
          if(i < this.monthListLength / 2) {
            months.push(moment(visibleDate).subtract(this.monthListLength / 2 - i, 'months'))
          }
          else if(i > this.monthListLength / 2) {
            months.push(moment(visibleDate).add(i - this.monthListLength / 2, 'months'))
          }
          else {
            months.push(moment(visibleDate))
          }
        }
        return months
      }

      this.currentMonth = moment()

    },


    link: function (scope, element, attrs, ctrl) {

      var $viewport = angular.element(element[0].querySelector('.months-list'))

      $viewport[0].style.marginRight = -getSidebarWidth() + 'px'

      function getSidebarWidth() {
        var el = document.createElement('div')
        var scrollWidth = 0
        el.style.position = "absolute"
        el.style.left = "-500px"
        el.style.width = "100px"
        el.style.visibility = "hidden"
        el.style.overflow = "scroll"
        document.body.appendChild(el)
        scrollWidth = el.offsetWidth - el.clientWidth + 1
        el.remove()
        return scrollWidth
      }

      function getMonthId(month) {
        return 'datepicker-month-' + month.format('MM-YYYY')
      }
      function getMonthElement(month) {
        return document.getElementById(getMonthId(month))
      }
      function getMonthElementTop(month) {
        var monthElement = getMonthElement(month)
        return monthElement.getBoundingClientRect().top - $viewport[0].getBoundingClientRect().top
      }
      function getMonthElementBottom(month) {
        var monthElement = getMonthElement(month)
        return monthElement.getBoundingClientRect().bottom - $viewport[0].getBoundingClientRect().top
      }
      function getMonthElementHeight(month) {
        var monthElement = getMonthElement(month)
        return monthElement.getBoundingClientRect().bottom - monthElement.getBoundingClientRect().top
      }

      var scrollEventBlock = true
      var initial_scroll = 0

      $viewport.on('scroll', scrollHandler)

      function scrollHandler(e) {
        if(! scrollEventBlock) {
          initial_scroll = $viewport[0].scrollTop
          scrollEventBlock = true
          $timeout(() => {
            if($viewport[0].scrollTop < initial_scroll) {
              var minMonth = moment(ctrl.currentMonth).subtract(ctrl.updateMonthIndex, 'months')
              if(0 <= getMonthElementTop(minMonth)) {
                var list = ctrl.getMonthsList(minMonth)
                var offset = 0

                scope.$apply(() => {
                  ctrl.currentMonth = minMonth
                  ctrl.months = list
                })

                $timeout(() => {
                  for(var i = 0; i < ctrl.updateMonthIndex; i++) {
                    offset += getMonthElementHeight(list[i])
                  }
                  $viewport[0].scrollTop += offset
                }, 0, false)
              }
            }
            else {
              var maxMonth = moment(ctrl.currentMonth).add(ctrl.updateMonthIndex, 'months')

              if(getMonthElementTop(maxMonth) < 0) {
                var offset = 0

                scope.$apply(() => {
                  ctrl.currentMonth = maxMonth
                  ctrl.months = ctrl.getMonthsList(ctrl.currentMonth)
                })

                $timeout(() => {
                  for(var i = 0; i < ctrl.updateMonthIndex; i++) {
                    offset += getMonthElementHeight(ctrl.months[ctrl.months.length - i - 1])
                  }
                  $viewport[0].scrollTop -= offset
                }, 0, false)
              }
            }
            scrollEventBlock = false
          }, 350, false)
        }
      }

      scope.$watch(() => {return ctrl.date}, (val) => {
        var month = moment(val).startOf('month') || moment().startOf('month')
        ctrl.currentMonth = month
        ctrl.months = ctrl.getMonthsList(month)
        $timeout(() => {
          $viewport[0].scrollTop = 0
          $viewport[0].scrollTop = getMonthElementTop(month)
        }, 0, false)
        scrollEventBlock = false
      })

    }
  }
})

angular.module('niceandsimpleDatepicker').directive('niceandsimpleDatepickerMonth', function (moment) {
  return {
    restrict: "E",
    scope: {},

    templateUrl: "/src/niceandsimpleDatepicker/directives/month/template.html",

    bindToController: {
      date: "=",
      selectDate: "&?",
      selectedDate: "=?"
    },

    controllerAs: 'datepickerMonthCtrl',
    controller: function () {
    },
    link: function (scope, element, attrs, ctrl) {

      const firstDay = 1
      var selectedDate = null

      function getDays(currentDate) {
        currentDate = currentDate || moment()

        var days = {
          list: [],
          firstDayOffset: 0
        }
        var daysInMonth = currentDate.daysInMonth()
        var dayOfWeek = moment(currentDate).date(1).day()

        if(firstDay == 1) {
          dayOfWeek = dayOfWeek > 0 ? dayOfWeek - 1 : 6
        }

        for (var i = 0; i < daysInMonth; i++) {
          var date = moment(currentDate).date(i + 1)
          var day = date.day()
          if(firstDay == 1) {
            day = day > 0 ? day - 1 : 6
          }

          days.list.push({
            value: date,
            isToday: moment().isSame(date, 'day'),
            isSelected: selectedDate ? selectedDate.isSame(date, 'day') : false,
            isWeekend: day > 4 ? true : false
          })

          if(i == 0 && dayOfWeek > 0) {
            days.firstDayOffset = dayOfWeek
          }
        }

        return days
      }

      scope.$watch(function () {
        return ctrl.date;
      }, function (val, oldVal) {
        scope.days = getDays(moment(val))
      })

      scope.$watch(function () {
        return ctrl.selectedDate;
      }, function (val, oldVal) {
        selectedDate = moment(val)
      })
    }
  }
})

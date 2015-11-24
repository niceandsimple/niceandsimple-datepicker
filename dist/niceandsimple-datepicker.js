'use strict';

angular.module('niceandsimpleDatepicker', ['componentsTemplates']);
'use strict';

angular.module('niceandsimpleDatepicker').directive('niceandsimpleDatepickerScroll', ["moment", "$document", "$timeout", function (moment, $document, $timeout) {
  return {
    restrict: 'E',

    templateUrl: "/src/niceandsimpleDatepicker/directives/scroll/template.html",

    scope: {},

    bindToController: {
      date: '='
    },

    controllerAs: 'datepickerScrollCtrl',

    controller: function controller() {
      var _this = this;

      this.monthListLength = 48;
      this.updateMonthIndex = 18;

      this.selectDate = function (date) {
        _this.date = date;
      };

      this.getMonthsList = function (visibleDate) {
        visibleDate = visibleDate.startOf('month') || moment().startOf('month');

        var months = [];

        for (var i = 0; i < _this.monthListLength; i++) {
          if (i < _this.monthListLength / 2) {
            months.push(moment(visibleDate).subtract(_this.monthListLength / 2 - i, 'months'));
          } else if (i > _this.monthListLength / 2) {
            months.push(moment(visibleDate).add(i - _this.monthListLength / 2, 'months'));
          } else {
            months.push(moment(visibleDate));
          }
        }
        return months;
      };

      this.currentMonth = moment();
    },

    link: function link(scope, element, attrs, ctrl) {

      var $viewport = angular.element(element[0].querySelector('.months-list'));

      $viewport[0].style.marginRight = -getSidebarWidth() + 'px';

      function getSidebarWidth() {
        var el = document.createElement('div');
        var scrollWidth = 0;
        el.style.position = "absolute";
        el.style.left = "-500px";
        el.style.width = "100px";
        el.style.visibility = "hidden";
        el.style.overflow = "scroll";
        document.body.appendChild(el);
        scrollWidth = el.offsetWidth - el.clientWidth + 1;
        el.remove();
        return scrollWidth;
      }

      function getMonthId(month) {
        return 'datepicker-month-' + month.format('MM-YYYY');
      }
      function getMonthElement(month) {
        return document.getElementById(getMonthId(month));
      }
      function getMonthElementTop(month) {
        var monthElement = getMonthElement(month);
        return monthElement.getBoundingClientRect().top - $viewport[0].getBoundingClientRect().top;
      }
      function getMonthElementBottom(month) {
        var monthElement = getMonthElement(month);
        return monthElement.getBoundingClientRect().bottom - $viewport[0].getBoundingClientRect().top;
      }
      function getMonthElementHeight(month) {
        var monthElement = getMonthElement(month);
        return monthElement.getBoundingClientRect().bottom - monthElement.getBoundingClientRect().top;
      }

      var scrollEventBlock = true;
      var initial_scroll = 0;

      $viewport.on('scroll', scrollHandler);

      function scrollHandler(e) {
        if (!scrollEventBlock) {
          initial_scroll = $viewport[0].scrollTop;
          scrollEventBlock = true;
          $timeout(function () {
            if ($viewport[0].scrollTop < initial_scroll) {
              var minMonth = moment(ctrl.currentMonth).subtract(ctrl.updateMonthIndex, 'months');
              if (0 <= getMonthElementTop(minMonth)) {
                var list = ctrl.getMonthsList(minMonth);
                var offset = 0;

                scope.$apply(function () {
                  ctrl.currentMonth = minMonth;
                  ctrl.months = list;
                });

                $timeout(function () {
                  for (var i = 0; i < ctrl.updateMonthIndex; i++) {
                    offset += getMonthElementHeight(list[i]);
                  }
                  $viewport[0].scrollTop += offset;
                }, 0, false);
              }
            } else {
              var maxMonth = moment(ctrl.currentMonth).add(ctrl.updateMonthIndex, 'months');

              if (getMonthElementTop(maxMonth) < 0) {
                var offset = 0;

                scope.$apply(function () {
                  ctrl.currentMonth = maxMonth;
                  ctrl.months = ctrl.getMonthsList(ctrl.currentMonth);
                });

                $timeout(function () {
                  for (var i = 0; i < ctrl.updateMonthIndex; i++) {
                    offset += getMonthElementHeight(ctrl.months[ctrl.months.length - i - 1]);
                  }
                  $viewport[0].scrollTop -= offset;
                }, 0, false);
              }
            }
            scrollEventBlock = false;
          }, 350, false);
        }
      }

      scope.$watch(function () {
        return ctrl.date;
      }, function (val) {
        var month = moment(val).startOf('month') || moment().startOf('month');
        ctrl.currentMonth = month;
        ctrl.months = ctrl.getMonthsList(month);
        $timeout(function () {
          $viewport[0].scrollTop = 0;
          $viewport[0].scrollTop = getMonthElementTop(month);
        }, 0, false);
        scrollEventBlock = false;
      });
    }
  };
}]);
'use strict';

angular.module('niceandsimpleDatepicker').directive('niceandsimpleDatepickerMonth', ["moment", function (moment) {
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
    controller: function controller() {},
    link: function link(scope, element, attrs, ctrl) {

      var firstDay = 1;
      var selectedDate = null;

      function getDays(currentDate) {
        currentDate = currentDate || moment();

        var days = {
          list: [],
          firstDayOffset: 0
        };
        var daysInMonth = currentDate.daysInMonth();
        var dayOfWeek = moment(currentDate).date(1).day();

        if (firstDay == 1) {
          dayOfWeek = dayOfWeek > 0 ? dayOfWeek - 1 : 6;
        }

        for (var i = 0; i < daysInMonth; i++) {
          var date = moment(currentDate).date(i + 1);
          var day = date.day();
          if (firstDay == 1) {
            day = day > 0 ? day - 1 : 6;
          }

          days.list.push({
            value: date,
            isToday: moment().isSame(date, 'day'),
            isSelected: selectedDate ? selectedDate.isSame(date, 'day') : false,
            isWeekend: day > 4 ? true : false
          });

          if (i == 0 && dayOfWeek > 0) {
            days.firstDayOffset = dayOfWeek;
          }
        }

        return days;
      }

      scope.$watch(function () {
        return ctrl.date;
      }, function (val, oldVal) {
        scope.days = getDays(moment(val));
      });

      scope.$watch(function () {
        return ctrl.selectedDate;
      }, function (val, oldVal) {
        selectedDate = moment(val);
      });
    }
  };
}]);
'use strict';

angular.module('niceandsimpleDatepicker').directive('niceandsimpleDatepicker', ["moment", function (moment) {
  return {
    restrict: 'E',

    templateUrl: '/src/niceandsimpleDatepicker/directives/datepicker/template.html',

    require: 'ngModel',

    link: function link(scope, element, attrs, ngModelCtrl) {
      scope.$watch(function () {
        return ngModelCtrl.$modelValue;
      }, function (value, oldValue) {
        scope.date = value;
      });

      scope.$watch('date', function (value, oldValue) {
        if (value != oldValue) {
          ngModelCtrl.$setViewValue = value;
          ngModelCtrl.$render();
        }
      });
    }
  };
}]);
'use strict';

angular.module('niceandsimpleDatepicker').directive('datepickerControls', function () {
  return {};
});
angular.module("componentsTemplates", []).run(["$templateCache", function($templateCache) {$templateCache.put("/src/niceandsimpleDatepicker/directives/controls/template.html","");
$templateCache.put("/src/niceandsimpleDatepicker/directives/datepicker/template.html","<input ng-model=\"date\"/><niceandsimple-datepicker-scroll date=\"date\"></niceandsimple-datepicker-scroll>");
$templateCache.put("/src/niceandsimpleDatepicker/directives/month/template.html","<div ng-class=\"days.firstDayOffset ? \'day-start-offset-\' + days.firstDayOffset : \'\'\" class=\"month-label\">{{ datepickerMonthCtrl.date.format(\"MMMM\'YY\") }}</div><div ng-repeat=\"day in days.list track by $index\" ng-class=\"{\'is-today\': day.isToday, \'is-disabled\': day.isDisabled, \'is-weekend\': day.isWeekend, \'is-selected\': day.isSelected}\" ng-click=\"datepickerMonthCtrl.selectDate({date: +day.value})\" class=\"day\"><span class=\"day-label\">{{ day.value.format(\'D\') }}</span></div>");
$templateCache.put("/src/niceandsimpleDatepicker/directives/scroll/template.html","<div class=\"viewport\"><div class=\"months-list\"><div ng-repeat=\"month in datepickerScrollCtrl.months track by $index | limitTo:datepickerScrollCtrl.monthListLength\" id=\"datepicker-month-{{ month.format(\'MM-YYYY\') }}\" class=\"month-item\"><niceandsimple-datepicker-month date=\"month\" select-date=\"datepickerScrollCtrl.selectDate(date)\" selected-date=\"datepickerScrollCtrl.date\"></niceandsimple-datepicker-month></div></div></div>");}]);
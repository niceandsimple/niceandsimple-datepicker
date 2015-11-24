angular.module('niceandsimpleDatepicker').directive('niceandsimpleDatepicker', function (moment) {
  return {
    restrict: 'E',

    templateUrl: '/src/niceandsimpleDatepicker/directives/datepicker/template.html',

    require: 'ngModel',

    link: function (scope, element, attrs, ngModelCtrl) {
      scope.$watch(function () {
        return ngModelCtrl.$modelValue
      }, function (value, oldValue) {
        scope.date = value
      })

      scope.$watch('date', function (value, oldValue) {
        if(value != oldValue) {
          ngModelCtrl.$setViewValue = value
          ngModelCtrl.$render()
        }
      })
    }
  }
})

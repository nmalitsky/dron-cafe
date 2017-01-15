'use strict';

angular.module('myApp.viewCook', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/viewCook', {
    templateUrl: 'viewCook/viewCook.html'
  });
}])

    .controller('ViewCookCtrl', ['$scope', '$http', '$timeout', function ($scope, $http, $timeout) {
        $(document).ready(function () {
            $('ul.tabs').tabs();
        });

        let vm = this;
        vm.orders = [];
        vm.uid = 1;
        vm.account = 50;

        vm.showOrders = function () {
            let params = {
                user: vm.uid
            };

            $http.get('/api/orders', params)
                .then(function successCallback(response) { // response status code between 200 and 299
                    let status = response.status;
                    console.log("/api/menu, response.status: " + response.status);
                    vm.orders = response.data;
		    $timeout(vm.showOrders, 1000);
                }, function errorCallback(response) {
                    console.log("/api/orders, error.status: " + response.status);
                });
        }
        vm.showOrders();


}]);
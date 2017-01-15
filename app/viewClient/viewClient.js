'use strict';

angular.module('myApp.viewClient', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/viewClient', {
            templateUrl: 'viewClient/viewClient.html'
        });
    }])

    .controller('ViewClientCtrl', ['$scope', '$http', '$timeout', '$location', function ($scope, $http, $timeout, $location) {
        if(sessionStorage.getItem('client') == null) {
            Materialize.toast('Попытка входа без авторизации', 3000, 'rounded')
            $location.path('/viewLogin')
        }

        $(document).ready(function () {
            $('ul.tabs').tabs();
        });

        let vm = this;
        vm.client = JSON.parse(sessionStorage.getItem('client'));

        vm.dishes = [];
        vm.orders = [];

        vm.loadMenu = function () {
            let params = {};

            $http.get('/api/dishes', params)
                .then(function successCallback(response) { // response status code between 200 and 299
                    vm.dishes = response.data;
                    let status = response.status;
                    console.log("/api/menu, response.status: " + response.status);
                    console.log(vm.dishes)
                }, function errorCallback(response) {
                    console.log("/api/menu, error.status: " + response.status);
                });
        }
        vm.loadMenu();

        vm.addAccount = function (account) {
            vm.account += account;

            let params = {
                name: vm.client.name,
                email: vm.client.email,
                account: vm.client.account + account
            };

            $http.put('/api/client', params)
                .then(function successCallback(response) { // response status code between 200 and 299
                    let status = response.status;
                    console.log("/api/menu, response.status: " + response.status);
                    vm.client.account += account;
                }, function errorCallback(response) {
                    Materialize.toast('Ошибка добавления денег на счет', 3000, 'rounded')
                    console.log("/api/orders, error.status: " + response.status);
                });
        }

        vm.doOrder = function (dish) {
            let params = {
                id: new Date().getTime(),
                client: vm.client.email,
                dish: dish.title
            };

            $http.post('/api/orders', params)
                .then(function successCallback(response) { // response status code between 200 and 299
                    let status = response.status;
                    console.log("/api/menu, response.status: " + response.status);
                    console.log(response.data)
                    vm.client.account -= dish.price;
                }, function errorCallback(response) {
                    Materialize.toast('Ошибка создания заказа', 3000, 'rounded')
                    console.log("/api/orders, error.status: " + response.status);
                });
        }

        vm.showOrders = function () {
            let params = {
                client: vm.client.email
            };

            $http.get('/api/orders', params)
                .then(function successCallback(response) { // response status code between 200 and 299
                    let status = response.status;
                    console.log("/api/menu, response.status: " + response.status);
                    vm.orders = response.data;
		    $timeout(vm.showOrders, 1000);
                }, function errorCallback(response) {
                    Materialize.toast('Ошибка получения списка заказов', 3000, 'rounded')
                    console.log("/api/orders, error.status: " + response.status);
                });
        }
        vm.showOrders();
    }]);
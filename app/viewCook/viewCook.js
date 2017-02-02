'use strict';

angular.module('myApp.viewCook', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/viewCook', {
            templateUrl: 'viewCook/viewCook.html'
        });
    }])

    .controller('ViewCookCtrl', ['$scope', '$http', '$timeout', function ($scope, $http, $timeout) {
        $(document).ready(function () {
            $('ul.tabs').tabs();
        });

        let vm = this;
        vm.orders = {
            ordered: [],
            prepared: {}
        };

        //--- TIMER for 'prepared' ...
        vm.preparedTimer = {};
        let timer;
        let stopTimer = function() {
            $timeout.cancel(timer);
            timer = null;
        };
        let startTimer = function() {
            if (timer === null || timer === undefined) {
                updateTimer();
            }
        };
        let updateTimer = function() {
            for(let i = 0; i < vm.orders['prepared'].length; i++) {
                let order = vm.orders['prepared'][i];
                vm.preparedTimer[order._id] = Math.round((new Date().getTime() - Number(order.preparedTime)) / 1000);
            }

            console.log(vm.preparedTimer)

            timer = $timeout(updateTimer, 1000);
        };
        //--- ... TIMER for 'prepared'


        vm.getOrdersByStatus = function (status) {
            let params = {
                status: status
            };

            $http({
                url: '/api/orders',
                method: "GET",
                params: params
            }).then(function successCallback(response) { // response status code between 200 and 299
                console.log('/api/orders, response.status: ' + response.status);
                vm.orders[status] = response.data;

                if(status == 'prepared') {
                    // start or stop timer for 'prepared'
                    if(vm.orders['prepared'].length > 0) startTimer();
                    else stopTimer();
                }

            }, function errorCallback(response) {
                console.log("/api/orders, error.status: " + response.status);
            });
        };

        vm.getOrdersByStatus('ordered');
        vm.getOrdersByStatus('prepared');

        let host = window.document.location.host.replace(/:.*/, '');
        let ws = new WebSocket('ws://' + host + ':8080');
        ws.onmessage = function (event) {
            let data = JSON.parse(event.data);

            if (data.event == 'update_orders_cook_ordered') {
                vm.getOrdersByStatus('ordered');
            }

            if (data.event == 'update_orders_cook_prepared') {
                vm.getOrdersByStatus('prepared');
            }
        };

        vm.setOrderStatus = function (order_id, status) {
            let params = {
                status: status
            };
            if(status == 'prepared') params['preparedTime'] = new Date().getTime();

            $http.put('/api/orders/' + order_id, params)
                .then(function successCallback(response) { // response status code between 200 and 299
                    console.log("/api/orders/" + order_id + ", response.status: " + response.status);
                }, function errorCallback(response) {
                    console.log("/api/orders, error.status: " + response.status);
                    Materialize.toast('Ошибка изменения статуса заказа', 3000, 'rounded');
                });
        };

    }]);
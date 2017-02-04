'use strict';

angular.module('myApp.viewClient', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/viewClient', {
            templateUrl: 'viewClient/viewClient.html'
        });
    }])

    .controller('ViewClientCtrl', ['$scope', '$http', '$timeout', '$location', '$sce', function ($scope, $http, $timeout, $location, $sce) {
        if (sessionStorage.getItem('client_id') == null) {
            Materialize.toast('Требуется авторизация', 3000, 'rounded');
            $location.path('/viewLogin');
            return;
        }

        $(document).ready(function () {
            $('ul.tabs').tabs();
            $('.tooltipped').tooltip({delay: 50});
        });

        let vm = this;
        let client_id = sessionStorage.getItem('client_id');

        vm.dishes = [];
        vm.orders = [];

        //--- TIMER for 'ordered' ...
        vm.orderedTimer = {};
        let timer;
        let stopTimer = function() {
            console.log("stop startTimer");
            $timeout.cancel(timer);
            timer = null;
        };
        let startTimer = function() {
            console.log("start startTimer");
            if (timer === null || timer === undefined) {
                updateTimer();
            }
        };
        let updateTimer = function() {
            console.log('Call updateTimer()...')
            for(let i = 0; i < vm.orders.length; i++) {
                let order = vm.orders[i];
                vm.orderedTimer[order._id] = Math.round((new Date().getTime() - Number(order.orderedTime)) / 1000);
            }
            timer = $timeout(updateTimer, 1000);
        };
        //--- ... TIMER for 'ordered'

        vm.orderStatus = {
            "ordered": "Заказано",
            "prepared": "Готовится",
            "delivered": "Доставляется...",
            "broken": "Возникли сложности",
            "completed": "Подано"
        };

        vm.doLogout = function () {
            sessionStorage.removeItem('client_id');
            $location.path("/viewLogin");
        };

        vm.getClient = function () {
            $http.get('/api/clients/' + client_id)
                .then(function successCallback(response) { // response status code between 200 and 299
                    let status = response.status;
                    console.log("GET /api/clients, response.status: " + response.status);
                    vm.client = response.data;

                    // load client data (orders)
                    vm.getClientOrders();

                }, function errorCallback(response) {
                    console.log("GET /api/clients, error.status: " + response.status);
                    Materialize.toast('Ошибка входа', 3000, 'rounded');
                    $location.path("/viewLogin");
                });
        };
        vm.getClient();

        vm.loadMenu = function () {
            let params = {};

            $http.get('/api/dishes', params)
                .then(function successCallback(response) { // response status code between 200 and 299
                    vm.dishes = response.data;
                    let status = response.status;
                    console.log("GET /api/dishes, response.status: " + response.status);
                    console.log(vm.dishes)
                }, function errorCallback(response) {
                    Materialize.toast('Ошибка загрузки блюд меню', 3000, 'rounded');
                    console.log("GET /api/dishes, error.status: " + response.status);
                });
        };
        vm.loadMenu();

        vm.addAccountBalance = function (account) {
            let params = {
                name: vm.client.name,
                email: vm.client.email,
                account: Number(vm.client.account) + account
            };

            $http.put('/api/clients/' + client_id, params)
                .then(function successCallback(response) { // response status code between 200 and 299
                    console.log("/api/menu, response.status: " + response.status);
                    vm.client = response.data;
                    Materialize.toast('Баланс: ' + vm.client.account, 3000, 'rounded');
                }, function errorCallback(response) {
                    Materialize.toast('Ошибка добавления денег на счет', 3000, 'rounded');
                    console.log("/api/orders, error.status: " + response.status);
                });
        };

        vm.doOrder = function (dish) {
            let params = {
                orderedTime: new Date().getTime(),
                client_name: vm.client.name,
                client_email: vm.client.email,
                price: dish.price,
                dish: dish
            };

            $http.post('/api/orders', params)
                .then(function successCallback(response) { // response status code between 200 and 299
                    console.log("POST /api/orders, response.status: " + response.status);
                    console.log(response.data);
                    vm.addAccountBalance(-Number(dish.price)); // save account in DB
                    Materialize.toast('Заказно блюдо: ' + dish.title, 3000, 'rounded');
                }, function errorCallback(response) {
                    Materialize.toast('Ошибка создания заказа', 3000, 'rounded');
                    console.log("POST /api/orders, error.status: " + response.status);
                });
        };

        vm.deleteOrder = function(order) {
            $http.delete('/api/orders/' + order._id)
                .then(function successCallback(response) { // response status code between 200 and 299
                    console.log("DELETE /api/orders, response.status: " + response.status);
                    vm.addAccountBalance(Number(order.price)); // save account in DB
                    vm.getClientOrders();
                    Materialize.toast('Заказ отменен', 3000, 'rounded');
                }, function errorCallback(response) {
                    Materialize.toast('Ошибка отмены заказа', 3000, 'rounded');
                    console.log("DELETE /api/orders, error.status: " + response.status);
                });
        };

        vm.doReOrder = function(order, discount) {

            let discount_price = Math.round(Number(order.price) * (100 - discount)/100);

            let params = {
                orderedTime: new Date().getTime(),
                preparedTime: null,
                status: "ordered",
                price: discount_price
            };

            $http.put('/api/orders/' + order._id, params)
                .then(function successCallback(response) { // response status code between 200 and 299
                    console.log("PUT /api/orders, response.status: " + response.status);
                    vm.addAccountBalance(Number(order.price) - Number(discount_price)); // save account in DB and reload orders
                    vm.getClientOrders();
                    Materialize.toast('Заказ подан повторно со скидкой ' + discount + "%", 3000, 'rounded');
                }, function errorCallback(response) {
                    Materialize.toast('Ошибка подачи заказа', 3000, 'rounded');
                    console.log("PUT /api/orders, error.status: " + response.status);
                });
        };

        vm.getClientOrders = function () {
            let params = {
                client_email: vm.client.email
            };

            $http({
                url: '/api/orders',
                method: "GET",
                params: params
            }).then(function successCallback(response) { // response status code between 200 and 299
                console.log("GET /api/orders, response.status: " + response.status);
                vm.orders = response.data;

                // start or stop timer for 'ordered'
                if(vm.orders.length > 0) startTimer();
                else stopTimer();

            }, function errorCallback(response) {
                Materialize.toast('Ошибка получения списка заказов', 3000, 'rounded');
                console.log("GET /api/orders, error.status: " + response.status);
            });
        };

        // listen notifictions
        let host = window.document.location.host.replace(/:.*/, '');
        let ws = new WebSocket('ws://' + host + ':8080');
        ws.onmessage = function (event) {
            let data = JSON.parse(event.data);
            if (data.event == 'update_orders_client_' + vm.client.email) {
                vm.getClientOrders();
            }
            if (data.event == 'update_client_' + vm.client.email) {
                vm.getClient(); // include call vm.getClientOrders();
            }
        };
    }]);
'use strict';

angular.module('myApp.viewLogin', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/viewLogin', {
    templateUrl: 'viewLogin/viewLogin.html'
  });
}])

    .controller('ViewLoginCtrl', ['$scope', '$http', '$location', function ($scope, $http, $location) {
        let vm = this;
	    vm.name = "";
	    vm.email = "";

        vm.doLogin = function () {
            if(vm.email == "") {
                Materialize.toast('Email не может быть пустым', 2000, 'rounded');
                return;
            }
            $http.get('/api/clients?email=' + vm.email)
                .then(function successCallback(response) { // response status code between 200 and 299
                    let status = response.status;
                    console.log("GET /api/clients, response.status: " + response.status);
                    let clients = response.data;
		            if(clients.length == 0) {
                        addClient();
                    } else {
                        let client = clients[0];
                        sessionStorage.setItem('client_id', client._id);
                        $location.path("/viewClient");
                    }
                }, function errorCallback(response) {
                    console.log("GET /api/clients, error.status: " + response.status);
                    Materialize.toast('Ошибка входа', 3000, 'rounded');
                });
        };

        function addClient() {
            let params = {
                name: vm.name,
                email: vm.email,
                account: 100
            };
            $http.post('/api/clients', params)
                .then(function successCallback(response) { // response status code between 200 and 299
                    let status = response.status;
                    console.log("POST /api/clients, response.status: " + response.status);
                    let client = response.data;
                    sessionStorage.setItem('client_id', client._id);
                    $location.path("/viewClient");
                }, function errorCallback(response) {
                    Materialize.toast('Ошибка регистрации пользователя', 3000, 'rounded')
                });
        }

}]);
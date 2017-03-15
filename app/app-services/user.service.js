(function () {
    'use strict';

    angular
        .module('app')
        .factory('UserService', Service);

    function Service($http, $q) {
        var service = {};
		
		service.GetLayoutJSON = GetLayoutJSON;
		
		service.GetNotifications = GetNotifications;
		service.CreateTrip = CreateTrip;
		service.DeleteTrip = DeleteTrip;
		service.GetAllTrips = GetAllTrips;
		service.GetTrip = GetTrip;
		service.UpdateTrip = UpdateTrip;

        service.GetCurrent = GetCurrent;
        service.GetAll = GetAll;
        service.GetById = GetById;
        service.GetByUsername = GetByUsername;
        service.Create = Create;
        service.Update = Update;
        service.Delete = Delete;

        return service;
		
		function GetLayoutJSON(layoutName){
			return $http.get('config/' + layoutName + '.json');
		}
		
		function GetNotifications(username){
			return $http.get('/api/notifications/'+ username).then(handleSuccess, handleError);
		}
		
        function GetTrip(username, _id) {
            return $http.get('/api/trips/'+ username + '/' + _id).then(handleSuccess, handleError);
        }

        function GetAllTrips(username) {
			if(username){
				console.log("GetAllTrips username", username);				
				return $http.get('/api/trips/' + username).then(handleSuccess, handleError);
			}
			else{
				console.log("GetAllTrips", username);								
				return $http.get('/api/trips/').then(handleSuccess, handleError);
			}
        }
		
        function DeleteTrip(_id) {
			console.log($http.delete);
            return $http.delete('/api/trips/' + _id).then(handleSuccess, handleError);
        }
		
        function CreateTrip(trip) {
			trip.createdOn = new Date();
            return $http.post('/api/trips/create', trip).then(handleSuccess, handleError);
        }
		
        function UpdateTrip(trip) {
			console.log("Update", trip);
			trip.lastChangedOn = new Date();
            return $http.put('/api/trips/' + trip._id, trip).then(handleSuccess, handleError);
        }
		
        function GetCurrent() {
            return $http.get('/api/users/current').then(handleSuccess, handleError);
        }

        function GetAll() {
            return $http.get('/api/users').then(handleSuccess, handleError);
        }

        function GetById(_id) {
            return $http.get('/api/users/' + _id).then(handleSuccess, handleError);
        }

        function GetByUsername(username) {
            return $http.get('/api/users/' + username).then(handleSuccess, handleError);
        }

        function Create(user) {
            return $http.post('/api/users', user).then(handleSuccess, handleError);
        }

        function Update(user) {
            return $http.put('/api/users/' + user._id, user).then(handleSuccess, handleError);
        }

        function Delete(_id) {
            return $http.delete('/api/users/' + _id).then(handleSuccess, handleError);
        }

        // private functions

        function handleSuccess(res) {
            return res.data;
        }

        function handleError(res) {
            return $q.reject(res.data);
        }
    }

})();

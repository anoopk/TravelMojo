(function () {
    'use strict';

    angular
        .module('app')
        .factory('TripService', Service);

    function Service($http, $q) {
        var service = {};

        service.GetCurrent = GetCurrent;
        service.GetAll = GetAll;
        service.GetById = GetById;
        service.GetByTripname = GetByTripname;
        service.Create = Create;
        service.Update = Update;
        service.Delete = Delete;

        return service;

        function GetCurrent() {
            return $http.get('/api/trips/current').then(handleSuccess, handleError);
        }

        function GetAll() {
            return $http.get('/api/trips').then(handleSuccess, handleError);
        }

        function GetTrip(username, _id) {
            return $http.get('/api/trips/'+ username + '/' + _id).then(handleSuccess, handleError);
        }
		
        function GetById(_id) {
            return $http.get('/api/trips/' + _id).then(handleSuccess, handleError);
        }

        function GetByTripname(tripname) {
            return $http.get('/api/trips/' + tripname).then(handleSuccess, handleError);
        }

        function Create(trip) {
			console.log(trip);
            return $http.post('/api/trips', trip).then(handleSuccess, handleError);
        }

        function Update(trip) {
            return $http.put('/api/trips/' + trip._id, trip).then(handleSuccess, handleError);
        }

        function Delete(_id) {
            return $http.delete('/api/trips/' + _id).then(handleSuccess, handleError);
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

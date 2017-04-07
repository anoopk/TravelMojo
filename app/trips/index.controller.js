(function () {
    'use strict';
    angular
        .module('app')
		.controller('listController', function listController ($scope, $timeout, UserService){			
			$scope.loadNotificationFilters = function() {
				// Use timeout to simulate a 650ms request.
				return $timeout(function() {
				  $scope.notificationFilters =  $scope.notificationFilters  || [
					{ id: 0, name: 'All' },
					{ id: 1, name: 'Trip' }
				  ];
				}, 650);
			};			
		})                 		
		.controller('CarouselDemoCtrl', function ($scope, $filter, UserService, FlashService, $rootScope) {
			var vm = $scope;
			$scope.lastActive = 0;
			$scope.text=null;
			$scope.active = null;
			$scope.noWrapSlides = false;
			$scope.slideInterval = 5000;					
			UserService.GetCurrent().then(function (user) {				
				vm.user = user;
				vm.superadmin = (user.role == 'superadmin') ? true : false;
				vm.retailer = (user.role == 'superadmin' || user.role == 'retailer') ? true : false ;								
			});
						
			$scope.$watch(function () {
				if($scope.lastActive != $scope.active){
					$scope.editableSlide = false;
					$scope.lastActive = $scope.active;
					if($scope.slides && $scope.slides[$scope.active] && $scope.slides[$scope.active].userName == vm.user.username){
							$scope.editableSlide = true;
					}
					if($scope.slides && $scope.slides[$scope.active]){
						$scope.count[0] = $scope.lastActive;
						$scope.notifications = $scope.slides[$scope.active].notifications;
						$scope.notificationCount = $scope.notifications.length;
					}
				}
			});
						
			$scope.mouseleave = function(){
				$scope.slideInterval = 5000;
				$scope.showButtons = false;
			}

			$scope.mouseenter = function(){
				$scope.slideInterval = -1;
				$scope.showButtons = true;
			}
		})	
		.controller('Trips.IndexController', Controller);

		function Controller($window, UserService, FlashService, $scope, $mdDialog, $state, $stateParams, $filter, $rootScope) {
			var vm = this;
			$scope.slides = [];								
			$scope.trips = {};		
			$scope.createNewFlag = false;				
			$scope.notifications = null;
			$scope.showButtons = false;			
			$scope.count = [];
			$scope.noTripsHosted = false;
			$scope.myTrips = false;

			initController();
			function initController() {
				UserService.GetCurrent().then(function (user) {				
					vm.user = user;				
					if($stateParams.filter == false){
						UserService.GetNotifications(vm.user.username).then(function(data){								
							$scope.notifications = data;
						});					
					}
					vm.superadmin = (user.role == 'superadmin') ? true : false ;
					vm.retailer = (user.role == 'superadmin' || user.role == 'retailer') ? true : false ;								
					$scope.prepareCarousel();
				});
			}

			$scope.prepareCarousel = function(){
				UserService.GetAllTrips().then(function(data){								
					if($scope.myTrips){
						data = data.filter(function(tripData){
							console.log(tripData.userName, vm.user.username);
							return tripData.userName == vm.user.username;
						});
					}
					$scope.trips = [];
					$scope.slides = [];
					$scope.trips = data;				
					for (var i = 0; i < data.length; i++) {
						data[i].id = i;
						$scope.slides.push(data[i]);					
					}
					if($scope.slides.length == 0){
						$scope.noTripsHosted = true;
					}
				});									
			}
					
			$scope.toggleStatus = function(statusName, trip){
				if(trip[statusName]){
					trip[statusName] = !trip[statusName];
				}
				else{ 
					trip[statusName] = true;
				}
				UserService.UpdateTrip(trip, true).then(function () {
					FlashService.Success('The trip has been updated.');
				})
					.catch(function (error) {
						FlashService.Error(error);
				});			
			}
			
			$scope.actionInitiated = function(actionName, slide){
				if(actionName == 'clone'){
					$scope.clone(slide);				
				}
				if(actionName == 'edit'){
					$scope.edit(slide);				
				}				
			}							
								
			$scope.upVote = function(slide){
				if(slide.voters === undefined){
					slide.voters = [];					
				}			
				slide.voters.push(vm.user.username);				
				
				if(slide.votes === undefined){
					slide.votes = 0;
				}
				slide.votes++;				
				UserService.UpdateTrip(slide);				
			}
			
			$scope.hasAVote = function(trip){
				if (_.contains(trip.voters, vm.user.username)){
					return false;
				}				
				if (trip.userName == vm.user.username){
					return false;
				}
				return true;
			}
			
			$scope.showTripDetails = function(trip){
				$state.go('tripDetailsStatic', {tripId : trip._id});
			}
			
			$scope.clone = function(trip){
				$scope.trip.createdOn = new Date();			
				UserService.CreateTrip($scope.trip);
				UserService.GetAllTrips().then(function(data){
					vm.myData = data;				
				});
			}			

			$scope.filterTrips = function(trip){			
				$scope.showButtons = false;
				$scope.noTripsHosted = false;				
				$scope.myTrips = !$scope.myTrips;
				$scope.prepareCarousel();
			}			
			
			$scope.edit = function(trip){
				console.log(trip);
				$state.go('tripDetails', {tripId : trip._id});
			}
			
			$scope.create = function(){
				vm.trip = {};
				vm.trip.image = 'https://unsplash.it/900/510';
				vm.trip.username = vm.user.username;
				vm.trip.userid = vm.user._id;			
				vm.trip.createdOn = new Date();
				$state.go("tripDetails");				
			}			

			$scope.save = function(){
				if(vm.trip._id){
					UserService.UpdateTrip(vm.trip);
				}
				else{
					UserService.CreateTrip(vm.trip);
				}
				UserService.GetAllTrips().then(function(data){
					vm.myData = data;				
				});			
				$scope.createNewFlag = false;
			}			

			$scope.delete = function(slide){
				UserService.DeleteTrip(slide.id);
				UserService.GetAllTrips().then(function(data){
					vm.myData = data;				
				});
			}			
	
			$scope.getNotifications = function(){
				var index = $scope.count[0];
				$scope.notifications = $scope.slides[index].notifications;
				return $scope.notifications;
			}
	
			$scope.cancelChanges = function(){
				$scope.createNewFlag = false;
			}
	
			function save() {
					$scope.createNewFlag = true;
			}	
		}
})();
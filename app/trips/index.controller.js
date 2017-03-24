﻿(function () {
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
				if(false == $scope.showNotifications){
					$scope.slideInterval = 5000;
					$scope.showButtons = false;
				}
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
			initController();
			$scope.showNotifications = false;
			$scope.createNewFlag = false;				
			$scope.activeSlide = null;
			$scope.notifications = null;
			$scope.user = null;			
			$scope.showButtons = false;			
			$scope.count = [];
			$scope.allNotifications	= null;		
			$scope.selectedItem = 'All';
			$scope.filter = {};
			$scope.noTripsHosted = false;
			$scope.myTrips = true;
			
			function initController() {
				$rootScope.filters = {};
				$scope.notificationStartIndex = 0;				
				UserService.GetCurrent().then(function (user) {				
					vm.user = user;				
					if($stateParams.filter == false){
						UserService.GetNotifications(vm.user.username).then(function(data){								
							$scope.allNotifications = data;										
							$scope.notifications = data;
							$scope.showNotifications = true;														
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
				if(actionName == 'shownotifications'){
					$scope.activeSlide = slide;
					$scope.notifications = slide.notifications;
					$scope.showNotifications = true;
					$scope.selectedItem = 'Trip';
					
					if($scope.notifications.length){
						$scope.showAdvanced(slide);			
					}
				}				
			}							
						
			$scope.showAdvanced = function(ev) {
				$mdDialog.show({
					//controller: DialogController,
					modal:false,
					templateUrl: 'trips/notifications.tmpl.html',
					parent: angular.element(document.body),				
					targetEvent: ev,
					scope:$scope,
					clickOutsideToClose:true,
					fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
					})
					.then(function(answer) {
						$scope.showNotifications = false;
						$scope.slideInterval = 5000;										
						$scope.showButtons = false;
						}, function() {
							$scope.slideInterval = 5000;											
							$scope.showNotifications = false;
					});
				};		
		
			$scope.showTripDetails = function(){
				$scope.edit($scope.activeSlide);
			}		
			
			$scope.showTripDetails = function(trip){
				$state.go('tripDetails', {tripId : trip._id});
			}
			
			$scope.clone = function(trip){
				trip.createdOn = new Date();			
				UserService.CreateTrip(trip);
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
	
			$scope.notificationsVisible = false;
			$scope.notificationIcon = true;
			
			function attachNotificationsList(){
				document.getElementById('notificationListStart').innerHTML = "";				
				for(var i = 0; i < $scope.notifications.length; i++){
					var trip = $scope.notifications[i].tripName;
					var text = $scope.notifications[i].text;
					var date = $scope.notifications[i].date;
					var content = '<md-list-item style="width: 400px; margin: 0 auto; padding:4px" class="md-3-line contact-item">\n' + 
								'<img ng-src="http://lorempixel.com/50/50/people/?1/" class="md-avatar"/>\n' +
								'<div class="md-list-item-text compact" layout="column">\n' + 
								'<div>\n' + 
								'<a href="#">\n' + 
								'<i style="padding-left: 1px;" style="float:left" class="fa fa-envelope-square fa-x text-success"></i>\n' + 
								'</a>\n' + 
								'<a ng-show=(notification.unread) href="#">\n' + 
								'<i style="padding-left: 2px;" style="float:left" class="fa fa-check-square fa-x text-danger"></i>\n' + 
								'</a>\n' + 								
								'<span ng-click="showTripDetails()" style="float:left" class="label label-primary">'+ trip + '</span>\n' + 
								'</div>\n' + 
								'<p><small style="float:left" >' + text + '</small></p>\n' + 
								'<p><small style="float:left" >' + date + '</small></p>\n' + 		
								'</div>\n' + 
								'<md-divider style="width: 100%;" ng-if="!$last"></md-divider>\n' + 			
							'</md-list-item>\n';														
							document.getElementById('notificationListStart').innerHTML += content;											
				}
				//console.log("After >>>> ", document.getElementById('notificationListStart').innerHTML);															
			}
			
			$scope.toggleNotifications = function(slide){
				console.log("toggle ----------");
				$scope.slideInterval = $scope.notificationsVisible ? -1 : 5000 ;				
				$scope.activeSlide = slide;
				$scope.notifications = slide.notifications;
				
				attachNotificationsList();
				$scope.notificationsVisible = !$scope.notificationsVisible;
				$scope.notificationIcon = !$scope.notificationIcon
			}
					
			$scope.move = function(direction){
				if(direction=='prev'){
					if($scope.notificationStartIndex > 0 ){
						$scope.notificationStartIndex--;
					}
				}
				if(direction=='next'){
					if($scope.notificationStartIndex < $scope.getNotifications().length - 2){
						$scope.notificationStartIndex++;
					}
				}				
				console.log("Move", $scope.getNotifications()[$scope.notificationStartIndex], direction, $scope.notificationStartIndex);				
			}			
			
			function save() {
					$scope.createNewFlag = true;
			}	
		}
})();
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
			var items = [
				{ Id:  1, Client: 'Client 01', Code: 'AAAAA', Enabled: false, Sport: 'Football',   Country: 'Japan'          },
				{ Id:  2, Client: 'Client 02', Code: 'BBBBB', Enabled: true,  Sport: 'Basketball', Country: 'United Kingdom' },
				{ Id:  3, Client: 'Client 03', Code: 'CCCCC', Enabled: false, Sport: 'Running',    Country: 'France'         },
				{ Id:  4, Client: 'Client 04', Code: 'DDDDD', Enabled: false, Sport: 'Climbing',   Country: 'France'         },
				{ Id:  5, Client: null,        Code: 'FFFFF', Enabled: false, Sport: 'Football',   Country: 'France'         },
				{ Id:  6, Client: 'Client 06', Code: 'CCCCC', Enabled: true,  Sport: 'Basketball', Country: 'Russia'         },
				{ Id:  7, Client: 'Client 07', Code: 'AAAAA', Enabled: false, Sport: 'Running',    Country: 'Germany'        },
				{ Id:  8, Client: 'Client 08', Code: 'CCCCC', Enabled: true,  Sport: 'Football',   Country: 'Germany'        },
				{ Id:  9, Client: 'Client 09', Code: 'BBBBB', Enabled: true,  Sport: 'Football',   Country: ''               },
				{ Id: 10, Client: 'Client 10', Code: 'DDDDD', Enabled: true,  Sport: 'Football',   Country: 'United Kingdom' },
				{ Id: 11, Client: 'Client 11', Code: 'CCCCC', Enabled: true,  Sport: 'Tennis',     Country: 'United Kingdom' },
				{ Id: 12, Client: 'Client 12', Code: 'BBBBB', Enabled: true,  Sport: 'Running',    Country: 'United Kingdom' },
				{ Id: 13, Client: 'Client 13', Code: 'FFFFF', Enabled: false, Sport: 'Basketball', Country: 'Russia'         },
				{ Id: 14, Client: 'Client 14', Code: 'DDDDD', Enabled: false, Sport: 'Tennis',     Country: 'Germany'        },
				{ Id: 15, Client: 'Client 15', Code: 'AAAAA', Enabled: false, Sport: 'Basketball', Country: 'Japan'          }
			];			
			$scope.dataSource = items;					
			$scope.filteredDataSource = $scope.dataSource;					
			$scope.slides = [];
					
			UserService.GetCurrent().then(function (user) {				
				vm.user = user;
				vm.superadmin = (user.role == 'superadmin') ? true : false;
				vm.retailer = (user.role == 'superadmin' || user.role == 'retailer') ? true : false ;								
				$scope.userPersona = vm.user.username;				
				if(vm.superadmin){
					$scope.userPersona = null;
				}			
				UserService.GetAllTrips($scope.userPersona).then(function(data){								
					console.log("$$$$$$$$$$$$$$$$$ ", data);
					$scope.trips = data;				
					for (var i = 0; i < data.length; i++) {
						data[i].id = i;
						$scope.slides.push(data[i]);					
					}
				});
			});

			$scope.$watch(function () {
				if($scope.lastActive != $scope.active){
					$scope.lastActive = $scope.active;
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
					vm.showButtons = false;
				}
			}

			$scope.mouseenter = function(){
				$scope.slideInterval = -1;
				vm.showButtons = true;
			}
		})	
		.controller('Trips.IndexController', Controller);
		function Controller($window, UserService, FlashService, $scope, $mdDialog, $state, $stateParams, $filter, $rootScope) {
			var vm = this;
			$scope.trips = {};		
			initController();
			$scope.showNotifications = false;
			$scope.createNewFlag = false;				
			$scope.slides = [];				
			$scope.activeSlide = null;
			$scope.notifications = null;
			$scope.user = null;			
			$scope.userPersona = null;
			$scope.showButtons = false;			
			$scope.count = [];
			$scope.allNotifications	= null;		
			$scope.selectedItem = 'All';
			$scope.filter = {};
			
			function initController() {
				$rootScope.filters = {};
				$rootScope.filters.cancelled = false;
				$rootScope.filters.published = false;
				if($stateParams.filter == "true"){
					$rootScope.filters = {};
					$rootScope.filters.cancelled = true;
					$rootScope.filters.published = true;
					$rootScope.filters.private = true;
				}
				$scope.notificationStartIndex = 0;				
				UserService.GetCurrent().then(function (user) {				
					vm.user = user;				
					if($stateParams.filter == false){
						console.log("showMessages", $stateParams.showMessages);
						UserService.GetNotifications(vm.user.username).then(function(data){								
							$scope.allNotifications = data;										
							$scope.notifications = data;
							$scope.showNotifications = true;														
						});					
					}
					vm.superadmin = (user.role == 'superadmin') ? true : false ;
					vm.retailer = (user.role == 'superadmin' || user.role == 'retailer') ? true : false ;								
					$scope.userPersona = vm.user.username;				
					if(vm.superadmin){
						$scope.userPersona = null;
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
			
			$scope.clone = function(trip){
				trip.createdOn = new Date();			
				UserService.CreateTrip(trip);
				UserService.GetAllTrips($scope.userPersona).then(function(data){
					vm.myData = data;				
				});			
			}			
			
			$scope.edit = function(trip){
				console.log(trip._id);
				$state.go('tripDetails', {tripId : trip._id});
			}
			
			$scope.create = function(){
				vm.trip = {};
				vm.trip.image = 'https://unsplash.it/900/500';
				vm.trip.username = vm.user.username;
				vm.trip.userid = vm.user._id;			
				vm.trip.createdOn = new Date();
				$state.go("tripDetails");
				
				//$scope.createNewFlag = true;
			}			

			$scope.save = function(){
				if(vm.trip._id){
					UserService.UpdateTrip(vm.trip);
				}
				else{
					UserService.CreateTrip(vm.trip);
				}
				UserService.GetAllTrips($scope.userPersona).then(function(data){
					vm.myData = data;				
				});			
				$scope.createNewFlag = false;
			}			

			$scope.delete = function(slide){
				UserService.DeleteTrip(slide.id);
				UserService.GetAllTrips($scope.userPersona).then(function(data){
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
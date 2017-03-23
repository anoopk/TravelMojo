(function () {
    'use strict';

    angular
        .module('app')
		.directive('detailssheet', function() {
			//define the directive object
			var directive = {};

			//restrict = E, signifies that directive is Element directive
			directive.restrict = 'A';

			//template replaces the complete element with its text. 
			//directive.templateUrl = 'directives/tripDetails.html'			   
			//compile is called during application initialization. AngularJS calls it once when html page is loaded.
			directive.compile = function(element, attributes) {
			  element.css("border", "1px solid #cccccc");		  
			}
			directive.controller = function($scope){
				directive.templateUrl = 'directives/tripDetails.html'			   
			}
			return directive;
		})		
        .controller('TripDetails.IndexController', Controller);

    function Controller($scope, UserService, TripService, $mdDialog, $state, $stateParams, Upload, $timeout) {
        var vm = this;
        vm.user = null;
		var tripSchema = {};
		var now = new Date();
		$scope.items = {};
		$scope.activites = {};				
        initController();	
		$scope.singleDay = {};
		$scope.oneAtATime = true;			
		$scope.notifications = [{name:"Alfreds Futterkiste", date:now, unread:true}, {name:"Berglunds snabbköp", date:now, unread:true}, {name:"Centro comercial Moctezuma", date:now}, {name:"Ernst Handel", date:now, unread:false}];		
		$scope.items = {"description":true, "itinerary":false, "departures":false, "coversations":false};		
		$scope.trip = {};			
		$scope.trip.fileNames = ["adfvdfv","sdfvsadf"];		
		$scope.trip.itinerary = [];				
		$scope.trip.departures = [];				
		$scope.trip.notes = "I do not need any assistance at this point int time.";		
		$scope.trip.length = 0;
        function initController() {	
			$scope.activites = [{id:1, name : 'Suicide Bombing'}, {id:2, name : 'Paragliding'}, {id:3, name : 'Diving'}, {id:4, name : 'Trekking'}];
			$scope.budgets = [{id:1, name : 'Luxury'}, {id:2, name : 'Budget'}, {id:3, name : 'Backpacker'}];
			$scope.difficulties = [{id:1, name : 'Extreme'}, {id:2, name : 'Medium'}, {id:3, name : 'Easy'}];
			$scope.ratings = [{id:1, name : 'Adult'}, {id:2, name : 'U/A'}, {id:3, name : 'Universal'}, {id:4, name : 'PG'}, ];
            // get current user
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
				//Get the latest data for this trip as it might have changed since we got it last.
				if($stateParams.tripId){
					UserService.GetTrip(vm.user.username, $stateParams.tripId).then(function (trip){
						$scope.trip = trip;
					});
				}
            });
        }		
		
		$scope.uploadFiles = function (files) {
			$scope.trip.files = files;
			UserService.UploadFiles(files);
		};
		
		$scope.checkModel = function(){
			//Need to convert all undefined checkboxes into false
			if($scope.trip.public == undefined){
				$scope.trip.public = false;
			}
			if($scope.trip.suggestCost == undefined){
				$scope.trip.suggestCost = false;
			}
			if($scope.trip.showPrice == undefined){
				$scope.trip.showPrice = false;
			}			
			if($scope.trip.tos == undefined){
				$scope.trip.tos = false;
			}						
			if($scope.trip._id){
				console.log("$$$$$$$$$$ ", $scope.trip.budget);
				UserService.UpdateTrip($scope.trip, true).then(function () {
					$state.go("trips");
				});
			}
			else{
				$scope.trip.userName = vm.user.username;
				$scope.trip.userId = vm.user._id;
				$scope.trip.createdOn = new Date();
				$scope.trip.image = "https://unsplash.it/1350/650"
				UserService.CreateTrip($scope.trip);
			}
		}

		$scope.showSimpleToast = function() {
			$mdToast.show(
			$mdToast.simple()
			.textContent('Simple Toast!')
			.hideDelay(3000)
			);
		};	
		
		$scope.addDeparture = function(date){		
			$scope.openDialog = function() {	
				$mdDialog.show({
					parent: angular.element(document.body),
					scope:$scope,
					preserveScope: true,
					clickOutsideToClose:false,
					templateUrl: "tripDetails/singleDeparture.html",
					controller: DialogController
				});
				
				function DialogController($scope, $mdDialog) {
					$scope.closeDialog = function() {
						if(undefined === $scope.trip.departures){
							$scope.trip.departures = [];
						}
						if(undefined === date && $scope.singleDeparture.date){
							$scope.trip.departures.push($scope.singleDeparture);
						}
						$scope.singleDeparture = null;																				
						$mdDialog.hide();
					}
				}		
			}
			$scope.openDialog();
		}
		
		$scope.addDay = function(day){			
			$scope.day = day;		
			if(null == day){
				$scope.singleDay = {};
			}
			$scope.openDialog = function() {	
				$mdDialog.show({
					parent: angular.element(document.body),
					scope:$scope,
					preserveScope: true,
					clickOutsideToClose:false,
					templateUrl: "tripDetails/singleDay.html",
					controller: DialogController
				});
				
				function DialogController($scope, $mdDialog) {
					$scope.closeDialog = function() {
						if(undefined === $scope.trip.itinerary){
							$scope.trip.itinerary = [];
						}
						console.log($scope.day, $scope.trip.itinerary);
						if(undefined === $scope.day && $scope.singleDay.day){
							$scope.trip.itinerary.push($scope.singleDay);
						}
						$mdDialog.hide();
					};
				};				
			}		
			$scope.openDialog();
		}
	
		$scope.editDay = function(day){	
			var itinerary = $scope.trip.itinerary.filter(function(it){
				return it.day == day;
			});	
			$scope.singleDay = 	itinerary[0];
			$scope.addDay(day);			
		}
		
		$scope.cancelDay = function(day){
			$scope.singleDay = null;
			$scope.trip.itinerary = $scope.trip.itinerary.filter(function(it){
				return it.day != day;
			});
		}

		$scope.editDeparture = function(date){	
			var departure = $scope.trip.departures.filter(function(it){
				return it.date == date;
			});	
			$scope.singleDeparture = departure[0];
			var date = new Date($scope.singleDeparture.date);
			$scope.singleDeparture.date = date;
			$scope.addDeparture(date);			
		}
		
		$scope.cancelDeparture = function(date){
			$scope.trip.departures = $scope.trip.departures.filter(function(it){
				return it.date != date;
			});
		}

		$scope.changeTab = function(evt){
			console.log($scope.trip.itinerary);
			var target = evt.currentTarget.innerText.toLowerCase();
			$scope.items = {"description":false, "itinerary":false, "departures":false, "coversations":false};					
			$scope.items[target] = true;
		}
    }
})();
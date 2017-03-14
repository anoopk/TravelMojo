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

    function Controller($scope, UserService, TripService, $mdDialog, $stateParams) {
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
		$scope.trip.itinerary = [];				
		$scope.trip.departures = [];				
		$scope.trip.length = 0;
        function initController() {	
			$scope.activites = [{id:1, name : 'Suicide Bombing'}, {id:2, name : 'Paragliding'}, {id:3, name : 'Diving'}, {id:4, name : 'Trekking'}];
            // get current user
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
				//Get the latest data for this trip as it might have changed since we got it last.
				UserService.GetTrip(vm.user.username, $stateParams.tripId).then(function (trip){
					$scope.trip = trip;
				});
            });
        }
		
		$scope.checkModel = function(){
			//$scope.showSimpleToast();
			console.log(">>>", $scope.trip);
			if($scope.trip._id){
				UserService.UpdateTrip($scope.trip);
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
		
		$scope.addDeparture = function(){			
			//implies I am creating a new trip
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
						if($scope.singleDeparture.date){
							$scope.trip.departures[$scope.trip.departures.length] = $scope.singleDeparture;
							$scope.singleDeparture = null;							
						}
						$mdDialog.hide();
					}
				}		
			}
			//$scope.singleDeparture = {'price':1800};
			$scope.openDialog();
		}
		
		$scope.addDay = function(){			
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
						$scope.trip.itinerary[$scope.trip.itinerary.length] = $scope.singleDay;
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
			$scope.addDay();			
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
			$scope.addDeparture();			
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
			if(target == "conversations"){
				return;
			}
			if(tripSchema[target] === undefined){
				UserService.GetLayoutJSON(target).then(function (json){
					tripSchema[target] = json.data;
					$scope.schema = tripSchema[target][0]['schema'];
					$scope.forms = tripSchema[target][0];
				});				
			}
			else{
				$scope.schema = tripSchema[target][0]['schema'];
				$scope.forms = tripSchema[target][0];				
			}
		}
    }
})();
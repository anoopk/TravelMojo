(function () {
    'use strict';
    angular
        .module('app')
        .controller('TripDetailsStatic.IndexController', Controller);
    function Controller($scope, UserService, TripService, $mdDialog, $state, $stateParams, Upload, $timeout) {
        var vm = this;
        vm.user = null;
		var now = new Date();
		$scope.activites = {};				
        initController();	
		$scope.singleDay = {};
		$scope.oneAtATime = true;			
		$scope.notifications = [{name:"Alfreds Futterkiste", comment:"Can we make this cheaper ?", date:now, unread:true, upvotes:3}, {name:"Berglunds snabbköp", comment:"Is an extra night here a possibilty ?", date:now, unread:true}, {name:"Centro comercial Moctezuma", comment:"Extra night in exchange of which place ?", replyTo:"Berglunds snabbköp", date:now}, {name:"Ernst Handel", comment:"I would like to throw in a traditional Chilean lunch at my Grandmas place, just 20 minutes of town. Just 'like' this and I will use that as a guest count. Have talked to her and she would love to have us all over.", date:now, unread:false, upvotes:6}];		
		$scope.items = {"description":true, "itinerary":false, "departures":false};		
		$scope.trip = {};			
		$scope.trip.itinerary = [];				
		$scope.trip.departures = [];				
		$scope.trip.notes = "I do not need any assistance at this point in time.";		
		$scope.trip.length = 0;
        function initController() {	
		$scope.tags = [
			{text: "Himalayas", weight: 13},
			{text: "Mountains", weight: 10.5},
			{text: "Outdoors", weight: 9.4},
			{text: "Trekking", weight: 8},
			{text: "Amet", weight: 6.2},
			{text: "Adventure", weight: 5},
			{text: "Budget", weight: 5},
			{text: "Universal", weight: 5},
			{text: "Medium", weight: 5},
			{text: "Rishikesh", weight: 4},
			{text: "Uttaranchal", weight: 4},
			{text: "India", weight: 3},
			{text: "Paragliding", weight: 3},
			{text: "Suicide Bombing", weight: 3},
			{text: "Diving", weight: 3},
			{text: "Altitude", weight: 3},
			{text: "9 days", weight: 3},
			{text: "et malesuada", weight: 3},
			{text: "fames", weight: 2},
			{text: "ac turpis", weight: 2},
			{text: "egestas", weight: 2},
			{text: "Aenean", weight: 2},
			{text: "vestibulum", weight: 2},
			{text: "elit", weight: 2},
			{text: "sit amet", weight: 2},
			{text: "metus", weight: 2},
			{text: "adipiscing", weight: 2},
			{text: "ut ultrices", weight: 2}
		];
			
			$scope.colors = ["#800026", "#bd0026", "#e31a1c", "#fc4e2a", "#fd8d3c", "#feb24c", "#fed976"];		
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
						//$scope.trip.comments = $scope.notifications;
						//if($scope.trip.itinerary[1]){
						//	$scope.trip.itinerary[1].comments = $scope.notifications;
						//}
					});
				}
            });
        }		
		
		$scope.uploadFiles = function (files) {
			console.log(files);
			$scope.trip.files = files;
			UserService.UploadFiles(files);
		};
		
		$scope.applyChanges = function(){
			$scope.checkModel(false);
		}

		$scope.cancelChanges = function(){
			$state.go("trips");
		}

		$scope.saveChanges = function(){
			$scope.checkModel(true);
		}
		
		$scope.checkModel = function(back){
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
				UserService.UpdateTrip($scope.trip, true).then(function () {
					if(back){
						$state.go("trips");
					}
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

		$scope.filterMessages = function(filterBy){
			$scope.filterBy = filterBy;
		}
		
		$scope.getMessages = function(day){
			var comms = day.comments;
			if($scope.filterBy){
				var comms = day.comments.filter(function (comm){
					return comm[name] == $scope.filterBy || comm.replyTo == $scope.filterBy;
				});
			}
			return comms;
		}
		
		$scope.ownComment = function(day, id){
			if(day.comments[id].name == vm.user.username){ //or if administrator
				return true;
			};				
			return false;
		}
		
		$scope.upVote = function(day, id){			
			if(day.comments[id].voters === undefined){
				day.comments[id].voters = [];
			}
			day.comments[id].voters.push(vm.user.username); 
			if(day.comments[id].upvotes){
				day.comments[id].upvotes++;
			}
			else{
				day.comments[id].upvotes = 1;
			}
		}
		
		$scope.addComment = function(day, comment){			
			$scope.comment = {};
			$scope.comment.date = new Date();
			$scope.comment.name = vm.user.username;
			$scope.comment.upVote = 0;
			$scope.comment.unread = true;
			$scope.comment.unpublished = true;
			if(comment){
				$scope.comment.replyTo = comment.name;
			}
			$scope.comment.comment = "";
			
			if(day.comments === undefined){
				day.comments = [];
			}
			$scope.openDialog = function() {	
				$mdDialog.show({
					parent: angular.element(document.body),
					scope:$scope,
					preserveScope: true,
					clickOutsideToClose:true,
					templateUrl: "tripDetails/comment.html",
					controller: DialogController
				});
				
				function DialogController($scope, $mdDialog) {
					$scope.closeDialog = function() {
						if($scope.comment.comment.length > 0){
							day.comments.push($scope.comment);
						}
						$mdDialog.hide();
					};
				};				
			}		
			$scope.openDialog();
		}
		
		$scope.hasAVote = function(day, id){
			//Cannot upvote own comment
			if(day.comments[id].name == vm.user.username){
				return false;
			};			
			if (_.contains(day.comments[id].voters, vm.user.username)) {
				console.log("Needle found.");
				return false;			  
			};			
			
			return true;
		}
		
		$scope.listMessages = function(day){			
			$scope.filterBy = null;		
			$scope.day = day;		
			$scope.openDialog = function() {	
				$mdDialog.show({
					parent: angular.element(document.body),
					scope:$scope,
					preserveScope: true,
					clickOutsideToClose:true,
					templateUrl: "tripDetails/messages.html",
					controller: DialogController
				});
				
				function DialogController($scope, $mdDialog) {
					$scope.closeDialog = function() {
						$mdDialog.hide();
					};
				};				
			}		
			$scope.openDialog();
		}
		
		$scope.addDay = function(day){			
			$scope.singleDay = day;		
			if(null == day){
				$scope.singleDay = {};
			}
			$scope.openDialog = function() {	
				$mdDialog.show({
					parent: angular.element(document.body),
					scope:$scope,
					preserveScope: true,
					clickOutsideToClose:true,
					templateUrl: "tripDetails/singleDay.html",
					controller: DialogController
				});
				
				function DialogController($scope, $mdDialog) {
					$scope.closeDialog = function() {
						if(undefined === $scope.trip.itinerary){
							$scope.trip.itinerary = [];
						}
						if($scope.singleDay.day){
							$scope.trip.itinerary.push($scope.singleDay);
						}
						$mdDialog.hide();
					};
				};				
			}		
			$scope.openDialog();
		}
	
		$scope.editDay = function(day){	
			//var itinerary = $scope.trip.itinerary.filter(function(it){
			//	return it.day == day;
			//});	
			$scope.singleDay = 	day;
			$scope.addDay(day);			
		}
		
		$scope.cancelDay = function(day){
			$scope.singleDay = null;
			$scope.trip.itinerary = $scope.trip.itinerary.filter(function(it){
				return it.day != day.day;
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

		$scope.removeComment = function(day, $index){
			day.comments.splice($index);	
		}
		
		$scope.changeTab = function(evt){
			console.log($scope.trip.itinerary);
			var target = evt.currentTarget.innerText.toLowerCase();
			$scope.items = {"description":false, "itinerary":false, "departures":false};					
			$scope.items[target] = true;
		}
    }
})();
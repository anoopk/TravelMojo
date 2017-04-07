(function () {
    'use strict';
    angular
        .module('app')
        .controller('TripDetailsStatic.IndexController', Controller);
    
	function Controller($scope, UserService, TripService, $mdDialog, $state, $stateParams, Upload, $timeout) {
        var vm = this;
        vm.user = null;
        initController();	
		$scope.trip = {};			
		//$scope.trip.notes = "I do not need any assistance at this point in time.";		
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

		$scope.edit = function(){
			$state.go('tripDetails', {tripId : $scope.trip._id});
		}

		$scope.cancel = function(){
			$state.go('tripDetails', {tripId : $scope.trip._id});
		}

		$scope.clone = function(){
			$scope.trip.createdOn = new Date();			
			UserService.CreateTrip($scope.trip);
		}
		
		$scope.nextTrip = function(){
			$stateParams.tripId = "58c94d1482bee8178c6edbcb";
			UserService.GetTrip(vm.user.username, "58c94d1482bee8178c6edbcb").then(function (trip){
				$scope.trip = trip;			
			});
		}
			
		$scope.filterMessages = function(filterBy){
			$scope.filterBy = filterBy;
		}
		
		$scope.ownTrip = function(){			
			if($scope.trip.userName == vm.user.username){ //or if administrator
				return true;
			};				
			return false;		
		}
		
		$scope.ownComment = function(day, id){			
			if(day.comments && (day.comments[id].name == vm.user.username)){ //or if administrator
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

		$scope.removeComment = function(day, $index){
			day.comments.splice($index);	
		}		
    }
})();
(function () {
    'use strict';

    angular
        .module('app')
        .controller('Home.IndexController', Controller);

    function Controller($scope, UserService) {
        var vm = this;
        vm.user = null;
		var tripSchema = {};
		var now = new Date();
		$scope.items = {};
        initController();				
		$scope.oneAtATime = true;	
		$scope.notifications = [{name:"Alfreds Futterkiste", date:now, unread:true}, {name:"Berglunds snabbköp", date:now, unread:true}, {name:"Centro comercial Moctezuma", date:now}, {name:"Ernst Handel", date:now, unread:false}];		
		$scope.items = {"description":true, "itinerary":false, "departures":false, "coversations":false};		
		$scope.model = {};			
        function initController() {			
            // get current user
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
				UserService.GetLayoutJSON("description").then(function (json){
					tripSchema["description"] = json.data;
					$scope.schema = json.data[0]['schema'];
					$scope.forms = json.data[0];
				});
            });
        }
		
		$scope.checkModel = function(){
			console.log(">>>", $scope.model);
		}
		
		$scope.changeTab = function(evt){
			var target = evt.currentTarget.innerText.toLowerCase();
			$scope.items = {"description":false, "itinerary":false, "departures":false, "coversations":false};					
			$scope.items[target] = true;
			console.log($scope.items);			
			if(target == "conversations"){
				return;
			}
			if(tripSchema[target] === undefined){
				UserService.GetLayoutJSON(target).then(function (json){
					tripSchema[target] = json.data;
					$scope.schema = tripSchema[target][0]['schema'];
					$scope.forms = tripSchema[target][0];
					console.log($scope.forms);
				});				
			}
			else{
				$scope.schema = tripSchema[target][0]['schema'];
				$scope.forms = tripSchema[target][0];				
			}
		}
    }
})();
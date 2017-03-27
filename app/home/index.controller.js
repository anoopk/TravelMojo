(function () {
    'use strict';

    angular
        .module('app')
		.filter('propsFilter', function() {
			return function(items, props) {
			var out = [];

			if (angular.isArray(items)) {
			var keys = Object.keys(props);

			items.forEach(function(item) {
			var itemMatches = false;

			for (var i = 0; i < keys.length; i++) {
			var prop = keys[i];
			var text = props[prop].toLowerCase();
			if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
			itemMatches = true;
			break;
			}
			}

			if (itemMatches) {
			out.push(item);
			}
			});
			} else {
			// Let the output be the input untouched
			out = items;
			}

			return out;
		}})
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

		$scope.notification = [];		
		$scope.notification.subject = "Activity Day 3: About trip# 09823e892398e23, Blunders of India.";
		$scope.notification.contacts = [
			{ name: 'Adam',      email: 'adam@email.com',      age: 12, country: 'United States' },
			{ name: 'Amalie',    email: 'amalie@email.com',    age: 12, country: 'Argentina' },
			{ name: 'Estefanía', email: 'estefania@email.com', age: 21, country: 'Argentina' },
			{ name: 'Adrian',    email: 'adrian@email.com',    age: 21, country: 'Ecuador' },
			{ name: 'Wladimir',  email: 'wladimir@email.com',  age: 30, country: 'Ecuador' },
			{ name: 'Samantha',  email: 'samantha@email.com',  age: 30, country: 'United States' },
			{ name: 'Nicole',    email: 'nicole@email.com',    age: 43, country: 'Colombia' },
			{ name: 'Natasha',   email: 'natasha@email.com',   age: 54, country: 'Ecuador' },
			{ name: 'Michael',   email: 'michael@email.com',   age: 15, country: 'Colombia' },
			{ name: 'Nicolás',   email: 'nicolas@email.com',    age: 43, country: 'Colombia' }
		];		
		$scope.notification.to = [$scope.notification.contacts[2], $scope.notification.contacts[0]];				
		
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
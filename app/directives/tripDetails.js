angular.module('TravelMojo.tripDetails', [])
.directive('tripinfosheet', function() {
	return {
		restrict: 'E',
		templateUrl: 'directive/tripDetails.html',
		replace: true,
		scope: true,

		link: function ($scope, element, attributes) {
			$scope.emptyName = attributes.emptyname || 'Select State';
		},

		controller: [ "$scope", function ($scope) {
		}]
	};
})

;
var config = require('config.json');
var express = require('express');
var router = express.Router();
var tripService = require('services/trip.service');
var notificationsService = require('services/notification.service');

// routes
router.get('/:username', getAllTripsForUser);
router.get('', getAllTrips);
router.get('/:username/:_id', getTrip);
router.post('/create', createTrip);
router.put('/:_id', updateTrip);
router.delete('/:_id', deleteTrip);

module.exports = router;

function getAllTripsForUser(req, res) {
	console.log(req.params.username);
    tripService.getAllTrips(req.params.username)
        .then(function (trips) {
			notificationsService.getNotifications(req.params.username).then(function (notifications){
				var keysTrips = Object.keys(trips);
				for(var i = 0; i < keysTrips.length; i++)
				{
					var trip = trips[keysTrips[i]];
					trip.notifications = [];
					var keysNotfn = Object.keys(notifications);					
					for(var j = 0; j < keysNotfn.length; j++){
						var key = keysNotfn[j];
						var notification = notifications[key];
						if(notification.tripId == trip._id){
							notification.tripName = trip.name;														
							notification.image = "http://lorempixel.com/50/50/people?" + j;
							trip.notifications.push(notification);							
						}
					}
				};			
				res.json(trips);							
			});
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getAllTrips(req, res) {
    tripService.getAllTrips(null)
        .then(function (trips) {
			notificationsService.getNotifications().then(function (notifications){
				var keysTrips = Object.keys(trips);
				for(var i = 0; i < keysTrips.length; i++)
				{
					var trip = trips[keysTrips[i]];
					trip.notifications = [];
					var keysNotfn = Object.keys(notifications);					
					for(var j = 0; j < keysNotfn.length; j++){
						var key = keysNotfn[j];
						var notification = notifications[key];
						if(notification.tripId == trip._id){
							notification.image = "http://lorempixel.com/50/50/people?" + j;
							trip.notifications.push(notification);							
							notification.tripName = trip.name;							
						}
					}
				};			
				res.json(trips);							
			});
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function createTrip(req, res) {
    tripService.create(req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getTrip(req, res) {
    tripService.getById(req.params._id)
        .then(function (trip) {
            if (trip) {
                res.json(trip);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function updateTrip(req, res) {
    var id = req.body._id;
    tripService.update(id, req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function deleteTrip(req, res) {
    tripService.delete(req.params._id)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}
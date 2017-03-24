var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
var dbNotifications = mongo.db(config.connectionString, { native_parser: true });
var auditService = require('services/audit.service');
db.bind('trips');
dbNotifications.bind('notifications');

var service = {};

service.getAllTrips = getAllTrips;
service.getById = getById;
service.create = create;
service.update = update;
service.delete = _delete;

module.exports = service;

function createMongoFilter(filterDictionary){
	var filterjson = new Object();
	filterjson['$and'] = [filterDictionary];				
	return filterjson;
}

function getAllTrips(userName){
	userName = null;
	var deferred = Q.defer();
	if(userName){
		//{$and: [{username:userName},{cancelled:true},{published:true}]}, 
		db.trips.find({username:userName}, {"sort" : ['createdOn', 'desc']}, function(err, trips){
			return deferred.resolve(trips.toArray());
		});	
	}
	else{
		db.trips.find(null, {"sort" : ['createdOn', 'desc']}, function(err, trips){
			return deferred.resolve(trips.toArray());
		});
	};		
	return deferred.promise;
}
	
function getById(_id) {
    var deferred = Q.defer();

    db.trips.findById(_id, function (err, trip) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (trip) {
            // return user (without hashed password)
            deferred.resolve(trip);
        } else {
            // user not found
            deferred.resolve();
        }
    });

    return deferred.promise;
}

function create(tripParam) {
    var deferred = Q.defer();
    // validation
	delete(tripParam._id);

	console.log("trip-service.js", tripParam);
    createTrip(tripParam);
	
    function createTrip(tripParam, userName) {
        db.trips.insert(
            tripParam,
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);
				auditService.createAuditLog(null, doc._id, tripParam, null, tripParam.userId);
                deferred.resolve();
            });
    }

    return deferred.promise;
}

function update(_id, trip) {
    var deferred = Q.defer();
	delete(trip._id);
	delete(trip.id);
	var update = false; 
	var tripOrig = {};
	getById(_id).then(function(tripOrig){
		update = true;	
		updateTrip(_id, trip, tripOrig);		
	});
   
	function updateTrip(_id, trip, tripOrig) {
		console.log(trip);
        db.trips.update(            
			{ _id: mongo.helper.toObjectID(_id) },
            { $set: trip },
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);				
					if (tripOrig && update) {
						auditService.createAuditLog(null, _id, trip, tripOrig, "anoop_kr@yahoo.com");						
						deferred.resolve(trip);
					} else {
						// user not found
						deferred.resolve();
					}
		});				
        deferred.resolve();
    }
    return deferred.promise;
}

function _delete(_id) {
    var deferred = Q.defer();

    db.trips.remove(
        { _id: mongo.helper.toObjectID(_id) },
        function (err) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            deferred.resolve();
        });

    return deferred.promise;
}
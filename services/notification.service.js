var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('notifications');

var service = {};
service.createNotification = createNotification;
service.getNotifications   = getNotifications;
module.exports = service;

function inNotifiableColumns(collectionName, field){
	var notifiableColumns = [];
	switch(collectionName){
		case "trips":
			notifiableColumns = ['cancelled', 'private', 'published', 'departure', 'destination', 'cost'];
	}
	for(var i = 0; i < notifiableColumns.length; i++){
		if(notifiableColumns[i] == field){
			return true;
		}
	}
	return false;			
}

function getNotifications(username){
	var deferred = Q.defer();	
	if(username === undefined){
		console.log("getNotifications for SuperAdmin");		
		db.notifications.find(null, {"sort" : ['date', 'desc']}, function(err, notifications){
			return deferred.resolve(notifications.toArray());
		});			
	}
	else{
		console.log("getNotifications for", username);			
		db.notifications.find({to:username}, {"sort" : ['date', 'desc']}, function(err, notifications){
			db.notifications.find({from:username}, {"sort" : ['date', 'desc']}, function(err, notifications2){
				return deferred.resolve(notifications.toArray()); //.concat(notifications2.toArray()
			});			
		});			
	}	
	return deferred.promise;		
}

function createNotification(collectionName, auditRecord){
	var notification = {};
	notification.from = auditRecord.changer;
	notification.to = "bf@bf.com";
	notification.tripId = auditRecord.id;
	notification.date = auditRecord.timeStamp;
	notification.priority = 0;
	notification.read = false;	
	notification.type = 'Automatic';
	if(null == auditRecord.field || inNotifiableColumns("trips", auditRecord.field)){
		console.log("createNotification ", auditRecord);		
		if(auditRecord.verb == 'create')
			notification.text = auditRecord.changer + " " + auditRecord.verb + "d a new trip";
		if(auditRecord.verb == 'update')
			notification.text = auditRecord.changer + " " + auditRecord.verb + "d " + auditRecord.field + " from " + auditRecord.oldValue + " to " + auditRecord.newValue;
		db.notifications.insert(notification);		
	}
}

	

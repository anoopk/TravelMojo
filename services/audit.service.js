var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
var db2 = mongo.db(config.connectionString, { native_parser: true });
var notificationService = require('services/notification.service');
db.bind('tripAudit');
db2.bind('notifications');

var service = {};
service.createAuditLog = createAuditLog;
module.exports = service;

function createNotification(collectionName, auditRecord){
	var notification = {};
	notification.from = auditRecord.changer;
	notification.to = "bf.bf.com";
	notification.collectionName = collectionName;
	notification.date = auditRecord.timeStamp;
	notification.priority = 0;
	notification.read = false;	
	notification.type = 'Automatic';
	notification.name = auditRecord.name;
	if(auditRecord.verb == 'create')
		notification.text = auditRecord.changer + " " + auditRecord.verb + "d ";
	if(auditRecord.verb == 'update')
		notification.text = auditRecord.changer + " " + auditRecord.verb + "d " + auditRecord.field + " from " + auditRecord.oldValue + " to " + auditRecord.newValue;
	db2.notifications.insert(notification);		
}

function createAuditLog(collectionName, _id, newRec, origRec, username){
    var deferred = Q.defer();
    recordChanges(_id, newRec, origRec, username);
	function recordChanges(_id, tripNew, tripOriginal, username){
		var insertable  = false;
		var auditRecord = {};
		auditRecord.timeStamp = new Date();
		auditRecord.changer = username;
		auditRecord.name = newRec.name;
		if(origRec == null){
			console.log("Creating Audit and trip");
			insertable = true;
			auditRecord.verb = 'Create';					
		}
		else{	
			Object.keys(tripNew).forEach(function(key) {
				console.log("keys ", key, tripNew[key], tripOriginal[key]);		
				if(key != 'lastChangedOn' && (tripNew[key] != tripOriginal[key])){
					insertable = true;					
					auditRecord.verb = 'update';
					auditRecord.id = _id;
					auditRecord.field = key;
					if(tripOriginal[key]){
						auditRecord.oldValue = tripOriginal[key];
					}
					auditRecord.newValue = tripNew[key];
				}
			});
		}
		if(insertable){			
			db.tripAudit.insert(auditRecord);		
			notificationService.createNotification(collectionName, auditRecord);			
		}
	}
}

	

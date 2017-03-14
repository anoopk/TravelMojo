var config = require('config.json');
var express = require('express');
var router = express.Router();
var notificationService = require('services/notification.service');

// routes
router.get('/:username', getNotifications);
module.exports = router;

function getNotifications(req, res) {
    notificationService.getNotifications(req.params.username)
        .then(function (notifications) {
            res.json(notifications);
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
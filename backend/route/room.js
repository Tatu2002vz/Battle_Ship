const router = require('express').Router();
// const Genre = require('../models/genre');
const controller = require('../controllers/room')
router.get('/', controller.getAllRooms)
router.get('/player', controller.getPlayerOfRoom);

module.exports = router

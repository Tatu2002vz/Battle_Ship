const router = require('express').Router();
// const Genre = require('../models/genre');
const controller = require('../controllers/point')
router.post('/', controller.getAllPointOfPlayer)

module.exports = router

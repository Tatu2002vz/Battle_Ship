const router = require("express").Router();
// const Genre = require('../models/genre');
const controller = require("../controllers/room");
router.get("/", controller.getAllRooms);
router.get("/player", controller.getPlayerOfRoom);
router.get("/:roomId", controller.apiGetRoom);

module.exports = router;

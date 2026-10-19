const router = require("express").Router();
const controller = require("../controllers/room");
router.get("/", controller.getAllRooms);
router.get("/player", async (req, res) => {
  const result = await controller.getPlayerOfRoom(req.query.roomId);
  return res.status(200).json(result);
});
router.get("/:roomId", controller.apiGetRoom);

module.exports = router;

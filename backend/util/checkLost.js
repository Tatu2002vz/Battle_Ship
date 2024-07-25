const playerRepository = require("../model/player");
const pointRepository = require("../model/pointAttacked");
const checkLost = async (playerId) => {
  //playerId === token
  const Point = await pointRepository();
  const points = await Point.search()
    .where("playerId")
    .equals(playerId)
    .return.all();
  const check = points.every((el) => el.isAttacked === true);
  if (check) {
    console.log(`Người chơi ${playerId} đã thua!`);
  }
  return check;
};

const resetPointAndRoom = async (playerId) => {
  const Player = await playerRepository();
  const player = await Player.search()
    .where("token")
    .equals(playerId)
    .return.first();
  if (player) {
    player.point = 0;
    player.roomId = "";
    player.no = -1;
    await Player.save(player);
  }
};
module.exports = {
  checkLost,
  resetPointAndRoom,
};

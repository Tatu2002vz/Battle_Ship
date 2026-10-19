const playerRepository = require("../model/player");
const pointRepository = require("../model/pointAttacked");

// Người chơi thua khi mọi ô tàu của họ đều đã bị bắn trúng.
// Bản gốc dùng points.every(...) mà không kiểm tra mảng rỗng:
// mảng rỗng cũng cho kết quả true -> người chưa có tàu cũng bị tính thua.
const checkLost = async (playerId) => {
  const Point = await pointRepository();
  const points = await Point.search()
    .where("playerId")
    .equals(playerId)
    .return.all();
  const lost = points.length > 0 && points.every((el) => el.isAttacked === true);
  if (lost) {
    console.log(`Người chơi ${playerId} đã thua!`);
  }
  return lost;
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

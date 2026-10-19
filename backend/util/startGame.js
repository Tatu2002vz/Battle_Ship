const roomRepository = require("../model/room");
const playerRepository = require("../model/player");

// Bắt đầu game: tàu đã do người chơi tự đặt trước (event placeShip),
// nên ở đây không còn random tàu như bản gốc.
// Chỉ việc: đánh dấu phòng đã bắt đầu, gán số thứ tự lượt (no),
// reset trạng thái ready và cho người đầu tiên (no = 0) đi trước.
const startGame = async (players, roomId) => {
  const Room = await roomRepository();
  const Player = await playerRepository();

  const room = await Room.fetch(roomId);
  if (!room || !room.entityId) {
    return { success: false };
  }

  room.isStart = true;
  room.isEnd = false;
  room.turn = 0;
  await Room.save(room);

  // Bản gốc dùng forEach(async) nên save chưa xong hàm đã kết thúc
  await Promise.all(
    players.map(async (player, index) => {
      player.no = index;
      player.ready = false;
      await Player.save(player);
    })
  );

  return { success: true };
};

module.exports = startGame;

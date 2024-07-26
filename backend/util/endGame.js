const roomRepository = require("../model/room");
const playerRepository = require("../model/player");
const pointRepository = require("../model/pointAttacked");
const { resetPointAndRoom } = require("./checkLost");
const checkEndGame = async (roomId) => {
  try {
    const Room = await roomRepository();
    const Player = await playerRepository();
    const Point = await pointRepository();
    const room = await Room.fetch(roomId);
    if (room && room.entityId && room.name !== null) {
      if (room.isStart) {
        const playerOfRoom = await Player.search()
          .where("roomId")
          .equals(roomId)
          .return.all();
        if (playerOfRoom.length === 1) {
          room.isEnd = true;
          await Room.save(room);
          // Xóa tất cả các điểm của room
          const points = await Point.search()
            .where("roomId")
            .equals(roomId)
            .return.all();
          points.forEach(async (point) => {
            await Point.remove(point.entityId);
          });
          // Xóa id phòng của player chiến thắng
          playerOfRoom[0].roomId = "";
          playerOfRoom[0].point = 0;
          await resetPointAndRoom(playerOfRoom[0].token)
          await Player.save(playerOfRoom[0]);
          // Lưu lịch sử vào database
          
          //------------------
          // Xóa phòng đó!
          await Room.remove(roomId);
          return {
            success: true,
            mes: "Game Over!",
            winner: playerOfRoom[0],
          };
        } else if (playerOfRoom.length < 1) {
          return { success: true, mes: "Ẩn danh" };
        } else {
          return { success: false };
        }
      }
    } else {
      throw new Error("Không tìm thấy phòng có id: " + roomId);
    }
  } catch (error) {
    console.log("Lỗi khi check end game: " + error.message);
  }
};

module.exports = {
  checkEndGame,
};

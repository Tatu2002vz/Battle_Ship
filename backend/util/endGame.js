const roomRepository = require("../model/room");
const playerRepository = require("../model/player");
const pointRepository = require("../model/pointAttacked");
const { resetPointAndRoom } = require("./checkLost");

// Game kết thúc khi phòng đang chơi chỉ còn đúng 1 người.
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
          // Xóa tất cả các điểm của phòng (chờ xóa xong mới đi tiếp,
          // bản gốc dùng forEach(async) nên chưa xóa xong đã xóa phòng)
          const points = await Point.search()
            .where("roomId")
            .equals(roomId)
            .return.all();
          for (const point of points) {
            await Point.remove(point.entityId);
          }
          // Xóa id phòng của người chiến thắng
          const winner = playerOfRoom[0];
          winner.roomId = "";
          winner.point = 0;
          await resetPointAndRoom(winner.token);
          await Player.save(winner);
          // Xóa phòng
          await Room.remove(roomId);
          return {
            success: true,
            mes: "Game Over!",
            winner,
          };
        } else if (playerOfRoom.length < 1) {
          return { success: true, mes: "Ẩn danh" };
        } else {
          return { success: false };
        }
      }
      return { success: false };
    } else {
      throw new Error("Không tìm thấy phòng có id: " + roomId);
    }
  } catch (error) {
    console.log("Lỗi khi check end game: " + error.message);
    return { success: false };
  }
};

module.exports = {
  checkEndGame,
};

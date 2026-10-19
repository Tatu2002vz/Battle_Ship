const playerRepository = require("../model/player");
const roomRepository = require("../model/room");

// Người còn chơi trong phòng = còn roomId trỏ vào phòng
// (người thua/thoát đã bị reset roomId = "" và no = -1 ở checkLost/leaveRoom).
const getAlivePlayers = async (roomId) => {
  const Player = await playerRepository();
  const players = await Player.search()
    .where("roomId")
    .equals(roomId)
    .return.all();
  return players.sort((a, b) => a.no - b.no);
};

const getTurn = async ({ roomId, io }) => {
  try {
    const Room = await roomRepository();
    const room = await Room.fetch(roomId);
    if (!room || !room.entityId || room.name === null) {
      return false;
    }
    const players = await getAlivePlayers(roomId);
    if (players.length === 0) return false;

    let current = players.find((p) => p.no === Number(room.turn));
    if (!current) {
      current = players[0];
      room.turn = current.no;
      await Room.save(room);
    }
    io.in(roomId).emit("notificationTurn", {
      name: current.name,
      token: current.token,
    });
    return true;
  } catch (error) {
    console.log("Lỗi khi sắp xếp lượt chơi! " + error.message);
    return false;
  }
};

// Chuyển lượt tới người còn sống tiếp theo (vòng tròn).
// Bản gốc hardcode turn >= 5 và dùng vòng do...while không có điểm dừng
// nếu không tìm thấy người chơi -> có thể treo server.
const nextTurn = async (roomId) => {
  try {
    const Room = await roomRepository();
    const room = await Room.fetch(roomId);
    if (!room || !room.entityId || room.name === null) {
      return false;
    }
    const players = await getAlivePlayers(roomId);
    if (players.length === 0) return false;

    const idx = players.findIndex((p) => p.no === Number(room.turn));
    const next = players[(idx + 1) % players.length];
    room.turn = next.no;
    await Room.save(room);
    return true;
  } catch (error) {
    console.log("Lỗi khi chuyển lượt: " + error.message);
    return false;
  }
};

module.exports = {
  getTurn,
  nextTurn,
  getAlivePlayers,
};

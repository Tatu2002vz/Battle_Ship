const playerRepository = require("../model/player");
const roomRepository = require("../model/room");

const getTurn = async ({ roomId, io }) => {
  try {
    const Player = await playerRepository();
    const Room = await roomRepository();
    const room = await Room.fetch(roomId);
    if (room && room.name) {
      const turn = room.turn;
      const playerTurn = await Player.search()
        .where("roomId")
        .equal(roomId)
        .and("no")
        .eq(turn)
        .return.first();
      if (!playerTurn) {
        return false;
      }
      // io.to(playerTurn?.socketId).emit("myTurn");
      io.in(roomId).emit("notificationTurn", {
        name: playerTurn?.name,
        token: playerTurn?.token,
      });
      console.log("Tới lượt: " + playerTurn.socketId);
      console.log("Tới lượt: " + playerTurn.name);
      return true;
    } else {
      throw new Error(`Không tìm thấy phòng với id: ${roomId}!`);
    }
  } catch (error) {
    console.log("Lỗi khi sắp xếp lượt chơi!" + error.message);
    return false;
  }
};

const nextTurn = async (roomId) => {
  try {
    const Room = await roomRepository();
    const Player = await playerRepository();
    const room = await Room.fetch(roomId);
    if (room && room.name ) {
      let turn = Number(room.turn);
      // room.turn = Number(room.turn) + 1;
      turn += 1;
      // const playOfRoom = await Player.search()
      //   .where("roomId")
      //   .equals(roomId)
      //   .return.all();
      let playTurn;
      do {
        playTurn = await Player.search()
          .where("roomId")
          .equal(roomId)
          .and("no")
          .equals(turn)
          .return.first();
        if (!playTurn) {
          room.turn = Number(room.turn) + 1;
          turn += 1;
        }
        if (turn >= 5) {
          turn = 0;
        }
      } while (!playTurn);
      room.turn = turn;
      await Room.save(room);
    } else {
      throw new Error("Không tìm thấy phòng với id: " + roomId);
    }
  } catch (error) {
    console.log("Lỗi khi chuyển lượt: " + error.message);
  }
};
module.exports = {
  getTurn,
  nextTurn,
};

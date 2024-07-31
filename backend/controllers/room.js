const roomRepository = require("../model/room");
const playerRepository = require("../model/player");
const startGame = require("../util/startGame");
const { checkEndGame } = require("../util/endGame");
const { getTurn, nextTurn } = require("../util/handleTurn");
const createRoom = async (data) => {
  const Room = await roomRepository();
  const Player = await playerRepository();
  try {
    let { token, nameRoom, capacity, ratio } = data;
    if (!ratio) ratio = 16;
    if (!capacity) capacity = 5;
    if (isNaN(Number(ratio))) ratio = 16;
    if (isNaN(Number(capacity))) capacity = 5;
    if (Number(capacity) > 5 || Number(capacity) < 2) capacity = 5;
    if (Number(ratio) < 5) ratio = 16;
    if (nameRoom) {
      const exist = await Room.search()
        .where("name")
        .equals(nameRoom)
        .return.all();
      if (exist.length > 0) {
        return { success: false, mes: "Phòng đã tồn tại!" };
      }
    }
    let newRoom = {
      name: nameRoom ? nameRoom : "New Room",
      numberOfRoom: 1,
      capacity: Number(capacity),
      isStart: false,
      isEnd: false,
      ratio: Number(ratio),
      createdAt: Date.now(),
      turn: 0,
    };
    newRoom = await Room.createAndSave(newRoom);
    const roomId = newRoom.entityId;
    const player = await Player.search()
      .where("token")
      .equals(token)
      .return.first();
    player.roomId = roomId;
    await Player.save(player);
    return { success: true, mes: newRoom };
  } catch (e) {
    console.log("Lỗi khi tạo phòng: " + e.message);
    return { success: false, mes: "Tạo phòng thất bại: " + e.message };
  }
};
// const deleteRoom = async (data) => {
//   const Room = await roomRepository();
//   const Player = await playerRepository();
//   try {
//     const socketId = data.socketId;
//     const player = await Player.search()
//       .where("socketId")
//       .equals(socketId)
//       .return.first();
//     if (player) {
//       const room = await Room.fetch(player.roomId);
//       if (room.entityId && room.name !== null) {
//         await Room.save(room);
//         const personCount = await Player.search()
//           .where("roomId")
//           .equals(player.roomId)
//           .return.count();
//         if (room && !room.isStarted && personCount === 1) {
//           await Room.remove(player.roomId);
//         }
//       }
//     }
//   } catch (error) {
//     console.log("Lỗi khi xóa phòng: " + error.message);
//   }
// };

const getAllRooms = async (req, res) => {
  try {
    const Room = await roomRepository();
    const Player = await playerRepository();

    const listRoom = await Room.search().return.all();
    //   console.log(listRoom)
    // const newListRoom = [];
    // await listRoom.forEach(async (room) => {
    //   const countPerson = await Player.search()
    //     .where("roomId")
    //     .equals(room.entityId)
    //     .return.all();
    //   console.log("length: " + countPerson.length);
    //   const copy_room = { ...room, numberPerson: countPerson.length };
    //   newListRoom.push(copy_room);
    //   // room.numberPerson = countPerson.length
    //   // await Room.save(room)
    // });
    const newListRoom = [];
    for (const room of listRoom) {
      const countPerson = await Player.search()
        .where("roomId")
        .equals(room.entityId)
        .return.all();
      // const copy_room = { ...room, numberPerson: countPerson.length };
      // newListRoom.push(copy_room);
      // room.numberPerson = countPerson.length
      room.numberOfRoom = countPerson.length;
      if (countPerson.length === 0) {
        await Room.remove(room.entityId);
      } else {
        newListRoom.push(room);
      }
      await Room.save(room);
    }
    return res.status(200).json({ success: true, mes: newListRoom });
  } catch (error) {
    console.log("Lỗi khi lấy tất cả phòng!" + error.message);
  }
};

const socketGetAllRooms = async () => {
  try {
    const Room = await roomRepository();
    const Player = await playerRepository();
    const listRoom = await Room.search().return.all();
    listRoom.forEach(async (room) => {
      const countPerson = await Player.search()
        .where("roomId")
        .equals(room.entityId)
        .return.all();
      room.numberOfRoom = countPerson.length;
    });
    //   console.log(listRoom)
    return { success: true, mes: listRoom };
  } catch (error) {
    console.log("Lỗi khi lấy tất cả phòng fn socket" + error.message);
  }
};

const joinRoom = async (socket, room, token) => {
  try {
    console.log('join room')
    const Player = await playerRepository();
    const Room = await roomRepository();
    const roomSearch = await Room.fetch(room);
    if (roomSearch && roomSearch.entityId && roomSearch.name !== null) {
      if (roomSearch.isStart) {
        const player = await Player.search()
          .where("token")
          .equals(token)
          .return.first();
        if (player.roomId === room) {
          socket.join(room);
          return {
            success: true,
            type: "playing",
          };
        } else {
          return {
            success: false,
            mes: "Không thể vào phòng đã bắt đầu chơi",
          };
        }
      } else {
        const playerCount = (
          await Player.search().where("roomId").equals(room).return.all()
        ).length;
        const player = await Player.search()
          .where("token")
          .equals(token)
          .return.first();
        if (playerCount < roomSearch.capacity) {
          socket.join(room);
          if (player && player.entityId) {
            player.roomId = room;
            await Player.save(player);
          }
          return {
            success: true,
            type: "waiting",
          };
        } else {
          if (player.roomId === room) {
            socket.join(room);
            return {
              success: true,
              type: "waiting",
            };
          }
          return {
            success: false,
            mes: "Phòng này đã đầy!",
          };
        }
      }
    } else {
      return {
        success: false,
        mes: "Không tìm thấy phòng!",
      };
    }
  } catch (error) {
    console.log("Lỗi khi tham gia vào phòng!" + error.message);
  }
};

const leaveRoom = async (socket, room, token, io) => {
  try {
    const Player = await playerRepository();
    const Room = await roomRepository();
    const roomFetch = await Room.fetch(room);
    // Rời room socket
    socket.leave(room);
    const player = await Player.search()
      .where("token")
      .equals(token)
      .return.first();
    if (player && player.entityId) {
      player.roomId = "";
      player.ready = false;
      player.point = 0;
      await Player.save(player);
    }
    if (roomFetch.isStart !== null && roomFetch.isStart) {
      const endGame = await checkEndGame(room);
      if (endGame.success)
        io.to(endGame.winner.socketId).emit("endGame", endGame?.winner);
      else {
        const check = await getTurn({ roomId: room, io });
        console.log("check: " + check);
        if (!check) {
          await nextTurn(room);
          await getTurn({ roomId: room, io });
        }
      }
    }
    if (roomFetch.isStart !== null && !roomFetch.isStart) {
      const players = await Player.search()
        .where("roomId")
        .equals(room)
        .return.all();
      if (players.length === 0) {
        await Room.remove(room);
      }
    }
  } catch (error) {
    console.log("Lỗi khi rời phòng!" + error.message);
  }
};

const getPlayerOfRoom = async (roomId) => {
  try {
    // const Room = await await roomRepository();
    const Player = await playerRepository();
    if (roomId) {
      const player = await Player.search()
        .where("roomId")
        .equals(roomId)
        .return.all();
      if (player.length > 0) {
        return {
          success: true,
          mes: player,
        };
      } else {
        return {
          success: false,
          mes: "Đã có lỗi xảy ra!",
        };
      }
    }
  } catch (error) {
    console.log(
      "Lỗi khi lấy danh sách người chơi trong phòng!" + error.message
    );
  }
};

const checkAllPlayersReady = async (roomId) => {
  try {
    const Player = await playerRepository();
    const Room = await roomRepository();
    const players = await Player.search()
      .where("roomId")
      .equals(roomId)
      .return.all();
    if (players.length >= 2) {
      const check = players.every((item) => {
        return item.ready === true;
      });
      if (check) {
        await startGame(players, roomId);
      }
      return {
        success: check,
        mes: check ? check : "Tất cả người chơi chưa sẵn sàng!",
      };
    } else {
      return {
        success: false,
        mes: "Số lượng người < 2",
      };
    }
  } catch (error) {
    console.log("Lỗi ở kiểm tra tất cả người dùng sẵn sàng!" + error.message);
  }
};

const apiGetRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const Room = await roomRepository();
    const room = await Room.fetch(roomId);
    if (room.name) {
      return res.status(200).json({ success: true, message: room });
    } else {
      return res
        .status(200)
        .json({ success: false, message: "Không tìm thấy phòng" });
    }
  } catch (error) {
    console.log("Lỗi khi lấy thông tin phòng!" + error.message);
  }
};

module.exports = {
  createRoom,
  // deleteRoom,
  getAllRooms,
  joinRoom,
  leaveRoom,
  socketGetAllRooms,
  getPlayerOfRoom,
  checkAllPlayersReady,
  apiGetRoom,
};

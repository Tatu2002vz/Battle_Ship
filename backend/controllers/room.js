const roomRepository = require("../model/room");
const playerRepository = require("../model/player");
const pointRepository = require("../model/pointAttacked");
const startGame = require("../util/startGame");
const { checkEndGame } = require("../util/endGame");
const { getTurn, nextTurn } = require("../util/handleTurn");
const { hasShip } = require("./ship");
const { SHIP_LENGTH } = require("../util/validateShip");

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
    if (!player) {
      return { success: false, mes: "Không tìm thấy người chơi!" };
    }
    player.roomId = roomId;
    await Player.save(player);
    return { success: true, mes: newRoom };
  } catch (e) {
    console.log("Lỗi khi tạo phòng: " + e.message);
    return { success: false, mes: "Tạo phòng thất bại: " + e.message };
  }
};

const getAllRooms = async (req, res) => {
  try {
    const Room = await roomRepository();
    const Player = await playerRepository();

    const listRoom = await Room.search().return.all();
    const newListRoom = [];
    for (const room of listRoom) {
      const countPerson = await Player.search()
        .where("roomId")
        .equals(room.entityId)
        .return.count();
      if (countPerson === 0) {
        await Room.remove(room.entityId);
      } else {
        room.numberOfRoom = countPerson;
        await Room.save(room);
        newListRoom.push(room);
      }
    }
    return res.status(200).json({ success: true, mes: newListRoom });
  } catch (error) {
    console.log("Lỗi khi lấy tất cả phòng!" + error.message);
    return res.status(500).json({ success: false, mes: "Lỗi server" });
  }
};

const socketGetAllRooms = async () => {
  try {
    const Room = await roomRepository();
    const Player = await playerRepository();
    const listRoom = await Room.search().return.all();
    // Bản gốc dùng forEach(async) nên số người trả về chưa kịp cập nhật
    await Promise.all(
      listRoom.map(async (room) => {
        room.numberOfRoom = await Player.search()
          .where("roomId")
          .equals(room.entityId)
          .return.count();
      })
    );
    return { success: true, mes: listRoom };
  } catch (error) {
    console.log("Lỗi khi lấy tất cả phòng fn socket" + error.message);
    return { success: false, mes: "Lỗi server" };
  }
};

const joinRoom = async (socket, room, token) => {
  try {
    const Player = await playerRepository();
    const Room = await roomRepository();
    const roomSearch = await Room.fetch(room);
    if (roomSearch && roomSearch.entityId && roomSearch.name !== null) {
      if (roomSearch.isStart) {
        const player = await Player.search()
          .where("token")
          .equals(token)
          .return.first();
        if (player && player.roomId === room) {
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
        const playerCount = await Player.search()
          .where("roomId")
          .equals(room)
          .return.count();
        const player = await Player.search()
          .where("token")
          .equals(token)
          .return.first();
        if (!player) {
          return { success: false, mes: "Không tìm thấy người chơi!" };
        }
        if (playerCount < roomSearch.capacity) {
          socket.join(room);
          player.roomId = room;
          await Player.save(player);
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
    if (!roomFetch || !roomFetch.entityId) return;
    if (roomFetch.isStart) {
      const endGame = await checkEndGame(room);
      if (endGame?.success && endGame?.winner) {
        io.to(endGame.winner.socketId).emit("endGame", endGame.winner);
      } else {
        const check = await getTurn({ roomId: room, io });
        if (!check) {
          await nextTurn(room);
          await getTurn({ roomId: room, io });
        }
      }
    } else {
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

// Danh sách người chơi trong phòng, kèm hasShip (đã đặt tàu hay chưa).
// Chỉ trả trạng thái có/chưa, không kèm bất kỳ tọa độ tàu nào.
const getPlayerOfRoom = async (roomId) => {
  try {
    const Player = await playerRepository();
    const Point = await pointRepository();
    if (roomId) {
      const players = await Player.search()
        .where("roomId")
        .equals(roomId)
        .return.all();
      if (players.length > 0) {
        const points = await Point.search()
          .where("roomId")
          .equals(roomId)
          .return.all();
        const shipCount = {};
        for (const p of points) {
          if (p.playerId) {
            shipCount[p.playerId] = (shipCount[p.playerId] || 0) + 1;
          }
        }
        for (const player of players) {
          player.hasShip = shipCount[player.token] === SHIP_LENGTH;
        }
        return {
          success: true,
          mes: players,
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
    const players = await Player.search()
      .where("roomId")
      .equals(roomId)
      .return.all();
    if (players.length >= 2) {
      const allPlaced = (
        await Promise.all(players.map((p) => hasShip(roomId, p.token)))
      ).every(Boolean);
      if (!allPlaced) {
        return {
          success: false,
          mes: "Có người chơi chưa đặt tàu!",
        };
      }
      const check = players.every((item) => item.ready === true);
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
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

module.exports = {
  createRoom,
  getAllRooms,
  joinRoom,
  leaveRoom,
  socketGetAllRooms,
  getPlayerOfRoom,
  checkAllPlayersReady,
  apiGetRoom,
};

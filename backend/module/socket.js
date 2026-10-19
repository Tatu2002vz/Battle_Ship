const { Server } = require("socket.io");
const { instrument } = require("@socket.io/admin-ui");
const {
  createRoom,
  getPlayerOfRoom,
  joinRoom,
  leaveRoom,
  socketGetAllRooms,
  checkAllPlayersReady,
} = require("../controllers/room");
const {
  createPlayer,
  readyPlayer,
  updatePlayer,
  getCurrent,
  rejoinRoom,
  deletePlayer,
} = require("../controllers/player");
const { placeShip, randomShip, hasShip } = require("../controllers/ship");
const { getTurn, nextTurn } = require("../util/handleTurn");
const { createPoint, getAllPointBeAttacked } = require("../controllers/point");
const { checkEndGame } = require("../util/endGame");

// CORS dùng chung cấu hình với HTTP (index.js)
const clientOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((o) => o.trim())
  : true;

const socketModule = (server) => {
  const io = new Server(server, {
    cors: {
      credentials: true,
      origin: clientOrigins,
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
  });

  // Admin UI của Socket.IO: chỉ bật khi SOCKET_ADMIN_UI=true (mặc định tắt,
  // bản gốc bật công khai với auth: false)
  if (process.env.SOCKET_ADMIN_UI === "true") {
    instrument(io, { auth: false });
  }

  io.on("connection", async (socket) => {
    const token = socket.handshake.auth.token;

    try {
      // Join lại room khi bị disconnect
      await rejoinRoom({ socket, token });
    } catch (error) {
      console.log("Lỗi khi rejoin: " + error.message);
    }

    // Tạo hoặc cập nhật user mỗi khi truy cập
    socket.on("visited", async (data) => {
      try {
        await createPlayer(data);
      } catch (error) {
        console.log("Lỗi ở visited: " + error.message);
      }
    });

    // Lấy thông tin hiện tại của người dùng
    socket.on("current", async (data) => {
      try {
        const dataCurrent = await getCurrent(data);
        if (dataCurrent && dataCurrent.success)
          socket.emit("current", dataCurrent.mes);
      } catch (error) {
        console.log("Lỗi ở current: " + error.message);
      }
    });

    socket.on("changeName", async (data) => {
      try {
        await updatePlayer({ token, name: data });
      } catch (error) {
        console.log("Lỗi ở changeName: " + error.message);
      }
    });

    // Tạo phòng
    socket.on("createRoom", async (data) => {
      try {
        const { nameRoom, capacity, ratio } = data || {};
        const rs = await createRoom({
          nameRoom,
          capacity,
          token: data?.token || token,
          ratio,
        });
        socket.emit("createRoom", rs);
        const listRoom = await socketGetAllRooms();
        io.emit("getRoom", listRoom);
      } catch (error) {
        console.log("Lỗi ở createRoom: " + error.message);
      }
    });

    // Lấy danh sách người chơi trong phòng (chỉ phát trong phòng đó,
    // bản gốc dùng io.emit phát cho toàn bộ server)
    socket.on("getPlayers", async (data) => {
      try {
        const roomId = data?.roomId;
        if (!roomId) return;
        const players = await getPlayerOfRoom(roomId);
        io.to(roomId).emit("getPlayers", players);
      } catch (error) {
        console.log("Lỗi ở getPlayers: " + error.message);
      }
    });

    // Tham gia phòng
    socket.on("joinRoom", async (data, callback) => {
      try {
        const roomId = data?.roomId;
        const rsJoinRoom = await joinRoom(socket, roomId, data?.token || token);
        const players = await getPlayerOfRoom(roomId);
        if (data?.type === "room" && rsJoinRoom?.type === "playing") {
          socket.emit("onGame");
        }
        if (callback) {
          callback("success");
        }
        io.to(roomId).emit("getPlayers", players);
        if (!rsJoinRoom?.success) {
          socket.emit("error", rsJoinRoom?.mes);
        }
      } catch (error) {
        console.log("Lỗi ở joinRoom: " + error.message);
      }
    });

    // Đặt tàu (người chơi tự kéo-thả / click ở frontend)
    socket.on("placeShip", async (data) => {
      try {
        const rs = await placeShip({
          roomId: data?.roomId,
          token: data?.token || token,
          cells: data?.cells,
        });
        socket.emit("placeShip", rs);
        if (rs?.success) {
          const players = await getPlayerOfRoom(data.roomId);
          io.to(data.roomId).emit("getPlayers", players);
        }
      } catch (error) {
        console.log("Lỗi ở placeShip: " + error.message);
      }
    });

    // Xếp tàu ngẫu nhiên phía server (nút Random)
    socket.on("randomShip", async (data) => {
      try {
        const rs = await randomShip({
          roomId: data?.roomId,
          token: data?.token || token,
        });
        socket.emit("randomShip", rs);
        if (rs?.success) {
          const players = await getPlayerOfRoom(data.roomId);
          io.to(data.roomId).emit("getPlayers", players);
        }
      } catch (error) {
        console.log("Lỗi ở randomShip: " + error.message);
      }
    });

    // Thoát phòng
    socket.on("leaveRoom", async (data) => {
      try {
        const { roomId, token: playerToken } = data || {};
        await leaveRoom(socket, roomId, playerToken || token, io);
        const players = await getPlayerOfRoom(roomId);
        io.to(roomId).emit("getPlayers", players);
      } catch (error) {
        console.log("Lỗi ở leaveRoom: " + error.message);
      }
    });

    // Sẵn sàng / hủy sẵn sàng (phải đặt tàu xong mới Ready được)
    socket.on("ready", async (data) => {
      try {
        const { roomId, status } = data || {};
        const playerToken = data?.token || token;
        if (status) {
          const placed = await hasShip(roomId, playerToken);
          if (!placed) {
            socket.emit("error", "Bạn chưa đặt tàu!");
            return;
          }
        }
        await readyPlayer({ token: playerToken, status });
        const players = await getPlayerOfRoom(roomId);
        const checkReady = await checkAllPlayersReady(roomId);
        if (checkReady?.success) {
          io.in(roomId).emit("joinGame");
        }
        io.in(roomId).emit("getPlayers", players);
      } catch (error) {
        console.log("Lỗi ở ready: " + error.message);
      }
    });

    // Vào game
    socket.on("playing", async (data) => {
      try {
        const { roomId } = data || {};
        await checkEndGame(roomId);
        const check = await getTurn({ roomId, io });
        if (!check) {
          await nextTurn(roomId);
          await getTurn({ roomId, io });
        }
        // Lấy các điểm đã tấn công nếu có khi bị mất kết nối
        const rs = await getAllPointBeAttacked(roomId);
        if (rs.success) {
          socket.emit("pointActtacked", rs.mes);
        }
      } catch (error) {
        console.log("Lỗi ở playing: " + error.message);
      }
    });

    // Lắng nghe tấn công
    socket.on("kick", async (data) => {
      try {
        const { roomId, x, y } = data || {};
        const rs = await createPoint({
          roomId,
          x,
          y,
          attackedId: data?.token || token,
        });

        // Phát bắn không hợp lệ: chỉ báo cho người bắn, không chuyển lượt
        if (!rs || !rs.ok) {
          socket.emit("rsKick", {
            success: false,
            invalid: true,
            x,
            y,
            mes: rs?.mes || "Phát bắn không hợp lệ",
          });
          return;
        }

        const { playerBeAttacked, playerAttack, endGame, lost } = rs.mes;
        if (endGame) {
          io.in(roomId).emit("endGame", endGame?.winner);
        }
        if (lost) {
          io.in(roomId).emit("lostGame", playerBeAttacked);
        }
        const notification =
          rs.result === "hit"
            ? `Người chơi ${playerAttack.name} tấn công trúng tàu ${playerBeAttacked.name}!`
            : `Người chơi ${playerAttack.name} bắn trượt!`;
        io.in(roomId).emit("rsKick", {
          x,
          y,
          mes: rs.mes,
          success: rs.success,
          result: rs.result,
          notification,
        });
        const players = await getPlayerOfRoom(roomId);
        io.to(roomId).emit("getPlayers", players);

        // Chỉ chuyển lượt khi phát bắn hợp lệ và game chưa kết thúc
        if (!endGame) {
          await nextTurn(roomId);
          await getTurn({ roomId, io });
        }
      } catch (error) {
        console.log("Lỗi ở kick: " + error.message);
      }
    });

    socket.on("disconnect", async () => {
      try {
        // Xóa user khi ngắt kết nối nếu chưa vào phòng nào.
        // Người đang trong phòng thì giữ lại để reconnect (rejoinRoom).
        await deletePlayer({ socketId: socket.id });
      } catch (error) {
        console.log("Lỗi ở disconnect: " + error.message);
      }
    });
  });
};

module.exports = socketModule;

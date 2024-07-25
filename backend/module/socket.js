const { createServer } = require("http");
const { Server } = require("socket.io");
const { instrument } = require("@socket.io/admin-ui");
const {
  createRoom,
  getAllRooms,
  deleteRoom,
  getPlayerOfRoom,
  joinRoom,
  leaveRoom,
  socketGetAllRooms,
  checkAllPlayersReady,
} = require("../controllers/room");
const {
  createPlayer,
  deletePlayer,
  readyPlayer,
  updatePlayer,
  getCurrent,
} = require("../controllers/player");
const { getTurn, nextTurn } = require("../util/handleTurn");
const { createPoint, getAllPointBeAttacked } = require("../controllers/point");
const { checkEndGame } = require("../util/endGame");
const socketModule = (server) => {
  // const io = new Server(server, {
  //   cors: {
  //     credentials: true,
  //     origin: "*",
  //     methods: ["GET", "POST", "PUT", "DELETE"],
  //   },
  // });
  const io = new Server(server, {
    cors: {
      credentials: true,
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
  });
  instrument(io, {
    auth: false,
  });
  io.on("connection", async (socket) => {
    const token = socket.handshake.auth.token;
    console.log("token auth: " + token);
    console.log(socket.id);
    console.log(io.sockets.sockets.size);
    // Tạo hoặc cập nhật user mỗi khi truy cập
    socket.on("visited", async (data) => {
      await createPlayer(data);
    });
    // Lấy thông tin hiện tại của người dùng
    socket.on("current", async () => {
      const data = await getCurrent(token);
      console.log('current: ' + JSON.stringify(data))
      if (data && data.success) socket.emit("current", data.mes);
    });
    socket.on("changeName", async (data) => {
      await updatePlayer({ token, name: data });
    });
    // Lấy danh sách phòng đang trực tuyến + có người ở trong khi có người đăng nhập
    // const listRoom = await getAllRooms();
    // io.emit("getRoom", listRoom);
    // Tạo phòng
    socket.on("createRoom", async ({ nameRoom, capacity, token }) => {
      const rs = await createRoom({ nameRoom, capacity, token });

      socket.emit("createRoom", rs);
      // Trả về danh sách cho all khi tạo xong
      const listRoom = await socketGetAllRooms();
      io.emit("getRoom", listRoom);
    });
    // Lấy danh sách người chơi trong phòng
    socket.on("getPlayers", async (data) => {
      const roomId = data.roomId;
      const players = await getPlayerOfRoom(roomId);
      console.log(players);
      io.emit("getPlayers", players);
    });
    // Tham gia phòng
    socket.on("joinRoom", async (data) => {
      // console.log(JSON.stringify(data))
      // console.log(JSON.parse(data));
      const roomId = data.roomId;
      const rsJoinRoom = await joinRoom(socket, roomId, data.token);
      console.log('Lỗi xảy ra khi join room: ' + JSON.stringify(rsJoinRoom))
      const players = await getPlayerOfRoom(roomId);
      if(data.type === 'room' && rsJoinRoom.type === 'playing') {
        socket.emit('onGame')
      }
      io.to(roomId).emit("getPlayers", players);
      if (!rsJoinRoom?.success) {
        socket.emit("error", rsJoinRoom?.mes);
      }
    });

    // Thoát phòng
    socket.on("leaveRoom", async (data) => {
      const { roomId, token } = data;
      await leaveRoom(socket, roomId, token, io);
      const players = await getPlayerOfRoom(roomId);
      io.to(roomId).emit("getPlayers", players);
    });

    // Sẵn sàng / hủy sẵn sàng
    socket.on("ready", async (data) => {
      const { roomId, token, status } = data;
      await readyPlayer({ token, status });
      const players = await getPlayerOfRoom(roomId);
      const checkReady = await checkAllPlayersReady(roomId);
      if (checkReady?.success) {
        io.in(roomId).emit("joinGame");
      }
      io.in(roomId).emit("getPlayers", players);
    });

    // socket.on('playing', async(data) => {
    //   const {roomId, token} = data;

    // })

    // Vào game
    socket.on("playing", async (data) => {
      const { roomId } = data;
      console.log("get turn");
      await checkEndGame(roomId);
      await getTurn({ roomId, io });
      // Lấy các điểm đã tấn công nếu có khi bị mất kết nối
      const rs = await getAllPointBeAttacked(roomId);
      if (rs.success) {
        socket.emit("pointActtacked", rs.mes);
      }
    });

    // Lắng nghe tấn công
    socket.on("kick", async (data) => {
      const { roomId, x, y, token } = data;
      const rs = await createPoint({ roomId, x, y, attackedId: token });
      // Nếu có kết quả trả về.....
      if (rs) {
        if (rs.success) {
          const { playerBeAttacked, playerAttack, endGame, lost } = rs.mes;
          if (endGame) {
            // kết thúc game
            io.to(endGame.winner.socketId).emit("endGame", endGame?.winner);
          }
          console.log('object lost: ' + JSON.stringify(lost))
          if (lost) {

            console.log('Lost game: ' + playerBeAttacked.socketId);
            // thua game
            io.to(playerBeAttacked.socketId).emit("lostGame");
          }
          const message = `Người chơi ${playerAttack.name} tấn công trúng tàu ${playerBeAttacked.name}!`;
          io.in(roomId).emit("rsKick", {
            x,
            y,
            mes: rs.mes,
            success: true,
            notification: message,
          });
          const players = await getPlayerOfRoom(roomId);
          io.emit("getPlayers", players);
        } else {
          io.in(roomId).emit("rsKick", { success: false, x, y });
        }
      }
      // Lượt tiếp theo
      await nextTurn(roomId);
      await getTurn({ roomId, io });
    });
    // Lắng nghe sự kiện đầu hàng / thoát trận khi đang chơi ! == leaveRoom
    // socket.on("surrender", async () => {
    //   const { roomId, token } = data;
    //   await leaveRoom(socket, roomId, token);
    //   const players = await getPlayerOfRoom(roomId);
    //   io.to(roomId).emit("getPlayers", players); // thông báo cho những người chơi khác là đã thoát phòng
    // });

    socket.on("disconnect", async () => {
      console.log("ngắt kết nối: " + socket.id);
      // Xóa user khi ngắt truy cập nếu chưa vào phòng
      // await deleteRoom({ socketId: socket.id });
      // await deletePlayer({ socketId: socket.id });
      console.log(io.sockets.sockets.size);
    });
  });
};

module.exports = socketModule;

const playerRepository = require("../model/player");
const getCurrent = async (data) => {
  try {
    const { token } = data;
    const Player = await playerRepository();
    const player = await Player.search()
      .where("token")
      .equals(token)
      .return.first();
    if (player) {
      return {
        success: true,
        mes: player,
      };
    } else {
      const newPlayer = await createPlayer(data);
      return {
        success: true,
        mes: newPlayer,
      };
    }
  } catch (error) {
    console.log("Lỗi khi lấy thông tin người chơi hiện tại!" + error.message);
  }
};
const createPlayer = async (data) => {
  const { name, token, socketId } = data;
  let Player = await playerRepository();

  try {
    const isExist = await Player.search()
      .where("token")
      .equals(token)
      .return.all();
    if (isExist.length > 0) {
      const player = await Player.fetch(isExist[0].entityId);
      player.socketId = socketId;
      if (name) player.name = name;
      Player.save(player);
    } else {
      let newPlayer = {
        entityId: token,
        ready: false,
        roomId: "",
        point: 0,
        name: name ? name : "Ẩn danh",
        token,
        beAttacked: 0,
        socketId: socketId ? socketId : "",
        no: 0,
      };
      newPlayer = await Player.createAndSave(newPlayer);
      return newPlayer;
    }
  } catch (e) {
    console.log("Lỗi ở tạo hoặc cập nhật player: " + e.message);
  }
};
const updatePlayer = async ({ token, name }) => {
  try {
    const Player = await playerRepository();
    const player = await Player.search()
      .where("token")
      .equals(token)
      .return.first();
    if (player) {
      player.name = name;
      await Player.save(player);
    } else {
      throw new Error("Không tìm thấy player với token: " + token);
    }
  } catch (error) {
    console.log("Lỗi khi cập nhật tên: " + error.message);
  }
};
const deletePlayer = async (data) => {
  try {
    let Player = await playerRepository();
    const { socketId } = data;
    const delPlayer = Player.search()
      .where("socketId")
      .equals(socketId)
      .return.first();

    if (!delPlayer.ready && !delPlayer.roomId) {
      await Player.remove((await delPlayer).entityId);
    }
  } catch (e) {
    console.log("Lỗi khi xóa player: " + e.message);
  }
};

const readyPlayer = async (data) => {
  try {
    let Player = await playerRepository();
    const { token } = data;
    const player = await Player.search()
      .where("token")
      .equals(token)
      .return.first();
    player.ready = data.status;
    await Player.save(player);
    return { success: true, message: "Player ready!" };
  } catch (error) {
    console.log("Lỗi khi sẵn sàng: " + error.message);
  }
};

const rejoinRoom = async ({ socket, token }) => {
  try {
    const Player = await playerRepository();
    const player = await Player.search()
      .where("token")
      .equals(token)
      .return.first();
    if (player && player.roomId !== "") {
      socket.join(player.roomId);
      return { success: true };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.log("Lỗi khi vào lại phòng!" + error.message);
    return { success: false };
  }
};
module.exports = {
  createPlayer,
  deletePlayer,
  readyPlayer,
  updatePlayer,
  getCurrent,
  rejoinRoom
};

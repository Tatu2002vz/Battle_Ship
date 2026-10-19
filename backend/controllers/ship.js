const pointRepository = require("../model/pointAttacked");
const roomRepository = require("../model/room");
const playerRepository = require("../model/player");
const { validateShip, cellKey, SHIP_LENGTH } = require("../util/validateShip");
const generateShipPlacement = require("../util/generateRandomShip");

// Các ô tàu của 1 người trong 1 phòng
const getShipPoints = async (roomId, playerId) => {
  const Point = await pointRepository();
  return Point.search()
    .where("roomId")
    .equals(roomId)
    .and("playerId")
    .equals(playerId)
    .return.all();
};

const hasShip = async (roomId, playerId) => {
  if (!roomId || !playerId) return false;
  const points = await getShipPoints(roomId, playerId);
  return points.length === SHIP_LENGTH;
};

// Tập hợp các ô đã có tàu của NGƯỜI KHÁC trong phòng (để chống đặt trùng).
// Chỉ dùng phía server, không bao giờ gửi tập hợp này xuống client.
const getOccupiedKeys = async (roomId, excludePlayerId) => {
  const Point = await pointRepository();
  const points = await Point.search()
    .where("roomId")
    .equals(roomId)
    .return.all();
  const keys = new Set();
  for (const p of points) {
    if (p.playerId && p.playerId !== excludePlayerId) {
      keys.add(cellKey(p.x, p.y));
    }
  }
  return keys;
};

const saveShip = async (roomId, playerId, cells) => {
  const Point = await pointRepository();
  const oldPoints = await getShipPoints(roomId, playerId);
  for (const p of oldPoints) {
    await Point.remove(p.entityId);
  }
  for (const [x, y] of cells) {
    await Point.createAndSave({
      x,
      y,
      isAttacked: false,
      playerId,
      attackedId: "",
      roomId,
    });
  }
};

// Kiểm tra điều kiện chung trước khi đặt tàu, dùng cho cả placeShip và randomShip
const checkCanPlace = async (roomId, token) => {
  if (!roomId || !token) {
    return { ok: false, mes: "Thiếu thông tin phòng hoặc người chơi" };
  }
  const Room = await roomRepository();
  const room = await Room.fetch(roomId);
  if (!room || !room.entityId || room.name === null) {
    return { ok: false, mes: "Không tìm thấy phòng" };
  }
  if (room.isStart) {
    return { ok: false, mes: "Game đã bắt đầu, không thể đặt tàu" };
  }
  const Player = await playerRepository();
  const player = await Player.search()
    .where("token")
    .equals(token)
    .return.first();
  if (!player || player.roomId !== roomId) {
    return { ok: false, mes: "Bạn không ở trong phòng này" };
  }
  if (player.ready) {
    return {
      ok: false,
      mes: "Bạn đã Ready, hãy hủy Ready trước khi đổi vị trí tàu",
    };
  }
  return { ok: true, room, player };
};

// Người chơi tự nộp vị trí tàu (kéo-thả hoặc click ở frontend)
const placeShip = async (data) => {
  try {
    const { roomId, token, cells } = data || {};
    const check = await checkCanPlace(roomId, token);
    if (!check.ok) return { success: false, mes: check.mes };

    const occupiedKeys = await getOccupiedKeys(roomId, token);
    const result = validateShip(cells, check.room.ratio, occupiedKeys);
    if (!result.valid) return { success: false, mes: result.mes };

    await saveShip(roomId, token, result.cells);
    return { success: true, mes: "Đặt tàu thành công", cells: result.cells };
  } catch (error) {
    console.log("Lỗi ở placeShip: " + error.message);
    return { success: false, mes: "Đặt tàu thất bại" };
  }
};

// Server xếp tàu hộ (nút Random) — đảm bảo không trùng tàu người khác
const randomShip = async (data) => {
  try {
    const { roomId, token } = data || {};
    const check = await checkCanPlace(roomId, token);
    if (!check.ok) return { success: false, mes: check.mes };

    const occupiedKeys = await getOccupiedKeys(roomId, token);
    const cells = generateShipPlacement(check.room.ratio, occupiedKeys);
    if (!cells) {
      return { success: false, mes: "Bàn cờ không còn vị trí trống phù hợp" };
    }

    await saveShip(roomId, token, cells);
    return { success: true, mes: "Đã xếp tàu ngẫu nhiên", cells };
  } catch (error) {
    console.log("Lỗi ở randomShip: " + error.message);
    return { success: false, mes: "Xếp tàu ngẫu nhiên thất bại" };
  }
};

module.exports = {
  placeShip,
  randomShip,
  hasShip,
  getShipPoints,
};

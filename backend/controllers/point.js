const pointAttackedRepository = require("../model/pointAttacked");
const roomRepository = require("../model/room");
const playerRepository = require("../model/player");
const { checkLost, resetPointAndRoom } = require("../util/checkLost");
const { checkEndGame } = require("../util/endGame");

// Xử lý 1 phát bắn (event "kick").
// Trả về hợp đồng rõ ràng thay cho bản gốc:
// - { ok: false, mes }              -> phát bắn KHÔNG hợp lệ, không tính, không chuyển lượt
// - { ok: true, result: "miss" }    -> bắn trượt (success: false như payload cũ)
// - { ok: true, result: "hit" }     -> bắn trúng (success: true như payload cũ)
const createPoint = async (data) => {
  try {
    const { roomId, attackedId } = data || {};
    const x = Number(data?.x);
    const y = Number(data?.y);

    const Room = await roomRepository();
    const Player = await playerRepository();
    const Point = await pointAttackedRepository();

    const room = await Room.fetch(roomId);
    if (!room || !room.entityId || room.name === null) {
      return { ok: false, mes: "Không tìm thấy phòng" };
    }
    if (!room.isStart) {
      return { ok: false, mes: "Game chưa bắt đầu" };
    }
    if (
      !Number.isInteger(x) ||
      !Number.isInteger(y) ||
      x < 0 ||
      y < 0 ||
      x >= room.ratio ||
      y >= room.ratio
    ) {
      return { ok: false, mes: "Tọa độ không hợp lệ" };
    }

    const playerAttack = await Player.search()
      .where("token")
      .equals(attackedId)
      .return.first();
    if (!playerAttack || playerAttack.roomId !== roomId) {
      return { ok: false, mes: "Không tìm thấy người bắn trong phòng này" };
    }
    if (Number(playerAttack.no) !== Number(room.turn)) {
      return { ok: false, mes: "Chưa tới lượt của bạn" };
    }

    const existing = await Point.search()
      .where("x")
      .eq(x)
      .and("y")
      .eq(y)
      .and("roomId")
      .equals(roomId)
      .return.all();

    if (existing.some((p) => p.attackedId !== "")) {
      return { ok: false, mes: "Ô này đã được bắn rồi" };
    }

    const shipPoint = existing.find((p) => p.playerId !== "");

    if (!shipPoint) {
      // Bắn trượt: lưu lại điểm đã bắn để không bắn trùng
      await Point.createAndSave({
        x,
        y,
        isAttacked: false,
        playerId: "",
        attackedId,
        roomId,
      });
      return {
        ok: true,
        result: "miss",
        success: false,
        mes: { playerAttack, playerBeAttacked: null, lost: false },
      };
    }

    if (shipPoint.playerId === attackedId) {
      return { ok: false, mes: "Đây là tàu của bạn, không thể tự bắn" };
    }

    shipPoint.isAttacked = true;
    shipPoint.attackedId = attackedId;
    await Point.save(shipPoint);

    playerAttack.point += 1;
    await Player.save(playerAttack);

    const playerBeAttacked = await Player.search()
      .where("token")
      .equals(shipPoint.playerId)
      .return.first();

    const lost = await checkLost(shipPoint.playerId);
    let endGame;
    if (lost) {
      await resetPointAndRoom(shipPoint.playerId);
      endGame = await checkEndGame(roomId);
    }

    return {
      ok: true,
      result: "hit",
      success: true,
      mes: {
        playerAttack,
        playerBeAttacked,
        lost,
        ...(endGame && endGame.success ? { endGame } : {}),
      },
    };
  } catch (error) {
    console.log("Lỗi ở create point: " + error.message);
    return { ok: false, mes: "Lỗi khi tấn công" };
  }
};

const getAllPointOfPlayer = async (req, res) => {
  try {
    const Point = await pointAttackedRepository();
    const { token, roomId } = req.body;
    const points = await Point.search()
      .where("playerId")
      .equals(token)
      .and("roomId")
      .equals(roomId)
      .return.all();
    return res.status(200).json({
      success: points.length > 0,
      mes: points,
    });
  } catch (error) {
    console.log(
      `Có lỗi xảy ra khi lấy các điểm của người chơi: ${error.message}`
    );
    return res.status(500).json({ success: false, mes: "Lỗi server" });
  }
};

const getAllPointBeAttacked = async (roomId) => {
  try {
    const Point = await pointAttackedRepository();
    const points = await Point.search()
      .where("roomId")
      .equals(roomId)
      .return.all();

    const pointsBeAttacked = points.filter((el) => el.attackedId !== "");
    if (pointsBeAttacked.length > 0) {
      return { success: true, mes: pointsBeAttacked };
    } else {
      return {
        success: false,
        mes: "Not points be attacked",
      };
    }
  } catch (error) {
    console.log("Lỗi ở lấy tất cả các điểm bị tấn công!" + error.message);
    return { success: false, mes: "Lỗi server" };
  }
};

module.exports = {
  createPoint,
  getAllPointOfPlayer,
  getAllPointBeAttacked,
};

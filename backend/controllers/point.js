const pointAttackedRepository = require("../model/pointAttacked");
const roomRepository = require("../model/room");
const playerRepository = require("../model/player");
const { checkLost, resetPointAndRoom } = require("../util/checkLost");
const { checkEndGame } = require("../util/endGame");
const createPoint = async (data) => {
  try {
    const { x, y, playerId, attackedId, roomId } = data; // playerId && attackedId === token
    // console.log(
    //   `x: ${x} y: ${y} playerId: ${playerId} attackedId: ${attackedId} roomId: ${roomId}`
    // );
    const Player = await playerRepository();
    const Point = await pointAttackedRepository();
    const isExist = await Point.search()
      .where("x")
      .eq(x)
      .and("y")
      .eq(y)
      .and("roomId")
      .equals(roomId)
      .return.first();
    // Nếu không tồn tại điểm -> tạo mới
    // nếu không tồn tại không có attackedId trong cache -> điểm tạo mới là điểm bị tấn công!
    // nếu tồn tại và không có playerID -> bị tấn công và không trúng ai hoặc không tấn công được!
    // nếu tồn tại và có playerID và không có attackedID trong cache -> tấn công trúng playerID
    // nếu tồn tại và không có playerID và có attackedID trong cache -> đã tồn tại tấn công không được đánh tiếp
    if (!isExist) {
      const newPoint = {
        x: x,
        y: y,
        isAttacked: false,
        playerId: playerId ? playerId : "",
        attackedId: attackedId ? attackedId : "", // có attackedId = bị tấn công
        roomId: roomId,
      };
      await Point.createAndSave(newPoint);
      // trả về tấn công nhưng không trúng ai
      return {
        success: false,
      };
    } else {
      if (isExist.attackedId === "") {
        // nếu chưa tấn công
        isExist.isAttacked = true;
        isExist.attackedId = attackedId;
        await Point.save(isExist);
        if (isExist.playerId !== "") {
          const playerAttack = await Player.search()
            .where("token")
            .equals(attackedId)
            .return.first(); // lấy player để cộng điểm
          if (playerAttack && playerAttack.entityId) {
            playerAttack.point += 1; // cộng 1 điểm
            await Player.save(playerAttack);
            const check = await checkLost(isExist.playerId); // kiểm tra xem đã bị tấn công hết tất cả các điểm chưa
            let endGame;

            if (check) {
              await resetPointAndRoom(isExist.playerId); // nếu đã bị tấn công hết thì thua
              endGame = await checkEndGame(roomId);
            }
            // console.log('')
            console.log("Token point: " + isExist.playerId);
            const playerBeAttacked = await Player.search()
              .where("token")
              .equals(isExist.playerId)
              .return.first();
            console.log("playerBeAttacked: ", JSON.stringify(playerBeAttacked));
            // console.log('Lost')
            console.log("check: " + check);
            if (endGame && endGame.success) {
              return {
                success: true,
                mes: {
                  playerAttack,
                  playerBeAttacked,
                  endGame,
                  lost: check,
                },
              };
            }
            return {
              success: true,
              mes: { playerAttack, playerBeAttacked, lost: check },
            };
          } else {
            throw new Error("Không tìm thấy người tấn công!");
          }
        }
        // đã tấn công thì không trả về gì cả
      } else throw new Error("Điểm này đã tồn tại trong ma trận!");
    }
  } catch (error) {
    console.log("Lỗi ở create point: " + error.message);
  }
};

const getAllPointOfPlayer = async (req, res) => {
  try {
    const Point = await pointAttackedRepository();
    const Room = await roomRepository();
    const { token, roomId } = req.body;
    const points = await Point.search()
      .where("playerId")
      .equals(token)
      .and("roomId")
      .equals(roomId)
      .return.all();
    if (points.length > 0) {
      return res.status(200).json({
        success: true,
        mes: points,
      });
    }
  } catch (error) {
    console.log(
      `Có lỗi xảy ra khi lấy các điểm của người chơi: ${error.message}`
    );
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
  }
};

module.exports = {
  createPoint,
  getAllPointOfPlayer,
  getAllPointBeAttacked,
};

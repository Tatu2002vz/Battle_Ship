const randomizeShips = require("./generateRandomShip");
const roomRepository = require("../model/room");
const playerRepository = require("../model/player");
const { createPoint } = require("../controllers/point");
const startGame = async (players, roomId) => {
  const Room = await roomRepository();
  const Player = await playerRepository();


  const room = await Room.fetch(roomId);
  if (room && room.entityId) {
    room.isStart = true;
    let ships = randomizeShips(room.ratio, players.length);
    await Room.save(room);
    for (let i = 0; i < ships.length; i++) {
      ships[i].forEach((ship) =>
        createPoint({
          x: ship[0],
          y: ship[1],
          playerId: players[i].token,
          roomId: roomId,
        })
      );
    }
    //
    
  //   for (let i = 0; i < players.length; i++) {
  //     players[i].no = i;
  //     players[i].ready = false;
  //   }
    players.forEach( async (player, index) => {
      player.no = index;
      player.ready = false;
      await Player.save(player);
    })
  }
};
module.exports = startGame;

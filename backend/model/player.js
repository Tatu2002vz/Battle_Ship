const { Client, Entity, Schema, Repository } = require("redis-om");

const excFn = async () => {
  const url = process.env.REDIS_URL || "redis://127.0.0.1:6379";

  /* create and open the Redis OM Client */
  const client = await new Client().open(url);

  class Player extends Entity {}

  const playerSchema = new Schema(Player, {
    ready: { type: "boolean" },
    roomId: { type: "string" },
    point: { type: "number" },
    name: { type: "string" },
    token: { type: "string" },
    beAttacked: { type: "number" },
    socketId: { type: "string" },
    no: {type: "number"}
  });
  const playerRepository = client.fetchRepository(playerSchema);
  await playerRepository.createIndex();
  return playerRepository;
};
module.exports = excFn;

const { Entity, Schema } = require("redis-om");
const connectRedis = require("../config/redis");

// Repository được tạo 1 lần duy nhất và dùng lại (singleton).
// createIndex() cũng chỉ chạy 1 lần lúc khởi tạo này.
let repositoryPromise = null;

const getPlayerRepository = () => {
  if (!repositoryPromise) {
    repositoryPromise = (async () => {
      const client = await connectRedis();

      class Player extends Entity {}

      const playerSchema = new Schema(Player, {
        ready: { type: "boolean" },
        roomId: { type: "string" },
        point: { type: "number" },
        name: { type: "string" },
        token: { type: "string" },
        beAttacked: { type: "number" },
        socketId: { type: "string" },
        no: { type: "number" },
      });

      const repository = client.fetchRepository(playerSchema);
      await repository.createIndex();
      return repository;
    })().catch((err) => {
      repositoryPromise = null;
      throw err;
    });
  }
  return repositoryPromise;
};

module.exports = getPlayerRepository;

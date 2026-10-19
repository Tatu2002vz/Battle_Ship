const { Entity, Schema } = require("redis-om");
const connectRedis = require("../config/redis");

// Repository được tạo 1 lần duy nhất và dùng lại (singleton).
let repositoryPromise = null;

const getRoomRepository = () => {
  if (!repositoryPromise) {
    repositoryPromise = (async () => {
      const client = await connectRedis();

      class Room extends Entity {}

      const roomSchema = new Schema(Room, {
        name: { type: "string" },
        numberOfRoom: { type: "number" },
        capacity: { type: "number" },
        isStart: { type: "boolean" },
        isEnd: { type: "boolean" },
        createdAt: { type: "date" },
        turn: { type: "number" },
        ratio: { type: "number" },
      });

      const repository = client.fetchRepository(roomSchema);
      await repository.createIndex();
      return repository;
    })().catch((err) => {
      repositoryPromise = null;
      throw err;
    });
  }
  return repositoryPromise;
};

module.exports = getRoomRepository;
